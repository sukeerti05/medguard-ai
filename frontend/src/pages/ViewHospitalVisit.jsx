import { useLocation, useNavigate } from "react-router-dom";

export default function ViewHospitalVisit() {

  const { state } = useLocation();
  const navigate = useNavigate();
  const visit = state?.visit;
  const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
};

  if (!visit) return <p>No hospital visit found</p>;

  return (
    <div className="view-page">
      <div className="view-box">

        <button
          className="close-top-btn"
          onClick={() => navigate(-1)}
        >
          Close
        </button>

        <h2>Hospital Visit Details</h2>

        <p><strong>Hospital:</strong> {visit.hospital_name}</p>
        <p><strong>Reason:</strong> {visit.reason}</p>
        <p><strong>Doctor:</strong> {visit.attending_doctor}</p>
        <p><strong>Location:</strong> {visit.location}</p>
        <p><strong>Admission Date:</strong> {formatDate(visit.admission_date)}</p>
        <p><strong>Discharge Date:</strong> {formatDate(visit.discharge_date)}</p>
        <p><strong>Follow-up Date:</strong> {formatDate(visit.follow_up_date)}</p>
        <p><strong>Follow-up Time:</strong> {visit.follow_up_time || "-"}</p>
        <p><strong>Notes:</strong> {visit.notes}</p>

      </div>
    </div>
  );
}