import { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    if (!mobile) {
      setMessage("Enter your mobile number");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/send-reset-otp",
        { mobile }
      );

      if (res.data.status === "otp-sent") {
        setOtpSent(true);
        setMessage("OTP sent to your mobile");
      } else {
        setMessage("Mobile not registered");
      }
    } catch (err) {
      setMessage("Error sending OTP");
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      setMessage("Fill all fields");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/reset-password-otp",
        { mobile, otp, newPassword }
      );

      if (res.data.status === "success") {
        setMessage("Password updated successfully");
      } else {
        setMessage("Invalid OTP");
      }
    } catch (err) {
      setMessage("Error resetting password");
    }
  };

  return (
    <div className="auth-container">
      <h2>Forgot Password</h2>

      {!otpSent && (
        <>
          <input
            type="text"
            placeholder="Enter registered mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
          <button onClick={handleSendOtp}>Send OTP</button>
        </>
      )}

      {otpSent && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button onClick={handleResetPassword}>Reset Password</button>
        </>
      )}

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
};

export default ForgotPassword;