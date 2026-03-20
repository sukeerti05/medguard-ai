import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const VerifyOtp = () => {

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const userId = location.state?.userId;
  const email = location.state?.email;

  /* ================= TIMER ================= */

  useEffect(() => {

    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    } 
    else {
      setCanResend(true);
    }

  }, [timer]);

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  /* ================= VERIFY OTP ================= */

  const handleVerifyOtp = async () => {

    try {

      const res = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        { userId, otp }
      );

      if (res.data.message === "Verification successful") {
        alert("Email verified successfully");
        navigate("/login");
      } else {
        setMessage("Invalid OTP");
      }

    } catch {
      setMessage("Verification failed");
    }
  };

  /* ================= RESEND OTP ================= */

  const handleResendOtp = async () => {

    try {

      await axios.post(
        "http://localhost:5000/api/auth/resend-otp",
        { userId, email }
      );

      alert("OTP resent successfully");

      setTimer(300);   // restart timer
      setCanResend(false);

    } catch {
      alert("Failed to resend OTP");
    }
  };

  return (
    <div className="auth-container">

      <h2>Email Verification</h2>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
      />

      <button onClick={handleVerifyOtp}>
        Verify OTP
      </button>

      {/* TIMER */}

      {timer > 0 && (
        <p style={{ marginTop: "10px" }}>
          OTP expires in: <b>{formatTime()}</b>
        </p>
      )}

      {/* RESEND BUTTON */}

      {canResend && (
        <button
          onClick={handleResendOtp}
          style={{ marginTop: "10px" }}
        >
          Resend OTP
        </button>
      )}

      {message && (
        <p style={{ marginTop: "10px", color: "red" }}>
          {message}
        </p>
      )}

    </div>
  );
};

export default VerifyOtp;