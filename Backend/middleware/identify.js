// middleware/identify.js
// Resolves the caller to a User record from an anonymous, per-browser device id
// sent as the X-Device-Id header.
//
// The app has no login, but documents, notes and interview sessions are still
// scoped per person so one visitor never sees another's uploads. The frontend
// generates the id once and keeps it in localStorage; we create exactly one
// lightweight User behind it the first time we see it.

import User from "../models/User.js";

// Permissive enough for a uuid or a random hex string, strict enough that the
// value can never be used to inject anything into the synthetic email.
const DEVICE_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

/** Pull the device id out of the request, or null when it is absent/unsafe. */
const readDeviceId = (req) => {
  const raw = req.get("x-device-id") || req.query.deviceId || "";
  const value = String(raw).trim();
  return DEVICE_ID_PATTERN.test(value) ? value : null;
};

/** Find the User for this device, creating it on first contact. */
const resolveUser = async (deviceId) => {
  const existing = await User.findOne({ deviceId });
  if (existing) return existing;

  try {
    return await User.create({
      deviceId,
      name: "Guest",
      // Unique stand-in so the collection's unique index stays satisfied
      // without ever asking the visitor for an address.
      email: `anon-${deviceId.toLowerCase()}@anon.app`,
      role: "User",
    });
  } catch (err) {
    // Two requests from a brand-new browser can race on insert. The loser
    // simply adopts the record the winner created.
    if (err?.code === 11000) {
      const raced = await User.findOne({ deviceId });
      if (raced) return raced;
    }
    throw err;
  }
};

/**
 * Populates `req.user`, or 400s when the browser has no usable device id.
 */
export const identify = async (req, res, next) => {
  const deviceId = readDeviceId(req);

  if (!deviceId) {
    return res.status(400).json({
      message:
        "Missing device id. Clear this site's storage and reload the page.",
    });
  }

  try {
    req.user = await resolveUser(deviceId);
    return next();
  } catch (err) {
    console.error("identify middleware:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export default identify;
