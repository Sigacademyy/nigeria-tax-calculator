import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserStorageKey, setUserData } from "../utils/storage";
import "../styles/ui.css";

const STORAGE_KEY_ONBOARDING = "onboarding_completed";
const STORAGE_KEY_PREFERENCES = "user_preferences";

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState({
    userType: "", // "individual" | "business" | "both"
    hasEmployees: null, // true | false
    incomeRange: "", // optional
    preferredRegime: "2026+", // "pre-2026" | "2026+"
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Save onboarding completion status
    const storageKey = getUserStorageKey(STORAGE_KEY_ONBOARDING);
    localStorage.setItem(storageKey, "true");

    // Save user preferences
    setUserData(STORAGE_KEY_PREFERENCES, preferences);

    // Redirect based on user type preference
    if (preferences.userType === "individual") {
      navigate("/individual");
    } else if (preferences.userType === "business") {
      navigate("/business");
    } else {
      navigate("/"); // Landing page if both
    }
  };

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return preferences.userType !== "";
      case 2:
        return preferences.hasEmployees !== null;
      case 3:
        return true; // Optional step
      case 4:
        return preferences.preferredRegime !== "";
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 style={{ marginBottom: "8px", color: "#0f766e" }}>What describes you best?</h2>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>
              Select your primary use case to customize your experience
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { value: "individual", label: "Individual Taxpayer", icon: "👤", desc: "Calculate personal income tax (PIT)" },
                { value: "business", label: "Business Owner", icon: "🏢", desc: "Calculate business taxes (CIT, VAT, PAYE, WHT)" },
                { value: "both", label: "Both", icon: "👥", desc: "I need both individual and business tax calculations" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updatePreference("userType", option.value)}
                  style={{
                    padding: "20px",
                    border: preferences.userType === option.value ? "2px solid #0f766e" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    backgroundColor: preferences.userType === option.value ? "#e6f6f4" : "white",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                  onMouseEnter={(e) => {
                    if (preferences.userType !== option.value) {
                      e.currentTarget.style.borderColor = "#0f766e";
                      e.currentTarget.style.backgroundColor = "#f9fafb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (preferences.userType !== option.value) {
                      e.currentTarget.style.borderColor = "#d1d5db";
                      e.currentTarget.style.backgroundColor = "white";
                    }
                  }}
                >
                  <span style={{ fontSize: "32px" }}>{option.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: "4px" }}>
                      {option.label}
                    </div>
                    <div style={{ fontSize: "14px", color: "#6b7280" }}>
                      {option.desc}
                    </div>
                  </div>
                  {preferences.userType === option.value && (
                    <span style={{ color: "#0f766e", fontSize: "20px" }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 style={{ marginBottom: "8px", color: "#0f766e" }}>Do you have employees?</h2>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>
              This helps us show you relevant PAYE features
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              {[
                { value: true, label: "Yes", icon: "✓", desc: "I have employees" },
                { value: false, label: "No", icon: "✗", desc: "I don't have employees" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updatePreference("hasEmployees", option.value)}
                  style={{
                    flex: 1,
                    padding: "24px",
                    border: preferences.hasEmployees === option.value ? "2px solid #0f766e" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    backgroundColor: preferences.hasEmployees === option.value ? "#e6f6f4" : "white",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (preferences.hasEmployees !== option.value) {
                      e.currentTarget.style.borderColor = "#0f766e";
                      e.currentTarget.style.backgroundColor = "#f9fafb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (preferences.hasEmployees !== option.value) {
                      e.currentTarget.style.borderColor = "#d1d5db";
                      e.currentTarget.style.backgroundColor = "white";
                    }
                  }}
                >
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>{option.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: "18px", marginBottom: "4px" }}>
                    {option.label}
                  </div>
                  <div style={{ fontSize: "14px", color: "#6b7280" }}>
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 style={{ marginBottom: "8px", color: "#0f766e", fontSize: "24px" }}>Approximate Annual Income Range (Optional)</h2>
            <p style={{ color: "#6b7280", marginBottom: "24px", fontSize: "15px" }}>
              This helps us provide relevant guidance. You can skip this step.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { value: "under-5m", label: "Under ₦5,000,000" },
                { value: "5m-25m", label: "₦5,000,000 - ₦25,000,000" },
                { value: "25m-50m", label: "₦25,000,000 - ₦50,000,000" },
                { value: "50m-100m", label: "₦50,000,000 - ₦100,000,000" },
                { value: "over-100m", label: "Over ₦100,000,000" },
                { value: "prefer-not", label: "Prefer not to say" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updatePreference("incomeRange", option.value)}
                  style={{
                    padding: "16px 20px",
                    border: preferences.incomeRange === option.value ? "2px solid #0f766e" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    backgroundColor: preferences.incomeRange === option.value ? "#e6f6f4" : "white",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "15px",
                    color: "#374151",
                    fontWeight: preferences.incomeRange === option.value ? 600 : 500,
                    minHeight: "56px",
                  }}
                  onMouseEnter={(e) => {
                    if (preferences.incomeRange !== option.value) {
                      e.currentTarget.style.borderColor = "#0f766e";
                      e.currentTarget.style.backgroundColor = "#f9fafb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (preferences.incomeRange !== option.value) {
                      e.currentTarget.style.borderColor = "#d1d5db";
                      e.currentTarget.style.backgroundColor = "white";
                    }
                  }}
                >
                  <span style={{ fontWeight: "inherit" }}>{option.label}</span>
                  {preferences.incomeRange === option.value && (
                    <span style={{ color: "#0f766e", fontSize: "20px", fontWeight: "bold" }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 style={{ marginBottom: "8px", color: "#0f766e" }}>Preferred Tax Regime</h2>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>
              Select which tax regime you'll primarily use for PAYE calculations
            </p>
            <div style={{ 
              padding: "16px", 
              backgroundColor: "#fef3c7", 
              borderRadius: "8px",
              border: "1px solid #f59e0b",
              marginBottom: "24px",
              fontSize: "13px",
              color: "#92400e",
            }}>
              <strong>Note:</strong> From 1 January 2026, the Nigeria Tax Act 2025 is in effect. The Pre-2026 regime is provided for historical reference only.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { 
                  value: "2026+", 
                  label: "2026+ (Nigeria Tax Act 2025)", 
                  desc: "Current regime with ₦800,000 tax-free band",
                  recommended: true,
                },
                { 
                  value: "pre-2026", 
                  label: "Pre-2026 (PITA)", 
                  desc: "Legacy regime with CRA (for historical calculations)",
                  recommended: false,
                },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updatePreference("preferredRegime", option.value)}
                  style={{
                    padding: "20px",
                    border: preferences.preferredRegime === option.value ? "2px solid #0f766e" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    backgroundColor: preferences.preferredRegime === option.value ? "#e6f6f4" : "white",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (preferences.preferredRegime !== option.value) {
                      e.currentTarget.style.borderColor = "#0f766e";
                      e.currentTarget.style.backgroundColor = "#f9fafb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (preferences.preferredRegime !== option.value) {
                      e.currentTarget.style.borderColor = "#d1d5db";
                      e.currentTarget.style.backgroundColor = "white";
                    }
                  }}
                >
                  {option.recommended && (
                    <span style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      fontSize: "11px",
                      backgroundColor: "#0f766e",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontWeight: 600,
                    }}>
                      RECOMMENDED
                    </span>
                  )}
                  <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: "4px" }}>
                    {option.label}
                  </div>
                  <div style={{ fontSize: "14px", color: "#6b7280" }}>
                    {option.desc}
                  </div>
                  {preferences.preferredRegime === option.value && (
                    <div style={{ marginTop: "8px", color: "#0f766e", fontSize: "14px", fontWeight: 600 }}>
                      ✓ Selected
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎉</div>
            <h2 style={{ marginBottom: "12px", color: "#0f766e" }}>You're All Set!</h2>
            <p style={{ color: "#6b7280", marginBottom: "24px", fontSize: "16px" }}>
              Your preferences have been saved. You can change these settings anytime.
            </p>
            <div style={{
              backgroundColor: "#f9fafb",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "24px",
              textAlign: "left",
            }}>
              <h3 style={{ marginTop: 0, marginBottom: "12px", fontSize: "16px" }}>Summary:</h3>
              <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: "2", color: "#374151" }}>
                <li>User Type: <strong>{preferences.userType === "individual" ? "Individual" : preferences.userType === "business" ? "Business Owner" : "Both"}</strong></li>
                <li>Has Employees: <strong>{preferences.hasEmployees ? "Yes" : "No"}</strong></li>
                {preferences.incomeRange && preferences.incomeRange !== "prefer-not" && (
                  <li>Income Range: <strong>{
                    preferences.incomeRange === "under-5m" ? "Under ₦5,000,000" :
                    preferences.incomeRange === "5m-25m" ? "₦5,000,000 - ₦25,000,000" :
                    preferences.incomeRange === "25m-50m" ? "₦25,000,000 - ₦50,000,000" :
                    preferences.incomeRange === "50m-100m" ? "₦50,000,000 - ₦100,000,000" :
                    preferences.incomeRange === "over-100m" ? "Over ₦100,000,000" :
                    preferences.incomeRange
                  }</strong></li>
                )}
                <li>Preferred Regime: <strong>{preferences.preferredRegime === "2026+" ? "2026+ (Nigeria Tax Act 2025)" : "Pre-2026 (PITA)"}</strong></li>
              </ul>
            </div>
            <button
              onClick={handleComplete}
              className="btn-primary"
              style={{
                padding: "16px 32px",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              Get Started →
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container" style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 20px" }}>
      <div className="card" style={{ padding: "40px" }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            marginBottom: "8px",
            fontSize: "14px",
            color: "#6b7280",
          }}>
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div style={{
            height: "8px",
            backgroundColor: "#e5e7eb",
            borderRadius: "4px",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${(currentStep / totalSteps) * 100}%`,
              backgroundColor: "#0f766e",
              transition: "width 0.3s ease",
            }} />
          </div>
        </div>

        {/* Step Content */}
        <div style={{ minHeight: "400px" }}>
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          marginTop: "32px",
          paddingTop: "24px",
          borderTop: "1px solid #e5e7eb",
        }}>
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            style={{
              padding: "12px 24px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              backgroundColor: currentStep === 1 ? "#f3f4f6" : "white",
              color: currentStep === 1 ? "#9ca3af" : "#374151",
              cursor: currentStep === 1 ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            ← Back
          </button>
          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="btn-primary"
              style={{
                padding: "12px 24px",
                fontWeight: 600,
                opacity: canProceed() ? 1 : 0.5,
                cursor: canProceed() ? "pointer" : "not-allowed",
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="btn-primary"
              style={{
                padding: "12px 24px",
                fontWeight: 600,
              }}
            >
              Complete Setup →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

