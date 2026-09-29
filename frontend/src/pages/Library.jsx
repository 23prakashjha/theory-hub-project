import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaCheck,
  FaDatabase,
  FaEye,
  FaFileDownload,
  FaFilePdf,
  FaFolderOpen,
  FaList,
  FaRegStar,
  FaSearch,
  FaShareSquare,
  FaSlidersH,
  FaSpinner,
  FaStar,
  FaTh,
  FaTimes,
  FaTrashAlt,
  FaUpload,
} from "react-icons/fa";
import toast from "react-hot-toast";
import api, {
  API_BASE_URL,
  formatBytes,
  formatDate,
  formatNumber,
} from "../api/client";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  Badge,
  Button,
  Card,
  Eyebrow,
  Field,
  Select,
} from "../components/ui/primitives";
import { cx } from "../lib/cx";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const UPLOAD_TIMEOUT_MS = 120_000;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title A → Z" },
  { value: "largest", label: "Largest first" },
];

const SORTERS = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  title: (a, b) => (a.title || "").localeCompare(b.title || ""),
  largest: (a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0),
};

const VIEW_MODES = [
  { value: "grid", label: "Grid view", icon: FaTh },
  { value: "list", label: "List view", icon: FaList },
];

/* ================================================================= Library */

const Library = () => {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState("grid");
  const [activeTag, setActiveTag] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const [docsRes, statsRes] = await Promise.all([
        api.get("/api/documents"),
        api.get("/api/documents/library/stats"),
      ]);
      setDocuments(docsRes.data || []);
      setStats(statsRes.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Could not load your library.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* Filter + sort in the client so typing stays instant. */
  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = documents.filter((doc) => {
      if (!query) return true;
      return (
        doc.title?.toLowerCase().includes(query) ||
        doc.fileName?.toLowerCase().includes(query) ||
        doc.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    });

    return [...filtered].sort(SORTERS[sort] || SORTERS.newest);
  }, [documents, search, sort]);

  /* Every tag in the library, most used first — powers the filter chips. */
  const tags = useMemo(() => {
    const counts = new Map();
    documents.forEach((doc) =>
      doc.tags?.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1)),
    );
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag, count]) => ({ tag, count }));
  }, [documents]);

  const results = useMemo(
    () =>
      activeTag
        ? visible.filter((doc) => doc.tags?.includes(activeTag))
        : visible,
    [visible, activeTag],
  );

  const togglePin = async (doc) => {
    try {
      const res = await api.patch(`/api/documents/${doc._id}`, {
        pinned: !doc.pinned,
      });
      setDocuments((prev) =>
        prev.map((item) => (item._id === doc._id ? res.data : item)),
      );
      toast.success(res.data.pinned ? "Pinned to your library" : "Unpinned");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update the document.");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/api/documents/${pendingDelete._id}`);
      toast.success("Document deleted");
      setPendingDelete(null);
      await fetchAll({ silent: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed.");
    } finally {
      setDeleting(false);
      setBusyId(null);
    }
  };

  /*
   * The file route is ownership-checked, so the device id header is required
   * and a plain window.open() cannot send it. Fetch the bytes, then either
   * hand them to a tab (view) or to a temporary anchor (download).
   */
  const fetchBlob = async (doc) => {
    const res = await api.get(`/api/documents/${doc._id}/file`, {
      responseType: "blob",
    });
    return new Blob([res.data], { type: "application/pdf" });
  };

  const openPdf = async (doc) => {
    setBusyId(doc._id);
    const tab = window.open("", "_blank");
    try {
      const blob = await fetchBlob(doc);
      const url = URL.createObjectURL(blob);
      if (tab) {
        tab.location.href = url;
      } else {
        window.open(url, "_blank");
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      tab?.close();
      toast.error(err.response?.data?.message || "Could not open the PDF.");
    } finally {
      setBusyId(null);
    }
  };

  const downloadPdf = async (doc) => {
    setBusyId(doc._id);
    try {
      const blob = await fetchBlob(doc);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = doc.fileName || `${doc.title || "document"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4_000);
      toast.success("Download started");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not download the PDF.");
    } finally {
      setBusyId(null);
    }
  };

  /*
   * `publicUrl` is the static, openly-served path the API hands back with every
   * document, so it is the only URL that works for someone who is not this
   * browser. Resolve it against the API origin because it is a server path.
   */
  const shareUrlFor = (doc) => {
    if (!doc.publicUrl) return null;
    try {
      return new URL(doc.publicUrl, API_BASE_URL).href;
    } catch {
      return null;
    }
  };

  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      /* Fall through to the legacy path below. */
    }

    /* Insecure origins and older browsers have no async clipboard. */
    try {
      const scratch = document.createElement("textarea");
      scratch.value = text;
      scratch.setAttribute("readonly", "");
      scratch.style.position = "fixed";
      scratch.style.opacity = "0";
      document.body.appendChild(scratch);
      scratch.select();
      const ok = document.execCommand("copy");
      scratch.remove();
      return ok;
    } catch {
      return false;
    }
  };

  /*
   * Native share sheet where the platform has one (mostly mobile), otherwise
   * copy the link. Both paths end in the same "link copied" confirmation so
   * the button always gives the user something to act on.
   */
  const shareDocument = async (doc) => {
    const url = shareUrlFor(doc);

    if (!url) {
      toast.error("This document has no shareable link yet.");
      return;
    }

    const payload = {
      title: doc.title || doc.fileName,
      text: doc.title || doc.fileName,
      url,
    };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(payload);
        return;
      } catch (err) {
        /* The user closing the sheet is not an error worth reporting. */
        if (err?.name === "AbortError") return;
      }
    }

    const copied = await copyToClipboard(url);
    if (copied) {
      setCopiedId(doc._id);
      toast.success("Link copied — anyone with it can open this PDF");
      setTimeout(() => setCopiedId(null), 2_000);
    } else {
      window.prompt("Copy this link to share the document:", url);
    }
  };

  return (
    <div className="relative">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* ------------------------------------------------------------ Header */}
        <header className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Eyebrow icon={FaFolderOpen}>Personal library</Eyebrow>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              <span className="gradient-text">My PDF Library</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
              Upload your PDFs and keep them saved here. Open any of them again
              whenever you need to read.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Button
              variant="soft"
              size="md"
              onClick={() => fetchAll({ silent: true })}
              disabled={refreshing}
              aria-label="Refresh library"
              className="px-3.5"
            >
              <FaSpinner
                className={cx("size-4", refreshing ? "animate-spin" : "opacity-70")}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button onClick={() => setShowUpload(true)} className="group flex-1 sm:flex-none">
              <FaUpload className="size-4" />
              Upload PDF
            </Button>
          </div>
        </header>

        {/* ------------------------------------------------------------- Stats */}
        <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            icon={FaFilePdf}
            tone="brand"
            label="Documents"
            value={stats ? formatNumber(stats.documents) : "—"}
          />
          <StatCard
            icon={FaStar}
            tone="gold"
            label="Pinned"
            value={stats ? formatNumber(stats.pinned) : "—"}
          />
          <StatCard
            icon={FaDatabase}
            tone="mint"
            label="Stored"
            value={stats ? formatBytes(stats.sizeBytes) : "—"}
          />
          <StatCard
            icon={FaFolderOpen}
            tone="aqua"
            label="Last upload"
            value={stats ? formatDate(stats.lastUpload) : "—"}
            compact
          />
        </div>

        {/* ----------------------------------------------------------- Toolbar */}
        <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1 lg:max-w-md">
            <FaSearch
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-500"
            />
            <label htmlFor="library-search" className="sr-only">
              Search your documents
            </label>
            <Field
              id="library-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search titles, files and tags…"
              className="h-12 pr-11 pl-11"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-white/8 hover:text-white"
              >
                <FaTimes className="size-3" />
              </button>
            ) : null}
          </div>

          <div className="flex flex-1 items-center gap-3 lg:flex-none">
            <Select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort documents"
              className="min-w-0 flex-1 lg:w-44 lg:flex-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <div
              role="group"
              aria-label="Layout"
              className="hidden items-center gap-1 rounded-xl border border-white/10 bg-ink-900/70 p-1 sm:flex"
            >
              {VIEW_MODES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setView(value)}
                  aria-label={label}
                  aria-pressed={view === value}
                  title={label}
                  className={cx(
                    "grid size-9 place-items-center rounded-lg transition-all duration-200",
                    view === value
                      ? "bg-brand-500/20 text-brand-200 ring-1 ring-brand-400/30"
                      : "text-slate-500 hover:bg-white/6 hover:text-white",
                  )}
                >
                  <Icon className="size-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tag filter chips */}
        {tags.length > 0 ? (
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              <FaSlidersH className="size-3" />
              Tags
            </span>

            <button
              type="button"
              onClick={() => setActiveTag("")}
              className={cx(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                !activeTag
                  ? "bg-brand-500/20 text-brand-200 ring-1 ring-brand-400/30"
                  : "text-slate-500 hover:bg-white/6 hover:text-white",
              )}
            >
              All
            </button>

            {tags.map(({ tag, count }) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag((current) => (current === tag ? "" : tag))}
                className={cx(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                  activeTag === tag
                    ? "bg-aqua-500/20 text-aqua-200 ring-1 ring-aqua-400/30"
                    : "text-slate-500 hover:bg-white/6 hover:text-white",
                )}
              >
                #{tag}
                <span className="ml-1.5 opacity-60">{count}</span>
              </button>
            ))}
          </div>
        ) : null}

        {/* ----------------------------------------------------------- Results */}
        <div className="mt-7">
          {!loading && results.length > 0 ? (
            <p className="mb-4 text-xs font-medium tracking-wide text-slate-500 uppercase">
              {results.length} {results.length === 1 ? "document" : "documents"}
              {search ? ` matching “${search.trim()}”` : ""}
              {activeTag ? ` tagged #${activeTag}` : ""}
            </p>
          ) : null}

          {loading ? (
            <div
              className={cx(
                "grid gap-5",
                view === "grid"
                  ? "sm:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1",
              )}
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <DocumentSkeleton key={index} row={view === "list"} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              hasAny={documents.length > 0}
              search={search}
              activeTag={activeTag}
              onUpload={() => setShowUpload(true)}
              onReset={() => {
                setSearch("");
                setActiveTag("");
              }}
            />
          ) : (
            <div
              className={cx(
                "grid gap-4 sm:gap-5",
                view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1",
              )}
            >
              {results.map((doc) => (
                <DocumentCard
                  key={doc._id}
                  doc={doc}
                  view={view}
                  busy={busyId === doc._id}
                  copied={copiedId === doc._id}
                  onView={() => openPdf(doc)}
                  onShare={() => shareDocument(doc)}
                  onDownload={() => downloadPdf(doc)}
                  onPin={() => togglePin(doc)}
                  onDelete={() => {
                    setBusyId(doc._id);
                    setPendingDelete(doc);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------------- Overlays */}
      {showUpload ? (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={() => {
            setShowUpload(false);
            fetchAll({ silent: true });
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this document?"
        message={
          pendingDelete
            ? `“${pendingDelete.title}” will be removed from your library along with the stored file. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete document"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setPendingDelete(null);
          setBusyId(null);
        }}
      />
    </div>
  );
};

/* ============================================================== Sub-components */

const STAT_TONES = {
  brand: { ring: "ring-brand-400/20", bg: "bg-brand-500/14", text: "text-brand-300" },
  gold: { ring: "ring-gold-400/20", bg: "bg-gold-500/14", text: "text-gold-300" },
  mint: { ring: "ring-mint-400/20", bg: "bg-mint-500/14", text: "text-mint-300" },
  aqua: { ring: "ring-aqua-400/20", bg: "bg-aqua-500/14", text: "text-aqua-300" },
};

const StatCard = ({ icon: Icon, label, value, tone = "brand", compact = false }) => {
  const palette = STAT_TONES[tone] || STAT_TONES.brand;

  return (
    <Card className={cx("p-4 ring-1 sm:p-5", palette.ring)}>
      <div className="flex items-center gap-3.5">
        <span
          className={cx(
            "grid size-10 shrink-0 place-items-center rounded-xl text-sm",
            palette.bg,
            palette.text,
          )}
        >
          <Icon />
        </span>
        <div className="min-w-0">
          <p
            className={cx(
              "truncate font-display font-bold text-white",
              compact ? "text-sm sm:text-base" : "text-xl sm:text-2xl",
            )}
          >
            {value}
          </p>
          <p className="mt-0.5 truncate text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
            {label}
          </p>
        </div>
      </div>
    </Card>
  );
};

const DocumentSkeleton = ({ row }) => (
  <div
    className={cx(
      "animate-pulse overflow-hidden rounded-2xl border border-white/8 bg-ink-900/50",
      row ? "flex items-center gap-4 p-5" : "p-5",
    )}
  >
    <div
      className={cx(
        "shrink-0 rounded-xl bg-white/6",
        row ? "size-11" : "size-11",
      )}
    />
    <div className={cx("min-w-0 flex-1", row ? "space-y-2" : "mt-4 space-y-3")}>
      <div className="h-3.5 w-3/4 rounded bg-white/8" />
      <div className="h-2.5 w-1/2 rounded bg-white/5" />
      {!row ? (
        <>
          <div className="h-2.5 w-full rounded bg-white/5" />
          <div className="h-9 w-full rounded-lg bg-white/6" />
        </>
      ) : null}
    </div>
  </div>
);

const statusMeta = (status) => {
  if (status === "failed") return { tone: "danger", label: "Failed" };
  if (status === "processing") return { tone: "gold", label: "Processing" };
  return { tone: "mint", label: "Saved" };
};

const DocumentCard = ({
  doc,
  view,
  busy,
  copied,
  onView,
  onShare,
  onDownload,
  onPin,
  onDelete,
}) => {
  const status = statusMeta(doc.status);
  const isRow = view === "list";

  const title = (
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-rose-500/12 text-lg text-rose-ink">
        <FaFilePdf />
      </span>
      <div className="min-w-0">
        <h3 className="truncate text-[15px] font-bold text-white">{doc.title}</h3>
        <p className="mt-0.5 truncate text-[11px] text-slate-500">{doc.fileName}</p>
      </div>
    </div>
  );

  const meta = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-slate-500">
      <Badge tone={status.tone}>
        {status.tone === "mint" ? <span className="size-1.5 rounded-full bg-mint-400" /> : null}
        {status.label}
      </Badge>
      <span className="font-medium">{formatBytes(doc.sizeBytes)}</span>
      <span aria-hidden="true">&middot;</span>
      <span>{formatDate(doc.createdAt)}</span>
    </div>
  );

  const actions = (
    <>
      <Button
        onClick={onView}
        disabled={busy}
        size="sm"
        className={cx("flex-1", isRow && "sm:flex-none sm:px-5")}
      >
        {busy ? (
          <FaSpinner className="size-3.5 animate-spin" />
        ) : (
          <FaEye className="size-3.5" />
        )}
        <span className="hidden sm:inline">View PDF</span>
        <span className="sm:hidden">View</span>
      </Button>

      <button
        type="button"
        onClick={onShare}
        disabled={busy}
        aria-label={`Share ${doc.title}`}
        title="Share link"
        className={cx(
          "grid size-9 shrink-0 place-items-center rounded-lg transition-all duration-200",
          "disabled:opacity-40",
          copied
            ? "bg-mint-500/18 text-mint-300 ring-1 ring-mint-400/30"
            : "bg-aqua-500/10 text-aqua-300 hover:bg-aqua-500/20 hover:text-aqua-200",
        )}
      >
        {copied ? <FaCheck className="size-3.5" /> : <FaShareSquare className="size-3.5" />}
      </button>

      <button
        type="button"
        onClick={onDownload}
        disabled={busy}
        aria-label={`Download ${doc.title}`}
        title="Download"
        className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/6 text-slate-400 transition-colors hover:bg-white/12 hover:text-white disabled:opacity-40"
      >
        <FaFileDownload className="size-3.5" />
      </button>

      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        aria-label={`Delete ${doc.title}`}
        title="Delete"
        className="grid size-9 shrink-0 place-items-center rounded-lg bg-rose-500/10 text-rose-300 transition-colors hover:bg-rose-500/20 hover:text-rose-200 disabled:opacity-40"
      >
        <FaTrashAlt className="size-3.5" />
      </button>
    </>
  );

  return (
    <Card
      hover
      className={cx(
        "group flex flex-col p-5",
        isRow && "sm:flex-row sm:items-center sm:gap-6",
      )}
    >
      {/* Gradient rail */}
      <div
        aria-hidden="true"
        className={cx(
          "pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-aqua-400 via-brand-500 to-brand-700 opacity-60 transition-opacity duration-300 group-hover:opacity-100",
          isRow && "sm:inset-y-0 sm:left-0 sm:h-auto sm:w-1 sm:bg-linear-to-b",
        )}
      />

      <div className={cx("flex items-start justify-between gap-3", isRow && "flex-1 min-w-0")}>
        {title}

        <button
          type="button"
          onClick={onPin}
          disabled={busy}
          aria-label={doc.pinned ? `Unpin ${doc.title}` : `Pin ${doc.title}`}
          title={doc.pinned ? "Unpin" : "Pin"}
          className={cx(
            "grid size-9 shrink-0 place-items-center rounded-lg transition-all duration-200",
            doc.pinned
              ? "text-gold-400 hover:bg-gold-500/12"
              : "text-slate-600 hover:bg-white/6 hover:text-slate-300",
          )}
        >
          {doc.pinned ? <FaStar className="size-3.5" /> : <FaRegStar className="size-3.5" />}
        </button>
      </div>

      {doc.tags?.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {doc.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-brand-500/10 px-2 py-0.5 text-[11px] font-medium text-brand-200 ring-1 ring-brand-400/15"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      {isRow ? (
        /* Row layout: meta sits in the middle, actions pinned to the right. */
        <>
          <div className="mt-4 min-w-0 sm:mt-0 sm:flex-1 sm:self-center">{meta}</div>
          <div className="mt-4 flex items-center gap-2 sm:mt-0 sm:w-auto sm:shrink-0">
            {actions}
          </div>
        </>
      ) : (
        <div className="mt-auto pt-5">
          {meta}
          <div className="mt-4 flex items-center gap-2">{actions}</div>
        </div>
      )}
    </Card>
  );
};

const EmptyState = ({ hasAny, search, activeTag, onUpload, onReset }) => {
  if (hasAny) {
    return (
      <Card className="border-dashed px-6 py-16 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-linear-to-br from-aqua-500/18 to-brand-600/18 text-2xl text-brand-300">
          <FaSearch />
        </span>
        <h2 className="mt-6 text-xl font-bold">Nothing matches that</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
          {activeTag
            ? `No documents are tagged #${activeTag}. Try clearing the tag filter.`
            : `We could not find anything for “${search.trim()}”. Try a different term or clear the search.`}
        </p>
        <Button variant="soft" onClick={onReset} className="mt-7">
          <FaTimes className="size-3.5" />
          Clear filters
        </Button>
      </Card>
    );
  }

  return (
    <Card className="border-dashed px-6 py-16 text-center sm:py-20">
      <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-linear-to-br from-aqua-500/20 to-brand-600/20 text-3xl text-brand-300">
        <FaFilePdf />
      </span>
      <h2 className="mt-7 text-2xl font-bold">Your library is empty</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
        Upload any PDF — lecture slides, a chapter, a spec — and it stays saved
        here so you can open and read it whenever you need.
      </p>
      <Button onClick={onUpload} size="lg" className="mt-8 group">
        <FaUpload className="size-4" />
        Upload your first PDF
      </Button>
      <p className="mt-5 text-xs text-slate-500">PDF only &middot; up to 15 MB</p>
    </Card>
  );
};

/* ============================================================ Upload modal */

const UploadModal = ({ onClose, onUploaded }) => {
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle | uploading | done | error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const reset = () => {
    setFile(null);
    setError("");
    setResult(null);
    setProgress(0);
    setPhase("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  const pick = (candidate) => {
    setError("");
    if (!candidate) return;

    const looksPdf =
      candidate.type === "application/pdf" || /\.pdf$/i.test(candidate.name);
    if (!looksPdf) {
      setFile(null);
      setError("That is not a PDF. Please choose a file ending in .pdf.");
      return;
    }
    if (candidate.size > MAX_UPLOAD_BYTES) {
      setFile(null);
      setError("That file is over the 15 MB limit. Try compressing it first.");
      return;
    }
    setFile(candidate);
  };

  /*
   * Uploads are driven by an explicit call, not a phase-keyed effect, so
   * changing the selected file can never re-trigger a request mid-flight.
   */
  const startUpload = async () => {
    if (!file) return;

    setPhase("uploading");
    setProgress(0);
    setError("");

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await api.post("/api/documents", body, {
        timeout: UPLOAD_TIMEOUT_MS,
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
          }
        },
      });

      setResult(res.data);
      setProgress(100);
      setPhase("done");
      toast.success("PDF saved to your library");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.code === "ECONNABORTED"
            ? "Upload timed out. Please try again."
            : "Upload failed. Please try again."),
      );
      setPhase("error");
    }
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const busy = phase === "uploading";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-ink-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-title"
        className="glass w-full max-w-lg animate-pop rounded-t-3xl p-6 shadow-lift outline-none sm:rounded-3xl sm:p-7"
      >
        {/* Mobile grab handle */}
        <div
          aria-hidden="true"
          className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/15 sm:hidden"
        />

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="upload-title" className="text-xl font-bold">
              Upload a PDF
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Your file is stored safely and stays available to view.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close upload dialog"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-white/8 hover:text-white disabled:opacity-30"
          >
            <FaTimes className="size-3.5" />
          </button>
        </div>

        {phase === "uploading" ? (
          <div className="py-12 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-500/14 text-2xl text-brand-300">
              <FaSpinner className="size-7 animate-spin" />
            </span>
            <p className="mt-6 font-semibold text-white">Uploading your PDF…</p>
            <p className="mt-1.5 truncate text-sm text-slate-400">{file?.name}</p>

            <div
              className="mt-7 h-2 overflow-hidden rounded-full bg-white/8"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Upload progress"
            >
              <div
                className="h-full rounded-full bg-linear-to-r from-aqua-400 to-brand-500 transition-[width] duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-3 text-xs font-medium text-slate-500">
              {progress}% &middot; {formatBytes(file?.size)}
            </p>
          </div>
        ) : phase === "done" && result ? (
          <div className="py-8 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-mint-500/15 text-2xl text-mint-300">
              <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden="true">
                <path
                  d="m5 13 4.5 4.5L19 7"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h3 className="mt-6 text-lg font-bold">Upload complete</h3>
            <p className="mt-1.5 text-sm text-slate-400">
              &ldquo;{result.title}&rdquo; is saved to your library.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button variant="soft" onClick={onClose} className="sm:min-w-32">
                Keep uploading
              </Button>
              <Button onClick={() => onUploaded(result)} className="sm:min-w-40">
                Back to library
              </Button>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                pick(event.dataTransfer.files?.[0]);
              }}
              className={cx(
                "mt-6 w-full rounded-2xl border-2 border-dashed px-5 py-10 text-center transition-all duration-200 sm:py-12",
                dragging
                  ? "scale-[1.01] border-brand-400 bg-brand-500/10"
                  : "border-white/12 bg-white/2 hover:border-brand-400/60 hover:bg-white/5",
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(event) => pick(event.target.files?.[0])}
              />

              {file ? (
                <>
                  <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-rose-500/12 text-2xl text-rose-ink">
                    <FaFilePdf />
                  </span>
                  <p className="mt-4 break-all px-2 text-sm font-semibold text-white">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatBytes(file.size)}
                  </p>
                  <p className="mt-4 text-sm font-medium text-brand-300">
                    Click to choose a different file
                  </p>
                </>
              ) : (
                <>
                  <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-500/14 text-2xl text-brand-300">
                    <FaUpload />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-white">
                    Drag &amp; drop your PDF here
                  </p>
                  <p className="mt-1 text-sm text-slate-400">or click to browse</p>
                  <p className="mt-4 text-xs text-slate-500">PDF only &middot; max 15 MB</p>
                </>
              )}
            </button>

            {error ? (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
              >
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={startUpload}
                disabled={!file}
                size="lg"
                className="w-full"
              >
                <FaUpload className="size-4" />
                Upload PDF
              </Button>
              {file ? (
                <Button variant="soft" onClick={reset} className="sm:w-32">
                  Clear
                </Button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Library;
