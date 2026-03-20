import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import MedicalRecord from "../models/MedicalRecord.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../../uploads/medical-records");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/add", upload.single("file"), async (req, res) => {
  try {
    const {
      category,
      test_name,
      hospital_name,
      lab_centre,
      lab_location,
      lab_id,
      test_date,
      result_summary,
      doctor_reference,
      reference_name,
      notes,
    } = req.body;

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const newRecord = new MedicalRecord({
      category,
      test_name,
      hospital_name,
      lab_centre,
      lab_location,
      lab_id,
      test_date,
      result_summary,
      doctor_reference,
      reference_name,
      notes,
      file_path: `/uploads/medical-records/${req.file.filename}`,
      file_name: req.file.filename,
      file_type: req.file.mimetype,
    });

    await newRecord.save();

    res.status(201).json({
      message: "Medical record uploaded successfully",
      record: newRecord,
    });
  } catch (error) {
    console.error("Add medical record error:", error);
    res.status(500).json({
      message: error.message || "Failed to upload medical record",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const records = await MedicalRecord.find().sort({ test_date: -1 });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch medical records" });
  }
});

router.get("/category/:category", async (req, res) => {
  try {
    const records = await MedicalRecord.find({
      category: req.params.category,
    }).sort({ test_date: -1 });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch category records" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    res.json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch record" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await MedicalRecord.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    res.json({ message: "Medical record deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete medical record" });
  }
});

export default router;