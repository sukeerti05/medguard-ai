import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor_name: {
      type: String,
      default: "",
    },
    hospital_name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "",
    },
    visit_date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    file_name: {
      type: String,
      required: true,
    },
    prescription_file: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;