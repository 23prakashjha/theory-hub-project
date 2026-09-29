import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// -------------------- Core --------------------
export const env = {
  port: toNumber(process.env.PORT, 5000),
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  isProduction: process.env.NODE_ENV === "production",
};

// -------------------- Uploads --------------------
export const uploadsConfig = {
  // Resolved from this file's location so it never depends on the shell's cwd.
  dir: process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.join(backendRoot, "uploads"),
  documentsDir: path.join(
    process.env.UPLOADS_DIR
      ? path.resolve(process.env.UPLOADS_DIR)
      : path.join(backendRoot, "uploads"),
    "documents"
  ),
  maxFileBytes: toNumber(process.env.MAX_UPLOAD_MB, 15) * 1024 * 1024,
  publicPath: "/uploads",
};
