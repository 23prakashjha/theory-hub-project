import axios from "axios";

// Base URL for the backend.
//  - Set VITE_API_URL in frontend/.env to override (e.g. the Render deploy URL).
//  - In local dev it defaults to the Express server on :5000.
//  - In production builds it uses the deployed CodeTheory API.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5050"
    : "https://theory-hub-project.onrender.com");

// There is no login. This browser gets one random id, kept in localStorage,
// which the backend uses to keep each visitor's PDFs and notes to themselves.
const DEVICE_ID_KEY = "deviceId";

const newDeviceId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;

const readDeviceId = () => {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = newDeviceId();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    // Private-mode browsers can block storage; a per-tab id still works
    // for this session, the visitor just won't see their previous uploads.
    return newDeviceId();
  }
};

const deviceId = readDeviceId();

const api = axios.create({ baseURL: API_BASE_URL });

// Attach the device id to every request.
api.interceptors.request.use((config) => {
  config.headers["X-Device-Id"] = deviceId;
  return config;
});

// On 401, something upstream rejected us; drop any stale session and go home.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.assign("/");
    }
    return Promise.reject(err);
  }
);

// Headers for non-axios requests (e.g. fetching the exported markdown).
export const authHeaders = () => ({ "X-Device-Id": deviceId });

export const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = Number(bytes);
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value % 1 === 0 ? value : value.toFixed(1)} ${units[unit]}`;
};

export const formatNumber = (n) =>
  n == null ? "—" : Number(n).toLocaleString();

export const formatDate = (value) => {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default api;