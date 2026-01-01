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
    },
    avatar: {
      type: String,
      default: "https://i.pravatar.cc/150?img=3", // Default avatar
    },
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },
    joined: {
      type: String,
      default: new Date().toLocaleDateString(),
    },
    viewedLanguages: [
      {
        name: String,
        logo: String,
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;

