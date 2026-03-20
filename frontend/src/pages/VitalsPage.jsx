import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function VitalsPage() {
  const navigate = useNavigate();
  const [vitals, setVitals] = useState([]);

  const fetchVitals = async () => {
    try {
      const res = await api.get("/vitals");
      setVitals(res.data || []);
    } catch (err) {
      console.log(err);
      alert("Failed to load vitals");
    }
  };

  useEffect(() => {
    fetchVitals();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this vital record?");
    if (!ok) return;

    try {
      await api.delete(`/vitals/${id}`);
      alert("Deleted successfully");
      fetchVitals();
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

 const getBpStatus = (bp) => {
  if (!bp || !bp.includes("/")) return { status: "-", suggestion: "No BP data available." };

  const [sys, dia] = bp.split("/").map(Number);

  if (sys >= 160 || dia >= 100) {
    return {
      status: "Consult Doctor",
      suggestion:
        "Blood pressure is very high. Rest, avoid stress, reduce salt, and consult a doctor soon.",
    };
  }

  if (sys >= 140 || dia >= 90) {
    return {
      status: "Monitor",
      suggestion:
        "Blood pressure is high. Reduce salt, drink water, rest well, and recheck later.",
    };
  }

  if (sys < 80 || dia < 50) {
    return {
      status: "Consult Doctor",
      suggestion:
        "Blood pressure is very low. Drink fluids, eat properly, and consult a doctor if weakness or dizziness continues.",
    };
  }

  if (sys < 90 || dia < 60) {
    return {
      status: "Slightly Low",
      suggestion:
        "Blood pressure is slightly low. Drink water, eat on time, and avoid standing up suddenly.",
    };
  }

  return {
    status: "Normal",
    suggestion:
      "Blood pressure looks normal. Maintain healthy food, proper sleep, and regular activity.",
  };
};

const getSugarStatus = (sugar) => {
  const val = Number(sugar);
  if (!val) return { status: "-", suggestion: "No sugar data available." };

  if (val >= 200) {
    return {
      status: "Consult Doctor",
      suggestion:
        "Sugar level is very high. Avoid sweets, drink water, follow diet control, and consult a doctor.",
    };
  }

  if (val > 140) {
    return {
      status: "Monitor",
      suggestion:
        "Sugar level is high. Reduce sugar intake, avoid junk food, and monitor regularly.",
    };
  }

  if (val < 60) {
    return {
      status: "Consult Doctor",
      suggestion:
        "Sugar level is very low. Take glucose or juice immediately and seek medical advice if symptoms continue.",
    };
  }

  if (val < 70) {
    return {
      status: "Slightly Low",
      suggestion:
        "Sugar level is slightly low. Eat something immediately and recheck after some time.",
    };
  }

  return {
    status: "Normal",
    suggestion:
      "Sugar level looks normal. Continue balanced meals and regular food timings.",
  };
};

const getTempStatus = (temp) => {
  const val = Number(temp);
  if (!val) return { status: "-", suggestion: "No temperature data available." };

  if (val >= 102) {
    return {
      status: "Consult Doctor",
      suggestion:
        "Temperature is very high. Rest, drink fluids, and seek medical advice if fever continues.",
    };
  }

  if (val > 100.4) {
    return {
      status: "Monitor",
      suggestion:
        "Temperature is slightly high. Rest, stay hydrated, and monitor for fever symptoms.",
    };
  }

  if (val < 95) {
    return {
      status: "Consult Doctor",
      suggestion:
        "Temperature is too low. Keep warm and seek medical advice if it remains low.",
    };
  }

  return {
    status: "Normal",
    suggestion: "Temperature looks normal.",
  };
};

const getOxygenStatus = (oxygen) => {
  const val = Number(oxygen);
  if (!val) return { status: "-", suggestion: "No oxygen data available." };

  if (val < 90) {
    return {
      status: "Consult Doctor",
      suggestion:
        "Oxygen level is very low. Seek medical help immediately.",
    };
  }

  if (val < 95) {
    return {
      status: "Monitor",
      suggestion:
        "Oxygen level is slightly low. Sit upright, rest, and monitor again.",
    };
  }

  return {
    status: "Normal",
    suggestion: "Oxygen level looks normal.",
  };
};

const getHeartRateStatus = (heartRate) => {
  const val = Number(heartRate);
  if (!val) return { status: "-", suggestion: "No heart rate data available." };

  if (val > 120) {
    return {
      status: "Consult Doctor",
      suggestion:
        "Heart rate is very high. Rest and consult a doctor if it remains high.",
    };
  }

  if (val > 100) {
    return {
      status: "Monitor",
      suggestion:
        "Heart rate is slightly high. Rest for some time and recheck.",
    };
  }

  if (val < 50) {
    return {
      status: "Consult Doctor",
      suggestion:
        "Heart rate is very low. Consult a doctor if you feel weak or dizzy.",
    };
  }

  if (val < 60) {
    return {
      status: "Slightly Low",
      suggestion:
        "Heart rate is slightly low. Monitor symptoms like weakness or dizziness.",
    };
  }

  return {
    status: "Normal",
    suggestion: "Heart rate looks normal.",
  };
};
const getNotesBasedSuggestion = (notes) => {
  if (!notes) return "";

  const text = notes.toLowerCase();

  if (text.includes("dizzy") || text.includes("dizziness")) {
    return "Since you noted dizziness, rest well, drink fluids, and monitor BP and sugar again.";
  }

  if (text.includes("weak") || text.includes("weakness")) {
    return "Since you noted weakness, eat properly, rest, and monitor sugar and BP again.";
  }

  if (text.includes("headache")) {
    return "Since you noted headache, rest, drink water, and monitor BP if symptoms continue.";
  }

  if (text.includes("fever")) {
    return "Since you noted fever, rest, stay hydrated, and monitor temperature regularly.";
  }

  if (text.includes("chest pain")) {
    return "Chest pain should not be ignored. Seek medical advice immediately if it continues.";
  }

  if (text.includes("breathless") || text.includes("breathing")) {
    return "Since you noted breathing difficulty, check oxygen again and seek medical help if needed.";
  }

  if (text.includes("normal") || text.includes("fine") || text.includes("okay")) {
    return "You noted feeling normal. Continue monitoring regularly.";
  }

  return "Patient notes recorded. Monitor symptoms and share them with the doctor during consultation.";
};
const getOverallStatusAndSuggestion = (item) => {
  const checks = [
    getBpStatus(item.blood_pressure),
    getSugarStatus(item.sugar_level),
    getTempStatus(item.temperature),
    getOxygenStatus(item.oxygen_level),
    getHeartRateStatus(item.heart_rate),
  ];

  const priority = ["Consult Doctor", "Monitor", "Slightly Low", "Normal", "-"];

  let finalStatus = "Normal";

  for (const level of priority) {
    if (checks.some((c) => c.status === level)) {
      finalStatus = level;
      break;
    }
  }

  const vitalSuggestions = checks
    .filter((c) => c.status !== "Normal" && c.status !== "-")
    .map((c) => c.suggestion);

  const notesSuggestion = getNotesBasedSuggestion(item.notes);

  const allSuggestions = [...vitalSuggestions];
  if (notesSuggestion) allSuggestions.push(notesSuggestion);

  const finalSuggestion =
    allSuggestions.length > 0
      ? allSuggestions.join(" ")
      : "All entered vitals look normal. Maintain hydration, healthy food, proper sleep, and regular activity.";

  return { status: finalStatus, suggestion: finalSuggestion };
};

  return (
    <div className="page-container">
      <div className="page-header prescription-header">
        <div>
          <h2>Health Vitals</h2>
          <p>Track blood pressure, sugar, weight and other health vitals.</p>
        </div>

        <button onClick={() => navigate("/add-vital")}>
          Add Vital
        </button>
      </div>

      <div className="table-box">
        {vitals.length === 0 ? (
          <p>No vitals added yet</p>
        ) : (
          <table className="prescription-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>BP</th>
                <th>Sugar</th>
                <th>Weight</th>
                <th>Heart Rate</th>
                <th>Temp</th>
                <th>Oxygen</th>
                <th>Status</th>
                <th>Notes</th>
                <th>AI Suggestion</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {vitals.map((item) => (
                <tr key={item._id}>
                  <td>{formatDate(item.date)}</td>
                  <td>{item.blood_pressure || "-"}</td>
                  <td>{item.sugar_level || "-"}</td>
                  <td>{item.weight || "-"}</td>
                  <td>{item.heart_rate || "-"}</td>
                  <td>{item.temperature || "-"}</td>
                  <td>{item.oxygen_level || "-"}</td>
                  <td>
  <span
    className={`vital-status ${getOverallStatusAndSuggestion(item).status
      .toLowerCase()
      .replace(/\s+/g, "-")}`}
  >
    {getOverallStatusAndSuggestion(item).status}
  </span>
</td>
<td className="vital-notes-cell">{item.notes || "-"}</td>
<td className="ai-suggestion-cell">
  {getOverallStatusAndSuggestion(item).suggestion}
</td>
                  <td>
                    <button onClick={() => handleDelete(item._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}