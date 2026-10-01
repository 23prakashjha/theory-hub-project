import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaDownload,
  FaFilm,
  FaMusic,
  FaRedo,
  FaTrash,
} from "react-icons/fa";
import {
  Badge,
  Button,
  Card,
  Eyebrow,
} from "../components/ui/primitives";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  clearHistory,
  deleteHistoryItem,
  fetchHistory,
} from "../api/media";
import { formatBytes } from "../api/client";
import { cx } from "../lib/cx";

/* Heuristic only — the API does not label a row as audio or video. */
const AUDIO_HINTS = [
  "soundcloud",
  "bandcamp",
  "spotify",
  "deezer",
  "apple music",
  "music",
  "audio",
  "podcast",
];

const guessKind = (item) => {
  const haystack = `${item.source || ""} ${item.title || ""}`.toLowerCase();
  return AUDIO_HINTS.some((hint) => haystack.includes(hint)) ? "song" : "video";
};

const formatWhen = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString();
};

const HistoryRow = ({ item, kind, onDelete }) => (
  <li className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
    {item.thumbnail ? (
      <img
        src={item.thumbnail}
        alt=""
        loading="lazy"
        className="h-16 w-full shrink-0 rounded-lg border border-white/8 object-cover sm:h-14 sm:w-24"
      />
    ) : (
      <span className="grid h-16 w-full shrink-0 place-items-center rounded-lg border border-white/8 bg-ink-850/60 text-xl sm:h-14 sm:w-24">
        {kind === "song" ? <FaMusic className="text-aqua-300" /> : <FaFilm className="text-brand-300" />}
      </span>
    )}

    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-white">{item.title || "Untitled"}</p>
      <p className="mt-1 truncate text-xs text-slate-500">
        {item.source && item.source !== "unknown" ? `${item.source} · ` : ""}
        {formatWhen(item.createdAt)}
      </p>
    </div>

    <div className="flex items-center gap-2">
      <Badge tone={kind === "song" ? "aqua" : "brand"}>{kind}</Badge>
      {item.size > 0 ? (
        <Badge tone="muted">{formatBytes(item.size)}</Badge>
      ) : null}
    </div>

    <button
      type="button"
      onClick={() => onDelete(item._id)}
      title={`Delete ${item.title || "this entry"}`}
      aria-label={`Delete ${item.title || "this entry"}`}
      className="shrink-0 self-end rounded-lg px-2.5 py-2 text-slate-500 transition-colors hover:bg-rose-500/12 hover:text-rose-300 sm:self-auto"
    >
      <FaTrash className="size-3.5" />
    </button>
  </li>
);

const History = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setItems(await fetchHistory());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const songs = items.filter((item) => guessKind(item) === "song").length;
    const bytes = items.reduce((sum, item) => sum + (item.size || 0), 0);
    return [
      { label: "Downloads", value: items.length },
      { label: "Videos", value: items.length - songs },
      { label: "Songs", value: songs },
      { label: "Total size", value: bytes > 0 ? formatBytes(bytes) : "—" },
    ];
  }, [items]);

  const handleDelete = async (id) => {
    /* Optimistic: the row disappears immediately and comes back if the call fails. */
    const previous = items;
    setItems((current) => current.filter((item) => item._id !== id));

    try {
      await deleteHistoryItem(id);
    } catch {
      setItems(previous);
      toast.error("Could not delete that entry.");
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      await clearHistory();
      setItems([]);
      setConfirmClear(false);
      toast.success("History cleared.");
    } catch {
      toast.error("Could not clear the history.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="relative">
      {/* ============================================================== Hero */}
      <section className="relative overflow-hidden px-4 pt-16 pb-14 sm:px-6 sm:pt-24 lg:px-8">
        <div
          aria-hidden="true"
          className="dot-backdrop absolute inset-0 -z-10 opacity-25 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]"
        />

        <div className="mx-auto w-full max-w-7xl">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Eyebrow icon={FaRedo}>Download history</Eyebrow>
            <h1 className="mt-7 text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="gradient-text">Everything you</span>{" "}
              <span className="text-white">grabbed.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
              Each grab is recorded with its source, size and timestamp, so the
              thing you downloaded last week is still one search away.
            </p>

            {items.length > 0 ? (
              <Button
                onClick={() => setConfirmClear(true)}
                variant="danger"
                size="md"
                className="mt-8"
              >
                <FaTrash className="size-3.5" />
                Clear all
              </Button>
            ) : null}
          </div>

          {/* ------------------------------------------------------- Stats */}
          {items.length > 0 ? (
            <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-ink-950/80 px-5 py-6 text-center backdrop-blur-xl"
                >
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block font-display text-2xl font-bold text-white">
                      {stat.value}
                    </span>
                    <span className="mt-1.5 block text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>

      {/* ============================================================== List */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
        <div className="mx-auto w-full max-w-5xl">
          {loading ? (
            <Card className="flex items-center justify-center gap-3 p-12 text-sm text-slate-400">
              <span className="size-5 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
              Loading history…
            </Card>
          ) : items.length === 0 ? (
            <Card className="p-12 text-center sm:p-16">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/5 text-slate-500">
                <FaRedo className="text-xl" />
              </span>
              <h2 className="mt-6 font-display text-xl font-bold">Nothing here yet</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
                Downloads started from the media grabber will show up here with
                their thumbnail, source and timestamp.
              </p>
              <Button to="/downloader" size="md" className="mt-8">
                <FaDownload className="size-4" />
                Go to the grabber
              </Button>
            </Card>
          ) : (
            <Card className={cx("overflow-hidden", "divide-y divide-white/8")}>
              <ul>
                {items.map((item) => (
                  <HistoryRow
                    key={item._id}
                    item={item}
                    kind={guessKind(item)}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            </Card>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={confirmClear}
        title="Clear download history?"
        message={`This permanently removes all ${items.length} entries. Downloaded files on your device are not affected.`}
        confirmLabel="Clear history"
        cancelLabel="Keep it"
        busy={clearing}
        onConfirm={handleClear}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
};

export default History;