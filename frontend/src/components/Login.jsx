import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../index.css";

export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!emailOrPhone || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      const res = await api.post(
        "http://localhost:5000/api/auth/login",
        {
          emailOrPhone,
          password,
        }
      );

      // 🔥 If not verified → go to OTP page
      if (res.data.status === "not_verified") {
        navigate("/verify-otp", {
          state: { userId: res.data.userId },
        });
        return;
      }

      // 🔥 If verified → login normally
      localStorage.setItem("token", res.data.token);
localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Login successful!");
      navigate("/dashboard");

    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Login failed";

      setError(msg);
    }
  };

  return (
    <div className="auth-container">
      <h2 style={{ marginBottom: "20px" }}>Login</h2>

      {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
      {message && <p style={{ color: "green", marginBottom: "10px" }}>{message}</p>}

      <form onSubmit={handleLogin}>
        {/* Email or Phone input */}
        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Enter Email or Mobile Number"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", fontSize: "16px" }}
          />
        </div>

        {/* Password */}
        <div style={{ position: "relative", marginBottom: "15px" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", fontSize: "16px" }}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              cursor: "pointer",
              position: "absolute",
              right: "10px",
              top: "39%",
              transform: "translateY(-50%)",
              color: "#007bff",
              fontWeight: "bold",
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            marginBottom: "20px",
          }}
        >
          Login
        </button>
      </form>

      <p style={{ marginTop: "20px", textAlign: "center" }}>
        Don't have an account?{" "}
        <span
          onClick={() => navigate("/register")}
          style={{ color: "#007bff", cursor: "pointer" }}
        >
          Register here
        </span>
      </p>
    </div>
  );
}