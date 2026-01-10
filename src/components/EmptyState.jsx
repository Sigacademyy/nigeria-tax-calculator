export default function EmptyState({ icon = "📋", title, message, action }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 20px",
        color: "#6b7280",
      }}
    >
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>{icon}</div>
      <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>
        {title}
      </h3>
      <p style={{ fontSize: "14px", marginBottom: action ? "24px" : "0" }}>{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

