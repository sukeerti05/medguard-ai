
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,

  email: {
    type: String,
    unique: true
  },

  phone: {
    type: String,
    unique: true
  },
  
   role: {
    type: String,
    enum: ["patient", "doctor", "caregiver"],
    default: "patient"
  },
  password: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: String,
  otpExpires: Date
});

export default mongoose.model("User", userSchema);