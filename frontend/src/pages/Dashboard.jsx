import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios.js";
import "../index.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [doctorVisits, setDoctorVisits] = useState([]);
  const [hospitalVisits, setHospitalVisits] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check token
    const token = localStorage.getItem("token");
    if (!token) return navigate("/auth");

    // Load user info
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);

    // Fetch data
    API.get("/medicines").then(res => setMedicines(res.data)).catch(err => console.error(err));
    API.get("/doctor-visits").then(res => setDoctorVisits(res.data)).catch(err => console.error(err));
    API.get("/hospital-visits").then(res => setHospitalVisits(res.data)).catch(err => console.error(err));

    // Request notification permission
    useEffect(() => {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}, []);
});

  // Upcoming follow-ups
  const upcomingDoctorFollowups = doctorVisits.filter(v => new Date(v.follow_up_date) > new Date()).length;
  const upcomingHospitalFollowups = hospitalVisits.filter(h => new Date(h.follow_up_date) > new Date()).length;

 const getDateOnly = (dateValue) => {
  if (!dateValue) return null;
  return new Date(dateValue).toISOString().split("T")[0];
};

const today = new Date().toISOString().split("T")[0];

useEffect(() => {
  doctorVisits.forEach((v) => {
    const followDate = getDateOnly(v.follow_up_date);

    if (followDate === today) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Doctor Follow-up Reminder 🩺", {
          body: `${v.doctor_name || "Doctor"} ${
            v.follow_up_time ? `at ${v.follow_up_time}` : ""
          }`,
        });
      }
    }
  });

  hospitalVisits.forEach((h) => {
    const followDate = getDateOnly(h.follow_up_date);

    if (followDate === today) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Hospital Follow-up Reminder 🏥", {
          body: `${h.hospital_name || "Hospital"} ${
            h.follow_up_time ? `at ${h.follow_up_time}` : ""
          }`,
        });
      }
    }
  });
}, [doctorVisits, hospitalVisits, today]);

     
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Dashboard</h1>

        {user && (
          <div className="user-profile-dropdown">
            <span className="user-name">Welcome, {user.name} ⬇</span>
            <div className="dropdown-content">
              <p><strong>{user.name}</strong></p>
              <p>{user.email}</p>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
        )}
      </header>

      {/* Cards */}
      <div className="dashboard-grid">
        <div className="card" onClick={() => navigate("/medicines")}>💊 Add Medicine</div>
        <div className="card" onClick={() => navigate("/prescriptions")}>📄 Upload Prescription</div>
        <div className="card" onClick={() => navigate("/medical-records")}>📂 Medical Records</div>
        <div className="card" onClick={() => navigate("/doctor-visits")}>🩺 Doctor Visits</div>
        <div className="card" onClick={() => navigate("/hospital-visits")}>🏥 Hospital Admission</div>
        <div className="card" onClick={() => navigate("/vitals")}>🩺 Health Vitals</div>
      </div>

      {/* Stats */}
    </div>
  );
};

export default Dashboard;