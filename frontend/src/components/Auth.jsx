import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div>
      {isLogin ? <Login /> : <Register />}
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        {isLogin ? (
          <p>
            Don't have an account?{" "}
            <span
              style={{ cursor: "pointer", color: "#007bff" }}
              onClick={() => setIsLogin(false)}
            >
              Register here
            </span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span
              style={{ cursor: "pointer", color: "#007bff" }}
              onClick={() => setIsLogin(true)}
            >
              Login here
            </span>
          </p>
        )}
      </div>
    </div>
  );
}