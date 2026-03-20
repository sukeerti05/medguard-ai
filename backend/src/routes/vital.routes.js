import express from "express";
import Vital from "../models/Vital.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const vital = new Vital(req.body);
    await vital.save();
    res.status(201).json(vital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save vital" });
  }
});

router.get("/", async (req, res) => {
  try {
    const vitals = await Vital.find().sort({ date: -1 });
    res.json(vitals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch vitals" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Vital.findByIdAndDelete(req.params.id);
    res.json({ message: "Vital deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete vital" });
  }
});

export default router;