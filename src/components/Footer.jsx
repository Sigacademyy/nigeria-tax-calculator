import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <div
      style={{
        marginTop: "60px",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-soft)",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div
        className="container"
        style={{
          paddingTop: "24px",
          paddingBottom: "24px",
          fontSize: "14px",
          color: "var(--text-muted)",
          transition: "color 0.3s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ flex: "1", minWidth: "300px" }}>
            <p>
              <strong>Disclaimer:</strong> This tax calculator is provided for
              estimation and informational purposes only. Calculations are based on
              the Nigeria Tax Act, 2025, and should not be considered as legal,
              accounting, or tax advice. Always consult a qualified tax professional
              or the relevant tax authority for official filings.
            </p>
          </div>
          <div style={{ flex: "0 0 auto" }}>
            <Link
              to="/compliance-notes"
              style={{
                color: "var(--primary)",
                textDecoration: "none",
                fontWeight: 600,
                display: "inline-block",
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid var(--primary)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--primary)";
                e.currentTarget.style.color = "var(--text-inverse)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--primary)";
              }}
            >
              📋 Compliance Notes
            </Link>
          </div>
        </div>

        <p style={{ marginTop: "16px", borderTop: "1px solid var(--border)", paddingTop: "16px", transition: "border-color 0.3s ease" }}>
          Nigeria Tax App NTA - Copyright © 2026 Samuel Oyeyemi. All rights reserved.
        </p>
      </div>
    </div>
  );
}
