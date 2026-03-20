import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import UploadPrescription from "../components/UploadPrescription";
import "../index.css";

export default function PrescriptionsPage() {
  const navigate = useNavigate();

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditBox, setShowEditBox] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortType, setSortType] = useState("newest");

  const [filters, setFilters] = useState({
    doctor_name: "",
    hospital_name: "",
    location: "",
    from_date: "",
    to_date: "",
  });

  const getBaseUrl = () => {
    const base = api.defaults.baseURL || "";
    if (base.startsWith("http")) {
      return base.replace(/\/api\/?$/, "");
    }
    return window.location.origin;
  };

  const BASE_URL = getBaseUrl();

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/prescriptions");
      setPrescriptions(res.data || []);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((item) => {
      const doctorMatch = (item.doctor_name || "")
        .toLowerCase()
        .includes(filters.doctor_name.toLowerCase());

      const hospitalMatch = (item.hospital_name || "")
        .toLowerCase()
        .includes(filters.hospital_name.toLowerCase());

      const locationMatch = (item.location || "")
        .toLowerCase()
        .includes(filters.location.toLowerCase());

      const visitDate = item.visit_date ? new Date(item.visit_date) : null;

      const fromMatch = filters.from_date
        ? visitDate && visitDate >= new Date(filters.from_date)
        : true;

      const toMatch = filters.to_date
        ? visitDate &&
          visitDate <= new Date(
            new Date(filters.to_date).setHours(23, 59, 59, 999)
          )
        : true;

      return doctorMatch && hospitalMatch && locationMatch && fromMatch && toMatch;
    });
  }, [prescriptions, filters]);

  const sortedPrescriptions = useMemo(() => {
    return [...filteredPrescriptions].sort((a, b) => {
      if (sortType === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }

      if (sortType === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortType === "hospital") {
        return (a.hospital_name || "").localeCompare(b.hospital_name || "");
      }

      if (sortType === "doctor") {
        return (a.doctor_name || "").localeCompare(b.doctor_name || "");
      }

      return 0;
    });
  }, [filteredPrescriptions, sortType]);

  const getFileUrl = (filePath) => {
    if (!filePath) return "";
    return `${BASE_URL}/${filePath.replace(/\\/g, "/")}`;
  };

  const isImageFile = (fileName = "") => {
    const lower = fileName.toLowerCase();
    return (
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png") ||
      lower.endsWith(".webp")
    );
  };

  const isPdfFile = (fileName = "") => {
    return fileName.toLowerCase().endsWith(".pdf");
  };

  const formatDate = (value) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleDateString("en-GB");
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Do you want to delete this prescription?");
    if (!ok) return;

    try {
      await api.delete(`/prescriptions/${id}`);
      alert("Prescription deleted successfully");
      setSelectedPrescription(null);
      setShowPreview(false);
      setShowEditBox(false);
      fetchPrescriptions();
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleUpdate = async (formData) => {
    if (!selectedPrescription?._id) return;

    try {
      setEditLoading(true);
      await api.put(`/prescriptions/${selectedPrescription._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Prescription updated successfully");
      setShowEditBox(false);
      fetchPrescriptions();

      const refreshed = await api.get(`/prescriptions/${selectedPrescription._id}`);
      setSelectedPrescription(refreshed.data);
    } catch (err) {
      alert(err?.response?.data?.message || "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      doctor_name: "",
      hospital_name: "",
      location: "",
      from_date: "",
      to_date: "",
    });
    setSortType("newest");
  };

  const handleDownload = async (filePath, fileName) => {
    try {
      const fileUrl = getFileUrl(filePath);
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "prescription";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed");
    }
  };

  const renderThumbnail = (item) => {
    const file = item.file_name?.toLowerCase() || "";

    if (
      file.endsWith(".jpg") ||
      file.endsWith(".jpeg") ||
      file.endsWith(".png") ||
      file.endsWith(".webp")
    ) {
      return (
        <img
          src={getFileUrl(item.prescription_file)}
          alt="prescription"
          className="prescription-thumb"
        />
      );
    }

    if (file.endsWith(".pdf")) {
      return <div className="pdf-icon">📄 PDF</div>;
    }

    return <div className="file-icon">FILE</div>;
  };

  return (
    <div className="page-container">
      <div className="page-header prescription-header">
        <div>
          <h2>My Prescriptions</h2>
          <p>View, search, sort, edit, download, and manage all prescriptions.</p>
        </div>

        <div className="header-actions">
          <button onClick={() => navigate("/upload-prescription")}>
            Upload New Prescription
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
            placeholder="Filter by location"
            value={filters.location}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, location: e.target.value }))
            }
          />

          <input
            type="date"
            value={filters.from_date}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, from_date: e.target.value }))
            }
          />

          <input
            type="date"
            value={filters.to_date}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, to_date: e.target.value }))
            }
          />

          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="hospital">Hospital</option>
            <option value="doctor">Doctor</option>
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
      ) : sortedPrescriptions.length === 0 ? (
        <div className="table-box">
          <p>No prescriptions found</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="prescription-grid">
          {sortedPrescriptions.map((item) => (
            <div
              key={item._id}
              className={`drive-card ${
                selectedPrescription?._id === item._id ? "selected-card" : ""
              }`}
              onClick={() => {
                setSelectedPrescription(item);
                setShowPreview(false);
                setShowEditBox(false);
              }}
            >
              <div className="drive-card-thumb">{renderThumbnail(item)}</div>

              <div className="drive-card-body">
                <h4 title={item.file_name}>{item.file_name}</h4>
                <p><strong>Doctor:</strong> {item.doctor_name || "N/A"}</p>
                <p><strong>Hospital:</strong> {item.hospital_name || "N/A"}</p>
                <p><strong>Location:</strong> {item.location || "N/A"}</p>
                <p><strong>Visit Date:</strong> {formatDate(item.visit_date)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-box">
          <table className="prescription-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Doctor</th>
                <th>Hospital</th>
                <th>Location</th>
                <th>Visit Date</th>
                <th>Uploaded On</th>
              </tr>
            </thead>

            <tbody>
              {sortedPrescriptions.map((item) => (
                <tr
                  key={item._id}
                  onClick={() => {
                    setSelectedPrescription(item);
                    setShowPreview(false);
                    setShowEditBox(false);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <td>{item.file_name || "N/A"}</td>
                  <td>{item.doctor_name || "N/A"}</td>
                  <td>{item.hospital_name || "N/A"}</td>
                  <td>{item.location || "N/A"}</td>
                  <td>{formatDate(item.visit_date)}</td>
                  <td>{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedPrescription && (
        <div className="details-box">
          <div className="details-header">
            <h3>Selected Prescription</h3>
            <button
              type="button"
              onClick={() => {
                setSelectedPrescription(null);
                setShowPreview(false);
                setShowEditBox(false);
              }}
            >
              Close
            </button>
          </div>

          <p><strong>File Name:</strong> {selectedPrescription.file_name}</p>
          <p><strong>Doctor:</strong> {selectedPrescription.doctor_name || "N/A"}</p>
          <p><strong>Hospital:</strong> {selectedPrescription.hospital_name || "N/A"}</p>
          <p><strong>Location:</strong> {selectedPrescription.location || "N/A"}</p>
          <p><strong>Visit Date:</strong> {formatDate(selectedPrescription.visit_date)}</p>
          <p><strong>Uploaded On:</strong> {formatDate(selectedPrescription.createdAt)}</p>
          <p><strong>Notes:</strong> {selectedPrescription.notes || "N/A"}</p>

          <div className="action-buttons">
            <button type="button" onClick={() => setShowPreview((prev) => !prev)}>
              Open
            </button>

            <button
              type="button"
              className="view-btn"
              onClick={() =>
                window.open(getFileUrl(selectedPrescription.prescription_file), "_blank")
              }
            >
              View
            </button>

            <button
              type="button"
              className="edit-btn"
              onClick={() => setShowEditBox((prev) => !prev)}
            >
              Edit
            </button>

            <button
              type="button"
              className="delete-btn"
              onClick={() => handleDelete(selectedPrescription._id)}
            >
              Delete
            </button>

            <button
              type="button"
              className="download-btn"
              onClick={() =>
                handleDownload(
                  selectedPrescription.prescription_file,
                  selectedPrescription.file_name
                )
              }
            >
              Download
            </button>
          </div>

          {showPreview && (
            <div className="preview-box">
              {isImageFile(selectedPrescription.file_name) ? (
                <img
                  src={getFileUrl(selectedPrescription.prescription_file)}
                  alt={selectedPrescription.file_name}
                  style={{ maxWidth: "100%", borderRadius: "8px" }}
                />
              ) : (
                <iframe
                  src={getFileUrl(selectedPrescription.prescription_file)}
                  title="Prescription Preview"
                  width="100%"
                  height="500px"
                  style={{ border: "1px solid #ddd", borderRadius: "8px" }}
                />
              )}
            </div>
          )}

          {showEditBox && (
            <div className="edit-box">
              <h3>Edit Prescription</h3>
              <UploadPrescription
                initialData={selectedPrescription}
                onSubmit={handleUpdate}
                submitLabel="Update Prescription"
                loading={editLoading}
                isEdit={true}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}