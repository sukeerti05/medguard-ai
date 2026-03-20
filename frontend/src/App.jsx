import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./components/Dashboard";
import Auth from "./components/Auth";
import MedicalRecords from "./pages/MedicalRecords";
import DoctorVisitsPage from "./pages/DoctorVisits";
import HospitalVisitsPage from "./pages/HospitalVisits";
import AddDoctorVisitPage from "./components/AddDoctorVisit";
import AddHospitalVisitPage from "./pages/AddHospitalVisit";
import AddMedicalRecord from "./pages/AddMedicalRecord";
import PrescriptionsPage from "./pages/Prescriptions";
import UploadPrescriptionPage from "./pages/UploadPrescription";
import VerifyOtp from "./pages/VerifyOtp";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import MedicinesPage from "./pages/Medicines";
import AddMedicinePage from "./components/AddMedicine";
import ViewDoctorVisit from "./pages/ViewDoctorVisit";
import ViewHospitalVisit from "./pages/ViewHospitalVisit";
import MedicalRecordsFolder from "./pages/MedicalRecordsFolder";
import ViewMedicalRecord from "./pages/ViewMedicalRecord";
import VitalsPage from "./pages/VitalsPage";
import AddVitalPage from "./pages/AddVitalPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route path="/scans" element={<MedicalRecords />} />

      <Route path="/doctor-visits" element={<DoctorVisitsPage />} />
      <Route path="/add-doctor-visit" element={<AddDoctorVisitPage />} />
      <Route path="/view-doctor-visit" element={<ViewDoctorVisit />} />
      <Route path="/vitals" element={<VitalsPage />} />
<Route path="/add-vital" element={<AddVitalPage />} />
      <Route path="/hospital-visits" element={<HospitalVisitsPage />} />
      <Route path="/add-hospital-visit" element={<AddHospitalVisitPage />} />
      <Route path="/view-hospital-visit" element={<ViewHospitalVisit />} />

      <Route path="/medical-records" element={<MedicalRecords />} />
      <Route path="/add-medical-record" element={<AddMedicalRecord />} />
      <Route
        path="/medical-records-folder/:category"
        element={<MedicalRecordsFolder />}
      />
      <Route path="/view-medical-record/:id" element={<ViewMedicalRecord />} />

      <Route path="/medicines" element={<MedicinesPage />} />
      <Route path="/add-medicine" element={<AddMedicinePage />} />

      <Route path="/prescriptions" element={<PrescriptionsPage />} />
      <Route path="/upload-prescription" element={<UploadPrescriptionPage />} />

      <Route path="/auth" element={<Auth />} />
    </Routes>
  );
}

export default App;