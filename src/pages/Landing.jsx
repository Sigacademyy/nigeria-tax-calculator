import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginRegister from "../components/LoginRegister";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    return <LoginRegister />;
  }

  // Show main content if authenticated
  return (
    <div className="container">
      <div className="card landing-card">
        <span className="badge">Nigeria Tax Act 2025 Compliant</span>

        <div style={{ marginTop: "16px", marginBottom: "8px", fontSize: "14px", color: "#6b7280" }}>
          Welcome back, <strong>{user?.username}</strong>!
        </div>

        <h1 style={{ marginTop: "16px", fontSize: "40px" }}>
          Simple & Accurate Tax Calculations
        </h1>

        <p style={{ marginTop: "12px", fontSize: "18px", color: "#6b7280" }}>
          Calculate Personal Income Tax (PIT) and Business taxes
          with confidence using legally compliant formulas.
        </p>

        <div style={{ marginTop: "32px", display: "flex", gap: "16px" }}>
          <button
            className="btn-primary"
            onClick={() => navigate("/individual")}
          >
            Individual Income Tax (PIT)
          </button>

          <button
            className="btn-outline"
            onClick={() => navigate("/business")}
          >
            Business / LLC Taxes
          </button>
        </div>

        <hr style={{ margin: "40px 0" }} />

        <div className="grid-3">
          <div className="card-soft">
            <h3>Legally Accurate</h3>
            <p style={{ color: "#6b7280" }}>
              Calculations strictly follow the Nigeria Tax Act 2025.
            </p>
          </div>

          <div className="card-soft">
            <h3>Clear Breakdown</h3>
            <p style={{ color: "#6b7280" }}>
              Understand exactly how your tax is computed.
            </p>
          </div>

          <div className="card-soft">
            <h3>Audit-Ready</h3>
            <p style={{ color: "#6b7280" }}>
              Suitable for accountants, payroll and compliance use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
