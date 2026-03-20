import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function AddVitalPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    date: "",
    blood_pressure: "",
    sugar_level: "",
    weight: "",
    heart_rate: "",
    temperature: "",
    oxygen_level: "",
    notes: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/vitals", form);
      alert("Vital added successfully");
      navigate("/vitals");
    } catch (err) {
      console.log(err);
      alert("Failed to save vital");
    }
  };

  return (
    <div className="add-record-page">
      <div className="add-record-container">
        <h2>Add Health Vital</h2>

        <form onSubmit={handleSubmit} className="add-record-form">
          <table>
            <tbody>
              <tr>
                <td><label>Date</label></td>
                <td>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </td>
              </tr>

              <tr>
                <td><label>Blood Pressure</label></td>
                <td>
                  <input
                    type="text"
                    name="blood_pressure"
                    value={form.blood_pressure}
                    onChange={handleChange}
                    placeholder="120/80"
                  />
                </td>
              </tr>

              <tr>
                <td><label>Sugar Level</label></td>
                <td>
                  <input
                    type="text"
                    name="sugar_level"
                    value={form.sugar_level}
                    onChange={handleChange}
                    placeholder="98"
                  />
                </td>
              </tr>

              <tr>
                <td><label>Weight</label></td>
                <td>
                  <input
                    type="text"
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    placeholder="54 kg"
                  />
                </td>
              </tr>

              <tr>
                <td><label>Heart Rate</label></td>
                <td>
                  <input
                    type="text"
                    name="heart_rate"
                    value={form.heart_rate}
                    onChange={handleChange}
                    placeholder="76 bpm"
                  />
                </td>
              </tr>

              <tr>
                <td><label>Temperature</label></td>
                <td>
                  <input
                    type="text"
                    name="temperature"
                    value={form.temperature}
                    onChange={handleChange}
                    placeholder="98.4 F"
                  />
                </td>
              </tr>

              <tr>
                <td><label>Oxygen Level</label></td>
                <td>
                  <input
                    type="text"
                    name="oxygen_level"
                    value={form.oxygen_level}
                    onChange={handleChange}
                    placeholder="99%"
                  />
                </td>
              </tr>

              <tr>
                <td><label>Notes</label></td>
                <td>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter notes"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="button-group">
            <button type="button" onClick={() => navigate("/vitals")}>
              Cancel
            </button>
            <button type="submit">Save Vital</button>
          </div>
        </form>
      </div>
    </div>
  );
}