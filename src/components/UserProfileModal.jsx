import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";

export default function UserProfileModal({ isOpen, onClose, onSave, initialData }) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    additionalInfo: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name || "",
        companyName: initialData?.companyName || "",
        additionalInfo: initialData?.additionalInfo || "",
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast("Please enter your name", "error");
      return;
    }

    if (!formData.companyName.trim()) {
      showToast("Please enter your company name", "error");
      return;
    }

    onSave(formData);
    showToast("Profile information saved successfully!", "success");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "500px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "var(--text-main)",
              transition: "color 0.3s ease",
            }}
          >
            {initialData ? "Edit Profile Information" : "Welcome! Set Up Your Company Profile"}
          </h2>
          {!initialData && (
            <p
              style={{
                marginTop: "8px",
                marginBottom: "20px",
                color: "var(--text-muted)",
                fontSize: "14px",
                transition: "color 0.3s ease",
              }}
            >
              Please enter your name and company details to personalize your experience.
            </p>
          )}
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "0",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-main)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "8px",
                color: "var(--text-main)",
                transition: "color 0.3s ease",
              }}
            >
              Your Name <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter your name"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "16px",
                backgroundColor: "var(--bg-card)",
                color: "var(--text-main)",
                transition:
                  "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "8px",
                color: "var(--text-main)",
                transition: "color 0.3s ease",
              }}
            >
              Company Name <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              placeholder="Enter your company name"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "16px",
                backgroundColor: "var(--bg-card)",
                color: "var(--text-main)",
                transition:
                  "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "8px",
                color: "var(--text-main)",
                transition: "color 0.3s ease",
              }}
            >
              Additional Information (Optional)
            </label>
            <textarea
              value={formData.additionalInfo}
              onChange={(e) =>
                setFormData({ ...formData, additionalInfo: e.target.value })
              }
              placeholder="Any additional details about your company (optional)"
              rows={3}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "16px",
                backgroundColor: "var(--bg-card)",
                color: "var(--text-main)",
                transition:
                  "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                boxSizing: "border-box",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
            }}
          >
            {initialData && (
              <button
                type="button"
                onClick={onClose}
                className="btn-outline"
                style={{
                  padding: "12px 24px",
                }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: "12px 24px",
              }}
            >
              {initialData ? "Update" : "Save & Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
