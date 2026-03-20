import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";

export default function ViewMedicalRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await API.get(`/medical-records/${id}`);
        console.log("Medical record:", res.data);
        setRecord(res.data);
      } catch (error) {
        console.error(error);
        alert("Failed to load record");
      }
    };

    fetchRecord();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  if (!record) return <p>Loading...</p>;

  const fileUrl = `http://localhost:5000${record.file_path}`;
  const isImage = record.file_type?.startsWith("image/");
  const isPdf = record.file_type === "application/pdf";

  return (
    <div className="view-page">
      <div className="view-box">
        <button className="close-top-btn" onClick={() => navigate(-1)}>
          Close
        </button>

        <h2>Medical Record Details</h2>

        <p><strong>Category:</strong> {record.category || "-"}</p>
        <p><strong>Test Name:</strong> {record.test_name || "-"}</p>
        <p><strong>Hospital Name:</strong> {record.hospital_name || "-"}</p>
        <p><strong>Lab Centre:</strong> {record.lab_centre || "-"}</p>
        <p><strong>Lab Location:</strong> {record.lab_location || "-"}</p>
        <p><strong>Lab Report ID:</strong> {record.lab_id || "-"}</p>
        <p><strong>Test Date:</strong> {formatDate(record.test_date)}</p>
        <p><strong>Result Summary:</strong> {record.result_summary || "-"}</p>
        <p>
          <strong>Reference:</strong>{" "}
          {record.doctor_reference === "Self"
            ? "Self"
            : `${record.doctor_reference} - ${record.reference_name || "-"}`
          }
        </p>
        <p><strong>Notes:</strong> {record.notes || "-"}</p>

        <div style={{ marginTop: "20px" }}>
          <strong>File Preview:</strong>

          <div style={{ marginTop: "12px" }}>
            {isImage ? (
              <img
                src={fileUrl}
                alt="Medical Record"
                style={{ maxWidth: "100%", borderRadius: "10px" }}
              />
            ) : isPdf ? (
              <iframe
                src={fileUrl}
                title="Medical Record PDF"
                width="100%"
                height="500"
                style={{ border: "1px solid #ccc", borderRadius: "10px" }}
              />
            ) : (
              <a href={fileUrl} target="_blank" rel="noreferrer">
                Open File
              </a>
            )}
          </div>

          <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
            <a href={fileUrl} target="_blank" rel="noreferrer">
              <button type="button">Open File</button>
            </a>

            <a href={fileUrl} target="_blank" rel="noreferrer">
              <button type="button">Download Record</button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}