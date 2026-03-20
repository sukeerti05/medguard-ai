import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";

export default function DoctorVisitsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [doctorVisits, setDoctorVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [sortType, setSortType] = useState("newest");
  const [selectedVisit, setSelectedVisit] = useState(null);

  const [filters, setFilters] = useState({
    doctor_name: "",
    hospital_name: "",
    specialization: "",
  });

  const fetchDoctorVisits = async () => {
    try {
      setLoading(true);
      const res = await API.get("/doctor-visits");
      setDoctorVisits(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load doctor visits");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  if (location.state?.selectedVisitId && doctorVisits.length > 0) {
    const foundVisit = doctorVisits.find(
      (visit) => visit._id === location.state.selectedVisitId
    );

    if (foundVisit) {
      setSelectedVisit(foundVisit);
    }
  }
}, [location.state, doctorVisits]);
  useEffect(() => {
    fetchDoctorVisits();
  }, []);

  const upcomingVisits = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return doctorVisits.filter((visit) => {
      const d = new Date(visit.date);
      d.setHours(0, 0, 0, 0);
      return d >= today;
    });
  }, [doctorVisits]);

  const filteredVisits = useMemo(() => {
    return doctorVisits.filter((item) => {
      const doctorMatch = (item.doctor_name || "")
        .toLowerCase()
        .includes(filters.doctor_name.toLowerCase());

      const hospitalMatch = (item.hospital_name || "")
        .toLowerCase()
        .includes(filters.hospital_name.toLowerCase());

      const specializationMatch = (item.specialization || "")
        .toLowerCase()
        .includes(filters.specialization.toLowerCase());

      return doctorMatch && hospitalMatch && specializationMatch;
    });
  }, [doctorVisits, filters]);

  const sortedVisits = useMemo(() => {
    return [...filteredVisits].sort((a, b) => {
      if (sortType === "newest") {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortType === "oldest") {
        return new Date(a.date) - new Date(b.date);
      }
      if (sortType === "doctor") {
        return (a.doctor_name || "").localeCompare(b.doctor_name || "");
      }
      if (sortType === "hospital") {
        return (a.hospital_name || "").localeCompare(b.hospital_name || "");
      }
      return 0;
    });
  }, [filteredVisits, sortType]);

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-GB");
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this doctor visit?");
    if (!ok) return;

    try {
      await API.delete(`/doctor-visits/${id}`);
      alert("Deleted successfully");
      setSelectedVisit(null);
      fetchDoctorVisits();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleEdit = (visit) => {
    navigate("/add-doctor-visit", { state: { doctorVisit: visit } });
  };

  const resetFilters = () => {
    setFilters({
      doctor_name: "",
      hospital_name: "",
      specialization: "",
    });
    setSortType("newest");
  };

  return (
    <div className="page-container">
      <div className="page-header prescription-header">
        <div>
          <h2>My Doctor Visits</h2>
          <p>View upcoming visits, search, filter, and manage doctor consultations.</p>
        </div>

        <div className="header-actions">
          <button onClick={() => navigate("/add-doctor-visit")}>
            Add New Doctor Visit
          </button>
        </div>
      </div>

      <div className="details-box">
        <h3>Upcoming Doctor Visits</h3>

        {upcomingVisits.length === 0 ? (
          <p>No upcoming doctor visits</p>
        ) : (
          <div className="prescription-grid">
            {upcomingVisits.slice(0, 6).map((item) => (
              <div
                key={item._id}
                className="drive-card"
                onClick={() => setSelectedVisit(item)}
              >
                <div className="drive-card-thumb">
                  <div className="file-icon">DR</div>
                </div>

                <div className="drive-card-body">
                  <h4>{item.doctor_name || "Doctor"}</h4>
                  <p><strong>Hospital:</strong> {item.hospital_name || "-"}</p>
                  <p><strong>Specialization:</strong> {item.specialization || "-"}</p>
                  <p><strong>Date:</strong> {formatDate(item.date)}</p>
                  <p><strong>Reason:</strong> {item.reason || "-"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
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
            placeholder="Filter by doctor name"
            value={filters.doctor_name}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, doctor_name: e.target.value }))
            }
          />

          <input
            type="text"
            placeholder="Filter by hospital name"
            value={filters.hospital_name}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, hospital_name: e.target.value }))
            }
          />

          <input
            type="text"
            placeholder="Filter by specialization"
            value={filters.specialization}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, specialization: e.target.value }))
            }
          />

          <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="doctor">Doctor</option>
            <option value="hospital">Hospital</option>
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
      ) : sortedVisits.length === 0 ? (
        <div className="table-box">
          <p>No doctor visits found</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="prescription-grid">
          {sortedVisits.map((item) => (
            <div
              key={item._id}
              className={`drive-card ${
                selectedVisit?._id === item._id ? "selected-card" : ""
              }`}
              onClick={() => setSelectedVisit(item)}
            >
              <div className="drive-card-thumb">
                <div className="file-icon">DR</div>
              </div>

              <div className="drive-card-body">
                <h4>{item.doctor_name || "Doctor"}</h4>
                <p><strong>Hospital:</strong> {item.hospital_name || "-"}</p>
                <p><strong>Specialization:</strong> {item.specialization || "-"}</p>
                <p><strong>Date:</strong> {formatDate(item.date)}</p>
                <p><strong>Reason:</strong> {item.reason || "-"}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-box">
          <table className="prescription-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Hospital</th>
                <th>Specialization</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Follow-up</th>
                <th>Notes</th>
              </tr>
            </thead>

            <tbody>
              {sortedVisits.map((item) => (
                <tr
                  key={item._id}
                  onClick={() => setSelectedVisit(item)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{item.doctor_name || "-"}</td>
                  <td>{item.hospital_name || "-"}</td>
                  <td>{item.specialization || "-"}</td>
                  <td>{formatDate(item.date)}</td>
                  <td>{item.reason || "-"}</td>
                  <td>{formatDate(item.follow_up_date)}</td>
                  <td>{item.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedVisit && (
        <div className="details-box">
          <div className="details-header">
            <h3>Selected Doctor Visit</h3>
            <button type="button" onClick={() => setSelectedVisit(null)}>
              Close
            </button>
          </div>

          <p><strong>Doctor:</strong> {selectedVisit.doctor_name || "-"}</p>
          <p><strong>Hospital:</strong> {selectedVisit.hospital_name || "-"}</p>
          <p><strong>Specialization:</strong> {selectedVisit.specialization || "-"}</p>
          <p><strong>Date:</strong> {formatDate(selectedVisit.date)}</p>
          <p><strong>Reason:</strong> {selectedVisit.reason || "-"}</p>
          <p><strong>Diagnosis:</strong> {selectedVisit.diagnosis || "-"}</p>
          <p><strong>Doctor Advice:</strong> {selectedVisit.prescription || selectedVisit.doctor_advice ||  "-"}</p>
          <p><strong>Follow-up Date:</strong> {formatDate(selectedVisit.follow_up_date)}</p>
          <p><strong>Notes:</strong> {selectedVisit.notes || "-"}</p>

          <div className="action-buttons">
            <button
  className="view-btn"
  onClick={() =>
    navigate("/view-doctor-visit", {
      state: { visit: selectedVisit }
    })
  }
>
  View
</button>

            <button
              type="button"
              className="edit-btn"
              onClick={() => handleEdit(selectedVisit)}
            >
              Edit
            </button>

            <button
              type="button"
              className="delete-btn"
              onClick={() => handleDelete(selectedVisit._id)}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}