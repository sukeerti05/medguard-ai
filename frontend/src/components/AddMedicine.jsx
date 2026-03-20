import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function AddMedicine() {
  const location = useLocation();
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    type: "",
    dosage: "",
    quantity_per_dose: 1,
    frequency: "Once Daily",
    times: [""],
    startDate: "",
    endDate: "",
    food_instruction: "After Food",
    prescribed_by: "",
    expiry_date: "",
    no_of_days: 1,
    stock_count: 0,
    appearance_note: "",
  });

  const [medicineImage, setMedicineImage] = useState(null);
  const [prescriptionFile, setPrescriptionFile] = useState(null);

  const baseURL = useMemo(() => {
    const base = API.defaults.baseURL || "";
    return base.replace(/\/api\/?$/, "");
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await API.get("/medicines");
      setMedicines(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    const med = location.state?.medicine;

    if (med) {
      setEditingId(med._id);

      setForm({
        name: med.name || "",
        type: med.type || "",
        dosage: med.dosage || "",
        quantity_per_dose: med.quantity_per_dose || 1,
        frequency: med.frequency || "Once Daily",
        times: med.times?.length ? med.times : [""],
        startDate: med.startDate
          ? new Date(med.startDate).toISOString().split("T")[0]
          : "",
        endDate: med.endDate
          ? new Date(med.endDate).toISOString().split("T")[0]
          : "",
        food_instruction: med.food_instruction || "After Food",
        prescribed_by: med.prescribed_by || "",
        expiry_date: med.expiry_date
          ? new Date(med.expiry_date).toISOString().split("T")[0]
          : "",
        no_of_days: med.no_of_days || 1,
        stock_count: med.stock_count || 0,
        appearance_note: med.appearance_note || "",
      });

      setMedicineImage(null);
      setPrescriptionFile(null);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (index, value) => {
    const updatedTimes = [...form.times];
    updatedTimes[index] = value;
    setForm((prev) => ({ ...prev, times: updatedTimes }));
  };

  const addTimeField = () => {
    setForm((prev) => ({ ...prev, times: [...prev.times, ""] }));
  };

  const removeTimeField = (index) => {
    const updatedTimes = form.times.filter((_, i) => i !== index);
    setForm((prev) => ({
      ...prev,
      times: updatedTimes.length ? updatedTimes : [""],
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      type: "",
      dosage: "",
      quantity_per_dose: 1,
      frequency: "Once Daily",
      times: [""],
      startDate: "",
      endDate: "",
      food_instruction: "After Food",
      prescribed_by: "",
      expiry_date: "",
      no_of_days: 1,
      stock_count: 0,
      appearance_note: "",
    });
    setMedicineImage(null);
    setPrescriptionFile(null);
    setEditingId(null);
  };

  const buildFormData = () => {
    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("type", form.type);
    formData.append("dosage", form.dosage);
    formData.append("quantity_per_dose", form.quantity_per_dose);
    formData.append("frequency", form.frequency);
    formData.append("times", JSON.stringify(form.times.filter(Boolean)));
    formData.append("startDate", form.startDate);
    formData.append("endDate", form.endDate);
    formData.append("food_instruction", form.food_instruction);
    formData.append("prescribed_by", form.prescribed_by);
    formData.append("expiry_date", form.expiry_date);
    formData.append("no_of_days", form.no_of_days);
    formData.append("stock_count", form.stock_count);
    formData.append("appearance_note", form.appearance_note);

    if (medicineImage) {
      formData.append("medicine_image", medicineImage);
    }

    if (prescriptionFile) {
      formData.append("prescription_file", prescriptionFile);
    }

    return formData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = buildFormData();

      if (editingId) {
        await API.put(`/medicines/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Medicine updated successfully");
      } else {
        await API.post("/medicines/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Medicine added successfully");
      }

      resetForm();
      navigate("/medicines");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Operation failed");
    }
  };

  /* ================= DATE-BASED CATEGORIZATION LOGIC ================= */

  const getDateOnly = (dateValue) => {
    return new Date(dateValue).toISOString().split("T")[0];
  };

  const categorizedMedicines = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    const todaysSchedule = [];
    const activeMedicines = [];
    const upcomingMedicines = [];
    const previousMedicines = [];

    medicines.forEach((medicine) => {
      if (!medicine.startDate || !medicine.endDate) return;

      const startDate = getDateOnly(medicine.startDate);
      const endDate = getDateOnly(medicine.endDate);

      // Today + Active
      if (startDate <= today && endDate >= today) {
        activeMedicines.push(medicine);

        const times = Array.isArray(medicine.times)
          ? medicine.times
          : [];

        if (times.length > 0) {
          times.forEach((time) => {
            todaysSchedule.push({
              ...medicine,
              scheduledTime: time,
            });
          });
        } else {
          todaysSchedule.push(medicine);
        }
      }
      // Upcoming
      else if (startDate > today) {
        upcomingMedicines.push(medicine);
      }
      // Previous
      else if (endDate < today) {
        previousMedicines.push(medicine);
      }
    });

    return {
      todaysSchedule,
      activeMedicines,
      upcomingMedicines,
      previousMedicines,
    };
  }, [medicines]);

  const {
    todaysSchedule,
    activeMedicines,
    upcomingMedicines,
    previousMedicines,
  } = categorizedMedicines;

  const getImageUrl = (filePath) => {
    if (!filePath) return "";
    return `${baseURL}/${filePath.replace(/\\/g, "/")}`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>{editingId ? "Edit Medicine" : "Add Medicine"}</h2>
      </div>

      <form onSubmit={handleSubmit} className="prescription-form">
        <div className="form-group">
          <label>Medicine Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Type</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="">Select Type</option>
            <option value="Tablet">Tablet</option>
            <option value="Capsule">Capsule</option>
            <option value="Syrup">Syrup</option>
            <option value="Injection">Injection</option>
            <option value="Drops">Drops</option>
          </select>
        </div>

        <div className="form-group">
          <label>Dosage</label>
          <input
            type="text"
            name="dosage"
            value={form.dosage}
            onChange={handleChange}
            placeholder="Example: 500mg"
          />
        </div>

        <div className="form-group">
          <label>Quantity per Dose</label>
          <input
            type="number"
            name="quantity_per_dose"
            value={form.quantity_per_dose}
            onChange={handleChange}
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Frequency</label>
          <select
            name="frequency"
            value={form.frequency}
            onChange={handleChange}
          >
            <option value="Once Daily">Once Daily</option>
            <option value="Twice Daily">Twice Daily</option>
            <option value="Thrice Daily">Thrice Daily</option>
          </select>
        </div>

        <div className="form-group">
          <label>Reminder Times</label>
          {form.times.map((time, index) => (
            <div
              key={index}
              style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
            >
              <input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(index, e.target.value)}
              />
              <button type="button" onClick={() => removeTimeField(index)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addTimeField}>
            + Add Time
          </button>
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Food Instruction</label>
          <select
            name="food_instruction"
            value={form.food_instruction}
            onChange={handleChange}
          >
            <option value="Before Food">Before Food</option>
            <option value="After Food">After Food</option>
            <option value="Anytime">Anytime</option>
          </select>
        </div>

        <div className="form-group">
          <label>Prescribed By</label>
          <input
            type="text"
            name="prescribed_by"
            value={form.prescribed_by}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Expiry Date</label>
          <input
            type="date"
            name="expiry_date"
            value={form.expiry_date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>No. of Days</label>
          <input
            type="number"
            name="no_of_days"
            value={form.no_of_days}
            onChange={handleChange}
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Stock Count</label>
          <input
            type="number"
            name="stock_count"
            value={form.stock_count}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Appearance Note</label>
          <input
            type="text"
            name="appearance_note"
            value={form.appearance_note}
            onChange={handleChange}
            placeholder="Example: white round tablet"
          />
        </div>

        <div className="form-group">
          <label>Upload Medicine Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setMedicineImage(e.target.files[0] || null)}
          />
        </div>

        <div className="form-group">
          <label>Upload Prescription (optional)</label>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setPrescriptionFile(e.target.files[0] || null)}
          />
        </div>

        <button type="submit">
          {editingId ? "Update Medicine" : "Add Medicine"}
        </button>
      </form>

      <div className="details-box">
        <h3>Today's Schedule</h3>
        {todaysSchedule.length === 0 ? (
          <p>No medicines for today</p>
        ) : (
          <div className="prescription-grid">
            {todaysSchedule.map((med, index) => (
              <div className="drive-card" key={`${med._id}-${index}`}>
                <div className="drive-card-thumb">
                  {med.medicine_image ? (
                    <img
                      src={getImageUrl(med.medicine_image)}
                      alt={med.name}
                      className="prescription-thumb"
                    />
                  ) : (
                    <div className="file-icon">MED</div>
                  )}
                </div>
                <div className="drive-card-body">
                  <h4>{med.name}</h4>
                  <p><strong>Time:</strong> {med.scheduledTime || "-"}</p>
                  <p><strong>Dosage:</strong> {med.dosage || "-"}</p>
                  <p><strong>Food:</strong> {med.food_instruction || "-"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="details-box">
        <h3>Active Medicines</h3>
        {activeMedicines.length === 0 ? (
          <p>No active medicines</p>
        ) : (
          <div className="prescription-grid">
            {activeMedicines.map((med) => (
              <div className="drive-card" key={med._id}>
                <div className="drive-card-thumb">
                  {med.medicine_image ? (
                    <img
                      src={getImageUrl(med.medicine_image)}
                      alt={med.name}
                      className="prescription-thumb"
                    />
                  ) : (
                    <div className="file-icon">MED</div>
                  )}
                </div>
                <div className="drive-card-body">
                  <h4>{med.name}</h4>
                  <p><strong>Start:</strong> {getDateOnly(med.startDate)}</p>
                  <p><strong>End:</strong> {getDateOnly(med.endDate)}</p>
                  <p><strong>Times:</strong> {med.times?.join(", ") || "-"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="details-box">
        <h3>Upcoming Medicines</h3>
        {upcomingMedicines.length === 0 ? (
          <p>No upcoming medicines</p>
        ) : (
          <div className="prescription-grid">
            {upcomingMedicines.map((med) => (
              <div className="drive-card" key={med._id}>
                <div className="drive-card-thumb">
                  {med.medicine_image ? (
                    <img
                      src={getImageUrl(med.medicine_image)}
                      alt={med.name}
                      className="prescription-thumb"
                    />
                  ) : (
                    <div className="file-icon">MED</div>
                  )}
                </div>
                <div className="drive-card-body">
                  <h4>{med.name}</h4>
                  <p><strong>Starts On:</strong> {getDateOnly(med.startDate)}</p>
                  <p><strong>Ends On:</strong> {getDateOnly(med.endDate)}</p>
                  <p><strong>Times:</strong> {med.times?.join(", ") || "-"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="details-box">
        <h3>Previous Medicines (History)</h3>
        {previousMedicines.length === 0 ? (
          <p>No previous medicines</p>
        ) : (
          <div className="prescription-grid">
            {previousMedicines.map((med) => (
              <div className="drive-card" key={med._id}>
                <div className="drive-card-thumb">
                  {med.medicine_image ? (
                    <img
                      src={getImageUrl(med.medicine_image)}
                      alt={med.name}
                      className="prescription-thumb"
                    />
                  ) : (
                    <div className="file-icon">MED</div>
                  )}
                </div>
                <div className="drive-card-body">
                  <h4>{med.name}</h4>
                  <p><strong>Started:</strong> {getDateOnly(med.startDate)}</p>
                  <p><strong>Ended:</strong> {getDateOnly(med.endDate)}</p>
                  <p><strong>Times:</strong> {med.times?.join(", ") || "-"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}