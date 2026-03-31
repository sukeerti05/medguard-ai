import cron from "node-cron";
import Medicine from "../models/Medicine.js";
import { sendMedicineReminderEmail } from "./sendMedicineReminderEmail.js";
import { checkVisitReminders } from "./visitReminderChecker.js";

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getLocalTimeString = (date = new Date()) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const isDateInRange = (today, startDate, endDate) => {
  if (!startDate) return false;

  const todayOnly = new Date(today);
  todayOnly.setHours(0, 0, 0, 0);

  const startOnly = new Date(startDate);
  startOnly.setHours(0, 0, 0, 0);

  const endOnly = endDate ? new Date(endDate) : new Date(startDate);
  endOnly.setHours(0, 0, 0, 0);

  return todayOnly >= startOnly && todayOnly <= endOnly;
};

const alreadySentForThisMinute = (medicine, todayStr, timeStr) => {
  return medicine.lastReminderSentAt === `${todayStr} ${timeStr}`;
};

// ================= MEDICINE EMAIL REMINDER =================

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const todayStr = getLocalDateString(now);
    const currentTime = getLocalTimeString(now);

    console.log(`Checking medicine reminders at ${todayStr} ${currentTime}`);

    const medicines = await Medicine.find();

    for (const med of medicines) {
      // ✅ Use stored email directly
      if (!med.user_email) continue;

      const validDate = isDateInRange(now, med.startDate, med.endDate);
      if (!validDate) continue;

      const medicineTimes = Array.isArray(med.times) ? med.times : [];
      if (!medicineTimes.includes(currentTime)) continue;

      if (alreadySentForThisMinute(med, todayStr, currentTime)) continue;

      await sendMedicineReminderEmail({
        to: med.user_email,
        userName: med.user_name,
        medicineName: med.name,
        dosage: med.dosage,
        time: currentTime,
        foodInstruction: med.food_instruction,
      });

      med.lastReminderSentAt = `${todayStr} ${currentTime}`;
      await med.save();
    }
  } catch (error) {
    console.error("Medicine cron error:", error);
  }
});

// ================= VISIT REMINDERS =================

cron.schedule("*/5 * * * *", async () => {
  try {
    await checkVisitReminders();
  } catch (error) {
    console.error("Visit cron error:", error);
  }
});