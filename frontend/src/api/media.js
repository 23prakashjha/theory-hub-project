import api, { API_BASE_URL, deviceId } from "./client";

/* Media download endpoints.
 *
 * All of these require the X-Device-Id header, which the shared axios instance
 * attaches automatically — history is scoped per browser exactly like documents.
 */

/** Wrap an axios failure, keeping the status so callers can still branch on it. */
const fail = (err, fallback) => {
  const wrapped = new Error(
    err.response?.data?.message || err.response?.data?.error || fallback
  );
  wrapped.status = err.response?.status ?? null;
  throw wrapped;
};

/** True when the request hit our own catch-all 404 rather than a real failure. */
export const isMissingBackend = (err) => err.status === 404;

export const fetchMediaInfo = (url) =>
  api.post("/api/media/info", { url }).then((res) => res.data).catch((err) => fail(err, "Could not read that link."));

/**
 * yt-dlp availability, or null when the backend could not be reached at all.
 *
 * These are different problems with different fixes — "yt-dlp is missing" means
 * install a binary on the server, whereas null means the server is not running.
 * Collapsing both into `false` sends people off to install something that is
 * already installed.
 */
export const fetchMediaStatus = () =>
  api
    .get("/api/media/status")
    .then((res) => res.data)
    .catch(() => null);

export const startDownload = ({ url, formatId, title, source, thumbnail, size }) =>
  api
    .post("/api/media/download", { url, formatId, title, source, thumbnail, size })
    .then((res) => res.data)
    .catch((err) => fail(err, "Could not start the download."));

export const fetchDownloadProgress = (id) =>
  api
    .get(`/api/media/download/${id}`)
    .then((res) => res.data)
    .catch((err) => fail(err, "Lost track of that download."));

export const cancelDownload = (id) => api.post(`/api/media/download/${id}/cancel`).catch(() => null);

/**
 * A plain href rather than axios: the browser should follow it and save the
 * response, not hand the bytes to JavaScript. The backend deletes the file the
 * moment this request finishes, so it is only worth fetching once.
 *
 * The device id travels as a query parameter because a navigation cannot send
 * custom headers — `identify` accepts either form.
 */
export const downloadFileUrl = (id) =>
  `${API_BASE_URL}/api/media/file/${id}?deviceId=${encodeURIComponent(deviceId)}`;

export const fetchHistory = () =>
  api.get("/api/media/history").then((res) => (Array.isArray(res.data) ? res.data : [])).catch(() => []);

export const deleteHistoryItem = (id) => api.delete(`/api/media/history/${id}`);

export const clearHistory = () => api.delete("/api/media/history");

/* -------------------------------------------------------------- Formatters */

export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return null;
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":").replace(/^00:/, "");
};

export const formatPercent = (percent) =>
  percent == null ? "—" : `${Math.max(0, Math.min(100, percent)).toFixed(2)}%`;

export const formatEta = (seconds) => {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  if (m >= 60) {
    return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}:${s.toFixed(0).padStart(2, "0")}`;
  }
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
};