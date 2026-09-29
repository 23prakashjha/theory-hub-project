import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaFilePdf, FaUpload, FaSearch, FaRegStar, FaStar, FaTrashAlt,
  FaFileDownload, FaSpinner, FaTimes, FaDatabase, FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import api, { formatBytes, formatDate, API_BASE_URL } from "../api/client";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title A→Z" },
  { value: "largest", label: "Largest first" },
];

const Library = () => {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [showUpload, setShowUpload] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [docsRes, statsRes] = await Promise.all([
        api.get("/api/documents"),
        api.get("/api/documents/library/stats"),
      ]);
      setDocuments(docsRes.data || []);
      setStats(statsRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load your library.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = documents.filter(
      (doc) =>
        !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.fileName.toLowerCase().includes(q)
    );
    const sorters = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      title: (a, b) => a.title.localeCompare(b.title),
      largest: (a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0),
    };
    return [...filtered].sort(sorters[sort] || sorters.newest);
  }, [documents, search, sort]);

  const togglePin = async (doc) => {
    try {
      const res = await api.patch(`/api/documents/${doc._id}`, {
        pinned: !doc.pinned,
      });
      setDocuments((prev) => prev.map((d) => (d._id === doc._id ? res.data : d)));
      toast.success(res.data.pinned ? "Pinned to top of your library" : "Unpinned");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update the document.");
    }
  };

  const removeDoc = async (doc) => {
    if (window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) {
      setBusyId(doc._id);
      try {
        await api.delete(`/api/documents/${doc._id}`);
        toast.success("Document deleted");
        await fetchAll();
      } catch (err) {
        toast.error(err.response?.data?.message || "Delete failed.");
      } finally {
        setBusyId(null);
      }
    }
  };

  // The file route is ownership-checked, so the device id header is required.
  // A plain window.open() cannot send it, so fetch the bytes and open the blob.
  const openPdf = async (doc) => {
    setBusyId(doc._id);
    const tab = window.open("", "_blank");
    try {
      const res = await api.get(`/api/documents/${doc._id}/file`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      if (tab) {
        tab.location.href = url;
      } else {
        window.open(url, "_blank");
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      tab?.close();
      toast.error(err.response?.data?.message || "Could not open the PDF.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-10 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              My PDF Library
            </h1>
            <p className="text-gray-400 mt-2 max-w-xl">
              Upload your PDFs and keep them saved here. Open any of them again
              whenever you need to read.
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 self-start md:self-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:scale-[1.03]"
          >
            <FaUpload /> Upload PDF
          </button>
        </div>

        {/* Stats strip */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <StatCard icon={<FaFilePdf className="text-cyan-400" />} label="Documents" value={stats.documents} />
            <StatCard icon={<FaStar className="text-amber-400" />} label="Pinned" value={stats.pinned} />
            <StatCard icon={<FaDatabase className="text-emerald-400" />} label="Stored" value={formatBytes(stats.sizeBytes)} />
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your documents…"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center text-gray-500 py-24 animate-pulse">
            Loading your library…
          </div>
        ) : visible.length === 0 ? (
          <EmptyState hasAny={documents.length > 0} onUpload={() => setShowUpload(true)} search={search} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {visible.map((doc) => (
              <DocumentCard
                key={doc._id}
                doc={doc}
                busy={busyId === doc._id}
                onView={() => openPdf(doc)}
                onPin={() => togglePin(doc)}
                onDelete={() => removeDoc(doc)}
              />
            ))}
          </div>
        )}
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={() => {
            setShowUpload(false);
            fetchAll();
          }}
        />
      )}
    </div>
  );
};

/* -------------------- Small pieces -------------------- */

const StatCard = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 rounded-2xl bg-gray-900/70 border border-gray-800 p-5">
    <div className="text-2xl">{icon}</div>
    <div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
    </div>
  </div>
);

const DocumentCard = ({ doc, busy, onView, onPin, onDelete }) => (
  <div className="group relative rounded-2xl bg-gray-900/80 border border-gray-800 hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-900/20 transition-all duration-300 overflow-hidden">
    {/* top gradient bar */}
    <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600" />

    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center text-xl">
            <FaFilePdf />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white truncate">{doc.title}</h3>
            <p className="text-xs text-gray-500 truncate">{doc.fileName}</p>
          </div>
        </div>
        <button
          onClick={onPin}
          title={doc.pinned ? "Unpin" : "Pin"}
          className={`shrink-0 p-2 rounded-lg transition ${
            doc.pinned
              ? "text-amber-400 hover:text-amber-300"
              : "text-gray-600 hover:text-gray-300"
          }`}
        >
          {doc.pinned ? <FaStar /> : <FaRegStar />}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-500/15 text-emerald-400 border-emerald-500/40">
          Saved
        </span>
        <span>{formatBytes(doc.sizeBytes)}</span>
        <span>·</span>
        <span>Uploaded {formatDate(doc.createdAt)}</span>
      </div>

      {doc.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {doc.tags.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={onView}
          disabled={busy}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white disabled:opacity-50"
        >
          {busy ? <FaSpinner className="animate-spin" /> : <FaEye />} View PDF
        </button>
        <button
          onClick={onView}
          title="Open in a new tab"
          className="px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition"
        >
          <FaFileDownload />
        </button>
        <button
          onClick={onDelete}
          title="Delete"
          className="px-3 py-2 rounded-lg bg-gray-800 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition"
        >
          <FaTrashAlt />
        </button>
      </div>
    </div>
  </div>
);

const EmptyState = ({ hasAny, onUpload, search }) => (
  <div className="text-center py-24 px-6 rounded-3xl border border-dashed border-gray-800">
    <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center text-4xl mb-6">
      <FaFilePdf className="text-blue-400" />
    </div>
    {hasAny ? (
      <>
        <h2 className="text-xl font-bold mb-2">Nothing matches "{search}"</h2>
        <p className="text-gray-400 mb-6">Try a different search term.</p>
      </>
    ) : (
      <>
        <h2 className="text-2xl font-bold mb-2">Your library is empty</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          Upload any PDF — lecture slides, a chapter, a spec — and it stays saved
          here so you can open and read it whenever you need.
        </p>
      </>
    )}
    <button
      onClick={onUpload}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 font-semibold text-white transition hover:scale-105"
    >
      <FaUpload /> {hasAny ? "Upload another PDF" : "Upload your first PDF"}
    </button>
  </div>
);

/* -------------------- Upload modal -------------------- */

const UploadModal = ({ onClose, onUploaded }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState("idle"); // idle | uploading | done | error
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const pick = useCallback((f) => {
    setError("");
    if (!f) return;
    if (f.type !== "application/pdf" && !/\.pdf$/i.test(f.name)) {
      setError("Please choose a PDF file.");
      return;
    }
    if (f.size > 15 * 1024 * 1024) {
      setError("That file is over the 15 MB limit.");
      return;
    }
    setFile(f);
  }, []);

  useEffect(() => {
    if (phase !== "uploading" || !file) return;

    const formData = new FormData();
    formData.append("file", file);

    api
      .post("/api/documents", formData, { timeout: 120000 })
      .then((res) => {
        setResult(res.data);
        setPhase("done");
        toast.success("PDF saved!");
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            (err.code === "ECONNABORTED"
              ? "Upload timed out. Please try again."
              : "Upload failed. Please try again.")
        );
        setPhase("error");
      });
  }, [phase, file]);

  const modal = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    modal.current?.scrollIntoView?.({ block: "center" });
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div
        ref={modal}
        className="w-full max-w-lg rounded-3xl bg-gray-900 border border-gray-800 shadow-2xl p-7 relative"
      >
        <button
          onClick={onClose}
          disabled={phase === "uploading"}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition disabled:opacity-30"
        >
          <FaTimes />
        </button>

        <h2 className="text-xl font-bold mb-1">Upload a PDF</h2>
        <p className="text-sm text-gray-400 mb-6">
          Your file is stored safely and stays available to view.
        </p>

        {phase === "uploading" ? (
          <div className="text-center py-10">
            <FaSpinner className="animate-spin text-4xl text-blue-400 mx-auto mb-5" />
            <p className="font-semibold text-white">Uploading your PDF…</p>
            <p className="text-sm text-gray-400 mt-2">This only takes a moment.</p>
            <div className="mt-6 h-1.5 rounded-full bg-gray-800 overflow-hidden">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse" />
            </div>
          </div>
        ) : phase === "done" && result ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 text-3xl flex items-center justify-center mb-5">
              ✓
            </div>
            <h3 className="text-lg font-bold mb-1">Upload complete!</h3>
            <p className="text-sm text-gray-400 mb-6">
              "{result.title}" is saved to your library.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:text-white font-semibold transition"
              >
                Close
              </button>
              <button
                onClick={() => onUploaded(result)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 font-semibold text-white transition"
              >
                Back to library
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pick(e.dataTransfer.files?.[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition ${
                dragging
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-700 hover:border-blue-500/60 hover:bg-gray-800/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => pick(e.target.files?.[0])}
              />
              {file ? (
                <div>
                  <div className="mx-auto w-14 h-14 rounded-xl bg-red-500/15 text-red-400 text-2xl flex items-center justify-center mb-3">
                    <FaFilePdf />
                  </div>
                  <p className="font-semibold text-white break-all px-2">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatBytes(file.size)}</p>
                  <p className="text-sm text-blue-400 mt-3">Click to choose a different file</p>
                </div>
              ) : (
                <div>
                  <div className="mx-auto w-14 h-14 rounded-xl bg-blue-500/15 text-blue-400 text-2xl flex items-center justify-center mb-3">
                    <FaUpload />
                  </div>
                  <p className="font-semibold text-white">
                    Drag & drop your PDF here
                  </p>
                  <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                  <p className="text-xs text-gray-600 mt-3">PDF only · max 15 MB</p>
                </div>
              )}
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </p>
            )}

            <button
              onClick={() => setPhase("uploading")}
              disabled={!file}
              className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Upload PDF
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Library;
