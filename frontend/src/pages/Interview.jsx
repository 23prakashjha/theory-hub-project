import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FaBuilding,
  FaCheckCircle,
  FaChevronDown,
  FaFilter,
  FaFire,
  FaLayerGroup,
  FaPen,
  FaPlus,
  FaRedo,
  FaRegBookmark,
  FaRegLightbulb,
  FaRegStar,
  FaSearch,
  FaStar,
  FaTrash,
  FaUserTie,
  FaTimes,
} from "react-icons/fa";
import {
  Badge,
  Button,
  Card,
  Eyebrow,
  Field,
  Select,
} from "../components/ui/primitives";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import api, { formatDate } from "../api/client";
import { cx } from "../lib/cx";

/* --------------------------------------------------------------- Meta */

const DIFFICULTY_META = {
  easy: { label: "Easy", tone: "mint" },
  medium: { label: "Medium", tone: "gold" },
  hard: { label: "Hard", tone: "danger" },
};

const STATUS_META = {
  saved: { label: "Saved", icon: FaRegBookmark, tone: "muted" },
  practicing: { label: "Practicing", icon: FaRedo, tone: "aqua" },
  mastered: { label: "Mastered", icon: FaCheckCircle, tone: "mint" },
};

const STATUS_CYCLE = ["saved", "practicing", "mastered"];

const CATEGORY_PRESETS = [
  "DSA",
  "JavaScript",
  "React",
  "Node.js",
  "System Design",
  "DBMS & SQL",
  "Operating Systems",
  "Computer Networks",
  "OOPs",
  "Projects",
  "Behavioral",
  "HR",
  "Aptitude",
  "General",
];

const EMPTY_FORM = {
  question: "",
  answer: "",
  company: "",
  role: "",
  category: "General",
  difficulty: "medium",
  status: "saved",
  tags: "",
  starred: false,
};

/* --------------------------------------------------------------- Bits */

const StatTile = ({ icon: Icon, label, value, tone = "brand", hint }) => {
  const tones = {
    brand: "from-brand-500 to-brand-700 shadow-brand",
    mint: "from-mint-500 to-mint-600",
    gold: "from-gold-500 to-gold-400",
    aqua: "from-aqua-500 to-aqua-600",
  };

  return (
    <Card className="flex items-center gap-4 p-4 sm:p-5">
      <span
        className={cx(
          "grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br text-white shadow-lg",
          tones[tone] || tones.brand,
        )}
      >
        <Icon className="text-base" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-2xl leading-none font-bold text-white">
          {value}
        </p>
        <p className="mt-1 truncate text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
          {label}
        </p>
        {hint ? <p className="mt-0.5 truncate text-xs text-slate-500">{hint}</p> : null}
      </div>
    </Card>
  );
};

const Toolbar = ({
  query,
  setQuery,
  category,
  setCategory,
  categories,
  difficulty,
  setDifficulty,
  status,
  setStatus,
  starredOnly,
  setStarredOnly,
  sort,
  setSort,
  onAdd,
}) => (
  <Card className="p-4 sm:p-5">
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <FaSearch className="pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-slate-500" />
          <Field
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search questions, companies, tags…"
            className="h-11 pl-10"
            aria-label="Search questions"
          />
        </div>

        <Button onClick={onAdd} size="md" className="shrink-0">
          <FaPlus className="size-3.5" />
          Add question
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>

        <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} aria-label="Filter by difficulty">
          <option value="">Any difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </Select>

        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">Any status</option>
          <option value="saved">Saved</option>
          <option value="practicing">Practicing</option>
          <option value="mastered">Mastered</option>
        </Select>

        <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort questions">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="company">Company A–Z</option>
          <option value="difficulty">Difficulty</option>
          <option value="asked">Most asked</option>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStarredOnly((value) => !value)}
          aria-pressed={starredOnly}
          className={cx(
            "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-semibold ring-1 ring-inset transition",
            starredOnly
              ? "bg-gold-500/14 text-gold-300 ring-gold-400/30"
              : "bg-white/5 text-slate-400 ring-white/10 hover:text-white",
          )}
        >
          <FaStar className="size-3" />
          Starred only
        </button>

        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3.5 py-1.5 text-[12px] font-semibold text-slate-400 ring-1 ring-inset ring-white/10">
          <FaFilter className="size-2.5" />
          {category || difficulty || status ? "Filters active" : "No filters"}
        </span>
      </div>
    </div>
  </Card>
);

const QuestionCard = ({ item, index, onToggleStar, onCycleStatus, onMarkAsked, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const difficulty = DIFFICULTY_META[item.difficulty] || DIFFICULTY_META.medium;
  const status = STATUS_META[item.status] || STATUS_META.saved;
  const StatusIcon = status.icon;

  return (
    <Card
      hover
      className="flex h-full flex-col p-5 animate-rise"
      style={{ animationDelay: `${Math.min(index, 9) * 55}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">
            <FaLayerGroup className="size-2.5" />
            {item.category}
          </Badge>
          <Badge tone={difficulty.tone}>{difficulty.label}</Badge>
        </div>

        <button
          type="button"
          onClick={() => onToggleStar(item)}
          aria-label={item.starred ? "Remove star" : "Star this question"}
          aria-pressed={item.starred}
          className={cx(
            "grid size-9 shrink-0 place-items-center rounded-xl ring-1 ring-inset transition",
            item.starred
              ? "bg-gold-500/14 text-gold-300 ring-gold-400/30"
              : "bg-white/5 text-slate-500 ring-white/10 hover:text-gold-300",
          )}
        >
          {item.starred ? <FaStar className="size-3.5" /> : <FaRegStar className="size-3.5" />}
        </button>
      </div>

      <h3 className="mt-4 text-[15px] leading-snug font-semibold text-white sm:text-base">
        {item.question}
      </h3>

      {(item.company || item.role || item.timesAsked > 1) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
          {item.company ? (
            <span className="inline-flex items-center gap-1.5">
              <FaBuilding className="size-3" />
              {item.company}
            </span>
          ) : null}
          {item.role ? (
            <span className="inline-flex items-center gap-1.5">
              <FaUserTie className="size-3" />
              {item.role}
            </span>
          ) : null}
          {item.timesAsked > 1 ? (
            <span className="inline-flex items-center gap-1.5 text-gold-300/80">
              <FaFire className="size-3" />
              asked {item.timesAsked}×
            </span>
          ) : null}
        </div>
      )}

      {item.answer ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-300 transition-colors hover:text-brand-200"
          >
            {open ? "Hide answer" : "Show answer"}
            <FaChevronDown
              className={cx("size-2.5 transition-transform duration-200", open && "rotate-180")}
            />
          </button>

          {open ? (
            <p className="mt-3 animate-pop rounded-xl border border-white/8 bg-ink-900/60 p-3.5 text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
              {item.answer}
            </p>
          ) : null}
        </div>
      ) : null}

      {item.tags?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-400 ring-1 ring-inset ring-white/10"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-auto pt-5">
        <div className="flex flex-wrap items-center gap-2 border-t border-white/8 pt-4">
          <button
            type="button"
            onClick={() => onCycleStatus(item)}
            title="Click to change status"
            className="transition-transform hover:-translate-y-0.5"
          >
            <Badge tone={status.tone}>
              <StatusIcon className="size-2.5" />
              {status.label}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => onMarkAsked(item)}
            title="I was asked this again"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-400 ring-1 ring-inset ring-white/10 transition hover:text-white"
          >
            <FaPlus className="size-2.5" />
            Asked again
          </button>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(item)}
              aria-label="Edit question"
              className="grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-white/8 hover:text-white"
            >
              <FaPen className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item)}
              aria-label="Delete question"
              className="grid size-8 place-items-center rounded-lg text-slate-500 transition hover:bg-rose-500/14 hover:text-rose-300"
            >
              <FaTrash className="size-3" />
            </button>
          </div>
        </div>

        {item.lastAskedAt ? (
          <p className="mt-3 text-[11px] text-slate-600">
            Last asked {formatDate(item.lastAskedAt)}
          </p>
        ) : null}
      </div>
    </Card>
  );
};

/* --------------------------------------------------------------- Form */

const QuestionForm = ({ open, initial, onClose, onSaved }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const questionRef = useRef(null);
  const editing = Boolean(initial?._id);

  useEffect(() => {
    if (!open) return;
    setForm(
      initial
        ? {
            question: initial.question || "",
            answer: initial.answer || "",
            company: initial.company || "",
            role: initial.role || "",
            category: initial.category || "General",
            difficulty: initial.difficulty || "medium",
            status: initial.status || "saved",
            tags: (initial.tags || []).join(", "),
            starred: Boolean(initial.starred),
          }
        : EMPTY_FORM,
    );
    const timer = setTimeout(() => questionRef.current?.focus(), 60);
    return () => clearTimeout(timer);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, saving, onClose]);

  if (!open) return null;

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const question = form.question.trim();
    if (!question) {
      toast.error("Write the question first.");
      return;
    }

    const payload = {
      question,
      answer: form.answer,
      company: form.company,
      role: form.role,
      category: form.category.trim() || "General",
      difficulty: form.difficulty,
      status: form.status,
      tags: form.tags,
      starred: form.starred,
    };

    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/api/interview/${initial._id}`, payload);
        toast.success("Question updated");
      } else {
        await api.post("/api/interview", payload);
        toast.success("Saved to your interview bank");
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save the question.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-ink-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={editing ? "Edit question" : "Add question"}
        className="glass max-h-[92dvh] w-full max-w-2xl animate-pop overflow-y-auto rounded-t-3xl p-5 sm:rounded-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <Eyebrow icon={FaRegLightbulb}>{editing ? "Edit" : "New"}</Eyebrow>
            <h2 className="mt-3 text-xl font-bold text-white">
              {editing ? "Edit question" : "Add an interview question"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Capture it while it is fresh — the answer can come later.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <FaTimes className="size-3.5" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-slate-300">
              Question <span className="text-rose-300">*</span>
            </span>
            <textarea
              ref={questionRef}
              name="question"
              value={form.question}
              onChange={update}
              rows={3}
              placeholder="e.g. Explain the difference between == and === in JavaScript."
              className="w-full resize-none rounded-xl border border-white/10 bg-ink-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 transition outline-none focus:border-brand-400/60 focus:bg-ink-850 focus:ring-4 focus:ring-brand-500/18"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-slate-300">
              Answer / notes
            </span>
            <textarea
              name="answer"
              value={form.answer}
              onChange={update}
              rows={5}
              placeholder="The ideal answer, or the points you want to remember."
              className="w-full resize-none rounded-xl border border-white/10 bg-ink-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 transition outline-none focus:border-brand-400/60 focus:bg-ink-850 focus:ring-4 focus:ring-brand-500/18"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-slate-300">Company</span>
              <Field
                name="company"
                value={form.company}
                onChange={update}
                placeholder="e.g. Infosys"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-slate-300">Role</span>
              <Field
                name="role"
                value={form.role}
                onChange={update}
                placeholder="e.g. Frontend Intern"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-slate-300">Category</span>
              <Field
                name="category"
                list="interview-categories"
                value={form.category}
                onChange={update}
                placeholder="DSA"
              />
              <datalist id="interview-categories">
                {CATEGORY_PRESETS.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-slate-300">Difficulty</span>
              <Select name="difficulty" value={form.difficulty} onChange={update}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-slate-300">Status</span>
              <Select name="status" value={form.status} onChange={update}>
                <option value="saved">Saved</option>
                <option value="practicing">Practicing</option>
                <option value="mastered">Mastered</option>
              </Select>
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-slate-300">
              Tags <span className="font-normal text-slate-500">(comma separated)</span>
            </span>
            <Field
              name="tags"
              value={form.tags}
              onChange={update}
              placeholder="closures, hoisting, array methods"
            />
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-ink-900/50 px-4 py-3">
            <input
              type="checkbox"
              name="starred"
              checked={form.starred}
              onChange={update}
              className="size-4 accent-brand-500"
            />
            <span className="text-sm font-medium text-slate-300">
              Star this question to find it quickly later
            </span>
          </label>

          <div className="mt-1 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="soft" onClick={onClose} disabled={saving} className="sm:min-w-28">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="sm:min-w-40">
              {saving ? "Saving…" : editing ? "Save changes" : "Add question"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------- Page */

const Interview = () => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");
  const [starredOnly, setStarredOnly] = useState(false);
  const [sort, setSort] = useState("newest");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* Debounce the search box so typing does not fire a request per keystroke. */
  useEffect(() => {
    const timer = setTimeout(() => setSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      try {
        const params = { sort };
        if (search.trim()) params.search = search.trim();
        if (category) params.category = category;
        if (difficulty) params.difficulty = difficulty;
        if (status) params.status = status;
        if (starredOnly) params.starred = "true";

        const [listRes, statsRes] = await Promise.all([
          api.get("/api/interview", { params }),
          api.get("/api/interview/stats"),
        ]);

        setItems(Array.isArray(listRes.data) ? listRes.data : []);
        setStats(statsRes.data || null);
      } catch {
        toast.error("Could not load your interview questions.");
      } finally {
        setLoading(false);
      }
    },
    [search, category, difficulty, status, starredOnly, sort],
  );

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(() => {
    const fromStats = stats?.categories || [];
    const fromItems = items.map((item) => item.category).filter(Boolean);
    return [...new Set([...fromStats, ...fromItems])].sort();
  }, [stats, items]);

  const masteryPercent = stats?.total
    ? Math.round((stats.mastered / stats.total) * 100)
    : 0;

  const toggleStar = async (item) => {
    setItems((prev) =>
      prev.map((entry) =>
        entry._id === item._id ? { ...entry, starred: !entry.starred } : entry,
      ),
    );
    try {
      await api.patch(`/api/interview/${item._id}`, { starred: !item.starred });
      load({ silent: true });
    } catch {
      toast.error("Could not update the star.");
      load({ silent: true });
    }
  };

  const cycleStatus = async (item) => {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(item.status) + 1) % STATUS_CYCLE.length];
    setItems((prev) =>
      prev.map((entry) => (entry._id === item._id ? { ...entry, status: next } : entry)),
    );
    try {
      await api.patch(`/api/interview/${item._id}`, { status: next });
      load({ silent: true });
    } catch {
      toast.error("Could not change the status.");
      load({ silent: true });
    }
  };

  const markAsked = async (item) => {
    try {
      const { data } = await api.post(`/api/interview/${item._id}/review`);
      setItems((prev) => prev.map((entry) => (entry._id === item._id ? data : entry)));
      toast.success("Marked as asked again");
      load({ silent: true });
    } catch {
      toast.error("Could not update the count.");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/api/interview/${pendingDelete._id}`);
      toast.success("Question removed");
      setPendingDelete(null);
      load({ silent: true });
    } catch {
      toast.error("Could not delete the question.");
    } finally {
      setDeleting(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormOpen(true);
  };

  return (
    <div className="relative">
      {/* ============================================================== Hero */}
      <section className="relative overflow-hidden px-4 pt-16 pb-10 sm:px-6 sm:pt-24 lg:px-8">
        <div
          aria-hidden="true"
          className="dot-backdrop absolute inset-0 -z-10 opacity-25 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]"
        />

        <div className="mx-auto w-full max-w-7xl">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Eyebrow icon={FaRegLightbulb}>Interview bank</Eyebrow>
            <h1 className="mt-7 text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="gradient-text">Every question</span>{" "}
              <span className="text-white">you have been asked.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
              Log the questions from your interviews as they happen, add the answers over
              time, and walk into the next one already prepared.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button onClick={openAdd} size="lg">
                <FaPlus className="size-4" />
                Add a question
              </Button>
              <Button to="/library" size="lg" variant="soft">
                <FaLayerGroup className="size-4" />
                Open my library
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================== Content */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
        <div className="mx-auto w-full max-w-7xl">
          {/* Stats strip */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile icon={FaRegLightbulb} label="Questions" value={stats?.total ?? "—"} />
            <StatTile
              icon={FaCheckCircle}
              label="Mastered"
              value={stats?.mastered ?? "—"}
              tone="mint"
              hint={stats?.total ? `${masteryPercent}% of your bank` : undefined}
            />
            <StatTile
              icon={FaBuilding}
              label="Companies"
              value={stats?.companies ?? "—"}
              tone="aqua"
            />
            <StatTile icon={FaStar} label="Starred" value={stats?.starred ?? "—"} tone="gold" />
          </div>

          {/* Mastery progress */}
          {stats?.total ? (
            <div className="mt-5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-ink-800">
                <div
                  className="h-full rounded-full bg-linear-to-r from-mint-500 to-aqua-400 transition-all duration-700"
                  style={{ width: `${masteryPercent}%` }}
                />
              </div>
            </div>
          ) : null}

          {/* Toolbar */}
          <div className="mt-8">
            <Toolbar
              query={query}
              setQuery={setQuery}
              category={category}
              setCategory={setCategory}
              categories={categories}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              status={status}
              setStatus={setStatus}
              starredOnly={starredOnly}
              setStarredOnly={setStarredOnly}
              sort={sort}
              setSort={setSort}
              onAdd={openAdd}
            />
          </div>

          {/* Results */}
          <div className="mt-8">
            {loading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="h-48 animate-pulse p-5">
                    <div className="h-4 w-24 rounded bg-white/10" />
                    <div className="mt-5 h-4 w-full rounded bg-white/8" />
                    <div className="mt-2 h-4 w-3/4 rounded bg-white/8" />
                    <div className="mt-8 h-8 w-full rounded bg-white/5" />
                  </Card>
                ))}
              </div>
            ) : items.length ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item, index) => (
                  <QuestionCard
                    key={item._id}
                    item={item}
                    index={index}
                    onToggleStar={toggleStar}
                    onCycleStatus={cycleStatus}
                    onMarkAsked={markAsked}
                    onEdit={openEdit}
                    onDelete={setPendingDelete}
                  />
                ))}
              </div>
            ) : (
              <Card className="flex flex-col items-center px-6 py-16 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-linear-to-br from-brand-500 to-aqua-500 text-white shadow-brand">
                  <FaRegLightbulb className="text-xl" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-white">
                  {search || category || difficulty || status || starredOnly
                    ? "No questions match those filters"
                    : "Your interview bank is empty"}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
                  {search || category || difficulty || status || starredOnly
                    ? "Try clearing a filter or searching for something else."
                    : "Add the first question you were asked. Over time this becomes a personal question bank for every interview ahead."}
                </p>
                <Button onClick={openAdd} size="md" className="mt-6">
                  <FaPlus className="size-3.5" />
                  Add your first question
                </Button>
              </Card>
            )}
          </div>
        </div>
      </section>

      <QuestionForm
        open={formOpen}
        initial={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          load({ silent: true });
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this question?"
        message="It will be removed from your interview bank. This cannot be undone."
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};

export default Interview;
