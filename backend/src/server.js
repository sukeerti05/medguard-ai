import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import userRoutes from "./routes/User.routes.js";
import medicineRoutes from "./routes/medicine.routes.js";
import authRoutes from "./routes/auth.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";
import doctorVisitRoutes from "./routes/doctorVisit.routes.js";
import hospitalVisitRoutes from "./routes/hospitalVisit.routes.js";
import medicalRecordRoutes from "./routes/medicalRecord.routes.js";
import vitalRoutes from "./routes/vital.routes.js";

// import cron only AFTER env is available
import "./utils/cron.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/users", userRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/doctor-visits", doctorVisitRoutes);
app.use("/api/hospital-visits", hospitalVisitRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/vitals", vitalRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});