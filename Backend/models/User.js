// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // 🔥 never return password by default
    },

    avatar: {
      type: String,
      default: "https://i.pravatar.cc/150?img=3",
    },

    role: {
      type: String,
      enum: ["User", "Admin"], // ✅ must match backend role checks
      default: "User",
    },

    joined: {
      type: Date, // store as proper Date object
      default: Date.now, // ✅ fix default
    },

    viewedLanguages: [
      {
        _id: false, // prevents Mongo from creating extra _id for array items
        name: String,
        logo: String,
      },
    ],
  },
  {
    timestamps: true, // createdAt & updatedAt auto
  }
);

// Ensure unique indexes are applied in MongoDB
userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model("User", userSchema);
