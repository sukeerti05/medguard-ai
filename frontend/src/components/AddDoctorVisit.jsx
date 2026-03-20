import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function AddDoctorVisit() {
  const location = useLocation();
  const navigate = useNavigate();

  const [entryMode, setEntryMode] = useState("manual");
  const [editingId, setEditingId] = useState(null);
  const [ocrFile, setOcrFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  
  const [form, setForm] = useState({
    doctor_name: "",
    hospital_name: "",
    specialization: "",
    visit_type: "First Consultation",
    date: "",
    reason: "",
    symptoms: "",
    diagnosis: "",
    doctor_advice: "",
    follow_up_date: "",
    follow_up_time: "",
    visit_status: "Completed",
    consultation_fee: 0,
    notes: "",
    entry_mode: "manual",
    ocr_text: "",
    ocr_file: "",
  });

  useEffect(() => {
    const visit = location.state?.doctorVisit;

    if (visit) {
      setEditingId(visit._id);
      setEntryMode(visit.entry_mode || "manual");

      setForm({
        doctor_name: visit.doctor_name || "",
        hospital_name: visit.hospital_name || "",
        specialization: visit.specialization || "",
        visit_type: visit.visit_type || "First Consultation",
        date: visit.date ? new Date(visit.date).toISOString().split("T")[0] : "",
        reason: visit.reason || "",
        symptoms: visit.symptoms || "",
        diagnosis: visit.diagnosis || "",
        doctor_advice: visit.doctor_advice || "",
        follow_up_date: visit.follow_up_date
          ? new Date(visit.follow_up_date).toISOString().split("T")[0]
          : "",
        follow_up_time: visit.follow_up_time || "",
        visit_status: visit.visit_status || "Completed",
        consultation_fee: visit.consultation_fee || 0,
        notes: visit.notes || "",
        entry_mode: visit.entry_mode || "manual",
        ocr_text: visit.ocr_text || "",
        ocr_file: visit.ocr_file || "",
      });
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      entry_mode: entryMode,
    }));
  };

  const handleExtract = async () => {
    if (!ocrFile) {
      alert("Please upload a doctor document/image first");
      return;
    }

    try {
      setExtracting(true);

      const formData = new FormData();
      formData.append("ocr_file", ocrFile);

      const res = await API.post("/doctor-visits/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const parsed = res.data.parsedData || {};

      setForm((prev) => ({
        ...prev,
        doctor_name: parsed.doctor_name || prev.doctor_name,
        hospital_name: parsed.hospital_name || prev.hospital_name,
        specialization: parsed.specialization || prev.specialization,
        date: parsed.date || prev.date,
        follow_up_date: parsed.follow_up_date || prev.follow_up_date,
        follow_up_time: parsed.follow_up_time || prev.follow_up_time,
        diagnosis: parsed.diagnosis || prev.diagnosis,
        doctor_advice: parsed.doctor_advice || prev.doctor_advice,
        ocr_text: parsed.ocr_text || "",
        ocr_file: res.data.filePath || "",
        entry_mode: "ocr",
      }));

      alert("OCR extracted. Please review and edit before saving.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "OCR failed");
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
    
const payload = {
  ...form,
  entry_mode: entryMode,
  user_email: storedUser?.email || "",
};
      if (editingId) {
        await API.put(`/doctor-visits/${editingId}`, payload);
        alert("Doctor visit updated successfully");
      } else {
        await API.post("/doctor-visits", payload);
        alert("Doctor visit added successfully");
      }

      navigate("/doctor-visits");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Operation failed");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>{editingId ? "Edit Doctor Visit" : "Add Doctor Visit"}</h2>
      </div>

      {!editingId && (
        <div className="filter-box">
          <div className="view-switch">
            <button
              type="button"
              className={entryMode === "manual" ? "active-view" : ""}
              onClick={() => setEntryMode("manual")}
            >
              Manual Entry
            </button>

            <button
              type="button"
              className={entryMode === "ocr" ? "active-view" : ""}
              onClick={() => setEntryMode("ocr")}
            >
              OCR Extraction
            </button>
          </div>

          {entryMode === "ocr" && (
            <div style={{ marginTop: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px" }}>
                Upload Doctor Document / Slip
              </label>

              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setOcrFile(e.target.files[0] || null)}
              />

              <button
                type="button"
                onClick={handleExtract}
                style={{ marginTop: "12px" }}
              >
                {extracting ? "Extracting..." : "Extract Using OCR"}
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="prescription-form">
        <div className="form-group">
          <label>Doctor Name</label>
          <input
            type="text"
            name="doctor_name"
            value={form.doctor_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Hospital / Clinic Name</label>
          <input
            type="text"
            name="hospital_name"
            value={form.hospital_name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Specialization</label>
          <input
            type="text"
            name="specialization"
            value={form.specialization}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Visit Type</label>
          <select
            name="visit_type"
            value={form.visit_type}
            onChange={handleChange}
          >
            <option value="First Consultation">First Consultation</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Routine Checkup">Routine Checkup</option>
            <option value="Emergency">Emergency</option>
            <option value="Teleconsultation">Teleconsultation</option>
          </select>
        </div>

        <div className="form-group">
          <label>Visit Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Reason for Visit</label>
          <input
            type="text"
            name="reason"
            value={form.reason}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Symptoms</label>
          <textarea
            name="symptoms"
            value={form.symptoms}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Diagnosis</label>
          <textarea
            name="diagnosis"
            value={form.diagnosis}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Doctor Advice</label>
          <textarea
            name="doctor_advice"
            value={form.doctor_advice}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Follow-up Date</label>
          <input
            type="date"
            name="follow_up_date"
            value={form.follow_up_date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Follow-up Time</label>
          <input
            type="time"
            name="follow_up_time"
            value={form.follow_up_time}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Visit Status</label>
          <select
            name="visit_status"
            value={form.visit_status}
            onChange={handleChange}
          >
            <option value="Completed">Completed</option>
            <option value="Follow-up Pending">Follow-up Pending</option>
            <option value="Missed">Missed</option>
          </select>
        </div>

        <div className="form-group">
          <label>Consultation Fee</label>
          <input
            type="number"
            name="consultation_fee"
            value={form.consultation_fee}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
          />
        </div>

        <button type="submit">
          {editingId ? "Update Doctor Visit" : "Save Doctor Visit"}
        </button>
      </form>
    </div>
  );
}