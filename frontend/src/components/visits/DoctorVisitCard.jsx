const DoctorVisitCard = ({ visit }) => {
  return (
    <div style={{ border: "1px solid #ccc", padding: "15px", margin: "10px" }}>
      <h3>👨‍⚕ {visit.doctor_name}</h3>
      <p>🏥 {visit.hospital_name}</p>
      <p>📅 {new Date(visit.visit_date).toDateString()}</p>
      <p>🩺 Diagnosis: {visit.diagnosis}</p>
      <p>📅 Follow-up: {visit.follow_up_date && new Date(visit.follow_up_date).toDateString()}</p>
    </div>
  );
};

export default DoctorVisitCard;