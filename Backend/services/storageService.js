import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { uploadsConfig } from "../config/env.js";

// -------------------- Filesystem helpers --------------------

/** Create a directory (and parents) if it does not already exist. */
export const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
  return dir;
};

/** Create every storage directory the app needs. Safe to call on every boot. */
export const initStorage = async () => {
  await ensureDir(uploadsConfig.dir);
  await ensureDir(uploadsConfig.documentsDir);
  return uploadsConfig.documentsDir;
};

/**
 * Strip anything that could escape the uploads directory or break a filesystem.
 * Keeps unicode letters/numbers so "Café Notes (v2).pdf" survives intact.
 */
export const sanitizeFileName = (originalName = "document.pdf") => {
  const ext = path.extname(originalName).toLowerCase();
  const isPdf = ext === ".pdf";
  const base = path
    .basename(originalName, path.extname(originalName))
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80);

  return `${base || "document"}${isPdf ? ".pdf" : ext || ".pdf"}`;
};

/** Directory that holds one user's documents. Keeps the disk tidy and namespaced. */
export const userDir = (userId) =>
  path.join(uploadsConfig.documentsDir, String(userId || "anonymous"));

/**
 * Build the final on-disk name. `docId` is generated before the write so the
 * name is stable even if two users upload "notes.pdf" at the same moment.
 */
export const buildStoredName = ({ userId, docId, originalName }) => {
  const safe = sanitizeFileName(originalName);
  return path.join(String(userId || "anonymous"), `${docId}-${safe}`);
};

export const absolutePathFor = (storedName) => path.join(uploadsConfig.documentsDir, storedName);

/** Write an uploaded buffer to disk and return the relative `storedName`. */
export const saveDocument = async ({ userId, docId, originalName, buffer }) => {
  const storedName = buildStoredName({ userId, docId, originalName });
  const absolute = absolutePathFor(storedName);

  await ensureDir(path.dirname(absolute));
  await fs.writeFile(absolute, buffer);

  const { size } = await fs.stat(absolute);
  return { storedName, absolutePath: absolute, size };
};

/** Read a stored document back off disk. Returns null when the file is gone. */
export const readDocument = async (storedName) => {
  if (!storedName) return null;
  try {
    return await fs.readFile(absolutePathFor(storedName));
  } catch {
    return null;
  }
};

/** Delete a stored document. Missing files are treated as already deleted. */
export const deleteDocument = async (storedName) => {
  if (!storedName) return false;
  try {
    await fs.unlink(absolutePathFor(storedName));
    return true;
  } catch {
    return false;
  }
};

export const publicUrlFor = (storedName) =>
  storedName ? `${uploadsConfig.publicPath}/documents/${storedName.split(path.sep).join("/")}` : null;

/**
 * Generate a Mongo-ObjectId-shaped identifier (24 hex chars) so documents can
 * take a client-generated `_id` without tripping Mongoose casting.
 */
export const newId = () => crypto.randomBytes(12).toString("hex");
