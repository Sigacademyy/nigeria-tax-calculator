export default function StatusBadge({ status, children }) {
  const statusConfig = {
    success: { bg: "#d1fae5", color: "#065f46", border: "#10b981" },
    error: { bg: "#fee2e2", color: "#991b1b", border: "#ef4444" },
    warning: { bg: "#fef3c7", color: "#92400e", border: "#f59e0b" },
    info: { bg: "#dbeafe", color: "#1e40af", border: "#3b82f6" },
    pending: { bg: "#f3f4f6", color: "#374151", border: "#9ca3af" },
  };

  const config = statusConfig[status] || statusConfig.info;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
      }}
    >
      {children}
    </span>
  );
}

