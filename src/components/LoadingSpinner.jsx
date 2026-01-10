export default function LoadingSpinner({ size = 40, color = "#0f766e" }) {
  return (
    <div
      style={{
        display: "inline-block",
        width: `${size}px`,
        height: `${size}px`,
        border: `3px solid ${color}20`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
}

