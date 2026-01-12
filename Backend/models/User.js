import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address"
      ]
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false // 🔥 NEVER return password
    },

    avatar: {
      type: String,
      default: "https://i.pravatar.cc/150?img=3"
    },

    role: {
      type: String,
      enum: ["user", "admin"], // ✅ consistent
      default: "user"
    },

    joined: {
      type: String,
      default: () => new Date().toLocaleDateString() // ✅ FIXED
    },

    viewedLanguages: [
      {
        name: String,
        logo: String
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

