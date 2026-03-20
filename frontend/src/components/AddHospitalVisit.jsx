import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../index.css";
export default function AddHospitalVisit() {
  const location = useLocation();
  const navigate = useNavigate();

  const [entryMode, setEntryMode] = useState("manual");
  const [editingId, setEditingId] = useState(null);
  const [ocrFile, setOcrFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  
  const [form, setForm] = useState({
    hospital_name: "",
    location: "",
    attending_doctor: "",
    doctor_specialization: "",
    reason: "Admission",
    procedure_name: "",
    admission_date: "",
    discharge_date: "",
    ward: "",
    room_number: "",
    bed_number: "",
    diagnosis: "",
    treatment_summary: "",
    bill_amount: "",
    insurance_used: "",
    amount_paid: "",
    follow_up_date: "",
    follow_up_time: "",
    discharge_status: "Admitted",
    notes: "",
    entry_mode: "manual",
    ocr_text: "",
    ocr_file: "",
  });

  const [billFile, setBillFile] = useState(null);
  const [procedureImages, setProcedureImages] = useState([]);

  useEffect(() => {
    const visit = location.state?.hospitalVisit;

    if (visit) {
      setEditingId(visit._id);
      setEntryMode(visit.entry_mode || "manual");

      setForm({
        hospital_name: visit.hospital_name || "",
        location: visit.location || "",
        attending_doctor: visit.attending_doctor || "",
        doctor_specialization: visit.doctor_specialization || "",
        reason: visit.reason || "Admission",
        procedure_name: visit.procedure_name || "",
        admission_date: visit.admission_date
          ? new Date(visit.admission_date).toISOString().split("T")[0]
          : "",
        discharge_date: visit.discharge_date
          ? new Date(visit.discharge_date).toISOString().split("T")[0]
          : "",
        ward: visit.ward || "",
        room_number: visit.room_number || "",
        bed_number: visit.bed_number || "",
        diagnosis: visit.diagnosis || "",
        treatment_summary: visit.treatment_summary || "",
        bill_amount: visit.bill_amount || "",
        insurance_used: visit.insurance_used || "",
        amount_paid: visit.amount_paid || "",
        follow_up_date: visit.follow_up_date
          ? new Date(visit.follow_up_date).toISOString().split("T")[0]
          : "",
        follow_up_time: visit.follow_up_time || "",
        discharge_status: visit.discharge_status || "Admitted",
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
      alert("Please upload a hospital document/image first");
      return;
    }

    try {
      setExtracting(true);

      const data = new FormData();
      data.append("ocr_file", ocrFile);

      const res = await API.post("/hospital-visits/extract", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const parsed = res.data.parsedData || {};

      setForm((prev) => ({
        ...prev,
        hospital_name: parsed.hospital_name || prev.hospital_name,
        location: parsed.location || prev.location,
        attending_doctor: parsed.attending_doctor || prev.attending_doctor,
        admission_date: parsed.admission_date || prev.admission_date,
        discharge_date: parsed.discharge_date || prev.discharge_date,
        diagnosis: parsed.diagnosis || prev.diagnosis,
        treatment_summary: parsed.treatment_summary || prev.treatment_summary,
        follow_up_date: parsed.follow_up_date || prev.follow_up_date,
        follow_up_time: parsed.follow_up_time || prev.follow_up_time,
        ocr_text: parsed.ocr_text || "",
        ocr_file: res.data.filePath || "",
        entry_mode: "ocr",
      }));

      alert("OCR extraction completed. Please review and edit before saving.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "OCR extraction failed");
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      Object.keys(form).forEach((key) => {
        data.append(key, form[key]);
      });
      const storedUser = JSON.parse(localStorage.getItem("user"));
      data.append("user_email", storedUser?.email || "");

      if (billFile) {
        data.append("bill_file", billFile);
      }

      for (let i = 0; i < procedureImages.length; i++) {
        data.append("procedure_images", procedureImages[i]);
      }
const payload = {
  ...form,
  entry_mode: entryMode,
  user_email: storedUser?.email || "",
};
      if (editingId) {
        await API.put(`/hospital-visits/${editingId}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Hospital visit updated successfully");
      } else {
        await API.post("/hospital-visits/add", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Hospital visit saved successfully");
      }

      navigate("/hospital-visits");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Save failed");
    }
  };

  return (
    <div className="add-hospital-page">
      <div className="add-hospital-form">
        <h2>{editingId ? "Edit Hospital Visit" : "Add Hospital Visit"}</h2>

        {!editingId && (
          <div className="hospital-mode-box">
            <div className="hospital-mode-switch">
              <button
                type="button"
                className={entryMode === "manual" ? "active-mode" : ""}
                onClick={() => setEntryMode("manual")}
              >
                Manual Entry
              </button>

              <button
                type="button"
                className={entryMode === "ocr" ? "active-mode" : ""}
                onClick={() => setEntryMode("ocr")}
              >
                OCR Extraction
              </button>
            </div>

            {entryMode === "ocr" && (
              <div className="ocr-upload-box">
                <label>Upload Admission / Discharge Document</label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setOcrFile(e.target.files[0] || null)}
                />
                <button type="button" onClick={handleExtract}>
                  {extracting ? "Extracting..." : "Extract Using OCR"}
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Hospital Name</label>
              <input
                type="text"
                name="hospital_name"
                value={form.hospital_name}
                onChange={handleChange}
                placeholder="Enter hospital name"
                required
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Enter location"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Attending Doctor</label>
              <input
                type="text"
                name="attending_doctor"
                value={form.attending_doctor}
                onChange={handleChange}
                placeholder="Enter doctor name"
              />
            </div>

            <div className="form-group">
              <label>Doctor Specialization</label>
              <input
                type="text"
                name="doctor_specialization"
                value={form.doctor_specialization}
                onChange={handleChange}
                placeholder="Enter specialization"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Reason for Visit</label>
              <select
                name="reason"
                value={form.reason}
                onChange={handleChange}
              >
                <option value="Admission">Admission</option>
                <option value="Surgery">Surgery</option>
                <option value="Operation">Operation</option>
                <option value="Emergency">Emergency</option>
                <option value="Psychiatric Consultation">Psychiatric Consultation</option>
                <option value="Delivery">Delivery</option>
                <option value="Accident / Injury">Accident / Injury</option>
                <option value="Therapy">Therapy</option>
                <option value="Checkup">Checkup</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Procedure / Operation Name</label>
              <input
                type="text"
                name="procedure_name"
                value={form.procedure_name}
                onChange={handleChange}
                placeholder="Enter procedure name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Admission Date</label>
              <input
                type="date"
                name="admission_date"
                value={form.admission_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Discharge Date</label>
              <input
                type="date"
                name="discharge_date"
                value={form.discharge_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row three-cols">
            <div className="form-group">
              <label>Ward</label>
              <input
                type="text"
                name="ward"
                value={form.ward}
                onChange={handleChange}
                placeholder="Enter ward"
              />
            </div>

            <div className="form-group">
              <label>Room Number</label>
              <input
                type="text"
                name="room_number"
                value={form.room_number}
                onChange={handleChange}
                placeholder="Enter room number"
              />
            </div>

            <div className="form-group">
              <label>Bed Number</label>
              <input
                type="text"
                name="bed_number"
                value={form.bed_number}
                onChange={handleChange}
                placeholder="Enter bed number"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Diagnosis</label>
            <textarea
              name="diagnosis"
              value={form.diagnosis}
              onChange={handleChange}
              placeholder="Enter diagnosis"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Treatment Summary</label>
            <textarea
              name="treatment_summary"
              value={form.treatment_summary}
              onChange={handleChange}
              placeholder="Enter treatment summary"
              rows="3"
            />
          </div>

          <div className="form-row three-cols">
            <div className="form-group">
              <label>Bill Amount</label>
              <input
                type="number"
                name="bill_amount"
                value={form.bill_amount}
                onChange={handleChange}
                placeholder="Enter bill amount"
              />
            </div>

            <div className="form-group">
              <label>Insurance Used</label>
              <input
                type="text"
                name="insurance_used"
                value={form.insurance_used}
                onChange={handleChange}
                placeholder="Enter insurance details"
              />
            </div>

            <div className="form-group">
              <label>Amount Paid</label>
              <input
                type="number"
                name="amount_paid"
                value={form.amount_paid}
                onChange={handleChange}
                placeholder="Enter amount paid"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Upload Bill</label>
            <input
              type="file"
              onChange={(e) => setBillFile(e.target.files[0] || null)}
            />
          </div>

          <div className="form-group">
            <label>Upload Operation Images</label>
            <input
              type="file"
              multiple
              onChange={(e) => setProcedureImages(e.target.files)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Follow Up Date</label>
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
              <label>Discharge Status</label>
              <select
                name="discharge_status"
                value={form.discharge_status}
                onChange={handleChange}
              >
                <option value="Admitted">Admitted</option>
                <option value="Discharged">Discharged</option>
                <option value="Follow-up Pending">Follow-up Pending</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Enter notes"
              rows="3"
            />
          </div>

          <button type="submit">
            {editingId ? "Update Hospital Visit" : "Save Hospital Visit"}
          </button>
        </form>
      </div>
    </div>
  );
}