import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import UploadPrescription from "../components/UploadPrescription";

export default function UploadPrescriptionPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (formData) => {
    try {
      setLoading(true);
      await api.post("/prescriptions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Prescription uploaded successfully");
      navigate("/prescriptions");
    } catch (err) {
      alert(err?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Upload New Prescription</h2>
      </div>

      <UploadPrescription
        onSubmit={handleCreate}
        submitLabel="Upload Prescription"
        loading={loading}
      />
    </div>
  );
}