import express from "express";
import User from "../models/User.js";

const router = express.Router();

// ⚠️ DEV-ONLY ENDPOINT: Use once to promote user to admin
router.post("/make-admin", async (req, res) => {
  try {
    const userId = "690e026484f330d4c173a1e4"; // your user ID

    const updated = await User.findByIdAndUpdate(
      userId,
      { role: "admin", isVerified: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "✅ User promoted to admin successfully!",
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        isVerified: updated.isVerified,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to set admin", error: err.message });
  }
});

export default router;
