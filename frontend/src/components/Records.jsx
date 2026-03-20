import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Records() {
  const [records, setRecords] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRecords = async () => {
      const res = await api.get("/records/records", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(res.data);
    };
    fetchRecords();
  }, [token]);

  return (
    <div>
      <h2>Your Prescriptions & Records</h2>
      <ul>
        {records.map((rec, idx) => (
          <li key={idx}>
            <a href={rec.fileUrl} target="_blank">{rec.fileUrl}</a> | Date: {new Date(rec.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
