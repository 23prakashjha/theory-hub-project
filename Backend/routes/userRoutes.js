import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// GET current user info
// GET /api/users/me
router.get("/me/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE user profile
// PUT /api/users/update/:id
router.put("/update/:id", async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        joined: user.joined,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

