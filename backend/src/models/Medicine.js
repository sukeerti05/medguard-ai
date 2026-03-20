import mongoose from "mongoose";

const doseHistorySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["taken", "missed"],
      required: true,
    },
  },
  { _id: false }
);

const medicineSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      default: "",
    },

    dosage: {
      type: String,
      default: "",
    },

    quantity_per_dose: {
      type: Number,
      default: 1,
    },

    frequency: {
      type: String,
      default: "Once Daily",
    },

    times: {
      type: [String],
      default: [],
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    food_instruction: {
      type: String,
      default: "After Food",
    },

    prescribed_by: {
      type: String,
      default: "",
    },

    expiry_date: {
      type: Date,
      default: null,
    },

    no_of_days: {
      type: Number,
      default: 1,
    },

    stock_count: {
      type: Number,
      default: 0,
    },

    prescription_file: {
      type: String,
      default: "",
    },

    medicine_image: {
      type: String,
      default: "",
    },

    appearance_note: {
      type: String,
      default: "",
    },

    dose_history: {
      type: [doseHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Medicine", medicineSchema);