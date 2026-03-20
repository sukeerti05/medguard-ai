import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: [
        "Lab Reports",
        "X-Ray",
        "MRI",
        "CT Scan",
        "Blood Tests",
        "Vaccination Records",
      ],
    },
    test_name: {
      type: String,
      required: true,
    },
    hospital_name: {
      type: String,
      default: "",
    },
    lab_centre: {
      type: String,
      default: "",
    },
    lab_location: {
      type: String,
      default: "",
    },
    lab_id: {
      type: String,
      default: "",
    },
    test_date: {
      type: Date,
      required: true,
    },
    result_summary: {
      type: String,
      default: "",
    },
    doctor_reference: {
      type: String,
      default: "Self",
    },
    reference_name: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    file_path: {
      type: String,
      required: true,
    },
    file_name: {
      type: String,
      required: true,
    },
    file_type: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("MedicalRecord", medicalRecordSchema);