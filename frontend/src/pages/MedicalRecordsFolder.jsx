import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";

export default function MedicalRecordsFolder() {
  const { category } = useParams();
  const navigate = useNavigate();
  const decodedCategory = decodeURIComponent(category);

  const [records, setRecords] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [sortType, setSortType] = useState("newest");

  const [filters, setFilters] = useState({
    test_name: "",
    lab_name: "",
    test_date: "",
  });

  const fetchRecords = async () => {
    try {
      const res = await API.get(`/medical-records/category/${decodedCategory}`);
      setRecords(res.data || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load records");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [decodedCategory]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this medical record?");
    if (!ok) return;

    try {
      await API.delete(`/medical-records/${id}`);
      alert("Record deleted successfully");
      fetchRecords();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  const resetFilters = () => {
    setFilters({
      test_name: "",
      lab_name: "",
      test_date: "",
    });
    setSortType("newest");
  };

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const testNameMatch = (item.test_name || "")
        .toLowerCase()
        .includes(filters.test_name.toLowerCase());

      const labNameValue =
        item.lab_centre || item.hospital_name || "";

      const labNameMatch = labNameValue
        .toLowerCase()
        .includes(filters.lab_name.toLowerCase());

      const recordDate = item.test_date
        ? new Date(item.test_date).toISOString().slice(0, 10)
        : "";

      const dateMatch =
        !filters.test_date || recordDate === filters.test_date;

      return testNameMatch && labNameMatch && dateMatch;
    });
  }, [records, filters]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      if (sortType === "newest") {
        return new Date(b.test_date) - new Date(a.test_date);
      }
      if (sortType === "oldest") {
        return new Date(a.test_date) - new Date(b.test_date);
      }
      if (sortType === "test") {
        return (a.test_name || "").localeCompare(b.test_name || "");
      }
      if (sortType === "lab") {
        const aLab = a.lab_centre || a.hospital_name || "";
        const bLab = b.lab_centre || b.hospital_name || "";
        return aLab.localeCompare(bLab);
      }
      return 0;
    });
  }, [filteredRecords, sortType]);

  return (
    <div className="page-container">
      <div className="page-header prescription-header">
        <div>
          <h2>{decodedCategory}</h2>
          <p>View, search, filter and manage all uploaded records in this category.</p>
        </div>

        <button onClick={() => navigate("/add-medical-record")}>
          Add Record
        </button>
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
            placeholder="Filter by test name"
            value={filters.test_name}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, test_name: e.target.value }))
            }
          />

          <input
            type="text"
            placeholder="Filter by lab / hospital name"
            value={filters.lab_name}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, lab_name: e.target.value }))
            }
          />

          <input
            type="date"
            value={filters.test_date}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, test_date: e.target.value }))
            }
          />

          <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="test">Test Name</option>
            <option value="lab">Lab Name</option>
          </select>

          <button type="button" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      {sortedRecords.length === 0 ? (
        <div className="table-box">
          <p>No records found</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="prescription-grid">
          {sortedRecords.map((item) => (
            <div
              key={item._id}
              className="drive-card"
              onClick={() => navigate(`/view-medical-record/${item._id}`)}
            >
              <div className="drive-card-thumb">
                <div className="file-icon">
                  {item.file_type?.startsWith("image/")
                    ? "🖼"
                    : item.file_type === "application/pdf"
                    ? "📄"
                    : "📁"}
                </div>
              </div>

              <div className="drive-card-body">
                <h4>{item.test_name || "Medical Record"}</h4>
                <p><strong>Lab:</strong> {item.lab_centre || item.hospital_name || "-"}</p>
                <p><strong>Date:</strong> {formatDate(item.test_date)}</p>
                <p><strong>Lab ID:</strong> {item.lab_id || "-"}</p>

                <div
                  className="action-buttons"
                  onClick={(e) => e.stopPropagation()}
                  style={{ marginTop: "12px" }}
                >
                  <button
                    type="button"
                    className="view-btn"
                    onClick={() => navigate(`/view-medical-record/${item._id}`)}
                  >
                    View
                  </button>

                  <a
                    href={`http://localhost:5000${item.file_path}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button type="button" className="edit-btn">
                      Open
                    </button>
                  </a>

                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-box">
          <table className="prescription-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Lab / Hospital</th>
                <th>Location</th>
                <th>Lab ID</th>
                <th>Date</th>
                <th>Reference</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sortedRecords.map((item) => (
                <tr key={item._id}>
                  <td>{item.test_name || "-"}</td>
                  <td>{item.lab_centre || item.hospital_name || "-"}</td>
                  <td>{item.lab_location || "-"}</td>
                  <td>{item.lab_id || "-"}</td>
                  <td>{formatDate(item.test_date)}</td>
                  <td>
                    {item.doctor_reference === "Self"
                      ? "Self"
                      : `${item.doctor_reference || "-"} - ${item.reference_name || "-"}`}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="view-btn"
                        onClick={() => navigate(`/view-medical-record/${item._id}`)}
                      >
                        View
                      </button>

                      <a
                        href={`http://localhost:5000${item.file_path}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <button type="button" className="edit-btn">
                          Open
                        </button>
                      </a>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}