import express from "express";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import Medicine from "../models/Medicine.js";
import User from "../models/User.js";
import medicineUpload from "../middlewares/medicineupload.js";

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

/* ---------------- BULK ADD ---------------- */
router.post("/bulk", verifyToken, async (req, res) => {
  try {
    const loggedInUser = await User.findById(req.user.id);

    if (!loggedInUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const medicines = await Medicine.insertMany(
      req.body.map((item) => ({
        ...item,
        user_id: req.user.id,
        user_email: loggedInUser.email,
      }))
    );

    res.status(201).json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ---------------- ADD MEDICINE ---------------- */
router.post(
  "/add",
  verifyToken,
  medicineUpload.fields([
    { name: "medicine_image", maxCount: 1 },
    { name: "prescription_file", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.user.id);

      if (!loggedInUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const medicineImage =
        req.files?.medicine_image?.[0]?.path?.replace(/\\/g, "/") || "";

      const prescriptionFile =
        req.files?.prescription_file?.[0]?.path?.replace(/\\/g, "/") || "";

      const medicine = await Medicine.create({
        user_id: req.user.id,
        user_email: loggedInUser.email,
        user_name: loggedInUser.name,
        name: req.body.name,
        type: req.body.type || "",
        dosage: req.body.dosage || "",
        quantity_per_dose: Number(req.body.quantity_per_dose || 1),
        frequency: req.body.frequency || "Once Daily",
        times: req.body.times ? JSON.parse(req.body.times) : [],
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        food_instruction: req.body.food_instruction || "After Food",
        prescribed_by: req.body.prescribed_by || "",
        expiry_date: req.body.expiry_date || null,
        no_of_days: Number(req.body.no_of_days || 1),
        stock_count: Number(req.body.stock_count || 0),
        appearance_note: req.body.appearance_note || "",
        medicine_image: medicineImage,
        prescription_file: prescriptionFile,
      });

      res.status(201).json(medicine);
    } catch (err) {
      console.error("ADD MEDICINE ERROR:", err);
      res.status(500).json({ message: "Add failed", error: err.message });
    }
  }
);

/* ---------------- GET ALL MEDICINES ---------------- */
router.get("/", verifyToken, async (req, res) => {
  try {
    const medicines = await Medicine.find({ user_id: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- UPDATE MEDICINE ---------------- */
router.put(
  "/:id",
  verifyToken,
  medicineUpload.fields([
    { name: "medicine_image", maxCount: 1 },
    { name: "prescription_file", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const medicine = await Medicine.findOne({
        _id: req.params.id,
        user_id: req.user.id,
      });

      if (!medicine) {
        return res.status(404).json({ message: "Medicine not found" });
      }

      const loggedInUser = await User.findById(req.user.id);

      if (!loggedInUser) {
        return res.status(404).json({ message: "User not found" });
      }

      medicine.name = req.body.name || medicine.name;
      medicine.type = req.body.type || medicine.type;
      medicine.dosage = req.body.dosage || medicine.dosage;
      medicine.quantity_per_dose = Number(
        req.body.quantity_per_dose || medicine.quantity_per_dose
      );
      medicine.frequency = req.body.frequency || medicine.frequency;

      if (req.body.times) {
        if (Array.isArray(req.body.times)) {
          medicine.times = req.body.times;
        } else {
          try {
            medicine.times = JSON.parse(req.body.times);
          } catch {
            medicine.times = [req.body.times];
          }
        }
      }

      medicine.startDate = req.body.startDate || medicine.startDate;
      medicine.endDate = req.body.endDate || medicine.endDate;
      medicine.food_instruction =
        req.body.food_instruction || medicine.food_instruction;
      medicine.prescribed_by = req.body.prescribed_by || medicine.prescribed_by;
      medicine.expiry_date = req.body.expiry_date || medicine.expiry_date;
      medicine.no_of_days = Number(req.body.no_of_days || medicine.no_of_days);
      medicine.stock_count = Number(
        req.body.stock_count || medicine.stock_count
      );
      medicine.appearance_note =
        req.body.appearance_note || medicine.appearance_note;

      // keep required user fields during update
      medicine.user_id = req.user.id;
      medicine.user_email = loggedInUser.email;
      medicine.user_name = loggedInUser.name;

      const newMedicineImage =
        req.files?.medicine_image?.[0]?.path?.replace(/\\/g, "/") || "";

      const newPrescriptionFile =
        req.files?.prescription_file?.[0]?.path?.replace(/\\/g, "/") || "";

      if (newMedicineImage) {
        const oldImagePath = path.resolve(medicine.medicine_image || "");
        if (medicine.medicine_image && fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
        medicine.medicine_image = newMedicineImage;
      }

      if (newPrescriptionFile) {
        const oldPrescriptionPath = path.resolve(
          medicine.prescription_file || ""
        );
        if (medicine.prescription_file && fs.existsSync(oldPrescriptionPath)) {
          fs.unlinkSync(oldPrescriptionPath);
        }
        medicine.prescription_file = newPrescriptionFile;
      }

      await medicine.save();
      res.json({ message: "Medicine updated successfully", medicine });
    } catch (error) {
      console.error("UPDATE MEDICINE ERROR:", error);
      res.status(500).json({
        message: "Update failed",
        error: error.message,
      });
    }
  }
);

/* ---------------- MARK AS TAKEN ---------------- */
router.put("/taken/:id", verifyToken, async (req, res) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      user_id: req.user.id,
    });

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    medicine.dose_history.push({
      date: new Date(),
      status: "taken",
    });

    await medicine.save();
    res.json({ message: "Marked as taken" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- MARK AS MISSED ---------------- */
router.put("/missed/:id", verifyToken, async (req, res) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      user_id: req.user.id,
    });

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    medicine.dose_history.push({
      date: new Date(),
      status: "missed",
    });

    await medicine.save();
    res.json({ message: "Marked as missed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- UPDATE STOCK ---------------- */
router.put("/update-stock/:id", verifyToken, async (req, res) => {
  try {
    const { stock } = req.body;

    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { stock_count: stock },
      { new: true }
    );

    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- DELETE ---------------- */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const medicine = await Medicine.findOne({
      _id: req.params.id,
      user_id: req.user.id,
    });

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    if (medicine.medicine_image) {
      const imagePath = path.resolve(medicine.medicine_image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    if (medicine.prescription_file) {
      const prescriptionPath = path.resolve(medicine.prescription_file);
      if (fs.existsSync(prescriptionPath)) {
        fs.unlinkSync(prescriptionPath);
      }
    }

    await Medicine.deleteOne({ _id: req.params.id });

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;