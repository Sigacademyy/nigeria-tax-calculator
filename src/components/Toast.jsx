import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  const colors = {
    success: { bg: "#10b981", text: "white" },
    error: { bg: "#ef4444", text: "white" },
    info: { bg: "#3b82f6", text: "white" },
    warning: { bg: "#f59e0b", text: "white" },
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        right: "20px",
        backgroundColor: colors[type].bg,
        color: colors[type].text,
        padding: "12px 20px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        minWidth: "250px",
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <span style={{ fontSize: "18px", fontWeight: "bold" }}>{icons[type]}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: colors[type].text,
          cursor: "pointer",
          fontSize: "18px",
          padding: "0",
          lineHeight: "1",
        }}
      >
        ×
      </button>
    </div>
  );
}

