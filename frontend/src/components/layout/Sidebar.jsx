import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div style={{ width: "220px", background: "#1e1e2f", color: "white", padding: "20px", minHeight: "100vh" }}>
      <h2>🩺 MedAI</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><Link to="/" style={{color:"white"}}>Dashboard</Link></li>
        <li><Link to="/medicines" style={{color:"white"}}>Medicines</Link></li>
        <li><Link to="/prescriptions" style={{color:"white"}}>Prescriptions</Link></li>
        <li><Link to="/doctor-visits" style={{color:"white"}}>Doctor Visits</Link></li>
        <li><Link to="/hospital-records" style={{color:"white"}}>Hospital Records</Link></li>
        <li><Link to="/medical-records" style={{color:"white"}}>Lab Reports</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;