import API from "../../api/api";

const PrescriptionCard = ({ data, refresh }) => {

  const deletePrescription = async () => {
    await API.delete(`/prescriptions/${data._id}`);
    refresh();
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "15px", margin: "10px" }}>
      <h3>📄 Prescription – {data.doctor_name}</h3>
      <p>🏥 {data.hospital_name}</p>
      <p>📅 {new Date(data.visit_date).toDateString()}</p>
      <p>💊 {data.prescribed_medicines?.length} Medicines</p>
      <p>📝 {data.notes}</p>

      {data.prescription_file && (
        <a href={`http://localhost:5000/${data.prescription_file}`} target="_blank">
          📎 View File
        </a>
      )}

      <button onClick={deletePrescription}>Delete</button>
    </div>
  );
};

export default PrescriptionCard;