import { useState } from "react";
import { useToast } from "../context/ToastContext";
import { evaluateTaxAlerts } from "../utils/taxAlerts";

export default function TaxAlerts({ taxType, inputs, outputs, regime }) {
  const { showToast } = useToast();
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  
  const alerts = evaluateTaxAlerts({
    taxType,
    inputs,
    outputs,
    regime: regime || "2026+",
  }).filter(alert => !dismissedAlerts.has(alert.title));

  if (alerts.length === 0) {
    return null;
  }

  const handleDismiss = (title) => {
    setDismissedAlerts(prev => new Set([...prev, title]));
  };

  const getAlertStyles = (type) => {
    switch (type) {
      case "warning":
        return {
          backgroundColor: "#fef3c7",
          borderColor: "#f59e0b",
          textColor: "#92400e",
          iconColor: "#f59e0b",
        };
      case "info":
        return {
          backgroundColor: "#e0f2fe",
          borderColor: "#0ea5e9",
          textColor: "#0c4a6e",
          iconColor: "#0ea5e9",
        };
      default:
        return {
          backgroundColor: "#f9fafb",
          borderColor: "#6b7280",
          textColor: "#374151",
          iconColor: "#6b7280",
        };
    }
  };

  return (
    <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
      {alerts.map((alert, index) => {
        const styles = getAlertStyles(alert.type);
        return (
          <div
            key={index}
            style={{
              padding: "14px",
              borderRadius: "8px",
              border: `1px solid ${styles.borderColor}`,
              backgroundColor: styles.backgroundColor,
              color: styles.textColor,
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              position: "relative",
            }}
          >
            <span style={{ fontSize: "20px", flexShrink: 0 }}>{alert.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: "4px", fontSize: "14px" }}>
                {alert.title}
              </div>
              <div style={{ fontSize: "13px", lineHeight: "1.5" }}>
                {alert.message}
              </div>
            </div>
            <button
              onClick={() => handleDismiss(alert.title)}
              style={{
                background: "none",
                border: "none",
                color: styles.textColor,
                cursor: "pointer",
                fontSize: "18px",
                padding: "4px",
                opacity: 0.7,
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.7";
              }}
              aria-label="Dismiss alert"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

