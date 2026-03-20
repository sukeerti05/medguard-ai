import cron from "node-cron";
import Medicine from "../models/Medicine.js";
import sendReminder from "../services/reminder.service.js";
cron.schedule("0 9 * * *", () => {
  console.log(" Reminder check running...");
});
cron.schedule("* * * * *", async () => {
  const now = new Date().toTimeString().slice(0,5);
  const meds = await Medicine.find({ times: now });
  meds.forEach(sendReminder);
});
import { checkVisitReminders } from "./utils/checkVisitReminders.js";

cron.schedule("*/5 * * * *", async () => {
  await checkVisitReminders();
});