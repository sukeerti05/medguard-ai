import DoctorVisit from "../models/DoctorVisit.js";
import HospitalVisit from "../models/HospitalVisit.js";
import { sendReminderEmail } from "./sendReminderEmail.js";

// ================= HELPERS =================

// If no time is mentioned, default to 09:00 AM
const getVisitDateTime = (dateValue, timeValue) => {
  if (!dateValue) return null;

  const visitDate = new Date(dateValue);
  const [hours, minutes] = (timeValue || "09:00").split(":").map(Number);

  visitDate.setHours(hours || 9, minutes || 0, 0, 0);
  return visitDate;
};

const formatVisitDateTime = (dateValue, timeValue) => {
  const dt = getVisitDateTime(dateValue, timeValue);
  if (!dt) return "-";

  return dt.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Reminder should be sent if current time is within 10 minutes
// after the target reminder time, and not already sent
const shouldSendReminder = (targetTime, now, alreadySent) => {
  if (alreadySent) return false;
  if (!targetTime) return false;

  const diff = now - targetTime;
  return diff >= 0 && diff <= 10 * 60 * 1000;
};

// Target 1: one day before at 9:00 AM
const getOneDayBeforeAt9AM = (visitDateTime) => {
  const reminderTime = new Date(visitDateTime);
  reminderTime.setDate(reminderTime.getDate() - 1);
  reminderTime.setHours(9, 0, 0, 0);
  return reminderTime;
};

// Target 2: same day at 9:00 AM
const getSameDayAt9AM = (visitDateTime) => {
  const reminderTime = new Date(visitDateTime);
  reminderTime.setHours(9, 0, 0, 0);
  return reminderTime;
};

// ================= MAIN FUNCTION =================

export const checkVisitReminders = async () => {
  try {
    const now = new Date();
    console.log("⏰ Visit reminder checker running:", now.toLocaleString());

    // ================= DOCTOR VISITS =================
    const doctorVisits = await DoctorVisit.find({
      follow_up_date: { $ne: null },
      user_email: { $ne: null },
    });

    for (const visit of doctorVisits) {
      const visitDateTime = getVisitDateTime(
        visit.follow_up_date,
        visit.follow_up_time || "09:00"
      );

      if (!visitDateTime) continue;

      const oneDayBeforeAt9AM = getOneDayBeforeAt9AM(visitDateTime);
      const sameDayAt9AM = getSameDayAt9AM(visitDateTime);

      console.log(
        "Doctor visit:",
        visit.doctor_name,
        visit.user_email,
        visit.follow_up_date,
        visit.follow_up_time || "09:00"
      );

      // 1 day before at 9 AM
      if (shouldSendReminder(oneDayBeforeAt9AM, now, visit.reminder_1day_sent)) {
        try {
          console.log("📧 Sending doctor 1-day reminder to:", visit.user_email);

          await sendReminderEmail({
            to: visit.user_email,
            subject: "Reminder: Doctor visit tomorrow at 9:00 AM",
            html: `
              <h2>Doctor Visit Reminder</h2>
              <p>Your doctor visit is scheduled for tomorrow.</p>
              <p><strong>Doctor:</strong> ${visit.doctor_name || "-"}</p>
              <p><strong>Hospital:</strong> ${visit.hospital_name || "-"}</p>
              <p><strong>Specialization:</strong> ${visit.specialization || "-"}</p>
              <p><strong>Reason:</strong> ${visit.reason || "-"}</p>
              <p><strong>Date & Time:</strong> ${formatVisitDateTime(
                visit.follow_up_date,
                visit.follow_up_time || "09:00"
              )}</p>
              <p><strong>Notes:</strong> ${visit.notes || "-"}</p>
            `,
          });

          visit.reminder_1day_sent = true;
          await visit.save();
        } catch (err) {
          console.error("❌ Doctor 1-day reminder failed:", err);
        }
      }

      // Same day at 9 AM
      if (shouldSendReminder(sameDayAt9AM, now, visit.reminder_9am_sent)) {
        try {
          console.log("📧 Sending doctor same-day 9 AM reminder to:", visit.user_email);

          await sendReminderEmail({
            to: visit.user_email,
            subject: "Reminder: Doctor visit today at 9:00 AM",
            html: `
              <h2>Doctor Visit Reminder</h2>
              <p>Your doctor visit is scheduled for today.</p>
              <p><strong>Doctor:</strong> ${visit.doctor_name || "-"}</p>
              <p><strong>Hospital:</strong> ${visit.hospital_name || "-"}</p>
              <p><strong>Specialization:</strong> ${visit.specialization || "-"}</p>
              <p><strong>Reason:</strong> ${visit.reason || "-"}</p>
              <p><strong>Date & Time:</strong> ${formatVisitDateTime(
                visit.follow_up_date,
                visit.follow_up_time || "09:00"
              )}</p>
              <p><strong>Notes:</strong> ${visit.notes || "-"}</p>
            `,
          });

          visit.reminder_9am_sent = true;
          await visit.save();
        } catch (err) {
          console.error("❌ Doctor 9 AM reminder failed:", err);
        }
      }
    }

    // ================= HOSPITAL VISITS =================
    const hospitalVisits = await HospitalVisit.find({
      follow_up_date: { $ne: null },
      user_email: { $ne: null },
    });

    for (const visit of hospitalVisits) {
      const visitDateTime = getVisitDateTime(
        visit.follow_up_date,
        visit.follow_up_time || "09:00"
      );

      if (!visitDateTime) continue;

      const oneDayBeforeAt9AM = getOneDayBeforeAt9AM(visitDateTime);
      const sameDayAt9AM = getSameDayAt9AM(visitDateTime);

      console.log(
        "Hospital visit:",
        visit.hospital_name,
        visit.user_email,
        visit.follow_up_date,
        visit.follow_up_time || "09:00"
      );

      // 1 day before at 9 AM
      if (shouldSendReminder(oneDayBeforeAt9AM, now, visit.reminder_1day_sent)) {
        try {
          console.log("📧 Sending hospital 1-day reminder to:", visit.user_email);

          await sendReminderEmail({
            to: visit.user_email,
            subject: "Reminder: Hospital visit tomorrow at 9:00 AM",
            html: `
              <h2>Hospital Visit Reminder</h2>
              <p>Your hospital visit is scheduled for tomorrow.</p>
              <p><strong>Hospital:</strong> ${visit.hospital_name || "-"}</p>
              <p><strong>Location:</strong> ${visit.location || "-"}</p>
              <p><strong>Reason:</strong> ${visit.reason || "-"}</p>
              <p><strong>Date & Time:</strong> ${formatVisitDateTime(
                visit.follow_up_date,
                visit.follow_up_time || "09:00"
              )}</p>
              <p><strong>Notes:</strong> ${visit.notes || "-"}</p>
            `,
          });

          visit.reminder_1day_sent = true;
          await visit.save();
        } catch (err) {
          console.error("❌ Hospital 1-day reminder failed:", err);
        }
      }

      // Same day at 9 AM
      if (shouldSendReminder(sameDayAt9AM, now, visit.reminder_9am_sent)) {
        try {
          console.log("📧 Sending hospital same-day 9 AM reminder to:", visit.user_email);

          await sendReminderEmail({
            to: visit.user_email,
            subject: "Reminder: Hospital visit today at 9:00 AM",
            html: `
              <h2>Hospital Visit Reminder</h2>
              <p>Your hospital visit is scheduled for today.</p>
              <p><strong>Hospital:</strong> ${visit.hospital_name || "-"}</p>
              <p><strong>Location:</strong> ${visit.location || "-"}</p>
              <p><strong>Reason:</strong> ${visit.reason || "-"}</p>
              <p><strong>Date & Time:</strong> ${formatVisitDateTime(
                visit.follow_up_date,
                visit.follow_up_time || "09:00"
              )}</p>
              <p><strong>Notes:</strong> ${visit.notes || "-"}</p>
            `,
          });

          visit.reminder_9am_sent = true;
          await visit.save();
        } catch (err) {
          console.error("❌ Hospital 9 AM reminder failed:", err);
        }
      }
    }
  } catch (error) {
    console.error("❌ Visit reminder checker error:", error);
  }
};