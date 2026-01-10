import { useState } from "react";

export default function CopyButton({ text, label = "Copy", showLabel = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#0f766e",
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "12px",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? "✓" : "📋"}
      {showLabel && <span>{copied ? "Copied!" : label}</span>}
    </button>
  );
}

