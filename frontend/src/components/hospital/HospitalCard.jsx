import { useState } from "react";

const HospitalCard = ({ record }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ border: "1px solid #aaa", padding: "15px", margin: "10px" }}>
      <h3>🏥 {record.hospital_name}</h3>
      <p>📅 {new Date(record.admission_date).toDateString()} -
         {new Date(record.discharge_date).toDateString()}</p>

      <button onClick={() => setOpen(!open)}>
        {open ? "Hide Details" : "View Summary"}
      </button>

      {open && (
        <div>
          <p>🛏 Reason: {record.reason}</p>
          <p>👨‍⚕ Doctor: {record.treating_doctor}</p>
        </div>
      )}
    </div>
  );
};

export default HospitalCard;