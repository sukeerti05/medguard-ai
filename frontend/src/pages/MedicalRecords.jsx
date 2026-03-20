import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function MedicalRecords() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);

  const folders = [
    { name: "Lab Reports", icon: "🧪" },
    { name: "X-Ray", icon: "🦴" },
    { name: "MRI", icon: "🧠" },
    { name: "CT Scan", icon: "📡" },
    { name: "Blood Tests", icon: "🩸" },
    { name: "Vaccination Records", icon: "💉" },
  ];

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await API.get("/medical-records");
        setRecords(res.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRecords();
  }, []);

  const getCount = (category) => {
    return records.filter((item) => item.category === category).length;
  };

  return (
    <div className="records-page">
      <div className="records-header">
        <div>
          <h2>Medical Records</h2>
          <p>Organize and manage all your uploaded reports by category.</p>
        </div>

        <button onClick={() => navigate("/add-medical-record")}>
          Add Medical Record
        </button>
      </div>

      <div className="records-folder-grid">
        {folders.map((folder) => (
          <div
            key={folder.name}
            className="record-folder-card"
            onClick={() =>
              navigate(`/medical-records-folder/${encodeURIComponent(folder.name)}`)
            }
          >
            <div className="record-folder-top">
              <div className="record-folder-icon">{folder.icon}</div>
            </div>

            <div className="record-folder-bottom">
              <h4>{folder.name}</h4>
              <p>{getCount(folder.name)} record{getCount(folder.name) !== 1 ? "s" : ""}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}