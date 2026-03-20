import express from "express";
import ReminderService from "../services/reminder.service.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();


// Trigger sending reminder now (for testing)
router.post("/send", authMiddleware, async (req, res) => {
  const { userId } = req.body;
  await ReminderService.sendReminder(userId);
  res.json({ message: "Reminder triggered" });
});


export default router;
