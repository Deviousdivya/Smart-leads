import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User, { UserRole } from "../models/User.ts";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

router.post("/register", async (req, res) => {
  console.log("POST /api/auth/register request received for:", req.body.email);
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("User already exists:", email);
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Check DB connection before creating
    console.log("DB Connection State:", mongoose.connection.readyState);
    if (mongoose.connection.readyState !== 1) {
      console.error("DB NOT CONNECTED during registration attempt");
      throw new Error("Database is not connected. Please check MONGODB_URI and Network Access settings.");
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || UserRole.SALES,
    });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error("Vercel Debug - Registration Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/login", async (req, res) => {
  console.log("POST /api/auth/login request received for:", req.body.email);
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ success: false, message: "Invalid credentials (user not found)" });
    }

    // Check DB connection
    console.log("DB Connection State (Login):", mongoose.connection.readyState);
    if (mongoose.connection.readyState !== 1) {
      console.error("DB NOT CONNECTED during login attempt");
      throw new Error("Database is not connected.");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error("Vercel Debug - Login Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
});

router.get("/me", async (req: any, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false });

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ success: false });

    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ success: false });
  }
});

export default router;
