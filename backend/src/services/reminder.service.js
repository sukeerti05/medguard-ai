import User from "../models/User.js";
import Medicine from "../models/Medicine.js";
import NotificationService from "./notification.service.js";

export default {
  sendReminder: async (userId) => {
    const user = await User.findById(userId);
    const medicines = await Medicine.find({ user: userId });

    // Example: Send email + SMS for all medicines
    const medicineNames = medicines.map(m => m.name).join(", ");
    const message = `Time to take your medicines: ${medicineNames}`;

    if (user.email) await NotificationService.sendEmail(user.email, "Medicine Reminder", message);
    if (user.phone) await NotificationService.sendSMS(user.phone, message);

    console.log("Reminder sent to", user.name);
  }
};
