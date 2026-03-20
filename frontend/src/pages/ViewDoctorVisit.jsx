import { useLocation, useNavigate } from "react-router-dom";

export default function ViewDoctorVisit() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const visit = state?.visit;

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  if (!visit) return <p>No doctor visit found</p>;

  return (
    <div className="view-page">
      <div className="view-box">
        <button
          className="close-top-btn"
          onClick={() => navigate(-1)}
        >
          Close
        </button>

        <h2>Doctor Visit Details</h2>

        <p><strong>Doctor:</strong> {visit.doctor_name || "-"}</p>
        <p><strong>Hospital:</strong> {visit.hospital_name || "-"}</p>
        <p><strong>Specialization:</strong> {visit.specialization || "-"}</p>
        <p><strong>Date:</strong> {formatDate(visit.visit_date || visit.date)}</p>
        <p><strong>Reason:</strong> {visit.reason || "-"}</p>
        <p><strong>Diagnosis:</strong> {visit.diagnosis || "-"}</p>
        <p><strong>Doctor Advice:</strong> {visit.prescription || visit.doctor_advice || "-"}</p>
        <p><strong>Follow-up Date:</strong> {formatDate(visit.follow_up_date)}</p>
        <p><strong>Follow-up Time:</strong> {visit.follow_up_time || "-"}</p>
        <p><strong>Notes:</strong> {visit.notes || "-"}</p>
      </div>
    </div>
  );
}