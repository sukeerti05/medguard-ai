import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  name: String,
  brand_name: String,
  type: {
    type: String,
    enum: ["Tablet", "Capsule", "Syrup", "Injection", "Drops", "Inhaler"]
  },

  dosage: String,
  quantity_per_dose: Number,

  frequency: String,
  schedule_time: [String],

  start_date: Date,
  end_date: Date,

  food_instruction: {
    type: String,
    enum: ["Before Food", "After Food", "With Food"]
  },

  prescribed_by: String,
  prescription_file: String,

  expiry_date: Date,
  stock_count: Number,

  reminder_mode: {
    type: String,
    enum: ["alarm", "sms", "email", "whatsapp"]
  },

  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active"
  },

  adherence_percentage: { type: Number, default: 0 }

}, { timestamps: true });

export default mongoose.model("Medicine", medicineSchema);