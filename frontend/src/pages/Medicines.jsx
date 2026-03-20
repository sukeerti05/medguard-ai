import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function MedicinesPage() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [sortType, setSortType] = useState("newest");

  const [filters, setFilters] = useState({
    name: "",
    type: "",
    food_instruction: "",
  });

  const baseURL = useMemo(() => {
    const base = API.defaults.baseURL || "";
    return base.replace(/\/api\/?$/, "");
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await API.get("/medicines");
      setMedicines(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const getDateOnly = (dateValue) => {
    return new Date(dateValue).toISOString().split("T")[0];
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-GB");
  };

  const getImageUrl = (filePath) => {
    if (!filePath) return "";
    return `${baseURL}/${filePath.replace(/\\/g, "/")}`;
  };

  const filteredMedicines = useMemo(() => {
    return medicines.filter((item) => {
      const nameMatch = (item.name || "")
        .toLowerCase()
        .includes(filters.name.toLowerCase());

      const typeMatch = filters.type
        ? (item.type || "").toLowerCase().includes(filters.type.toLowerCase())
        : true;

      const foodMatch = filters.food_instruction
        ? (item.food_instruction || "")
            .toLowerCase()
            .includes(filters.food_instruction.toLowerCase())
        : true;

      return nameMatch && typeMatch && foodMatch;
    });
  }, [medicines, filters]);

  const sortedMedicines = useMemo(() => {
    return [...filteredMedicines].sort((a, b) => {
      if (sortType === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortType === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortType === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortType === "type") {
        return (a.type || "").localeCompare(b.type || "");
      }
      return 0;
    });
  }, [filteredMedicines, sortType]);

  const categorizedMedicines = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    const todaysSchedule = [];
    const activeMedicines = [];
    const upcomingMedicines = [];
    const previousMedicines = [];

    sortedMedicines.forEach((medicine) => {
      if (!medicine.startDate || !medicine.endDate) return;

      const startDate = getDateOnly(medicine.startDate);
      const endDate = getDateOnly(medicine.endDate);

      if (startDate <= today && endDate >= today) {
        activeMedicines.push(medicine);

        const times = Array.isArray(medicine.times) ? medicine.times : [];

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
      } else if (startDate > today) {
        upcomingMedicines.push(medicine);
      } else if (endDate < today) {
        previousMedicines.push(medicine);
      }
    });

    return {
      todaysSchedule,
      activeMedicines,
      upcomingMedicines,
      previousMedicines,
    };
  }, [sortedMedicines]);

  const {
    todaysSchedule,
    activeMedicines,
    upcomingMedicines,
    previousMedicines,
  } = categorizedMedicines;

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this medicine?");
    if (!ok) return;

    try {
      await API.delete(`/medicines/${id}`);
      alert("Deleted successfully");
      setSelectedMedicine(null);
      fetchMedicines();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleEdit = (med) => {
    navigate("/add-medicine", { state: { medicine: med } });
  };

  const handleOpen = (med) => {
    setSelectedMedicine(med);
  };

  const handleView = (med) => {
    if (med.medicine_image) {
      window.open(getImageUrl(med.medicine_image), "_blank");
    } else {
      alert("No medicine image available");
    }
  };

  const resetFilters = () => {
    setFilters({
      name: "",
      type: "",
      food_instruction: "",
    });
    setSortType("newest");
  };

  const renderMedicineCard = (med, keyOverride = null, showTime = false) => (
    <div
      className={`drive-card ${
        selectedMedicine?._id === med._id ? "selected-card" : ""
      }`}
      key={keyOverride || med._id}
      onClick={() => handleOpen(med)}
    >
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
        <p><strong>Type:</strong> {med.type || "-"}</p>
        <p><strong>Dosage:</strong> {med.dosage || "-"}</p>
        <p><strong>Food:</strong> {med.food_instruction || "-"}</p>
        <p><strong>Start:</strong> {formatDate(med.startDate)}</p>
        <p><strong>End:</strong> {formatDate(med.endDate)}</p>
        {showTime && <p><strong>Time:</strong> {med.scheduledTime || "-"}</p>}
      </div>
    </div>
  );

  const renderMedicineTable = (items, showScheduledTime = false) => (
    <div className="table-box">
      <table className="prescription-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Type</th>
            <th>Dosage</th>
            <th>{showScheduledTime ? "Time" : "Times"}</th>
            <th>Food</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>No. of Days</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr
              key={showScheduledTime ? `${item._id}-${index}` : item._id}
              onClick={() => handleOpen(item)}
              style={{ cursor: "pointer" }}
            >
              <td>
                {item.medicine_image ? (
                  <img
                    src={getImageUrl(item.medicine_image)}
                    alt={item.name}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  "No Image"
                )}
              </td>
              <td>{item.name}</td>
              <td>{item.type || "-"}</td>
              <td>{item.dosage || "-"}</td>
              <td>{showScheduledTime ? item.scheduledTime || "-" : item.times?.join(", ") || "-"}</td>
              <td>{item.food_instruction || "-"}</td>
              <td>{formatDate(item.startDate)}</td>
              <td>{formatDate(item.endDate)}</td>
              <td>{item.no_of_days || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSection = (title, items, showTime = false) => (
    <div className="details-box">
      <h3>{title}</h3>

      {items.length === 0 ? (
        <p>No medicines found</p>
      ) : viewMode === "grid" ? (
        <div className="prescription-grid">
          {items.map((med, index) =>
            renderMedicineCard(
              med,
              showTime ? `${med._id}-${index}` : med._id,
              showTime
            )
          )}
        </div>
      ) : (
        renderMedicineTable(items, showTime)
      )}
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header prescription-header">
        <div>
          <h2>My Medicines</h2>
          <p>View today's schedule, active, upcoming, and previous medicines.</p>
        </div>

        <div className="header-actions">
          <button onClick={() => navigate("/add-medicine")}>
            Add New Medicine
          </button>
        </div>
      </div>

      <div className="filter-box">
        <div className="filter-top-row">
          <h3>Filters</h3>

          <div className="view-switch">
            <button
              type="button"
              className={viewMode === "grid" ? "active-view" : ""}
              onClick={() => setViewMode("grid")}
            >
              Grid View
            </button>

            <button
              type="button"
              className={viewMode === "table" ? "active-view" : ""}
              onClick={() => setViewMode("table")}
            >
              Table View
            </button>
          </div>
        </div>

        <div className="filter-grid">
          <input
            type="text"
            placeholder="Filter by medicine name"
            value={filters.name}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, name: e.target.value }))
            }
          />

          <input
            type="text"
            placeholder="Filter by type"
            value={filters.type}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, type: e.target.value }))
            }
          />

          <input
            type="text"
            placeholder="Filter by food instruction"
            value={filters.food_instruction}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                food_instruction: e.target.value,
              }))
            }
          />

          <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Medicine Name</option>
            <option value="type">Type</option>
          </select>

          <button type="button" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="table-box">
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {renderSection("Today's Schedule", todaysSchedule, true)}
          {renderSection("Active Medicines", activeMedicines)}
          {renderSection("Upcoming Medicines", upcomingMedicines)}
          {renderSection("Previous Medicines (History)", previousMedicines)}
        </>
      )}

      {selectedMedicine && (
        <div className="details-box">
          <div className="details-header">
            <h3>Selected Medicine</h3>
            <button type="button" onClick={() => setSelectedMedicine(null)}>
              Close
            </button>
          </div>

          {selectedMedicine.medicine_image ? (
            <img
              src={getImageUrl(selectedMedicine.medicine_image)}
              alt={selectedMedicine.name}
              style={{
                width: "160px",
                height: "160px",
                objectFit: "cover",
                borderRadius: "12px",
                marginBottom: "16px",
              }}
            />
          ) : null}

          <p><strong>Name:</strong> {selectedMedicine.name}</p>
          <p><strong>Type:</strong> {selectedMedicine.type || "-"}</p>
          <p><strong>Dosage:</strong> {selectedMedicine.dosage || "-"}</p>
          <p><strong>Times:</strong> {selectedMedicine.times?.join(", ") || "-"}</p>
          <p><strong>Food:</strong> {selectedMedicine.food_instruction || "-"}</p>
          <p><strong>Start Date:</strong> {formatDate(selectedMedicine.startDate)}</p>
          <p><strong>End Date:</strong> {formatDate(selectedMedicine.endDate)}</p>
          <p><strong>No. of Days:</strong> {selectedMedicine.no_of_days || "-"}</p>
          <p><strong>Prescribed By:</strong> {selectedMedicine.prescribed_by || "-"}</p>
          <p><strong>Appearance:</strong> {selectedMedicine.appearance_note || "-"}</p>

          <div className="action-buttons">
            <button
              type="button"
              className="view-btn"
              onClick={() => handleView(selectedMedicine)}
            >
              View
            </button>

            <button
              type="button"
              onClick={() => handleOpen(selectedMedicine)}
            >
              Open
            </button>

            <button
              type="button"
              className="edit-btn"
              onClick={() => handleEdit(selectedMedicine)}
            >
              Edit
            </button>

            <button
              type="button"
              className="delete-btn"
              onClick={() => handleDelete(selectedMedicine._id)}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}