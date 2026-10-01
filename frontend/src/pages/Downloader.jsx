import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FaClock,
  FaDownload,
  FaExclamationTriangle,
  FaFilm,
  FaLink,
  FaRedo,
  FaServer,
  FaTags,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import {
  Badge,
  Button,
  Card,
  Eyebrow,
  SectionHeading,
} from "../components/ui/primitives";
import {
  cancelDownload,
  downloadFileUrl,
  fetchDownloadProgress,
  fetchMediaInfo,
  fetchMediaStatus,
  formatDuration,
  formatEta,
  formatPercent,
  isMissingBackend,
  startDownload,
} from "../api/media";
import { formatBytes } from "../api/client";
import { cx } from "../lib/cx";

const SITES = [
  { label: "YouTube", tone: "brand" },
  { label: "Vimeo", tone: "aqua" },
  { label: "SoundCloud", tone: "mint" },
  { label: "Direct .mp4", tone: "gold" },
];

const MEDIA_FEATURES = [
  {
    icon: FaFilm,
    title: "Video files",
    body: "MP4 and WebM at whatever quality the source actually offers.",
  },
  {
    icon: FaTags,
    title: "Format picker",
    body: "Take the best available stream, pick a resolution, or strip it back to audio.",
  },
  {
    icon: FaServer,
    title: "Nothing uploaded",
    body: "URLs are fetched by your own backend. No third-party service sees them.",
  },
];

const NoBackend = () => (
  <Card className="flex flex-col items-center p-8 text-center sm:p-10">
    <span className="grid size-14 place-items-center rounded-2xl bg-gold-500/14 text-gold-300">
      <FaExclamationTriangle className="text-xl" />
    </span>
    <h2 className="mt-6 font-display text-lg font-bold">Backend not reachable</h2>
    <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
      The media routes did not answer. Check that the Backend is running on the
      port this frontend points at, then try again.
    </p>
    <Badge tone="gold" className="mt-6">
      Backend offline
    </Badge>
  </Card>
);

const BackendOffline = () => (
  <p className="mx-auto mt-6 max-w-lg rounded-xl border border-rose-400/25 bg-rose-500/12 px-5 py-4 text-center text-sm leading-relaxed text-rose-200">
    <strong className="font-semibold">The backend is not running.</strong> Start it with{" "}
    <code className="font-mono">npm run dev</code> in the{" "}
    <code className="font-mono">Backend</code> folder, then reload this page.
  </p>
);

const YtDlpMissing = () => (
  <p className="mx-auto mt-6 max-w-lg rounded-xl border border-gold-400/25 bg-gold-500/12 px-5 py-4 text-center text-sm leading-relaxed text-gold-200">
    <strong className="font-semibold">yt-dlp is not installed on the server,</strong> so only
    direct media links will work. Install it with{" "}
    <code className="font-mono">winget install yt-dlp</code> (or{" "}
    <code className="font-mono">pip install yt-dlp</code>) and restart the backend.
  </p>
);

/* ------------------------------------------------------------- Progress */

const StatTile = ({ label, value }) => (
  <div className="rounded-xl border border-white/8 bg-ink-850/60 px-4 py-3.5 text-center">
    <p className="font-display text-sm font-bold text-white">{value}</p>
    <p className="mt-1 text-[11px] text-slate-500">{label}</p>
  </div>
);

const ProgressPanel = ({ taskId, title, onCancel, onDone }) => {
  /* null = no snapshot yet, so nothing may read status.<field> unguarded. */
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);

  const savedRef = useRef(false);
  const cancelledRef = useRef(false);

  const saveFile = useCallback(() => {
    // The backend deletes the file as soon as this request completes, so this
    // must happen exactly once.
    if (savedRef.current) return;
    savedRef.current = true;

    const anchor = document.createElement("a");
    anchor.href = downloadFileUrl(taskId);
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setFinished(true);
    onDone?.();
  }, [taskId, onDone]);

  useEffect(() => {
    let stopped = false;
    let timer;

    const tick = async () => {
      if (stopped || cancelledRef.current) return;

      try {
        const next = await fetchDownloadProgress(taskId);
        if (stopped) return;

        setStatus(next);

        if (next.error) {
          clearInterval(timer);
          setError(next.error);
          return;
        }

        if (next.done) {
          clearInterval(timer);
          saveFile();
        }
      } catch (err) {
        if (stopped || cancelledRef.current) return;
        clearInterval(timer);
        setError(
          isMissingBackend(err)
            ? "The server forgot this download — it may have been cleaned up."
            : err.message
        );
      }
    };

    timer = setInterval(tick, 1000);
    tick();

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [taskId, saveFile]);

  const percent = status?.percent;
  const indeterminate = percent == null && !status?.error;
  const width = indeterminate ? "35%" : `${Math.max(0, Math.min(100, percent ?? 0))}%`;

  return (
    <Card className="p-6 sm:p-8">
      <div className="text-center">
        <span
          className={cx(
            "mx-auto grid size-14 place-items-center rounded-2xl text-xl text-white shadow-lg",
            status?.error
              ? "bg-linear-to-br from-rose-ink to-brand-500"
              : finished
                ? "bg-linear-to-br from-mint-400 to-mint-600"
                : "bg-linear-to-br from-brand-500 to-aqua-500",
          )}
        >
          {status?.error ? <FaTimes /> : finished ? <FaDownload /> : <FaDownload />}
        </span>

        <h2 className="mt-5 font-display text-lg font-bold">
          {status?.error ? "Download failed" : finished ? "Saved" : "Downloading"}
        </h2>
        <p className="mt-2 truncate text-sm text-slate-500">{title}</p>
      </div>

      {status?.error ? (
        <p className="mt-6 rounded-xl border border-rose-400/25 bg-rose-500/12 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : (
        <>
          {status ? (
            <div className="mt-7 h-2.5 w-full overflow-hidden rounded-full bg-white/8">
              <div
                className={cx(
                  "h-full rounded-full bg-linear-to-r from-brand-500 to-aqua-500 transition-[width] duration-700 ease-out",
                  indeterminate && "animate-pulse",
                )}
                style={{ width }}
              />
            </div>
          ) : null}

          {status ? (
            <>
              <div className="mt-3 flex items-center justify-between text-sm">
            <span className="font-display text-lg font-bold text-white">
              {formatPercent(percent)}
            </span>
            <span className="text-slate-500">
              {indeterminate
                ? "Starting…"
                : `${formatBytes(status.received || 0)} of ${formatBytes(status.total)}`}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
                <StatTile label="Speed" value={`${formatBytes(status.speed || 0)}/s`} />
                <StatTile label="Time left" value={formatEta(status.eta)} />
                <StatTile
                  label="Remaining"
                  value={formatBytes(
                    Math.max(0, (status.total || 0) - (status.received || 0))
                  )}
                />
              </div>
            </>
          ) : (
            /* First poll has not returned yet — show a quiet placeholder rather
               than an empty panel or a crash on status.speed. */
            <p className="mt-7 text-center text-sm text-slate-500">Connecting to the server…</p>
          )}

          {!finished ? (
            <Button
              onClick={async () => {
                cancelledRef.current = true;
                await cancelDownload(taskId);
                onCancel();
              }}
              variant="outline"
              size="md"
              className="mt-7 w-full"
            >
              Cancel
            </Button>
          ) : (
            <p className="mt-7 text-center text-xs text-slate-500">
              Check your browser&apos;s downloads.
            </p>
          )}
        </>
      )}
    </Card>
  );
};

/* --------------------------------------------------------------- Result */

const MediaResult = ({ info, url, onStart }) => {
  const [formatId, setFormatId] = useState(info.formats?.[0]?.id || "best");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    setStarting(true);
    setError("");

    try {
      await onStart({
        url,
        formatId,
        title: info.title,
        source: info.source,
        thumbnail: info.thumbnail,
        size: info.formats?.find((format) => format.id === formatId)?.size,
      });
    } catch (err) {
      setError(err.message);
      setStarting(false);
    }
  };

  return (
    <Card className="grid gap-6 p-6 lg:grid-cols-[220px_1fr]">
      {info.thumbnail ? (
        <img
          src={info.thumbnail}
          alt={info.title || "Media thumbnail"}
          className="h-36 w-full rounded-xl border border-white/8 object-cover lg:h-full"
        />
      ) : (
        <div className="grid h-36 w-full place-items-center rounded-xl border border-white/8 bg-ink-850/60 text-3xl lg:h-full">
          <FaFilm className="text-slate-500" />
        </div>
      )}

      <div className="flex min-w-0 flex-col gap-5">
        <div className="min-w-0">
          <Eyebrow icon={FaLink}>{info.source || "unknown"}</Eyebrow>
          <h2 className="mt-3 font-display text-lg font-bold break-words">
            {info.title || "Untitled"}
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {info.duration ? (
              <Badge tone="muted">
                <FaClock className="mr-1 size-3" />
                {formatDuration(info.duration)}
              </Badge>
            ) : null}
            {info.uploader ? (
              <Badge tone="muted">
                <FaUser className="mr-1 size-3" />
                {info.uploader}
              </Badge>
            ) : null}
            {info.size ? <Badge tone="muted">{formatBytes(info.size)}</Badge> : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <select
              value={formatId}
              onChange={(event) => setFormatId(event.target.value)}
              aria-label="Choose a format"
              className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-ink-900/70 pr-9 pl-4 text-[13px] font-medium text-white transition outline-none focus:border-brand-400/60 focus:ring-4 focus:ring-brand-500/18"
            >
              {(info.formats || []).map((format) => (
                <option key={format.id} value={format.id}>
                  {format.label}
                  {format.size ? ` · ${formatBytes(format.size)}` : ""}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-500"
            >
              <path
                d="m6 8 4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <Button onClick={handleStart} disabled={starting} size="md" className="shrink-0">
            <FaDownload className="size-4" />
            {starting ? "Starting…" : "Download"}
          </Button>
        </div>

        {error ? (
          <p className="rounded-xl border border-rose-400/25 bg-rose-500/12 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
      </div>
    </Card>
  );
};

/* ------------------------------------------------------------------ Page */

const Downloader = () => {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendMissing, setBackendMissing] = useState(false);
  const [task, setTask] = useState(null);
  // undefined = checking, null = backend unreachable, otherwise { ytdlp }.
  const [status, setStatus] = useState(undefined);

  useEffect(() => {
    fetchMediaStatus().then(setStatus);
  }, []);

  const reset = () => {
    setUrl("");
    setInfo(null);
    setError("");
    setTask(null);
    setLoading(false);
  };

  const analyze = async (event) => {
    event.preventDefault();
    const value = url.trim();
    if (!value || loading) return;

    setLoading(true);
    setError("");
    setInfo(null);
    setBackendMissing(false);

    try {
      setInfo({ ...(await fetchMediaInfo(value)), url: value });
    } catch (err) {
      if (isMissingBackend(err)) setBackendMissing(true);
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const beginDownload = async (payload) => {
    const { id } = await startDownload(payload);
    setTask({ id, title: payload.title });
    setInfo(null);
  };

  return (
    <div className="relative">
      {/* ============================================================== Hero */}
      <section className="relative overflow-hidden px-4 pt-16 pb-16 sm:px-6 sm:pt-24 lg:px-8">
        <div
          aria-hidden="true"
          className="dot-backdrop absolute inset-0 -z-10 opacity-25 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]"
        />

        <div className="mx-auto w-full max-w-7xl">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Eyebrow icon={FaDownload}>Media grab</Eyebrow>
            <h1 className="mt-7 text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="gradient-text">Any link,</span>{" "}
              <span className="text-white">saved locally.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
              Paste a media URL and pick a format. The file streams straight from
              your own backend to your browser — nothing is stored on a
              third-party service.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {SITES.map((site) => (
                <Badge key={site.label} tone={site.tone}>
                  {site.label}
                </Badge>
              ))}
            </div>

            {status === null ? <BackendOffline /> : null}
            {status && !status.ytdlp ? <YtDlpMissing /> : null}
          </div>

          {/* Direct links work without yt-dlp, so the form stays usable when it is
              missing; only an offline backend disables it. */}
          {task ? null : (
            <Card className="mx-auto mt-12 max-w-3xl p-6 sm:p-7">
              <form onSubmit={analyze} className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <FaLink className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://…"
                    aria-label="Media URL"
                    autoComplete="off"
                    spellCheck="false"
                    className="h-12 w-full rounded-xl border border-white/10 bg-ink-900/70 pr-4 pl-11 text-sm text-white placeholder:text-slate-500 transition outline-none focus:border-brand-400/60 focus:bg-ink-850 focus:ring-4 focus:ring-brand-500/18"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !url.trim() || status === null}
                  size="lg"
                  className="shrink-0"
                >
                  {loading ? "Reading link…" : "Analyse"}
                </Button>
              </form>

              {info || error ? (
                <button
                  type="button"
                  onClick={reset}
                  className="mx-auto mt-5 flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-300"
                >
                  <FaRedo className="size-3" />
                  Start over
                </button>
              ) : null}
            </Card>
          )}

          {/* ------------------------------------------------------ States */}
          <div className="mx-auto mt-8 max-w-3xl">
            {task ? (
              <ProgressPanel
                taskId={task.id}
                title={task.title}
                onCancel={() => {
                  setTask(null);
                  toast("Download cancelled.", { icon: "🚫" });
                }}
                onDone={() => toast.success("Saved to your downloads.")}
              />
            ) : null}

            {loading ? (
              <Card className="flex items-center justify-center gap-3 p-10 text-sm text-slate-400">
                <span className="size-5 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
                Reading the link…
              </Card>
            ) : null}

            {backendMissing ? <NoBackend /> : null}

            {error ? (
              <Card className="flex items-start gap-4 p-6">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-500/12 text-rose-300">
                  <FaExclamationTriangle className="text-base" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-base font-bold">Could not read that link</h2>
                  <p className="mt-2 text-sm leading-relaxed break-words text-slate-400">{error}</p>
                </div>
              </Card>
            ) : null}

            {info ? (
              <MediaResult info={info} url={info.url} onStart={beginDownload} />
            ) : null}
          </div>
        </div>
      </section>

      {/* ========================================================== Features */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-7xl">
          <SectionHeading
            eyebrow="How it works"
            icon={FaFilm}
            title="Three guarantees"
            description="What this page promises you."
          />

          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
            {MEDIA_FEATURES.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-linear-to-br from-aqua-400 to-aqua-600 text-white shadow-lg">
                  <Icon className="text-base" />
                </span>
                <h3 className="mt-5 text-base font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Downloader;