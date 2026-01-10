export default function SimpleChart({ data, title, height = 200 }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
        No data to display
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div style={{ padding: "16px" }}>
      {title && (
        <h4 style={{ marginTop: 0, marginBottom: "16px", fontSize: "16px", fontWeight: 600 }}>
          {title}
        </h4>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const percentageOfTotal = total > 0 ? (item.value / total) * 100 : 0;
          
          return (
            <div key={index} style={{ animation: "fadeIn 0.3s ease-out", animationDelay: `${index * 0.1}s` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "#374151" }}>
                  {item.label}
                </span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                  ₦{item.value.toLocaleString()} ({percentageOfTotal.toFixed(1)}%)
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "24px",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "12px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    height: "100%",
                    backgroundColor: item.color || "#0f766e",
                    borderRadius: "12px",
                    transition: "width 0.5s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: "8px",
                  }}
                >
                  {percentage > 15 && (
                    <span style={{ fontSize: "11px", color: "white", fontWeight: 600 }}>
                      {percentageOfTotal.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

