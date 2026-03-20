import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../index.css";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  const calculateAge = (dateString) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let userAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      userAge--;
    }
    setAge(userAge);
  };

  const handlePhoneChange = async (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) value = value.slice(0, 10);

    setPhone(value);
    setPhoneError("");

    if (value.length === 10) {
      try {
        const res = await api.get(
          `/auth/check-phone/${countryCode + value}`
        );
        if (res.data.exists) {
          setPhoneError("Mobile number already registered");
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const register = async (e) => {
    e.preventDefault();
    setError("");

    if (phoneError || emailError) {
      setError("Please fix the errors before submitting");
      return;
    }

    if (!name || !phone || !email || !password || !dob || !age) {
      setError("All required fields must be filled");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(password)) {
      setError(
        "Password must contain uppercase, lowercase, number & special character"
      );
      return;
    }

    try {
      const phoneToSend = countryCode + phone;

      const res = await api.post("/auth/register", {
        name,
        phone: phoneToSend,
        gender,
        dob,
        age,
        address,
        state,
        district,
        email: email + "@gmail.com",
        password,
      });

      navigate("/verify-otp", {
        state: { userId: res.data.userId, phone: phoneToSend },
      });

    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Registration failed");
      } else {
        setError("Server error. Try again.");
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>

      {error && <p className="main-error">{error}</p>}

      <form onSubmit={register}>

        <input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="phone-group">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
          >
            <option value="+91">India (+91)</option>
            <option value="+1">USA (+1)</option>
            <option value="+44">UK (+44)</option>
            <option value="+61">Australia (+61)</option>
            <option value="+33">France (+33)</option>
            <option value="+49">Germany (+49)</option>
          </select>

          <input
            placeholder="Phone Number"
            value={phone}
            onChange={handlePhoneChange}
            required
          />
        </div>

        {phoneError && <p className="field-error">{phoneError}</p>}

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <div>
          <label>DOB:</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => {
              setDob(e.target.value);
              calculateAge(e.target.value);
            }}
            required
          />
        </div>

        <input placeholder="Age" value={age} readOnly required />

        <input
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <input
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />

        <input
          placeholder="District"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        />

        {/* Gmail Built-in */}
        <div className="email-group">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={async (e) => {
              const value = e.target.value.replace("@gmail.com", "");
              setEmail(value);
              setEmailError("");

              if (value.length > 3) {
                try {
                  const res = await api.get(
                    `/auth/check-email/${value}@gmail.com`
                  );
                  if (res.data.exists) {
                    setEmailError("Email already registered");
                  }
                } catch (err) {
                  console.log(err);
                }
              }
            }}
            required
          />
          <span className="email-suffix">@gmail.com</span>
        </div>

        {emailError && <p className="field-error">{emailError}</p>}

        <div className="password-group">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        <div className="password-group">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <span onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? "Hide" : "Show"}
          </span>
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}