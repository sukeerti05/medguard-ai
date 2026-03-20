import nodemailer from "nodemailer";
//import twilio from "twilio";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export default {
  sendEmail: async (to, subject, text) => {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
  },
  //sendSMS: async (to, body) => {
    //await twilioClient.messages.create({ body, from: process.env.TWILIO_PHONE_NUMBER, to });
 // },
  sendWhatsApp: async (to, body) => {
    await twilioClient.messages.create({ body, from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`, to: `whatsapp:${to}` });
  }
};
