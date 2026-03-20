import mongoose from "mongoose";

const doctorVisitSchema = new mongoose.Schema(
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
      default: "",
    },
    specialization: {
      type: String,
      default: "",
    },
    visit_type: {
      type: String,
      default: "First Consultation",
    },
    date: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      default: "",
    },
    symptoms: {
      type: String,
      default: "",
    },
    diagnosis: {
      type: String,
      default: "",
    },
    doctor_advice: {
      type: String,
      default: "",
    },
    follow_up_date: {
      type: Date,
      default: null,
    },
    follow_up_time: {
      type: String,
      default: "",
    },
    visit_status: {
      type: String,
      default: "Completed",
    },
    consultation_fee: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    entry_mode: {
      type: String,
      enum: ["manual", "ocr"],
      default: "manual",
    },
    ocr_text: {
      type: String,
      default: "",
    },
    ocr_file: {
      type: String,
      default: "",
    },
    reminder_1day_sent: {
  type: Boolean,
  default: false,
},
reminder_1hour_sent: {
  type: Boolean,
  default: false,
},
reminder_9am_sent: {
  type: Boolean,
  default: false,
},
user_email: {
  type: String,
  required: true,
},
  },
  { timestamps: true }
);

export default mongoose.model("DoctorVisit", doctorVisitSchema);