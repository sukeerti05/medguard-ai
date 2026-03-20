import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";

export default function HospitalVisitsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [hospitalVisits, setHospitalVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [sortType, setSortType] = useState("newest");

  const [filters, setFilters] = useState({
    hospital_name: "",
    reason: "",
    location: "",
  });

  const fetchVisits = async () => {
    try {
      const res = await API.get("/hospital-visits");
      setHospitalVisits(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load hospital visits");
    }
  };

  useEffect(() => {
    if (location.state?.selectedVisitId && hospitalVisits.length > 0) {
      const foundVisit = hospitalVisits.find(
        (visit) => visit._id === location.state.selectedVisitId
      );

      if (foundVisit) {
        setSelectedVisit(foundVisit);
      }
    }
  }, [location.state, hospitalVisits]);

  useEffect(() => {
    fetchVisits();
  }, []);

  const upcomingVisits = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return hospitalVisits.filter((visit) => {
      const d = new Date(visit.admission_date);
      d.setHours(0, 0, 0, 0);
      return d >= today;
    });
  }, [hospitalVisits]);

  const filteredVisits = useMemo(() => {
    return hospitalVisits.filter((item) => {
      const hospitalMatch = (item.hospital_name || "")
        .toLowerCase()
        .includes(filters.hospital_name.toLowerCase());

      const reasonMatch = (item.reason || "")
        .toLowerCase()
        .includes(filters.reason.toLowerCase());

      const locationMatch = (item.location || "")
        .toLowerCase()
        .includes(filters.location.toLowerCase());

      return hospitalMatch && reasonMatch && locationMatch;
    });
  }, [hospitalVisits, filters]);

  const sortedVisits = useMemo(() => {
    return [...filteredVisits].sort((a, b) => {
      if (sortType === "newest") {
        return new Date(b.admission_date) - new Date(a.admission_date);
      }
      if (sortType === "oldest") {
        return new Date(a.admission_date) - new Date(b.admission_date);
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
    const ok = window.confirm("Delete this hospital visit?");
    if (!ok) return;

    try {
      await API.delete(`/hospital-visits/${id}`);
      alert("Deleted successfully");
      setSelectedVisit(null);
      fetchVisits();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleEdit = (visit) => {
    navigate("/add-hospital-visit", { state: { hospitalVisit: visit } });
  };

  const resetFilters = () => {
    setFilters({
      hospital_name: "",
      reason: "",
      location: "",
    });
    setSortType("newest");
  };

  return (
    <div className="page-container">
      <div className="page-header prescription-header">
        <div>
          <h2>Hospital Visits</h2>
          <p>View admissions, search, filter and manage hospital history.</p>
        </div>

        <button onClick={() => navigate("/add-hospital-visit")}>
          Add New Hospital Visit
        </button>
      </div>

      <div className="details-box">
        <h3>Upcoming Admissions</h3>

        {upcomingVisits.length === 0 ? (
          <p>No upcoming hospital visits</p>
        ) : (
          <div className="prescription-grid">
            {upcomingVisits.slice(0, 6).map((item) => (
              <div
                key={item._id}
                className="drive-card"
                onClick={() => setSelectedVisit(item)}
              >
                <div className="drive-card-thumb">
                  <div className="file-icon">HS</div>
                </div>

                <div className="drive-card-body">
                  <h4>{item.hospital_name}</h4>
                  <p><strong>Reason:</strong> {item.reason}</p>
                  <p><strong>Date:</strong> {formatDate(item.admission_date)}</p>
                  <p><strong>Location:</strong> {item.location}</p>
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
            placeholder="Filter by hospital"
            value={filters.hospital_name}
            onChange={(e) =>
              setFilters((p) => ({ ...p, hospital_name: e.target.value }))
            }
          />

          <input
            type="text"
            placeholder="Filter by reason"
            value={filters.reason}
            onChange={(e) =>
              setFilters((p) => ({ ...p, reason: e.target.value }))
            }
          />

          <input
            type="text"
            placeholder="Filter by location"
            value={filters.location}
            onChange={(e) =>
              setFilters((p) => ({ ...p, location: e.target.value }))
            }
          />

          <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="hospital">Hospital</option>
          </select>

          <button onClick={resetFilters}>Reset Filters</button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="prescription-grid">
          {sortedVisits.map((item) => (
            <div
              key={item._id}
              className="drive-card"
              onClick={() => setSelectedVisit(item)}
            >
              <div className="drive-card-thumb">
                <div className="file-icon">HS</div>
              </div>

              <div className="drive-card-body">
                <h4>{item.hospital_name || "-"}</h4>
                <p><strong>Reason:</strong> {item.reason || "-"}</p>
                <p><strong>Location:</strong> {item.location || "-"}</p>
                <p><strong>Admission:</strong> {formatDate(item.admission_date)}</p>
                <p><strong>Doctor:</strong> {item.attending_doctor || item.doctor_name || "-"}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-box">
          <table className="prescription-table">
            <thead>
              <tr>
                <th>Hospital</th>
                <th>Reason</th>
                <th>Location</th>
                <th>Admission</th>
                <th>Discharge</th>
                <th>Doctor</th>
              </tr>
            </thead>

            <tbody>
              {sortedVisits.map((item) => (
                <tr
                  key={item._id}
                  onClick={() => setSelectedVisit(item)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{item.hospital_name || "-"}</td>
                  <td>{item.reason || "-"}</td>
                  <td>{item.location || "-"}</td>
                  <td>{formatDate(item.admission_date)}</td>
                  <td>{formatDate(item.discharge_date)}</td>
                  <td>{item.attending_doctor || item.doctor_name || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedVisit && (
        <div className="details-box hospital-details-box">
          <button
            className="close-top-btn"
            onClick={() => setSelectedVisit(null)}
          >
            Close
          </button>

          <h3>Selected Hospital Visit</h3>

          <p><strong>Hospital:</strong> {selectedVisit.hospital_name || "-"}</p>
          <p><strong>Reason:</strong> {selectedVisit.reason || "-"}</p>
          <p><strong>Doctor:</strong> {selectedVisit.attending_doctor || selectedVisit.doctor_name || "-"}</p>
          <p><strong>Location:</strong> {selectedVisit.location || "-"}</p>
          <p><strong>Admission Date:</strong> {formatDate(selectedVisit.admission_date)}</p>
          <p><strong>Discharge Date:</strong> {formatDate(selectedVisit.discharge_date)}</p>
          <p><strong>Notes:</strong> {selectedVisit.notes || "-"}</p>

          <div className="action-buttons">
            <button
              className="view-btn"
              onClick={() =>
                navigate("/view-hospital-visit", {
                  state: { visit: selectedVisit },
                })
              }
            >
              View
            </button>

            <button
              className="edit-btn"
              onClick={() => handleEdit(selectedVisit)}
            >
              Edit
            </button>

            <button
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