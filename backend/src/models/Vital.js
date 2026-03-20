import mongoose from "mongoose";

const vitalSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    blood_pressure: { type: String, default: "" },
    sugar_level: { type: String, default: "" },
    weight: { type: String, default: "" },
    heart_rate: { type: String, default: "" },
    temperature: { type: String, default: "" },
    oxygen_level: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Vital", vitalSchema);