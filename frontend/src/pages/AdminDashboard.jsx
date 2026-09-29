import React, { useCallback, useEffect, useState } from "react";
import {
  FaArrowRight,
  FaBookOpen,
  FaCircle,
  FaDatabase,
  FaFilePdf,
  FaHeartbeat,
  FaServer,
  FaSpinner,
  FaStar,
  FaUpload,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api, { API_BASE_URL, formatBytes, formatDate, formatNumber } from "../api/client";
import { Badge, Button, Card, Eyebrow } from "../components/ui/primitives";
import { cx } from "../lib/cx";

const SKELETON = "animate-pulse rounded-xl bg-white/6";

const formatUptime = (seconds) => {
  const total = Math.max(0, Math.round(seconds));
  const days = Math.floor(total / 86_400);
  const hours = Math.floor((total % 86_400) / 3_600);
  const minutes = Math.floor((total % 3_600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const AdminDashboard = () => {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [healthError, setHealthError] = useState(false);

  /* Health is public; library stats need the device id but degrade quietly,
     so both settle independently rather than failing the whole panel. */
  const fetchData = useCallback(async () => {
    const [healthResult, statsResult] = await Promise.allSettled([
      api.get("/api/health"),
      api.get("/api/documents/library/stats"),
    ]);
    return { healthResult, statsResult };
  }, []);

  const applyData = useCallback(({ healthResult, statsResult }) => {
    if (healthResult.status === "fulfilled") {
      setHealth(healthResult.value.data);
      setHealthError(false);
    } else {
      setHealthError(true);
    }

    if (statsResult.status === "fulfilled") {
      setStats(statsResult.value.data);
    } else if (healthResult.status === "fulfilled") {
      toast.error("Could not load library stats for this browser.");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    fetchData().then((data) => {
      if (active) applyData(data);
    });
    return () => {
      active = false;
    };
  }, [fetchData, applyData]);

  const refresh = () => {
    setLoading(true);
    fetchData().then(applyData);
  };

  const storageReady = health?.storage === "ready";

  const metrics = [
    {
      label: "Documents",
      value: loading ? null : stats ? formatNumber(stats.documents) : "—",
      icon: FaFilePdf,
      tone: "brand",
      hint: "Files stored for this browser",
    },
    {
      label: "Pinned",
      value: loading ? null : stats ? formatNumber(stats.pinned) : "—",
      icon: FaStar,
      tone: "gold",
      hint: "Marked as priority reading",
    },
    {
      label: "Storage used",
      value: loading ? null : stats ? formatBytes(stats.sizeBytes) : "—",
      icon: FaDatabase,
      tone: "mint",
      hint: "Total size of uploaded files",
    },
    {
      label: "Uptime",
      value: loading
        ? null
        : health?.uptimeSeconds != null
          ? formatUptime(health.uptimeSeconds)
          : "—",
      icon: FaHeartbeat,
      tone: "aqua",
      hint: "How long the API has been running",
    },
  ];

  return (
    <div className="relative">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* ------------------------------------------------------------ Header */}
        <header className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Eyebrow icon={FaServer}>Control panel</Eyebrow>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              <span className="gradient-text">Admin Dashboard</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
              A live view of the CodeTheory API and the documents stored in this
              browser.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Button
              variant="soft"
              onClick={refresh}
              disabled={loading}
              className="px-3.5"
              aria-label="Refresh dashboard"
            >
              <FaSpinner className={cx("size-4", loading ? "animate-spin" : "opacity-70")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button to="/library" className="group">
              <FaUpload className="size-4" />
              Upload PDF
            </Button>
          </div>
        </header>

        {/* ------------------------------------------------------------- Metrics */}
        <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon, tone, hint }) => (
            <MetricCard
              key={label}
              icon={Icon}
              tone={tone}
              label={label}
              hint={hint}
              loading={loading}
              value={value}
            />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* ---------------------------------------------------- Service health */}
          <Card className="lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-500/14 text-brand-300">
                  <FaServer className="size-4" />
                </span>
                <div>
                  <h2 className="text-base font-bold">Service status</h2>
                  <p className="text-xs text-slate-500">Backend and file storage</p>
                </div>
              </div>

              <Badge tone={healthError ? "danger" : storageReady ? "mint" : loading ? "muted" : "gold"}>
                <FaCircle
                  className={cx(
                    "size-1.5",
                    !healthError && (loading || storageReady) && "animate-pulse",
                  )}
                />
                {healthError
                  ? "Unreachable"
                  : loading
                    ? "Checking…"
                    : storageReady
                      ? "All systems go"
                      : "Degraded"}
              </Badge>
            </div>

            <dl className="divide-y divide-white/6">
              <Row label="API status">
                {loading ? (
                  <span className={cx(SKELETON, "block h-4 w-20")} />
                ) : (
                  <span
                    className={cx(
                      "font-semibold",
                      healthError ? "text-rose-300" : "text-mint-300",
                    )}
                  >
                    {healthError ? "offline" : health?.status || "unknown"}
                  </span>
                )}
              </Row>

              <Row label="File storage">
                {loading ? (
                  <span className={cx(SKELETON, "block h-4 w-20")} />
                ) : (
                  <span
                    className={cx(
                      "font-semibold",
                      healthError
                        ? "text-slate-400"
                        : storageReady
                          ? "text-mint-300"
                          : "text-gold-300",
                    )}
                  >
                    {healthError ? "unknown" : health?.storage || "unknown"}
                  </span>
                )}
              </Row>

              <Row label="API endpoint" wide>
                <code className="max-w-full truncate rounded-md bg-white/6 px-2.5 py-1 font-mono text-[11px] text-slate-300">
                  {API_BASE_URL}
                </code>
              </Row>

              <Row label="Last upload">
                {loading ? (
                  <span className={cx(SKELETON, "block h-4 w-24")} />
                ) : (
                  <span className="font-medium text-white">
                    {formatDate(stats?.lastUpload)}
                  </span>
                )}
              </Row>
            </dl>
          </Card>

          {/* --------------------------------------------------------- Shortcuts */}
          <Card className="flex flex-col p-6">
            <h2 className="text-base font-bold">Quick actions</h2>
            <p className="mt-1.5 text-xs text-slate-500">Jump straight back in</p>

            <div className="mt-6 flex flex-col gap-3">
              <Shortcut
                to="/library"
                icon={FaBookOpen}
                title="Open library"
                body="Browse, search and open your PDFs"
              />
              <Shortcut
                to="/"
                icon={FaArrowRight}
                title="Back to home"
                body="Product tour and feature overview"
              />
            </div>

            <div className="mt-auto pt-7">
              <div className="rounded-xl border border-white/8 bg-white/3 p-4">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                  Coming next
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-400">
                  {[
                    "Shared team libraries",
                    "Folders and bulk tagging",
                    "In-browser PDF search",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <span className="size-1.5 shrink-0 rounded-full bg-brand-400/70" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* -------------------------------------------------------------- Empty */}
        {!loading && !stats?.documents ? (
          <div className="mt-6">
            <Card className="flex flex-col items-center border-dashed px-6 py-12 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-linear-to-br from-aqua-500/20 to-brand-600/20 text-xl text-brand-300">
                <FaFilePdf />
              </span>
              <h2 className="mt-5 text-lg font-bold">No documents yet</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
                Upload your first PDF and these numbers will fill in immediately.
              </p>
              <Button to="/library" className="mt-6">
                <FaUpload className="size-4" />
                Upload a PDF
              </Button>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* ============================================================== Sub-components */

const TONES = {
  brand: "bg-brand-500/14 text-brand-300",
  gold: "bg-gold-500/14 text-gold-300",
  mint: "bg-mint-500/14 text-mint-300",
  aqua: "bg-aqua-500/14 text-aqua-300",
};

const MetricCard = ({ icon: Icon, tone, label, hint, value, loading }) => (
  <Card hover className="p-5">
    <div className="flex items-center gap-3.5">
      <span
        className={cx(
          "grid size-11 shrink-0 place-items-center rounded-xl text-base",
          TONES[tone],
        )}
      >
        <Icon />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-xl font-bold text-white sm:text-2xl">
          {loading ? <span className={cx(SKELETON, "block h-7 w-20")} /> : value}
        </p>
        <p className="mt-0.5 truncate text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
          {label}
        </p>
      </div>
    </div>
    <p className="mt-4 truncate text-xs text-slate-500">{hint}</p>
  </Card>
);

const Row = ({ label, children, wide = false }) => (
  <div
    className={cx(
      "flex items-center justify-between gap-4 px-6 py-4",
      wide && "flex-col items-start gap-2 sm:flex-row sm:items-center",
    )}
  >
    <dt className="text-sm text-slate-400">{label}</dt>
    <dd className="min-w-0 text-sm">{children}</dd>
  </div>
);

const Shortcut = ({ to, icon: Icon, title, body }) => (
  <Link
    to={to}
    className="group flex items-center gap-4 rounded-xl border border-white/8 bg-white/3 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400/40 hover:bg-brand-500/8"
  >
    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-500/14 text-brand-300 transition-transform duration-200 group-hover:scale-110">
      <Icon className="size-4" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold text-white">{title}</span>
      <span className="mt-0.5 block truncate text-xs text-slate-500">{body}</span>
    </span>
    <FaArrowRight className="size-3 shrink-0 text-slate-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand-300" />
  </Link>
);

export default AdminDashboard;