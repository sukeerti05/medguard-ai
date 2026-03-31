import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import {
  FaPills,
  FaFileMedical,
  FaFolderOpen,
  FaUserMd,
  FaHospital,
  FaUser,
  FaSignOutAlt,
  FaHeartbeat,
} from "react-icons/fa";

import "../index.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const alarmAudio = useRef(null);

  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const [meds, setMeds] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);

  const [activeAlarm, setActiveAlarm] = useState(null);
  const [followupAlarm, setFollowupAlarm] = useState(null);
  const [snoozedUntil, setSnoozedUntil] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const [upcomingDoctorVisits, setUpcomingDoctorVisits] = useState([]);
  const [upcomingHospitalVisits, setUpcomingHospitalVisits] = useState([]);

  const [sentDoctorNotifications, setSentDoctorNotifications] = useState({});
  const [sentHospitalNotifications, setSentHospitalNotifications] = useState({});

  const [highlightedDoctorVisitId, setHighlightedDoctorVisitId] = useState(null);
  const [highlightedHospitalVisitId, setHighlightedHospitalVisitId] = useState(null);

  const formatDateTime = (date, time) => {
    if (!date) return "-";
    const formattedDate = new Date(date).toLocaleDateString("en-GB");
    return time ? `${formattedDate} at ${time}` : formattedDate;
  };

  const getDateOnly = (dateValue) => {
    if (!dateValue) return "";
    return new Date(dateValue).toISOString().split("T")[0];
  };

  const showBrowserNotification = (title, body, path) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, { body });

      notification.onclick = () => {
        window.focus();
        if (path) {
          window.location.href = path;
        }
      };
    }
  };

  const tips = useMemo(
    () => [
      "Drink at least 8 glasses of water daily 💧",
      "Walk 30 minutes every day 🚶",
      "Eat more fruits and vegetables 🍎",
      "Sleep at least 7-8 hours 😴",
      "Regular health checkups are important 🩺",
      "Reduce sugar & junk food 🍔",
      "Take medicines on time 💊",
    ],
    []
  );

  const [tipIndex, setTipIndex] = useState(0);

  const aiSuggestions = useMemo(
    () => [
      "Based on your routine: keep a fixed sleep time and avoid late-night screens 🌙",
      "Try a 10-minute walk after meals to support digestion 🚶‍♀️",
      "Keep a water bottle near you—small sips all day helps hydration 💧",
      "Add one fruit per day (banana/apple/orange) for steady nutrition 🍌🍎",
      "If you feel stressed, try 3 minutes of deep breathing 🧘",
    ],
    []
  );

  const [aiIndex, setAiIndex] = useState(0);

  const activeMedicines = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    return medicines.filter((med) => {
      if (!med.startDate || !med.endDate) return false;

      const startDate = getDateOnly(med.startDate);
      const endDate = getDateOnly(med.endDate);

      return startDate <= today && endDate >= today;
    });
  }, [medicines]);

  const todaysMedicineSchedule = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    return medicines.flatMap((med) => {
      if (!med.startDate || !med.endDate) return [];

      const startDate = getDateOnly(med.startDate);
      const endDate = getDateOnly(med.endDate);

      if (!(startDate <= today && endDate >= today)) return [];

      const times = Array.isArray(med.times) ? med.times : [];

      return times.map((time, index) => ({
        key: `${med._id}-${index}`,
        name: med.name,
        time,
        dosage: med.dosage || "-",
        food: med.food_instruction || "-",
      }));
    });
  }, [medicines]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const unlockAudio = async () => {
      if (!alarmAudio.current || audioEnabled) return;

      try {
        alarmAudio.current.volume = 1;
        await alarmAudio.current.play();
        alarmAudio.current.pause();
        alarmAudio.current.currentTime = 0;
        setAudioEnabled(true);
        console.log("Audio enabled");
      } catch (err) {
        console.log("Audio blocked until user interaction:", err);
      }
    };

    const handleFirstInteraction = () => {
      unlockAudio();
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [audioEnabled]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [medRes, doctorRes, hospitalRes, prescriptionRes] = await Promise.all([
          api.get("/medicines"),
          api.get("/doctor-visits"),
          api.get("/hospital-visits"),
          api.get("/prescriptions"),
        ]);

        const medicinesData = medRes.data || [];
        const doctorsData = doctorRes.data || [];
        const hospitalsData = hospitalRes.data || [];

        const todayStr = new Date().toISOString().split("T")[0];

        const upcomingDoctors = doctorsData.filter((v) => {
          const followDate = getDateOnly(v.follow_up_date);
          return followDate && followDate >= todayStr;
        });

        const upcomingHospitals = hospitalsData.filter((v) => {
          const followDate = getDateOnly(v.follow_up_date);
          return followDate && followDate >= todayStr;
        });

        setMeds(medicinesData);
        setMedicines(medicinesData);
        setUpcomingDoctorVisits(upcomingDoctors);
        setUpcomingHospitalVisits(upcomingHospitals);
        setPrescriptions(prescriptionRes.data || []);
      } catch (err) {
        console.log("Dashboard fetch error:", err);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [tips.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAiIndex((prev) => (prev + 1) % aiSuggestions.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [aiSuggestions.length]);

  const playAlarmAudio = async () => {
    if (!alarmAudio.current) return;

    try {
      alarmAudio.current.currentTime = 0;
      alarmAudio.current.loop = true;
      alarmAudio.current.volume = 1;
      await alarmAudio.current.play();
      console.log("Alarm sound started");
    } catch (err) {
      console.log("Alarm sound blocked:", err);
      alert("Reminder triggered, but browser blocked sound. Click once anywhere on the page to enable audio.");
    }
  };

  const stopAlarmAudio = () => {
    if (alarmAudio.current) {
      alarmAudio.current.pause();
      alarmAudio.current.currentTime = 0;
      alarmAudio.current.loop = false;
    }
  };

  const triggerMedicineAlarm = async (med) => {
    if (activeAlarm || followupAlarm) return;

    setActiveAlarm(med);
    await playAlarmAudio();

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Medicine Reminder 💊", {
        body: `${med.name} - ${med.dosage || ""} ${med.food_instruction || ""}`,
      });
    }
  };

  const triggerFollowupAlarm = async (type, visit) => {
    if (activeAlarm || followupAlarm) return;

    setFollowupAlarm({ type, visit });
    await playAlarmAudio();
  };

  const stopAllAlarms = () => {
    setActiveAlarm(null);
    setFollowupAlarm(null);
    stopAlarmAudio();
  };

  const snoozeAlarm = () => {
    const snoozeTime = new Date();
    snoozeTime.setMinutes(snoozeTime.getMinutes() + 5);
    setSnoozedUntil(snoozeTime);
    stopAllAlarms();
  };

  useEffect(() => {
    const checkMedicineAlarm = () => {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, "0");
      const mm = now.getMinutes().toString().padStart(2, "0");
      const currentTime = `${hh}:${mm}`;
      const today = now.toISOString().split("T")[0];

      if (snoozedUntil && now < snoozedUntil) return;
      if (activeAlarm || followupAlarm) return;

      for (const med of meds) {
        if (!med?.startDate || !med?.endDate) continue;

        const start = med.startDate.split("T")[0];
        const end = med.endDate.split("T")[0];

        if (today < start || today > end) continue;

        const times = Array.isArray(med.times) ? med.times : [];
        if (times.includes(currentTime)) {
          triggerMedicineAlarm(med);
          break;
        }
      }
    };

    const interval = setInterval(checkMedicineAlarm, 20000);
    return () => clearInterval(interval);
  }, [meds, snoozedUntil, activeAlarm, followupAlarm]);

  useEffect(() => {
    const checkDoctorNotifications = () => {
      const now = new Date().getTime();

      upcomingDoctorVisits.forEach((visit) => {
        if (!visit.follow_up_date || !visit.follow_up_time) return;

        const visitDateTime = new Date(visit.follow_up_date);
        const [hours, minutes] = visit.follow_up_time.split(":").map(Number);
        visitDateTime.setHours(hours || 0, minutes || 0, 0, 0);

        const oneHourBefore = new Date(visitDateTime.getTime() - 60 * 60 * 1000);
        const oneHourKey = `${visit._id}-1hour`;

        if (
          now >= oneHourBefore.getTime() &&
          now <= oneHourBefore.getTime() + 60 * 1000 &&
          !sentDoctorNotifications[oneHourKey]
        ) {
          showBrowserNotification(
            "Doctor Follow-up Reminder 🩺",
            `Visit in 1 hour with ${visit.doctor_name || "Doctor"} at ${visit.hospital_name || "-"}`,
            "/doctor-visits"
          );

          triggerFollowupAlarm("doctor", visit);

          setSentDoctorNotifications((prev) => ({
            ...prev,
            [oneHourKey]: true,
          }));

          setHighlightedDoctorVisitId(visit._id);

          setTimeout(() => {
            setHighlightedDoctorVisitId((current) =>
              current === visit._id ? null : current
            );
          }, 10 * 60 * 1000);
        }
      });
    };

    checkDoctorNotifications();
    const interval = setInterval(checkDoctorNotifications, 60000);

    return () => clearInterval(interval);
  }, [upcomingDoctorVisits, sentDoctorNotifications]);

  useEffect(() => {
    const checkHospitalNotifications = () => {
      const now = new Date().getTime();

      upcomingHospitalVisits.forEach((visit) => {
        if (!visit.follow_up_date || !visit.follow_up_time) return;

        const visitDateTime = new Date(visit.follow_up_date);
        const [hours, minutes] = visit.follow_up_time.split(":").map(Number);
        visitDateTime.setHours(hours || 0, minutes || 0, 0, 0);

        const oneHourBefore = new Date(visitDateTime.getTime() - 60 * 60 * 1000);
        const oneHourKey = `${visit._id}-1hour`;

        if (
          now >= oneHourBefore.getTime() &&
          now <= oneHourBefore.getTime() + 60 * 1000 &&
          !sentHospitalNotifications[oneHourKey]
        ) {
          showBrowserNotification(
            "Hospital Follow-up Reminder 🏥",
            `Visit in 1 hour at ${visit.hospital_name || "Hospital"} ${visit.location ? `(${visit.location})` : ""}`,
            "/hospital-visits"
          );

          triggerFollowupAlarm("hospital", visit);

          setSentHospitalNotifications((prev) => ({
            ...prev,
            [oneHourKey]: true,
          }));

          setHighlightedHospitalVisitId(visit._id);

          setTimeout(() => {
            setHighlightedHospitalVisitId((current) =>
              current === visit._id ? null : current
            );
          }, 10 * 60 * 1000);
        }
      });
    };

    checkHospitalNotifications();
    const interval = setInterval(checkHospitalNotifications, 60000);

    return () => clearInterval(interval);
  }, [upcomingHospitalVisits, sentHospitalNotifications]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const goToProfile = () => {
    setProfileOpen(false);
    navigate("/profile");
  };

  return (
    <div
      className="dashboard-page"
      onClick={() => profileOpen && setProfileOpen(false)}
    >
      <div className="dash-navbar" onClick={(e) => e.stopPropagation()}>
        <div className="dash-left">
          <h2>MedAI Dashboard</h2>
        </div>

        <div className="dash-center">
          <h3>Welcome, {user?.name || "User"} 👋</h3>
        </div>

        <div className="dash-right">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            className="dash-avatar"
            alt="profile"
            onClick={() => setProfileOpen((p) => !p)}
            title="Profile"
          />

          {profileOpen && (
            <div className="dash-dropdown">
              <div className="dd-head">
                <div className="dd-name">{user?.name || "User"}</div>
                <div className="dd-sub">{user?.email || "-"}</div>
              </div>

              <div className="dd-info">
                <div><span>Phone:</span> {user?.phone || "-"}</div>
                <div><span>Location:</span> {user?.location || "India"}</div>
              </div>

              <div className="dd-actions">
                <button className="dd-btn" onClick={goToProfile}>
                  <FaUser /> My Profile
                </button>

                <button className="dd-btn danger" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="tip-slider">
        <p>💡 {tips[tipIndex]}</p>
      </div>

      <section className="dashboard-stats">
        <div className="stat-box">
          <h3>💊 Active Medicines</h3>
          {activeMedicines.length === 0 ? (
            <p>No active medicines</p>
          ) : (
            activeMedicines.slice(0, 2).map((med, index) => (
              <p key={index}>
                {med.name} — {med.times?.join(", ") || "-"}
              </p>
            ))
          )}
        </div>

        <div className="stat-box">
          <h3>🧑‍⚕️ Doctor Follow-ups</h3>

          {upcomingDoctorVisits.length === 0 ? (
            <p>No upcoming visits</p>
          ) : (
            upcomingDoctorVisits.slice(0, 3).map((visit) => (
              <div
                key={visit._id}
                className={`followup-item clickable-followup ${
                  highlightedDoctorVisitId === visit._id ? "followup-soft-highlight" : ""
                }`}
                onClick={() =>
                  navigate("/view-doctor-visit", {
                    state: { visit },
                  })
                }
              >
                {highlightedDoctorVisitId === visit._id && (
                  <div className="followup-notification">🔔 Reminder in 1 hour</div>
                )}

                <p><strong>{visit.doctor_name || "Doctor"}</strong></p>
                <p>{visit.hospital_name || "-"}</p>
                <p>{formatDateTime(visit.follow_up_date, visit.follow_up_time)}</p>
              </div>
            ))
          )}
        </div>

        <div className="stat-box">
          <h3>🏥 Hospital Follow-ups</h3>

          {upcomingHospitalVisits.length === 0 ? (
            <p>No upcoming visits</p>
          ) : (
            upcomingHospitalVisits.slice(0, 3).map((visit) => (
              <div
                key={visit._id}
                className={`followup-item clickable-followup ${
                  highlightedHospitalVisitId === visit._id ? "followup-soft-highlight" : ""
                }`}
                onClick={() =>
                  navigate("/view-hospital-visit", {
                    state: { visit },
                  })
                }
              >
                {highlightedHospitalVisitId === visit._id && (
                  <div className="followup-notification">🔔 Reminder in 1 hour</div>
                )}

                <p><strong>{visit.hospital_name || "Hospital"}</strong></p>
                <p>{visit.location || "-"}</p>
                <p>{formatDateTime(visit.follow_up_date, visit.follow_up_time)}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="ai-box">
        <h3>🤖 AI Health Suggestion</h3>
        <p>{aiSuggestions[aiIndex]}</p>
      </div>

      <audio
        ref={alarmAudio}
        src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
        preload="auto"
      />

      {activeAlarm && (
        <div className="alarm-popup">
          {activeAlarm.medicine_image ? (
            <img
              src={`${api.defaults.baseURL.replace(/\/api\/?$/, "")}/${activeAlarm.medicine_image.replace(/\\/g, "/")}`}
              alt={activeAlarm.name}
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "12px",
                marginBottom: "12px",
              }}
            />
          ) : null}

          <h2>💊 Time to take {activeAlarm.name}</h2>
          <p><strong>Dosage:</strong> {activeAlarm.dosage || "-"}</p>
          <p><strong>Food:</strong> {activeAlarm.food_instruction || "-"}</p>
          <p><strong>Look:</strong> {activeAlarm.appearance_note || "-"}</p>

          <p className="alarm-sub">
            If you already took it, stop the alarm. Otherwise snooze for 5 minutes.
          </p>

          <div className="alarm-actions">
            <button className="alarm-btn" onClick={stopAllAlarms}>Stop</button>
            <button className="alarm-btn secondary" onClick={snoozeAlarm}>
              Snooze 5 Min
            </button>
          </div>
        </div>
      )}

      {followupAlarm && (
        <div className="alarm-popup">
          <h2>
            {followupAlarm.type === "doctor"
              ? "🩺 Doctor Follow-up Reminder"
              : "🏥 Hospital Follow-up Reminder"}
          </h2>

          {followupAlarm.type === "doctor" ? (
            <>
              <p><strong>Doctor:</strong> {followupAlarm.visit.doctor_name || "-"}</p>
              <p><strong>Hospital:</strong> {followupAlarm.visit.hospital_name || "-"}</p>
              <p>
                <strong>Date & Time:</strong>{" "}
                {formatDateTime(
                  followupAlarm.visit.follow_up_date,
                  followupAlarm.visit.follow_up_time
                )}
              </p>
            </>
          ) : (
            <>
              <p><strong>Hospital:</strong> {followupAlarm.visit.hospital_name || "-"}</p>
              <p><strong>Location:</strong> {followupAlarm.visit.location || "-"}</p>
              <p>
                <strong>Date & Time:</strong>{" "}
                {formatDateTime(
                  followupAlarm.visit.follow_up_date,
                  followupAlarm.visit.follow_up_time
                )}
              </p>
            </>
          )}

          <p className="alarm-sub">Your follow-up visit is in 1 hour.</p>

          <div className="alarm-actions">
            <button className="alarm-btn" onClick={stopAllAlarms}>Stop</button>
          </div>
        </div>
      )}

      <div className="dash-grid">
        <div className="dash-card" onClick={() => navigate("/medicines")}>
          <FaPills size={30} />
          <h3>Medicines</h3>
        </div>

        <div className="dash-card" onClick={() => navigate("/prescriptions")}>
          <FaFileMedical size={30} />
          <h3>Prescriptions</h3>
          <p>{prescriptions.length} Files Uploaded</p>
        </div>

        <div className="dash-card" onClick={() => navigate("/medical-records")}>
          <FaFolderOpen size={30} />
          <h3>Medical Records</h3>
        </div>

        <div className="dash-card" onClick={() => navigate("/doctor-visits")}>
          <FaUserMd size={30} />
          <h3>Doctor Visits</h3>
        </div>

        <div className="dash-card" onClick={() => navigate("/hospital-visits")}>
          <FaHospital size={30} />
          <h3>Hospital Visits</h3>
        </div>

        <div className="dash-card" onClick={() => navigate("/vitals")}>
          <FaHeartbeat size={30} />
          <h3>Health Vitals</h3>
          <p>Track BP, sugar, weight and more</p>
        </div>
      </div>

      <section className="today-medicines">
        <h2>📅 Today's Medicine Schedule</h2>

        {todaysMedicineSchedule.length === 0 ? (
          <p>No medicines scheduled for today</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Time</th>
                <th>Dosage</th>
                <th>Food Instruction</th>
              </tr>
            </thead>
            <tbody>
              {todaysMedicineSchedule.map((item) => (
                <tr key={item.key}>
                  <td>{item.name}</td>
                  <td>{item.time}</td>
                  <td>{item.dosage}</td>
                  <td>{item.food}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div className="dash-note">
        <small>
          Click once anywhere on the page after opening dashboard to enable reminder sound.
        </small>
      </div>
    </div>
  );
}