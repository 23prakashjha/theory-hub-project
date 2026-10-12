// scripts/vendor-ytdlp.mjs
// Fetch a yt-dlp binary that matches the machine doing the install.
//
// Why this exists: yt-dlp is a standalone program, not a Node package, so a
// plain `npm install` leaves the media downloader broken on any host that does
// not already have it on PATH (Render's build containers, Docker, CI, a fresh
// colleague's laptop). The old advice was "winget install yt-dlp", which only
// helps on Windows and cannot be run from inside a Linux build anyway.
//
// Running this from `postinstall` means the binary lands in Backend/vendor/ on
// every machine that installs the project, and mediaService.js resolves it from
// there. The download is verified against yt-dlp's published SHA2-256SUMS so a
// corrupted or tampered mirror cannot silently become our extractor.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const VENDOR_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "vendor");

const RELEASE_BASE = "https://github.com/yt-dlp/yt-dlp/releases/latest/download";

/* Release asset per platform. yt-dlp ships a self-contained executable for
   each one, so there is no Python or interpreter dependency to satisfy. */
const ASSETS = {
  "win32-x64": "yt-dlp.exe",
  "win32-arm64": "yt-dlp_arm64.exe",
  "win32-ia32": "yt-dlp_x86.exe",
  "darwin-x64": "yt-dlp_macos",
  "darwin-arm64": "yt-dlp_macos",
  "linux-x64": "yt-dlp_linux",
  "linux-arm64": "yt-dlp_linux_aarch64",
  "linux-ia32": "yt-dlp_linux",
  // Alpine and other musl builds ship as separate binaries.
  "linuxmusl-x64": "yt-dlp_musllinux",
  "linuxmusl-arm64": "yt-dlp_musllinux_aarch64",
};

const key = `${process.platform}-${process.arch}`;
const asset = ASSETS[key];

const targetName = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
const target = path.join(VENDOR_DIR, targetName);

/** Version marker so a later release is not mistaken for a stale cache hit. */
const stampFile = path.join(VENDOR_DIR, ".ytdlp-release");

/**
 * A usable binary already on disk is left alone. `npm install` runs on every
 * deploy, and re-pulling ~40 MB each time would slow every build for nothing.
 * The stamp holds the release tag, so upgrading yt-dlp is just a matter of
 * removing that file (or letting MEDIA_YTDLP_FORCE=1 rebuild do it).
 */
function alreadyVendored() {
  if (process.env.MEDIA_YTDLP_FORCE === "1") return false;
  try {
    if (!fs.existsSync(target) || !fs.existsSync(stampFile)) return false;
    return fs.statSync(target).size > 0;
  } catch {
    return false;
  }
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "codetheory-vendor-ytdlp" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}`);
  return res.text();
}

async function download(url, destination) {
  const res = await fetch(url, {
    headers: { "User-Agent": "codetheory-vendor-ytdlp" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}`);
  if (!res.body) throw new Error(`GET ${url} -> empty body`);

  // Write to a temp name first so an interrupted build never leaves a
  // truncated binary that later looks like a valid install.
  const partial = `${destination}.part`;
  await pipeline(res.body, fs.createWriteStream(partial));
  fs.renameSync(partial, destination);
}

const sha256 = async (file) => {
  const hash = createHash("sha256");
  hash.update(await fs.promises.readFile(file));
  return hash.digest("hex");
};

/** yt-dlp publishes one "<hex>  <name>" line per asset. */
async function expectedDigest(name) {
  const sums = await fetchText(`${RELEASE_BASE}/SHA2-256SUMS`);
  const line = sums.split(/\r?\n/).find((row) => row.trim().endsWith(`  ${name}`));
  if (!line) throw new Error(`No SHA2-256SUMS entry for ${name}`);
  return line.trim().split(/\s+/)[0];
}

async function main() {
  if (!asset) {
    // An unknown platform is not a build failure: the app still runs, it just
    // falls back to a yt-dlp that a human installed by hand.
    console.warn(`[vendor-ytdlp] no release binary for ${key}; skipping.`);
    return;
  }

  if (alreadyVendored()) {
    console.log(`[vendor-ytdlp] already present at ${target}`);
    return;
  }

  fs.mkdirSync(VENDOR_DIR, { recursive: true });

  console.log(`[vendor-ytdlp] downloading ${asset} for ${key}...`);
  await download(`${RELEASE_BASE}/${asset}`, target);

  const [want, got] = await Promise.all([expectedDigest(asset), sha256(target)]);
  if (want !== got) {
    fs.rmSync(target, { force: true });
    throw new Error(`checksum mismatch for ${asset}: expected ${want}, got ${got}`);
  }

  // GitHub does not preserve the executable bit through a raw asset download.
  if (process.platform !== "win32") fs.chmodSync(target, 0o755);

  // Record what was installed so build logs show it, and so the presence check
  // above can tell a complete download from a half-written one.
  fs.writeFileSync(stampFile, `${asset}\n${new Date().toISOString()}\n`);

  console.log(`[vendor-ytdlp] installed ${target}`);
}

main().catch((err) => {
  // A failed download must never break `npm install`: the service still boots,
  // and /api/media/status reports yt-dlp as unavailable so the reason is visible.
  console.warn(`[vendor-ytdlp] skipped: ${err.message}`);
  console.warn("[vendor-ytdlp] media downloads will be limited to direct links.");
});
