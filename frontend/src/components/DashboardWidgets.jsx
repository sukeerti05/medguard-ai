const DashboardWidgets = ({ medicines }) => {

  const active = medicines.filter(m => m.status === "active").length;
  const lowStock = medicines.filter(m => m.stock_count <= 5).length;

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <div>Active Medicines: {active}</div>
      <div>Low Stock: {lowStock}</div>
      <div>Total: {medicines.length}</div>
    </div>
  );
};

export default DashboardWidgets;