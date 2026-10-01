// services/mediaService.js
// yt-dlp driver: link inspection, resilient downloading, progress tracking.
//
// Everything here shells out to yt-dlp (and ffmpeg, for merging streams) as a
// child process. Two concerns shape most of this file:
//
//   1. yt-dlp is not reliable on very large files. When a CDN drops the socket
//      part-way it can sit there for minutes making no disk progress without
//      ever erroring out. A watchdog below detects zero-progress windows and
//      kills the worker so the resume loop can pick up from the .part file.
//
//   2. The child process is driven purely by argv (spawn, never shell:true),
//      so a URL can never be interpreted as a shell command.
//
// Callers get a task id back immediately and poll status; files are streamed
// to the browser and deleted right after.
import { spawn, execSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import path from "node:path";
import dns from "node:dns/promises";
import { URL } from "node:url";
import { uploadsConfig } from "../config/env.js";

/* ------------------------------------------------------------------ Config */

const TMP_DIR = path.join(uploadsConfig.dir, "media-tmp");

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

/* yt-dlp bug: after a socket read timeout it stops pulling data and never
   retries. These flags make it notice a dead socket sooner, and abort into a
   resumable .part file when it does give up. */
const RESILIENCE_ARGS = [
  "--socket-timeout", "20",
  "--retries", "10",
  "--fragment-retries", "10",
  "--retry-sleep", "2",
];

/* How long the watchdog tolerates zero disk progress before intervening.
   Long enough that a slow-but-alive download is never killed, short enough
   that a genuinely dead socket recovers in a couple of minutes. */
const STALL_WINDOW_MS = Number(process.env.MEDIA_STALL_WINDOW_MS) || 2 * 60 * 1000;

/* A 16 GB file can stall several times; each resume is cheap, so allow enough
   attempts to finish rather than giving up after the second hiccup. */
const MAX_STALL_RECOVERIES = 8;

/* Clients that bypass YouTube's "Sign in to confirm you're not a bot" without
   cookies. Tried in order after the default client fails. */
const YT_FALLBACK_CLIENTS = ["android", "ios", "tv", "web_embedded", "mweb"];

const DIRECT_EXTENSIONS = new Set([
  ".mp4", ".webm", ".mkv", ".mov", ".avi", ".flv", ".m4v", ".wmv", ".ts",
  ".mp3", ".m4a", ".ogg", ".opus", ".wav", ".flac", ".aac",
]);

/* Ceilings so one visitor cannot fill the disk or pin every core. */
const MAX_ACTIVE_TASKS = 4;
const MAX_ACTIVE_BYTES = 8 * 1024 * 1024 * 1024;
const TASK_TTL_MS = 24 * 60 * 60 * 1000;

let ytDlpBinary = null;
let cookieArgsCache = null;

/* ---------------------------------------------------------------- yt-dlp */

/**
 * yt-dlp args that pass cookies, so age/region-restricted and "confirm you're
 * not a bot" requests succeed.
 *
 * Configure via .env:
 *   YTDLP_COOKIES_FILE      path to a Netscape-format cookies.txt
 *   YTDLP_COOKIES_BROWSER   browser to read cookies from: chrome|firefox|edge
 */
function cookieArgs() {
  if (cookieArgsCache) return cookieArgsCache;

  const args = [];
  const cookiesFile = process.env.YTDLP_COOKIES_FILE;
  const browser = process.env.YTDLP_COOKIES_BROWSER;

  if (cookiesFile) args.push("--cookies", cookiesFile);
  if (browser) args.push("--cookies-from-browser", browser);

  cookieArgsCache = args;
  return args;
}

const playerClientArgs = (clients) => [
  "--extractor-args",
  `youtube:player_client=${clients.join(",")}`,
];

/** Locate yt-dlp on PATH, then in the usual per-platform install locations. */
function findYtDlp() {
  if (ytDlpBinary) return ytDlpBinary;

  const candidates = process.platform === "win32" ? ["yt-dlp.exe", "yt-dlp"] : ["yt-dlp"];
  const check = process.platform === "win32" ? "where" : "which";

  for (const candidate of candidates) {
    try {
      execSync(`${check} ${candidate}`, { stdio: "pipe" });
      ytDlpBinary = candidate;
      return candidate;
    } catch {
      /* not on PATH */
    }
  }

  const locations = [];
  if (process.platform === "win32") {
    const local = process.env.LOCALAPPDATA || "";
    locations.push(
      path.join(local, "Microsoft", "WinGet", "Links", "yt-dlp.exe"),
      path.join(local, "Programs", "yt-dlp", "yt-dlp.exe"),
      "C:\\yt-dlp\\yt-dlp.exe"
    );

    const packages = path.join(local, "Microsoft", "WinGet", "Packages");
    try {
      for (const dir of fs.readdirSync(packages).filter((d) => d.startsWith("yt-dlp"))) {
        locations.push(path.join(packages, dir, "yt-dlp.exe"));
      }
    } catch {
      /* packages dir missing */
    }
  }

  for (const location of locations) {
    try {
      if (fs.existsSync(location)) {
        ytDlpBinary = location;
        return location;
      }
    } catch {
      /* unreadable path */
    }
  }

  return null;
}

/** yt-dlp needs ffmpeg to merge separate video+audio streams. */
function findFfmpegDir() {
  if (process.platform !== "win32") return null;

  const packages = path.join(process.env.LOCALAPPDATA || "", "Microsoft", "WinGet", "Packages");
  try {
    for (const dir of fs.readdirSync(packages)) {
      if (!dir.startsWith("yt-dlp.FFmpeg")) continue;
      const root = path.join(packages, dir);
      for (const sub of fs.readdirSync(root)) {
        const bin = path.join(root, sub, "bin", "ffmpeg.exe");
        if (fs.existsSync(bin)) return path.join(root, sub, "bin");
      }
    }
  } catch {
    /* packages dir missing */
  }
  return null;
}

/** True when the binary we resolved is actually usable right now. */
export function isYtDlpAvailable() {
  return Boolean(findYtDlp());
}

/* -------------------------------------------------------------- URL safety */

/**
 * Reject anything that is not plain public http(s).
 *
 * This endpoint takes a URL from the browser and fetches it server-side, which
 * is a textbook SSRF shape: without a check, anyone could point us at
 * 169.254.169.254 (cloud instance credentials), 127.0.0.1 (this container's own
 * API) or an internal service on a private network. We reject loopback, link
 * local, private and reserved ranges, plus anything that is not http(s).
 */
async function assertFetchable(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("That does not look like a valid URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https links are supported.");
  }

  const host = parsed.hostname.replace(/^\[|\]$/g, "");
  const addresses = net.isIP(host)
    ? [{ address: host }]
    : await dns.lookup(host, { all: true }).catch(() => []);

  if (!addresses.length) {
    throw new Error("That hostname could not be resolved.");
  }

  for (const { address } of addresses) {
    if (!isPublicAddress(address)) {
      throw new Error("That address is not publicly reachable.");
    }
  }

  return parsed;
}

function isPublicAddress(address) {
  if (net.isIPv4(address)) {
    const [a, b] = address.split(".").map(Number);
    if (a === 0 || a === 10 || a === 127) return false;
    if (a === 169 && b === 254) return false; // link local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    if (a === 100 && b >= 64 && b <= 127) return false; // CGNAT
    if (a >= 224) return false; // multicast + reserved
    return true;
  }

  if (net.isIPv6(address)) {
    const lower = address.toLowerCase();
    if (lower === "::1" || lower === "::") return false;
    if (lower.startsWith("fe80") || lower.startsWith("fc") || lower.startsWith("fd")) return false;
    if (lower.startsWith("::ffff:")) {
      // IPv4-mapped: judge the embedded address with the IPv4 rules.
      return isPublicAddress(lower.slice(7));
    }
    return true;
  }

  return false;
}

/* ------------------------------------------------------------- Formatting */

const isDirectUrl = (rawUrl) => {
  try {
    return DIRECT_EXTENSIONS.has(path.extname(new URL(rawUrl).pathname).toLowerCase());
  } catch {
    return false;
  }
};

const sanitizeFilename = (name) =>
  String(name || "video")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);

/** Pull the most useful line out of yt-dlp's stderr for the user to read. */
function ytDlpErrorMessage(stderr) {
  const lines = String(stderr || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const error = lines.find((line) => line.toLowerCase().includes("error"));
  return error || lines[lines.length - 1] || "Unknown yt-dlp error.";
}

const MIME_TYPES = {
  mp4: "video/mp4", m4v: "video/mp4", mkv: "video/x-matroska", webm: "video/webm",
  mov: "video/quicktime", avi: "video/x-msvideo", flv: "video/x-flv", ts: "video/mp2t",
  m4a: "audio/mp4", mp3: "audio/mpeg", ogg: "audio/ogg", opus: "audio/ogg",
  wav: "audio/wav", flac: "audio/flac", aac: "audio/aac",
};

const mimeForExt = (ext) => MIME_TYPES[ext] || "application/octet-stream";

/** Both an ASCII fallback and a UTF-8 name so every browser saves it properly. */
function contentDisposition(filename) {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

/**
 * Kill a worker and, on Windows, its whole child tree. yt-dlp spawns ffmpeg to
 * merge streams, so killing only yt-dlp would leave an orphan ffmpeg still
 * writing into the task directory and locking it against the resume run.
 */
function killProcessTree(proc) {
  if (!proc?.pid) return;

  if (process.platform === "win32") {
    try {
      execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: "ignore" });
      return;
    } catch {
      /* already exited; fall through */
    }
  }

  try {
    proc.kill("SIGKILL");
  } catch {
    /* already dead */
  }
}

/* --------------------------------------------------------- Link inspection */

/** HEAD-ish probe of a raw media file, used to label size and MIME type. */
async function probeMediaFile(rawUrl) {
  const { res, finalUrl } = await getFollowingRedirects(rawUrl, {
    headers: { "User-Agent": USER_AGENT, Accept: "*/*" },
    timeout: 10000,
  });

  const info = {
    contentType: res.headers["content-type"] || "application/octet-stream",
    size: parseInt(res.headers["content-length"], 10) || null,
    finalUrl,
  };

  res.resume();
  return info;
}

const MAX_REDIRECTS = 5;

/**
 * Issue a GET and hand the final (post-redirect) response to `onResponse`.
 *
 * Three reasons this exists rather than a bare http.get:
 *
 *   - Direct media links very often 301 to a CDN host. Without following, the
 *     169-byte HTML redirect stub gets saved as if it were the video.
 *   - Every hop is re-checked with assertFetchable, so a public URL cannot
 *     redirect into the private network or cloud metadata after the initial
 *     check passed.
 *   - A 4xx/5xx at any hop is surfaced as an error before we commit a file.
 */
function getFollowingRedirects(rawUrl, { headers, timeout = 60000, onRequest } = {}) {
  return new Promise((resolve, reject) => {
    let current = rawUrl;
    let hops = 0;

    const attempt = () => {
      let lib;
      try {
        lib = new URL(current).protocol === "https:" ? https : http;
      } catch {
        return reject(new Error("That does not look like a valid URL."));
      }

      const req = lib.get(current, { headers, timeout }, async (res) => {
        const status = res.statusCode || 0;
        const location = res.headers.location;

        if ([301, 302, 303, 307, 308].includes(status) && location) {
          res.resume(); // discard the redirect body
          if (hops >= MAX_REDIRECTS) {
            return reject(new Error("Too many redirects."));
          }
          hops += 1;

          try {
            const next = new URL(location, current).href;
            // Re-validate: the target of the hop is a fresh URL to approve.
            await assertFetchable(next);
            current = next;
            return attempt();
          } catch (err) {
            return reject(err);
          }
        }

        if (status >= 400) {
          res.resume();
          return reject(new Error(`Remote server returned HTTP ${status}.`));
        }

        return resolve({ res, finalUrl: current });
      });

      // Let the caller hold the socket so a cancel can tear the transfer down.
      if (onRequest) onRequest(req);

      req.on("error", reject);
      req.on("timeout", () => req.destroy(new Error("Request timed out.")));
    };

    attempt();
  });
}

const sizeOf = (format) => format?.filesize || format?.filesize_approx || null;

/**
 * Turn yt-dlp's format list into the small set of tiers a person actually
 * chooses between, and estimate each tier's size (video stream + best audio)
 * so the History page and the progress bar have something to work with.
 */
function buildQualityFormats(info) {
  const formats = info.formats || [];

  const heights = new Set();
  let bestAudio = null;

  for (const format of formats) {
    if (format.height && format.vcodec && format.vcodec !== "none") heights.add(format.height);
    if (format.vcodec === "none" && format.acodec && format.acodec !== "none") {
      if ((sizeOf(format) || 0) > (sizeOf(bestAudio) || 0)) bestAudio = format;
    }
  }

  const audioSize = sizeOf(bestAudio);

  const tierSize = (height) => {
    const candidates = formats.filter(
      (format) => format.height === height && format.vcodec && format.vcodec !== "none"
    );
    const chosen = candidates.find((format) => sizeOf(format)) || candidates[0];
    const videoSize = sizeOf(chosen);
    if (videoSize && audioSize) return videoSize + audioSize;
    return videoSize || audioSize || null;
  };

  const tiers = [
    [2160, "2160p (4K)"],
    [1440, "1440p (2K)"],
    [1080, "1080p (Full HD)"],
    [720, "720p (HD)"],
    [480, "480p"],
    [360, "360p"],
    [240, "240p"],
    [144, "144p"],
  ];

  const list = tiers
    .filter(([height]) => heights.has(height))
    .map(([height, label]) => ({
      id: String(height),
      label,
      height,
      ext: "mp4",
      size: tierSize(height),
    }));

  const bestSize = heights.size ? tierSize(Math.max(...heights)) : null;

  return {
    list,
    hasAudioOnly: Boolean(bestAudio),
    bestSize,
    audioSize,
  };
}

/** Run yt-dlp in --dump-single-json mode, trying fallback clients on failure. */
function inspectWithYtDlp(binary, url) {
  const clientSets = [["default"], YT_FALLBACK_CLIENTS];

  const runOnce = (clients) =>
    new Promise((resolve, reject) => {
      const args = [
        ...playerClientArgs(clients),
        ...cookieArgs(),
        "--dump-single-json",
        "--no-playlist",
        "--skip-download",
        "--no-warnings",
        url,
      ];

      const proc = spawn(binary, args);
      let out = "";
      let err = "";

      proc.stdout.on("data", (chunk) => { out += chunk; });
      proc.stderr.on("data", (chunk) => { err += chunk; });
      proc.on("error", reject);
      proc.on("close", (code) => {
        if (code !== 0) return reject(new Error(ytDlpErrorMessage(err)));
        try {
          resolve(JSON.parse(out));
        } catch {
          reject(new Error("Could not read the extractor's response."));
        }
      });
    });

  return (async () => {
    let lastError;

    for (const clients of clientSets) {
      try {
        return await runOnce(clients);
        // eslint-disable-next-line no-unreachable
      } catch (err) {
        lastError = err;
      }
    }

    throw new Error(
      `${lastError?.message || "Could not read that link."} ` +
        "If this is a YouTube link, set YTDLP_COOKIES_BROWSER=chrome in Backend/.env " +
        "(or YTDLP_COOKIES_FILE to a cookies.txt path) and restart the server."
    );
  })();
}

/** Resolve a user-supplied URL into the shape the Downloader page renders. */
export async function getMediaInfo(rawUrl) {
  const parsed = await assertFetchable(rawUrl);

  if (isDirectUrl(parsed.href)) {
    const probe = await probeMediaFile(parsed.href);
    const ext = path.extname(parsed.pathname).slice(1) || "mp4";

    return {
      source: "direct",
      title: sanitizeFilename(path.basename(parsed.pathname)) || "video",
      thumbnail: null,
      duration: null,
      uploader: null,
      size: probe.size,
      formats: [
        { id: "direct", label: "Original file", height: null, ext, size: probe.size },
      ],
    };
  }

  const binary = findYtDlp();
  if (!binary) {
    throw new Error(
      "yt-dlp is required to read this link but is not installed. " +
        "Install it with: winget install yt-dlp (or pip install yt-dlp)."
    );
  }

  const info = await inspectWithYtDlp(binary, parsed.href);
  const { list, hasAudioOnly, bestSize, audioSize } = buildQualityFormats(info);

  const formats = [
    { id: "best", label: "Best quality (recommended)", height: null, ext: "mp4", size: bestSize },
    ...list,
  ];

  if (hasAudioOnly) {
    formats.push({
      id: "bestaudio",
      label: "Audio only (m4a)",
      height: null,
      ext: "m4a",
      size: audioSize,
    });
  }

  return {
    source: info.extractor_key || info.extractor || "unknown",
    title: sanitizeFilename(info.title || "Untitled"),
    thumbnail: info.thumbnail || null,
    duration: info.duration || null,
    uploader: info.uploader || info.channel || null,
    size: bestSize,
    formats,
  };
}

/* ------------------------------------------------------------ Task queue */

const tasks = new Map();

const initTmpDir = () => fs.mkdirSync(TMP_DIR, { recursive: true });

/**
 * Bytes claimed by every live task, including finished ones whose file has not
 * been picked up yet.
 *
 * Completed-but-unfetched tasks still occupy disk for up to TASK_TTL_MS, so
 * counting only running work would let the real usage drift past the quota.
 */
function activeBytes() {
  let total = 0;
  for (const task of tasks.values()) {
    if (!task.error) total += bytesOnDisk(task);
  }
  return total;
}

function assertCapacity(estimatedSize) {
  if (tasks.size >= MAX_ACTIVE_TASKS) {
    throw new Error("The server is already running the maximum number of downloads. Try again shortly.");
  }
  if (estimatedSize && activeBytes() + estimatedSize > MAX_ACTIVE_BYTES) {
    throw new Error("That would exceed the server's concurrent download budget. Try a smaller quality.");
  }
}

/** Current on-disk size of a task, summing partials and finished output. */
function bytesOnDisk(task) {
  if (task.filePath && fs.existsSync(task.filePath)) {
    try {
      return fs.statSync(task.filePath).size;
    } catch {
      /* fall through to the directory scan */
    }
  }

  let received = 0;
  try {
    for (const name of fs.readdirSync(task.taskDir)) {
      try {
        const stats = fs.statSync(path.join(task.taskDir, name));
        if (stats.isFile()) received += stats.size;
      } catch {
        /* file vanished mid-scan */
      }
    }
  } catch {
    /* task dir missing */
  }
  return received;
}

/**
 * Find the finished media inside a task directory.
 *
 * yt-dlp leaves several shapes behind depending on where it died:
 *   download.mp4            final file, all done
 *   download.temp.mp4       merged, but the rename never happened — this is the
 *                           classic "stuck at ~1 GB" leftover
 *   download.f399.mp4       separate video and audio streams, not yet merged
 *   *.part                  still downloading
 */
function pickOutputFile(taskDir) {
  let names = [];
  try {
    names = fs.readdirSync(taskDir);
  } catch {
    return null;
  }

  const settled = names.filter((name) => !name.endsWith(".part"));
  if (!settled.length) return null;

  const final = settled.find((name) => /^download\.[a-z0-9]{2,4}$/i.test(name));
  if (final) return path.join(taskDir, final);

  const temp = settled.find((name) => /^download\.temp\./i.test(name));
  if (temp) return path.join(taskDir, temp);

  const streams = settled.filter((name) => /^download\.f\d+\./i.test(name));
  if (streams.length === 1) return path.join(taskDir, streams[0]);

  return null;
}

/**
 * Decide whether the picked file is really the finished download rather than a
 * half-written one. yt-dlp can exit while a merge is still in flight.
 */
function outputLooksComplete(filePath, task) {
  let size = 0;
  try {
    size = fs.statSync(filePath).size;
  } catch {
    return false;
  }
  if (!size) return false;

  if (/^download\.[a-z0-9]{2,4}$/i.test(path.basename(filePath))) return true;

  const dir = path.dirname(filePath);
  let streamBytes = 0;
  try {
    for (const name of fs.readdirSync(dir)) {
      if (/^download\.f\d+\./i.test(name) && !name.endsWith(".part")) {
        streamBytes += fs.statSync(path.join(dir, name)).size;
      }
    }
  } catch {
    /* ignore */
  }

  // A single stream that accounts for nearly all downloaded bytes is finished
  // even without a merged sibling (e.g. bestaudio, or a video-only source).
  if (streamBytes > 0 && size >= streamBytes * 0.99) return true;
  if (task?.size && size >= task.size * 0.98) return true;

  return false;
}

/**
 * Do yt-dlp's last step ourselves. When a completed download.temp.* file is
 * sitting on disk, rename it to the final name so the task can finish even
 * though yt-dlp died before doing so.
 */
function finalizeOutputFile(taskDir) {
  const filePath = pickOutputFile(taskDir);
  if (!filePath) return null;

  const base = path.basename(filePath);
  if (!/^download\.temp\./i.test(base)) return filePath;

  const finalPath = path.join(taskDir, `download.${path.extname(filePath).slice(1) || "mp4"}`);
  try {
    fs.renameSync(filePath, finalPath);
    return finalPath;
  } catch {
    return filePath;
  }
}

/** Drop leftover DASH streams and .part files once output is chosen. */
function cleanupTaskDir(taskDir, keepFile) {
  try {
    for (const name of fs.readdirSync(taskDir)) {
      const full = path.join(taskDir, name);
      if (full === keepFile) continue;
      if (name.endsWith(".part") || /^download\.f\d+\./i.test(name)) {
        try {
          fs.unlinkSync(full);
        } catch {
          /* still locked by a lingering ffmpeg */
        }
      }
    }
  } catch {
    /* ignore */
  }
}

export function deleteTask(id) {
  const task = tasks.get(id);
  if (!task) return false;

  tasks.delete(id);
  clearInterval(task.watchdog);
  clearTimeout(task.cleanupTimer);

  killProcessTree(task.proc);

  if (task.req) {
    try {
      task.req.destroy();
    } catch {
      /* already closed */
    }
  }

  try {
    fs.rmSync(task.taskDir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }

  return true;
}

/** Hourly sweep: forget finished tasks and reclaim orphaned temp directories. */
function sweepOldTasks() {
  const cutoff = Date.now() - TASK_TTL_MS;
  const activeDirs = new Set([...tasks.values()].map((task) => task.taskDir));

  for (const [id, task] of tasks) {
    if (task.startedAt < cutoff) deleteTask(id);
  }

  try {
    for (const name of fs.readdirSync(TMP_DIR)) {
      const full = path.join(TMP_DIR, name);
      if (activeDirs.has(full)) continue;
      try {
        if (fs.statSync(full).mtimeMs < cutoff) {
          fs.rmSync(full, { recursive: true, force: true });
        }
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* tmp dir missing */
  }
}

sweepOldTasks();
setInterval(sweepOldTasks, 60 * 60 * 1000).unref();

/* ------------------------------------------------------------- Downloaders */

/** Stream a raw media URL straight through to the browser, nothing on disk. */
async function streamDirect(rawUrl, filename, res) {
  const { res: remote } = await getFollowingRedirects(rawUrl, {
    headers: { "User-Agent": USER_AGENT, Accept: "*/*" },
  });

  res.setHeader("Content-Type", remote.headers["content-type"] || "application/octet-stream");
  res.setHeader("Content-Disposition", contentDisposition(filename));
  if (remote.headers["content-length"]) {
    res.setHeader("Content-Length", remote.headers["content-length"]);
  }
  res.writeHead(200);

  await new Promise((resolve, reject) => {
    remote.on("error", reject);
    remote.on("end", resolve);
    remote.pipe(res);
  });
}

/** Download a raw media URL to disk with HTTP Range resume support. */
async function downloadDirectToFile(rawUrl, outFile, task) {
  const headers = { "User-Agent": USER_AGENT, Accept: "*/*" };
  if (task.received > 0) headers.Range = `bytes=${task.received}-`;

  const { res: remote } = await getFollowingRedirects(rawUrl, {
    headers,
    onRequest: (req) => { task.req = req; },
  });

  const resumed = remote.statusCode === 206;

  // A 200 to a ranged request means the server ignored Range, so the partial
  // file would corrupt the result. Throw it away and restart.
  if (!resumed && task.received > 0) {
    task.received = 0;
    try {
      fs.unlinkSync(outFile);
    } catch {
      /* nothing to remove */
    }
  }

  if (!task.size && remote.headers["content-length"]) {
    task.size = (resumed ? task.received : 0) + parseInt(remote.headers["content-length"], 10);
  }

  await new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(outFile, {
      flags: resumed || task.received > 0 ? "a" : "w",
    });

    remote.on("data", (chunk) => { task.received += chunk.length; });
    stream.on("finish", resolve);
    stream.on("error", reject);
    remote.on("error", reject);
    remote.pipe(stream);
  });
}

/** Spawn yt-dlp and resolve on a clean exit. Rejects with a readable message. */
function runYtDlp(binary, args, task) {
  return new Promise((resolve, reject) => {
    const proc = spawn(binary, args);
    if (task) task.proc = proc;

    let err = "";
    proc.stderr.on("data", (chunk) => { err += chunk; });

    proc.on("error", reject);
    proc.on("close", (code) => {
      if (task && task.proc === proc) task.proc = null;
      if (code === 0) return resolve();
      reject(new Error(ytDlpErrorMessage(err)));
    });
  });
}

/** Turn a formatId into yt-dlp selector args. */
function buildSelector(formatId) {
  if (!formatId || formatId === "best") return { merge: "bv*+ba/b", single: "b" };
  if (formatId === "bestaudio") return null;

  const height = parseInt(formatId, 10);
  if (Number.isFinite(height)) {
    return {
      merge: `bv*[height<=${height}]+ba/b[height<=${height}]`,
      single: `b[height<=${height}]`,
    };
  }

  return { merge: formatId, single: formatId };
}

/**
 * Run yt-dlp to completion into the task directory, retrying across selector
 * fallbacks and extractor clients. Each attempt reuses the .part file, so a
 * retry resumes rather than restarting.
 */
async function downloadWithYtDlp({ url, formatId }, task, outTemplate) {
  const binary = findYtDlp();
  if (!binary) throw new Error("yt-dlp is not installed.");

  const attempts = [];
  if (formatId === "bestaudio") {
    attempts.push({ args: ["-f", "ba", "--recode-video", "m4a"] });
  } else {
    const selector = buildSelector(formatId);
    attempts.push({ args: ["-f", selector.merge, "--merge-output-format", "mp4"] });
    if (selector.merge !== selector.single) {
      // Some sources have no separate audio stream; retry without merging.
      attempts.push({ args: ["-f", selector.single, "--merge-output-format", "mp4"] });
    }
  }

  const clientSets = [["default"], YT_FALLBACK_CLIENTS];

  const tryNext = async (attemptIndex, clientIndex) => {
    if (task.stalled) throw new Error(task.error || "Download stalled.");
    if (attemptIndex >= attempts.length) throw new Error("The download could not be completed.");

    const baseArgs = ["--no-playlist", "--no-mtime", "--no-warnings", ...RESILIENCE_ARGS];

    const ffmpegDir = findFfmpegDir();
    if (ffmpegDir) baseArgs.push("--ffmpeg-location", ffmpegDir);

    baseArgs.push(...cookieArgs(), ...playerClientArgs(clientSets[clientIndex]));

    const args = [...baseArgs, ...attempts[attemptIndex].args, "-o", outTemplate, url];

    try {
      await runYtDlp(binary, args, task);
    } catch (err) {
      if (task.stalled || task.done) throw err;

      // yt-dlp may have died right after merging. If a complete file is on
      // disk, use it rather than falling through to the next attempt.
      const existing = finalizeOutputFile(task.taskDir);
      if (existing && outputLooksComplete(existing, task)) {
        task.filePath = existing;
        cleanupTaskDir(task.taskDir, existing);
        return;
      }

      if (clientIndex + 1 < clientSets.length) return tryNext(attemptIndex, clientIndex + 1);
      return tryNext(attemptIndex + 1, 0);
    }

    const filePath = finalizeOutputFile(task.taskDir);
    if (filePath) {
      task.filePath = filePath;
      cleanupTaskDir(task.taskDir, filePath);
      return;
    }

    if (clientIndex + 1 < clientSets.length) return tryNext(attemptIndex, clientIndex + 1);
    return tryNext(attemptIndex + 1, 0);
  };

  await tryNext(0, 0);
}

/* ------------------------------------------------------------ Task runner */

/**
 * Kick off a download and return its id immediately; the client polls status.
 *
 * The body runs a resume loop around the worker. A stalled task is killed by the
 * watchdog, which sets `stalled`, and the loop below notices and starts the
 * worker again from the existing .part file.
 */
export function startDownloadTask({ url, formatId, filename, size, onFinish, onError }) {
  sweepOldTasks();

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("That does not look like a valid URL.");
  }

  assertCapacity(size);

  initTmpDir();

  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const taskDir = fs.mkdtempSync(path.join(TMP_DIR, `${id}-`));

  const task = {
    id,
    taskDir,
    filename: sanitizeFilename(filename) || "video",
    url: parsed.href,
    formatId: formatId || "best",
    size: size || null,
    received: 0,
    startedAt: Date.now(),
    done: false,
    error: null,
    filePath: null,
    proc: null,
    req: null,
    stalled: false,
    lastBytes: 0,
    lastActivityAt: Date.now(),
    stallCount: 0,
    watchdog: null,
    cleanupTimer: null,
  };

  tasks.set(id, task);
  task.lastBytes = bytesOnDisk(task);

  const stopWorker = () => {
    killProcessTree(task.proc);
    if (task.req) {
      try {
        task.req.destroy();
      } catch {
        /* already closed */
      }
    }
  };

  // Watchdog: yt-dlp can hang on a dead socket indefinitely, making a large
  // download look permanently stuck. Nothing on disk for STALL_WINDOW_MS means
  // something is wrong, so kill the worker and let the loop resume it.
  task.watchdog = setInterval(() => {
    if (task.done || task.error) return clearInterval(task.watchdog);

    const received = bytesOnDisk(task);
    if (received > task.lastBytes) {
      task.lastBytes = received;
      task.lastActivityAt = Date.now();
      task.stallCount = 0;
      return;
    }

    if (Date.now() - task.lastActivityAt <= STALL_WINDOW_MS) return;

    // A finished download.temp.* means yt-dlp died just after merging. Adopt it
    // so the user gets their file instead of an error.
    const existing = finalizeOutputFile(task.taskDir);
    if (existing && outputLooksComplete(existing, task)) {
      stopWorker();
      cleanupTaskDir(task.taskDir, existing);
      task.filePath = existing;
      try {
        task.received = fs.statSync(existing).size;
      } catch {
        task.received = bytesOnDisk(task);
      }
      task.done = true;
      clearInterval(task.watchdog);
      if (onFinish) onFinish(task);
      return;
    }

    task.stallCount += 1;

    if (task.stallCount > MAX_STALL_RECOVERIES) {
      task.stalled = true;
      task.error =
        `The download stalled — no progress for ${Math.round(STALL_WINDOW_MS / 60000)} minutes ` +
        `after ${MAX_STALL_RECOVERIES} recovery attempts.`;
      stopWorker();
      if (onError) onError(task.error);
      task.cleanupTimer = setTimeout(() => deleteTask(id), 30 * 1000);
      return clearInterval(task.watchdog);
    }

    // Recoverable stall: kill the worker, let the loop below resume from .part.
    task.stalled = true;
    task.lastBytes = received;
    task.lastActivityAt = Date.now();
    stopWorker();
  }, 10 * 1000);

  const run = async () => {
    const direct = isDirectUrl(task.url) || task.formatId === "direct";
    const ext = direct ? path.extname(parsed.pathname).toLowerCase() || ".mp4" : null;
    const outFile = direct ? path.join(task.taskDir, `download${ext}`) : null;
    const outTemplate = direct ? null : path.join(task.taskDir, "download.%(ext)s");

    while (!task.done && !task.error) {
      if (task.stalled) {
        task.stalled = false;
        await new Promise((resolve) => setTimeout(resolve, 2000));

        if (outFile && fs.existsSync(outFile)) {
          try {
            task.received = fs.statSync(outFile).size;
          } catch {
            /* ignore */
          }
        }

        task.lastBytes = bytesOnDisk(task);
        task.lastActivityAt = Date.now();
      }

      try {
        if (direct) {
          await downloadDirectToFile(task.url, outFile, task);
          // The direct path writes straight to its final name, so there is no
          // .part/merge dance for pickOutputFile to resolve.
          if (task.stalled || task.done) continue;
          task.filePath = outFile;
        } else {
          await downloadWithYtDlp({ url: task.url, formatId: task.formatId }, task, outTemplate);
          if (task.stalled || task.done) continue;
        }

        if (!task.filePath || !fs.existsSync(task.filePath)) {
          throw new Error("The download finished without producing a file.");
        }

        task.received = fs.statSync(task.filePath).size;
        task.done = true;
        if (onFinish) onFinish(task);
      } catch (err) {
        if (task.done) break;

        // A watchdog kill sets `stalled`; loop round and resume rather than fail.
        if (task.stalled && task.stallCount <= MAX_STALL_RECOVERIES) continue;
        if (task.error) break;

        task.error = err.message || "The download failed.";
        if (onError) onError(task.error);
      }
    }

    clearInterval(task.watchdog);
  };

  // Fire and forget; failures are reported through onError.
  Promise.resolve().then(run).catch(() => {});

  return id;
}

/** Progress snapshot for the polling endpoint. */
export function getTaskProgress(id) {
  const task = tasks.get(id);
  if (!task) return null;

  if (task.error) {
    return {
      id,
      received: task.received,
      total: task.size,
      percent: 0,
      speed: 0,
      eta: null,
      done: false,
      error: task.error,
    };
  }

  task.received = Math.max(bytesOnDisk(task), task.received);

  const elapsed = (Date.now() - task.startedAt) / 1000;
  const total = task.size || null;
  const percent = total ? Math.min(100, (task.received / total) * 100) : null;
  const speed = elapsed > 0 ? task.received / elapsed : 0;
  const eta = total && speed > 0 ? (total - task.received) / speed : null;

  return { id, received: task.received, total, percent, speed, eta, done: task.done, error: null };
}

/** The finished file for a task, or null when it is not ready. */
export function getTaskFile(id) {
  const task = tasks.get(id);
  if (!task || !task.done || !task.filePath) return null;
  if (!fs.existsSync(task.filePath)) return null;
  return { task, filePath: task.filePath };
}

/**
 * Send a finished file to the browser as an attachment, then delete it. The
 * route that calls this is also responsible for dropping the task.
 */
export function sendTaskFile(res, filePath, filename) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(filePath).slice(1) || "mp4";
    const finalName = `${sanitizeFilename(filename) || "video"}.${ext}`;

    res.setHeader("Content-Type", mimeForExt(ext));
    res.setHeader("Content-Disposition", contentDisposition(finalName));

    const stream = fs.createReadStream(filePath);

    stream.on("error", reject);

    // The browser hanging up mid-transfer must not leak the file on disk.
    res.on("close", () => {
      fs.unlink(filePath, () => {});
      resolve();
    });

    stream.pipe(res);
  });
}

export { streamDirect };