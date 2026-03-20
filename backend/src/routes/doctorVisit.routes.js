import express from "express";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import Tesseract from "tesseract.js";
import DoctorVisit from "../models/DoctorVisit.js";
import doctorVisitUpload from "../middlewares/doctorVisitUpload.js";

const router = express.Router();

/* ---------------- JWT Middleware ---------------- */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
};

/* ---------------- SIMPLE OCR PARSER ---------------- */
const parseDoctorVisitText = (text) => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let doctor_name = "";
  let hospital_name = "";
  let specialization = "";
  let date = "";
  let follow_up_date = "";
  let diagnosis = "";
  let doctor_advice = "";

  const dateRegex =
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+[A-Za-z]+\s+\d{2,4})\b/;

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (!doctor_name && (lower.includes("dr.") || lower.includes("doctor"))) {
      doctor_name = line;
    }

    if (
      !hospital_name &&
      (lower.includes("hospital") ||
        lower.includes("clinic") ||
        lower.includes("medical"))
    ) {
      hospital_name = line;
    }

    if (
      !specialization &&
      (lower.includes("cardiology") ||
        lower.includes("ent") ||
        lower.includes("orthopedic") ||
        lower.includes("orthopaedic") ||
        lower.includes("general medicine") ||
        lower.includes("dermatology") ||
        lower.includes("gynecology") ||
        lower.includes("gynaecology") ||
        lower.includes("neurology"))
    ) {
      specialization = line;
    }

    if (!date && dateRegex.test(line)) {
      date = line.match(dateRegex)?.[0] || "";
      continue;
    }

    if (!follow_up_date && (lower.includes("follow") || lower.includes("review"))) {
      const foundDate = line.match(dateRegex)?.[0];
      if (foundDate) follow_up_date = foundDate;
    }

    if (!diagnosis && (lower.includes("diagnosis") || lower.includes("impression"))) {
      diagnosis = line;
    }

    if (
      !doctor_advice &&
      (lower.includes("advice") ||
        lower.includes("recommend") ||
        lower.includes("rest") ||
        lower.includes("review after"))
    ) {
      doctor_advice = line;
    }
  }

  return {
    doctor_name,
    hospital_name,
    specialization,
    date,
    follow_up_date,
    diagnosis,
    doctor_advice,
    ocr_text: text,
  };
};

/* ---------------- OCR EXTRACT ---------------- */
router.post(
  "/extract",
  verifyToken,
  doctorVisitUpload.single("ocr_file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Document file is required" });
      }

      const filePath = req.file.path.replace(/\\/g, "/");
      const result = await Tesseract.recognize(filePath, "eng");
      const text = result.data.text || "";

      const parsedData = parseDoctorVisitText(text);

      res.json({
        message: "OCR extraction successful",
        filePath,
        parsedData,
      });
    } catch (err) {
      console.error("OCR EXTRACT ERROR:", err);
      res.status(500).json({ message: "OCR extraction failed" });
    }
  }
);

/* ---------------- CREATE DOCTOR VISIT ---------------- */
router.post("/", verifyToken, async (req, res) => {
  try {
    const doctorVisit = await DoctorVisit.create({
      ...req.body,
      user_id: req.user.id,
    });

    res.status(201).json(doctorVisit);
  } catch (err) {
    console.error("ADD DOCTOR VISIT ERROR:", err);
    res.status(500).json({ message: "Add failed" });
  }
});

/* ---------------- GET ALL DOCTOR VISITS ---------------- */
router.get("/", verifyToken, async (req, res) => {
  try {
    const visits = await DoctorVisit.find({ user_id: req.user.id }).sort({
      date: -1,
      createdAt: -1,
    });
    res.json(visits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- GET SINGLE DOCTOR VISIT ---------------- */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const visit = await DoctorVisit.findOne({
      _id: req.params.id,
      user_id: req.user.id,
    });

    if (!visit) {
      return res.status(404).json({ message: "Doctor visit not found" });
    }

    res.json(visit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- UPDATE DOCTOR VISIT ---------------- */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updated = await DoctorVisit.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Doctor visit not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("UPDATE DOCTOR VISIT ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

/* ---------------- DELETE DOCTOR VISIT ---------------- */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const visit = await DoctorVisit.findOne({
      _id: req.params.id,
      user_id: req.user.id,
    });

    if (!visit) {
      return res.status(404).json({ message: "Doctor visit not found" });
    }

    if (visit.ocr_file) {
      const filePath = path.resolve(visit.ocr_file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await DoctorVisit.deleteOne({ _id: req.params.id });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE DOCTOR VISIT ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;