import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";


dotenv.config();

const router = express.Router();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {

    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password)
      return res.status(400).json({ error: "All fields required" });

    // Check verified users only
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
      isVerified: true
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email or Mobile already exists"
      });
    }

    // Remove unverified users
    await User.deleteMany({
      $or: [{ email }, { phone }],
      isVerified: false
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();


// Send email
await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: email,
  subject: "MedGuard AI OTP Verification",
  html: `
  <h2>MedGuard AI</h2>
  <p>Your OTP for registration is:</p>
  <h1>${otp}</h1>
  <p>This OTP will expire in 5 minutes.</p>
  `
});

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
      isVerified: false
    });

    console.log("REGISTER OTP:", otp);

    res.json({
      message: "OTP sent to your email. Please verify to complete registration.",
      userId: user._id
    });

  } catch (err) {
    console.error(err);
  console.log("REGISTER ERROR:", err);
  res.status(500).json({ error: err.message });
}
});

/* ================= VERIFY OTP ================= */
router.post("/verify-otp", async (req, res) => {
  try {

    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.json({ message: "Verification successful" });

  } catch (error) {
    console.log("VERIFY ERROR:", error);
    res.status(500).json({ message: "Verification failed" });
  }
});

/* ================= RESEND OTP ================= */

router.post("/resend-otp", async (req, res) => {

  try {

    const { userId, email } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;

    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "MedGuard AI OTP Verification",
      html: `
      <h2>MedGuard AI</h2>
      <p>Your new OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP expires in 5 minutes.</p>
      `
    });

    console.log("RESEND OTP:", otp);

    res.json({ message: "OTP resent successfully" });

  } catch (error) {

    console.log("RESEND ERROR:", error);

    res.status(500).json({
      message: "Failed to resend OTP"
    });

  }

});

/* ================= LOGIN ================= */

/* ================= LOGIN ================= */

router.post("/login", async (req, res) => {
  try {

    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        message: "Email/Phone and password required"
      });
    }

    // Find user by email OR phone
    const user = await User.findOne({
      $or: [
        { email: emailOrPhone },
        { phone: emailOrPhone }
      ]
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    // If not verified
    if (!user.isVerified) {
      return res.json({
        status: "not_verified",
        userId: user._id
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
     user: {
    name: user.name,
    email: user.email,
    phone: user.phone,
    location: user.location || "India"
  }
});
}
catch (err) {

    console.log("LOGIN ERROR:", err);

    res.status(500).json({
      message: "Login failed"
    });

  }
});
export default router;