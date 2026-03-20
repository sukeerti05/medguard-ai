
import API from "../api/api";

const MedicineCard = ({ medicine, refresh }) => {

  const markTaken = async () => {
    await API.put(`/medicines/taken/${medicine._id}`);
    refresh();
  };

  const markMissed = async () => {
    await API.put(`/medicines/missed/${medicine._id}`);
    refresh();
  };

  const isLowStock = medicine.stock_count <= 5;
  const isExpired = new Date(medicine.expiry_date) < new Date();

  return (
    <div style={{
      border: "1px solid #ccc",
      padding: "15px",
      margin: "10px",
      backgroundColor: isExpired ? "#ffcccc"
        : isLowStock ? "#fff3cd"
        : "#e6ffe6"
    }}>

      <h3>💊 {medicine.name} ({medicine.dosage})</h3>

      <p>🕒 {medicine.schedule_time?.join(", ")}</p>
      <p>🍽 {medicine.food_instruction}</p>
      <p>📦 Stock: {medicine.stock_count}</p>

      {isLowStock && <p style={{color:"orange"}}>⚠ Low Stock</p>}
      {isExpired && <p style={{color:"red"}}>❌ Expired</p>}

      <button onClick={markTaken}>✔ Taken</button>
      <button onClick={markMissed}>❌ Missed</button>
    </div>
  );
};

export default MedicineCard;