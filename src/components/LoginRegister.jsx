import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/ui.css";

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      setLoading(false);
      return;
    }

    const result = isLogin ? login(username, password) : register(username, password);

    if (!result.success) {
      setError(result.error || "An error occurred");
      setLoading(false);
    } else {
      // Success - user will be redirected automatically
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "500px", marginTop: "40px" }}>
      <div className="card">
        <h2 style={{ textAlign: "center", marginBottom: "24px" }}>
          {isLogin ? "Login" : "Register"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="username"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
              disabled={loading}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "16px",
              fontWeight: 600,
              marginBottom: "16px",
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setUsername("");
                setPassword("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "#0f766e",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "14px",
              }}
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}


