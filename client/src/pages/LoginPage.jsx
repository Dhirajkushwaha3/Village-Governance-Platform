import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function LoginPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [loginType, setLoginType] = useState("user");
  const [message, setMessage] = useState("");

  function saveSessionAndGoHome(responseData) {
    localStorage.setItem("vgp_token", responseData.token);
    localStorage.setItem("vgp_user", JSON.stringify(responseData.user));
    navigate("/");
  }

  function isNameValid() {
    return name.trim().length >= 2;
  }

  async function handleSendOtp() {
    if (loginType === "user" && !isNameValid()) {
      setMessage("Enter name with at least 2 letters");
      return;
    }

    if (!email.trim()) {
      setMessage("Enter your email");
      return;
    }

    if (loginType === "admin" && !adminPassword.trim()) {
      setMessage("Enter admin password");
      return;
    }

    try {
      if (loginType === "user") {
        await api.post("/auth/request-otp", { email });
        setMessage("OTP sent to your email");
        setStep("otp");
      } else {
        const res = await api.post("/auth/admin-login", {
          email: email.trim(),
          password: adminPassword
        });
        saveSessionAndGoHome(res.data);
        return;
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error");
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();

    try {
      if (!otp.trim()) {
        setMessage("Enter OTP");
        return;
      }

      if (!isNameValid()) {
        setMessage("Enter name with at least 2 letters");
        return;
      }

      const res = await api.post("/auth/verify-otp", {
        name: name.trim(),
        email: email.trim(),
        otp
      });

      saveSessionAndGoHome(res.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  }

  return (
    <section className="panel">
      <h2>{loginType === "admin" ? "Admin Login" : "Login"}</h2>

      <form className="stack" onSubmit={handleVerifyOtp}>
        <label>
          Login Type
          <select
            value={loginType}
            onChange={(e) => {
              setLoginType(e.target.value);
              setStep("email");
            }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        {loginType === "user" && (
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={step === "otp"}
            />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={step === "otp"}
          />
        </label>

        {loginType === "admin" && (
          <label>
            Password
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
            />
          </label>
        )}

        {step === "email" && (
          <button type="button" className="btn solid" onClick={handleSendOtp}>
            {loginType === "admin" ? "Admin Login" : "Send OTP"}
          </button>
        )}

        {step === "otp" && (
          <>
            <label>
              OTP
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="6 digits"
                maxLength={6}
              />
            </label>
            <button type="submit" className="btn solid">
              Verify & Login
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setStep("email");
                setOtp("");
              }}
            >
              Back
            </button>
          </>
        )}
      </form>

      {message && <p className="message">{message}</p>}
    </section>
  );
}