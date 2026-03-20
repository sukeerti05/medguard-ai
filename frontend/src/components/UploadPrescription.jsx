import { useEffect, useState } from "react";

export default function UploadPrescription({
  initialData = null,
  onSubmit,
  submitLabel = "Save",
  loading = false,
  isEdit = false,
}) {
  const [form, setForm] = useState({
    doctor_name: "",
    hospital_name: "",
    location: "",
    visit_date: "",
    notes: "",
  });

  const [file, setFile] = useState(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        doctor_name: initialData.doctor_name || "",
        hospital_name: initialData.hospital_name || "",
        location: initialData.location || "",
        visit_date: initialData.visit_date
          ? new Date(initialData.visit_date).toISOString().split("T")[0]
          : "",
        notes: initialData.notes || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!form.hospital_name || !form.visit_date) {
      alert("Hospital name and visit date are required");
      return;
    }

    if (!isEdit && !file) {
      alert("Please choose a prescription file");
      return;
    }

    const formData = new FormData();
    formData.append("doctor_name", form.doctor_name);
    formData.append("hospital_name", form.hospital_name);
    formData.append("location", form.location);
    formData.append("visit_date", form.visit_date);
    formData.append("notes", form.notes);

    if (file) {
      formData.append("prescription_file", file);
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleFormSubmit} className="prescription-form">
      <div className="form-group">
        <label>Doctor Name</label>
        <input
          type="text"
          name="doctor_name"
          value={form.doctor_name}
          onChange={handleChange}
          placeholder="Enter doctor name"
        />
      </div>

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

      <div className="form-group">
        <label>Visit Date</label>
        <input
          type="date"
          name="visit_date"
          value={form.visit_date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Enter notes"
          rows="4"
        />
      </div>

      <div className="form-group">
        <label>
          {isEdit ? "Replace Prescription File (optional)" : "Prescription File"}
        </label>
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => setFile(e.target.files[0] || null)}
          required={!isEdit}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Please wait..." : submitLabel}
      </button>
    </form>
  );
}