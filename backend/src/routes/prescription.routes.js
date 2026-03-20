import express from "express";
import fs from "fs";
import path from "path";
import Prescription from "../models/Prescription.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

/*
  CREATE PRESCRIPTION
  Field names expected from frontend:
  - doctor_name
  - hospital_name
  - location
  - visit_date
  - notes
  - prescription_file
*/
router.post(
  "/",
  authMiddleware,
  upload.single("prescription_file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Prescription file is required" });
      }

      if (!req.body.hospital_name || !req.body.visit_date) {
        return res
          .status(400)
          .json({ message: "Hospital name and visit date are required" });
      }

      const savedFilePath = req.file.path.replace(/\\/g, "/");

      const visitDate = new Date(req.body.visit_date);
      const formattedDate = visitDate
        .toLocaleDateString("en-GB")
        .replace(/\//g, "-");

      const hospital = req.body.hospital_name.replace(/\s+/g, "_");
      const doctor = (req.body.doctor_name || "Doctor").replace(/\s+/g, "_");
      const extension = path.extname(req.file.originalname);

      const newFileName = `${hospital}_${doctor}_${formattedDate}${extension}`;

      const newPrescription = new Prescription({
        user_id: req.user.id,
        doctor_name: req.body.doctor_name || "",
        hospital_name: req.body.hospital_name,
        location: req.body.location || "",
        visit_date: req.body.visit_date,
        notes: req.body.notes || "",
        prescription_file: savedFilePath,
        file_name: newFileName,
      });

      await newPrescription.save();

      res.status(201).json({
        message: "Prescription uploaded successfully",
        prescription: newPrescription,
      });
    } catch (err) {
      console.error("CREATE PRESCRIPTION ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/*
  GET ALL PRESCRIPTIONS FOR LOGGED-IN USER
*/
router.get("/", authMiddleware, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      user_id: req.user.id,
    }).sort({ visit_date: -1, createdAt: -1 });

    res.json(prescriptions);
  } catch (err) {
    console.error("GET PRESCRIPTIONS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/*
  GET SINGLE PRESCRIPTION
*/
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      user_id: req.user.id,
    });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.json(prescription);
  } catch (err) {
    console.error("GET SINGLE PRESCRIPTION ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/*
  UPDATE PRESCRIPTION
*/
router.put(
  "/:id",
  authMiddleware,
  upload.single("prescription_file"),
  async (req, res) => {
    try {
      const prescription = await Prescription.findOne({
        _id: req.params.id,
        user_id: req.user.id,
      });

      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }

      prescription.doctor_name = req.body.doctor_name || "";
      prescription.hospital_name =
        req.body.hospital_name || prescription.hospital_name;
      prescription.location = req.body.location || "";
      prescription.visit_date = req.body.visit_date || prescription.visit_date;
      prescription.notes = req.body.notes || "";

      if (req.file) {
        const oldPath = path.resolve(prescription.prescription_file);

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }

        const savedFilePath = req.file.path.replace(/\\/g, "/");

        const visitDate = new Date(
          req.body.visit_date || prescription.visit_date
        );
        const formattedDate = visitDate
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-");

        const hospital = (
          req.body.hospital_name || prescription.hospital_name || "Hospital"
        ).replace(/\s+/g, "_");

        const doctor = (
          req.body.doctor_name || prescription.doctor_name || "Doctor"
        ).replace(/\s+/g, "_");

        const extension = path.extname(req.file.originalname);
        const newFileName = `${hospital}_${doctor}_${formattedDate}${extension}`;

        prescription.prescription_file = savedFilePath;
        prescription.file_name = newFileName;
      }

      await prescription.save();

      res.json({
        message: "Prescription updated successfully",
        prescription,
      });
    } catch (err) {
      console.error("UPDATE PRESCRIPTION ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/*
  DELETE PRESCRIPTION
  Also deletes uploaded file from uploads folder
*/
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      user_id: req.user.id,
    });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    const filePath = path.resolve(prescription.prescription_file);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Prescription.deleteOne({ _id: req.params.id });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE PRESCRIPTION ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;