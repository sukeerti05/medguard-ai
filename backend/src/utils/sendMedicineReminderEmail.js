import nodemailer from "nodemailer";

export const sendMedicineReminderEmail = async ({
  to,
  userName,
  medicineName,
  dosage,
  time,
  instructions,
}) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: `Medicine Reminder: ${medicineName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Medicine Reminder</h2>
          <p>Hello ${userName || "User"},</p>
          <p>This is a reminder to take your medicine now.</p>

          <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;"><b>Medicine Name</b></td>
              <td style="border: 1px solid #ccc; padding: 8px;">${medicineName}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;"><b>Dosage</b></td>
              <td style="border: 1px solid #ccc; padding: 8px;">${dosage || "-"}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;"><b>Time</b></td>
              <td style="border: 1px solid #ccc; padding: 8px;">${time}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;"><b>Food Instruction</b></td>
              <td style="border: 1px solid #ccc; padding: 8px;">${instructions || "-"}</td>
            </tr>
          </table>

          <p style="margin-top: 16px;">Please take your medicine on time.</p>
          <p>Regards,<br/>MedGuard AI</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Medicine reminder email sent to ${to} for ${medicineName}`);
  } catch (error) {
    console.error("Error sending medicine reminder email:", error);
  }
};