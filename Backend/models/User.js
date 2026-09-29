// models/User.js
// There is no login. Each browser is issued a stable device id (see
// middleware/identify.js) and gets exactly one lightweight User behind it, so
// documents, notes and interview sessions stay scoped per browser without
// ever asking anyone for a name, an email or a password.
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Stable id for this browser, assigned on first contact. Absent on any
    // pre-existing account rows, so the index stays sparse.
    deviceId: {
      type: String,
      trim: true,
      default: undefined,
      index: { unique: true, sparse: true },
    },

    name: {
      type: String,
      trim: true,
      default: "Guest",
    },

    // Anonymous visitors get a synthetic address derived from their device id.
    // It exists only to satisfy the unique index, and is never displayed.
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // ensures MongoDB uniqueness
      lowercase: true,
      trim: true,
    },

    // Optional: anonymous users never have one.
    password: {
      type: String,
      default: undefined,
      select: false, // 🔒 never return password by default
    },

    avatar: {
      type: String,
      default: "https://i.pravatar.cc/150?img=3",
    },

    role: {
      type: String,
      enum: ["User", "Admin"], // must match backend logic
      default: "User",
    },

    joined: {
      type: Date, // store as Date object
      default: Date.now, // automatically set current date
    },
  },
  {
    timestamps: true, // createdAt & updatedAt auto-managed
  }
);

export default mongoose.model("User", userSchema);
