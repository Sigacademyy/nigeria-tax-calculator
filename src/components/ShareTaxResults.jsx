import { useState } from "react";
import { useToast } from "../context/ToastContext";
import { generateTaxSummary, generateShareableLink } from "../utils/taxShare";
import { exportToPDF } from "../utils/exportHelpers";

export default function ShareTaxResults({ taxType, inputs, outputs, regime }) {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleCopySummary = () => {
    const data = {
      taxType,
      inputs,
      outputs,
      regime: regime || "2026+",
      timestamp: Date.now(),
    };
    
    const summary = generateTaxSummary(data);
    navigator.clipboard.writeText(summary).then(() => {
      showToast("Tax summary copied to clipboard!", "success");
      setIsOpen(false);
    }).catch(() => {
      showToast("Failed to copy to clipboard", "error");
    });
  };

  const handleDownloadPDF = () => {
    const data = {
      taxType,
      inputs,
      outputs,
      regime: regime || "2026+",
      timestamp: Date.now(),
    };
    
    const summary = generateTaxSummary(data);
    const content = `
      <h1>${taxType} Tax Results</h1>
      <p><strong>Generated:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
      <p><strong>Tax Regime:</strong> ${data.regime === "pre-2026" ? "Pre-2026 (PITA)" : "2026+ (Nigeria Tax Act 2025)"}</p>
      
      <h2>Inputs</h2>
      <table>
        <tbody>
          ${Object.entries(inputs).filter(([_, v]) => v !== null && v !== undefined && v !== "").map(([key, value]) => `
            <tr>
              <td><strong>${key}:</strong></td>
              <td>${typeof value === 'number' ? `₦${value.toLocaleString()}` : value}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      
      <h2>Results</h2>
      <table>
        <tbody>
          ${Object.entries(outputs).filter(([_, v]) => v !== null && v !== undefined).map(([key, value]) => `
            <tr>
              <td><strong>${key}:</strong></td>
              <td>${typeof value === 'number' ? `₦${value.toLocaleString()}` : value}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      
      <div class="summary" style="margin-top: 30px; padding: 15px; background-color: #fee2e2; border-radius: 6px;">
        <p><strong>Disclaimer:</strong> This is an estimation for informational purposes only. Always consult a qualified tax professional for official filings.</p>
      </div>
    `;
    
    exportToPDF(`${taxType} Tax Results`, content, `${taxType}_Results_${new Date().toISOString().split('T')[0]}.pdf`);
    setIsOpen(false);
  };

  const handleGenerateLink = () => {
    const data = {
      taxType,
      inputs,
      outputs,
      regime: regime || "2026+",
      timestamp: Date.now(),
    };
    
    const link = generateShareableLink(data);
    navigator.clipboard.writeText(link).then(() => {
      showToast("Shareable link copied to clipboard!", "success");
      setIsOpen(false);
    }).catch(() => {
      showToast("Failed to copy link", "error");
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: "8px 16px",
          backgroundColor: "var(--primary)",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 600,
        }}
      >
        📤 Share Results
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2000,
    }}
    onClick={() => setIsOpen(false)}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "500px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, color: "var(--text-main)" }}>Share Tax Results</h3>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            ×
          </button>
        </div>

        <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
          Choose how you'd like to share your tax calculation results:
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={handleCopySummary}
            className="btn-outline"
            style={{
              width: "100%",
              padding: "16px",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "24px" }}>📋</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: "4px" }}>Copy Summary Text</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Copy formatted text to clipboard
              </div>
            </div>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="btn-outline"
            style={{
              width: "100%",
              padding: "16px",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "24px" }}>📄</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: "4px" }}>Download PDF</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Download as PDF document
              </div>
            </div>
          </button>

          <button
            onClick={handleGenerateLink}
            className="btn-outline"
            style={{
              width: "100%",
              padding: "16px",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "24px" }}>🔗</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: "4px" }}>Generate Shareable Link</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Create a read-only link to share
              </div>
            </div>
          </button>
        </div>

        <div style={{
          marginTop: "24px",
          padding: "12px",
          backgroundColor: "var(--bg-soft)",
          borderRadius: "6px",
          fontSize: "12px",
          color: "var(--text-muted)",
        }}>
          <strong>Note:</strong> Shared results are read-only and include a disclaimer. They do not contain editable data.
        </div>
      </div>
    </div>
  );
}

