import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import { calculatePITWithBreakdown } from "../utils/tax";
import { calculatePAYEPre2026, calculateCRA } from "../utils/payeLegacy";
import { PIT_BANDS_2025 } from "../utils/constants";
import { getUserStorageKey, getUserData, setUserData } from "../utils/storage";
import ShareTaxResults from "../components/ShareTaxResults";
import TaxAlerts from "../components/TaxAlerts";
import ScenarioManager from "../components/ScenarioManager";
import UserProfileModal from "../components/UserProfileModal";

/* ================= HELPERS ================= */

function classifyCompany(turnover) {
  if (turnover <= 25_000_000) return { size: "Small Company", rate: 0 };
  if (turnover <= 100_000_000) return { size: "Medium Company", rate: 0.2 };
  return { size: "Large Company", rate: 0.3 };
}

// Export helper functions
function exportToCSV(headers, rows, filename) {
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(field => `"${String(field)}"`).join(","))
  ].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function exportToPDF(title, content, filename) {
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #0f766e; color: white; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .summary { margin-top: 20px; padding: 15px; background-color: #e6f6f4; border-radius: 6px; }
          .footer { margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        ${content}
        <div class="footer">
          Generated on ${new Date().toLocaleString()}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

function nextMonthDate(day) {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    Math.min(day, 28)
  ).toLocaleDateString();
}

function nextYearDate(month, day) {
  const now = new Date();
  return new Date(
    now.getFullYear() + 1,
    month,
    Math.min(day, 28)
  ).toLocaleDateString();
}

/* ================= STORAGE ================= */

const STORAGE_KEY_BASE = "llc_tax_data_ui_v1";
const STORAGE_KEY_PREFERENCES = "user_preferences";
const STORAGE_KEY_USER_PROFILE = "user_company_profile";

/* ================= MAIN ================= */

export default function LLC() {
  // User profile state
  const [userProfile, setUserProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [turnover, setTurnover] = useState("");
  const [expenses, setExpenses] = useState("");

  const [monthlySales, setMonthlySales] = useState("");
  const [monthlyPurchases, setMonthlyPurchases] = useState("");

  const [employees, setEmployees] = useState([{ name: "", salary: "" }]);
  const [selectedEmployeeIndex, setSelectedEmployeeIndex] = useState(0);
  const [payeView, setPayeView] = useState("monthly");
  
  // Load PAYE regime from onboarding preferences or default to 2026+
  const [payeRegime, setPayeRegime] = useState(() => {
    const preferences = getUserData(STORAGE_KEY_PREFERENCES, null);
    return preferences?.preferredRegime || "2026+";
  });

  const [vendors, setVendors] = useState([
    { name: "", type: "individual", amount: "" },
  ]);

  /* ---------- LOAD / SAVE ---------- */
  useEffect(() => {
    // Load user profile
    const profileKey = getUserStorageKey(STORAGE_KEY_USER_PROFILE);
    const savedProfile = localStorage.getItem(profileKey);
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setUserProfile(profile);
      } catch (e) {
        console.error("Error loading user profile:", e);
      }
    }
    // Note: Modal will be shown when user clicks edit or when they first visit
    // We check if profile exists in the component logic

    const STORAGE_KEY = getUserStorageKey(STORAGE_KEY_BASE);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
    const d = JSON.parse(saved);
    setTurnover(d.turnover || "");
    setExpenses(d.expenses || "");
    setMonthlySales(d.monthlySales || "");
    setMonthlyPurchases(d.monthlyPurchases || "");
    setEmployees(d.employees || [{ name: "", salary: "" }]);
    setVendors(d.vendors || [{ name: "", type: "individual", amount: "" }]);
      setPayeRegime(d.payeRegime || "2026+"); // Load PAYE regime, default to 2026+
      setPayeView(d.payeView || "monthly"); // Load PAYE view preference
      // Don't restore selectedEmployeeIndex - let user select fresh each time
    }

    // Load total expenses from Expense Tracking
    const expenseTrackingKey = getUserStorageKey("expense_tracking_data_v1");
    const expenseTrackingData = localStorage.getItem(expenseTrackingKey);
    if (expenseTrackingData) {
      try {
        const expenses = JSON.parse(expenseTrackingData);
        if (Array.isArray(expenses) && expenses.length > 0) {
          const totalExpenses = expenses.reduce((sum, exp) => {
            const amount = parseFloat(exp.amountAfterVat || exp.amount || 0);
            return sum + amount;
          }, 0);
          
          // Only auto-populate if expenses field is empty
          if (!saved || !JSON.parse(saved).expenses) {
            setExpenses(totalExpenses.toString());
          }
        }
      } catch (e) {
        console.error("Error loading expense tracking data:", e);
      }
    }
  }, []);

  useEffect(() => {
    const STORAGE_KEY = getUserStorageKey(STORAGE_KEY_BASE);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        turnover,
        expenses,
        monthlySales,
        monthlyPurchases,
        employees,
        vendors,
        payeRegime, // Save PAYE regime
        payeView, // Save PAYE view preference
      })
    );
  }, [turnover, expenses, monthlySales, monthlyPurchases, employees, vendors, payeRegime, payeView]);

  /* ---------- CALCULATIONS ---------- */

  const annualTurnover = Number(turnover) || 0;
  const annualExpenses = Number(expenses) || 0;
  const profit = Math.max(annualTurnover - annualExpenses, 0);

  const company = classifyCompany(annualTurnover);
  const citPayable = profit * company.rate;
  
  // Education Tax (EDT) - 2.5% of assessable profits
  // Applies only to Medium (₦50m-₦100m) and Large (>₦100m) companies
  // Small companies (≤₦50m) are exempt
  const EDT_RATE = 0.025; // 2.5%
  const isEDTApplicable = annualTurnover > 50_000_000; // Medium or Large company
  const edtPayable = isEDTApplicable ? profit * EDT_RATE : 0;
  const totalCompanyTax = citPayable + edtPayable;

  const VAT_RATE = 0.075;
  const outputVAT = (Number(monthlySales) || 0) * VAT_RATE;
  const inputVAT = (Number(monthlyPurchases) || 0) * VAT_RATE;
  const vatPayable = outputVAT - inputVAT;

  const totalPAYE = employees.reduce((sum, e) => {
    const annual = (Number(e.salary) || 0) * 12;
    if (annual <= 0) return sum;
    // Use the selected PAYE regime for compliance calculations
    const tax = payeRegime === "pre-2026" 
      ? calculatePAYEPre2026(annual).totalTax 
      : calculatePITWithBreakdown(annual).totalTax;
    return sum + tax / 12;
  }, 0);

  const totalWHT = vendors.reduce((sum, v) => {
    const amt = Number(v.amount) || 0;
    const rate = v.type === "company" ? 0.1 : 0.05;
    return sum + amt * rate;
  }, 0);

  const complianceCalendar = [
    { tax: "VAT", amount: vatPayable, due: nextMonthDate(21) },
    { tax: "PAYE", amount: totalPAYE, due: nextMonthDate(10) },
    { tax: "WHT", amount: totalWHT, due: nextMonthDate(21) },
    { tax: "CIT", amount: citPayable, due: nextYearDate(11, 31) },
  ];

  /* ================= DASHBOARD ================= */

  const handleSaveProfile = (profileData) => {
    const profile = {
      name: profileData.name,
      companyName: profileData.companyName,
      additionalInfo: profileData.additionalInfo || "",
      updatedAt: Date.now(),
    };
    setUserProfile(profile);
    const profileKey = getUserStorageKey(STORAGE_KEY_USER_PROFILE);
    localStorage.setItem(profileKey, JSON.stringify(profile));
  };

  const handleEditUser = () => {
    // If no profile exists, show welcome message
    if (!userProfile) {
      // You could show a toast here suggesting they set up their profile
    }
    setShowProfileModal(true);
  };

  const user = {
    name: userProfile?.name || "Not Set",
    idLabel: "Company",
    idValue: userProfile?.companyName || "Not Set",
  };

  const menuItems = [
    { key: "CIT", label: "CIT" },
    { key: "VAT", label: "VAT" },
    { key: "PAYE", label: "PAYE" },
    { key: "WHT", label: "WHT" },
    { key: "COMPLIANCE", label: "Compliance Calendar" },
  ];

  const renderContent = (active) => {
    /* ================= PAYE ================= */
    if (active === "PAYE") {
      const emp = employees[selectedEmployeeIndex] || {};
      const annual = (Number(emp.salary) || 0) * 12;
      
      // Calculate PAYE based on selected regime
      let payeResult = null;
      let cra = null;
      
      if (annual > 0) {
        if (payeRegime === "pre-2026") {
          // Pre-2026: Use legacy PITA calculation with CRA
          payeResult = calculatePAYEPre2026(annual);
          cra = payeResult.cra;
        } else {
          // 2026+: Use new Nigeria Tax Act 2025 (no CRA, ₦800,000 tax-free band)
          payeResult = calculatePITWithBreakdown(annual);
          cra = null; // No CRA in 2026+
        }
      }

      return (
        <div className="paye-layout" style={{ display: "grid", gridTemplateColumns: "350px 280px 1fr", gap: 24 }}>
          {/* Left Column - Employee Input Form */}
          <div className="card">
            <h3 style={{ color: "var(--text-main)", transition: "color 0.3s ease" }}>PAYE (Employees)</h3>

            {/* Legal Notice */}
            <div style={{
              backgroundColor: "var(--bg-warning-soft)",
              border: "1px solid var(--border-warning)",
              borderRadius: "6px",
              padding: "14px",
              marginBottom: "16px",
              fontSize: "12px",
              color: "var(--text-warning)",
              lineHeight: "1.6",
              transition: "background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease",
            }}>
              <div style={{ fontWeight: 600, marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>⚠️</span>
                <span>Legal Notice: Tax Regime Change</span>
              </div>
              <div>
                From <strong>1 January 2026</strong>, the Consolidated Relief Allowance (CRA) is no longer recognised under the Nigeria Tax Act, 2025. Employers should apply the <strong>₦800,000 tax-free band</strong> (0% rate on first ₦800,000) instead of CRA.
              </div>
            </div>

            {/* PAYE Tax Regime Toggle */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                PAYE Tax Regime
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  padding: "10px", 
                  border: payeRegime === "pre-2026" ? "2px solid var(--primary)" : "1px solid var(--border)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  backgroundColor: payeRegime === "pre-2026" ? "var(--primary-soft)" : "var(--bg-card)",
                  transition: "all 0.2s",
                }}>
                  <input
                    type="radio"
                    name="payeRegime"
                    value="pre-2026"
                    checked={payeRegime === "pre-2026"}
                    onChange={(e) => {
                      // Check if current date is after 2026 and warn user
                      const currentYear = new Date().getFullYear();
                      if (currentYear >= 2026) {
                        const confirm = window.confirm(
                          "⚠️ Warning: You are selecting Pre-2026 (PITA) regime, but the current year is " + currentYear + ".\n\n" +
                          "From 1 January 2026, the Consolidated Relief Allowance (CRA) is no longer recognised under the Nigeria Tax Act, 2025.\n\n" +
                          "Are you sure you want to use the Pre-2026 regime?"
                        );
                        if (!confirm) {
                          return; // Don't change if user cancels
                        }
                      }
                      setPayeRegime(e.target.value);
                    }}
                    style={{ marginRight: "8px" }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-main)", transition: "color 0.3s ease" }}>Pre-2026 (PITA – CRA applies)</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", transition: "color 0.3s ease" }}>
              CRA = ₦200,000 + 20% of gross income
                    </div>
                  </div>
                </label>
                
                <label style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  padding: "10px", 
                  border: payeRegime === "2026+" ? "2px solid var(--primary)" : "1px solid var(--border)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  backgroundColor: payeRegime === "2026+" ? "var(--primary-soft)" : "var(--bg-card)",
                  transition: "all 0.2s",
                }}>
                  <input
                    type="radio"
                    name="payeRegime"
                    value="2026+"
                    checked={payeRegime === "2026+"}
                    onChange={(e) => setPayeRegime(e.target.value)}
                    style={{ marginRight: "8px" }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-main)", transition: "color 0.3s ease" }}>2026+ (Nigeria Tax Act 2025)</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", transition: "color 0.3s ease" }}>
                      Tax-Free Band: ₦800,000 (No CRA)
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={() =>
                setPayeView(payeView === "monthly" ? "annual" : "monthly")
              }
                  style={{
                width: "100%",
                marginBottom: "16px",
                padding: "10px",
                backgroundColor: "var(--bg-soft)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
                color: "var(--text-main)",
                transition: "background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease",
              }}
            >
              🔄 Toggle to {payeView === "monthly" ? "Annual" : "Monthly"} View
            </button>

            {selectedEmployeeIndex !== null && employees[selectedEmployeeIndex] && (
              <div style={{
                backgroundColor: "var(--bg-soft)",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
                border: "2px solid var(--primary)",
                transition: "background-color 0.3s ease, border-color 0.3s ease",
              }}>
                <h4 style={{ marginTop: 0, marginBottom: "12px", fontSize: "14px", color: "var(--primary)", transition: "color 0.3s ease" }}>
                  Edit Employee #{selectedEmployeeIndex + 1}
                </h4>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                    Employee Name
                  </label>
                  <input
                    placeholder="Employee Name"
                    value={employees[selectedEmployeeIndex].name}
                    onChange={(ev) => {
                      const c = [...employees];
                      c[selectedEmployeeIndex].name = ev.target.value;
                      setEmployees(c);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "14px",
                      backgroundColor: "var(--bg-card)",
                      color: "var(--text-main)",
                      transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                    Monthly Salary (₦)
                  </label>
                  <input
                    placeholder="Monthly Salary (₦)"
                    value={employees[selectedEmployeeIndex].salary}
                    onChange={(ev) => {
                      const c = [...employees];
                      c[selectedEmployeeIndex].salary = ev.target.value;
                      setEmployees(c);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "14px",
                      backgroundColor: "var(--bg-card)",
                      color: "var(--text-main)",
                      transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                    }}
                  />
                </div>

                <button
                  onClick={() => setSelectedEmployeeIndex(null)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  Cancel Edit
                </button>
              </div>
            )}

            {selectedEmployeeIndex === null && (
              <button
                onClick={() => {
                  const newIndex = employees.length;
                  setEmployees([...employees, { name: "", salary: "" }]);
                  setSelectedEmployeeIndex(newIndex);
                }}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontWeight: 600,
                }}
              >
                ➕ Add New Employee
              </button>
            )}
          </div>

          {/* Middle Column - Employee List */}
          <div className="card" style={{ maxHeight: "600px", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ marginTop: 0, marginBottom: 0, color: "var(--text-main)", transition: "color 0.3s ease" }}>Employee List</h3>
              {employees.length > 0 && (
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", transition: "color 0.3s ease" }}>
                  {employees.length} employee{employees.length !== 1 ? 's' : ''} saved
                </span>
              )}
            </div>
            
            {employees.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", transition: "color 0.3s ease" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>👥</div>
                <p style={{ fontSize: "14px", color: "var(--text-main)", transition: "color 0.3s ease" }}>No employees added yet</p>
                <p style={{ fontSize: "12px", marginTop: "4px", color: "var(--text-muted)", transition: "color 0.3s ease" }}>Add your first employee using the form on the left</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {employees.map((e, i) => {
                  const ann = (Number(e.salary) || 0) * 12;
                  // Calculate PAYE based on selected regime
                  let tax = 0;
                  if (ann > 0) {
                    if (payeRegime === "pre-2026") {
                      tax = calculatePAYEPre2026(ann).totalTax;
                    } else {
                      tax = calculatePITWithBreakdown(ann).totalTax;
                    }
                  }
                  const display = payeView === "monthly" ? tax / 12 : tax;
                  const isSelected = i === selectedEmployeeIndex;

                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedEmployeeIndex(i)}
                      style={{
                        padding: "12px",
                        backgroundColor: isSelected ? "var(--primary-soft)" : "var(--bg-soft)",
                        border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = "var(--bg-card)";
                          e.currentTarget.style.borderColor = "var(--border)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = "var(--bg-soft)";
                          e.currentTarget.style.borderColor = "var(--border)";
                        }
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 600, fontSize: "14px", color: isSelected ? "var(--primary)" : "var(--text-main)", transition: "color 0.3s ease" }}>
                          #{i + 1}. {e.name || "Unnamed Employee"}
                        </span>
                        {isSelected && <span style={{ fontSize: "12px", color: "var(--primary)", transition: "color 0.3s ease" }}>✓</span>}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", transition: "color 0.3s ease" }}>
                        Salary: ₦{Number(e.salary || 0).toLocaleString()}/month
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--primary)", transition: "color 0.3s ease" }}>
                        {payeView === "monthly" ? "Monthly" : "Annual"} PAYE: ₦{Number(display || 0).toLocaleString()}
                      </div>
                </div>
              );
            })}
              </div>
            )}
          </div>

          {/* Right Column - PAYE Overview */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ marginTop: 0, marginBottom: 0, color: "var(--text-main)", transition: "color 0.3s ease" }}>PAYE Overview</h3>
              {employees.length > 0 && (
                <div style={{ display: "flex", gap: "8px" }}>
            <button
                    onClick={() => {
                      // Export PAYE Schedule to CSV
                      const headers = [
                        "Employee Name",
                        "Monthly Salary (₦)",
                        "Annual Income (₦)",
                        "Tax Regime",
                        payeRegime === "pre-2026" ? "CRA (₦)" : "Tax-Free Band (₦)",
                        "Annual PAYE (₦)",
                        "Monthly PAYE (₦)",
                      ];
                      
                      const rows = employees.map((emp) => {
                        const ann = (Number(emp.salary) || 0) * 12;
                        let payeCalc = null;
                        let cra = null;
                        let taxFreeBand = null;
                        
                        if (ann > 0) {
                          if (payeRegime === "pre-2026") {
                            payeCalc = calculatePAYEPre2026(ann);
                            cra = payeCalc.cra;
                          } else {
                            payeCalc = calculatePITWithBreakdown(ann);
                            taxFreeBand = 800000;
                          }
                        }
                        
                        return [
                          emp.name || "Unnamed",
                          Number(emp.salary || 0).toLocaleString(),
                          ann.toLocaleString(),
                          payeRegime === "pre-2026" ? "Pre-2026 (PITA)" : "2026+ (Nigeria Tax Act 2025)",
                          payeRegime === "pre-2026" 
                            ? (cra ? cra.toLocaleString() : "0")
                            : (taxFreeBand ? taxFreeBand.toLocaleString() : "0"),
                          payeCalc ? Math.round(payeCalc.totalTax).toLocaleString() : "0",
                          payeCalc ? Math.round(payeCalc.totalTax / 12).toLocaleString() : "0",
                        ];
                      });
                      
                      exportToCSV(headers, rows, `PAYE_Schedule_${payeRegime === "pre-2026" ? "Pre2026" : "2026+"}_${new Date().toISOString().split('T')[0]}.csv`);
                    }}
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
                    📥 CSV
            </button>
                  <button
                    onClick={() => {
                      // Export PAYE Schedule to PDF
                      const regimeLabel = payeRegime === "pre-2026" ? "Pre-2026 (PITA)" : "2026+ (Nigeria Tax Act 2025)";
                      let tableRows = employees.map((emp) => {
                        const ann = (Number(emp.salary) || 0) * 12;
                        let payeCalc = null;
                        let allowance = null;
                        
                        if (ann > 0) {
                          if (payeRegime === "pre-2026") {
                            payeCalc = calculatePAYEPre2026(ann);
                            allowance = payeCalc.cra;
                          } else {
                            payeCalc = calculatePITWithBreakdown(ann);
                            allowance = 800000;
                          }
                        }
                        
                        return `
                          <tr>
                            <td>${emp.name || "Unnamed"}</td>
                            <td>₦${Number(emp.salary || 0).toLocaleString()}</td>
                            <td>₦${ann.toLocaleString()}</td>
                            <td>${regimeLabel}</td>
                            <td>₦${allowance ? allowance.toLocaleString() : "0"}</td>
                            <td>₦${payeCalc ? Math.round(payeCalc.totalTax).toLocaleString() : "0"}</td>
                            <td>₦${payeCalc ? Math.round(payeCalc.totalTax / 12).toLocaleString() : "0"}</td>
                          </tr>
                        `;
                      }).join("");
                      
                      const content = `
                        <h1>PAYE Schedule</h1>
                        <p><strong>Tax Regime:</strong> ${regimeLabel}</p>
                        <table>
                          <thead>
                            <tr>
                              <th>Employee Name</th>
                              <th>Monthly Salary (₦)</th>
                              <th>Annual Income (₦)</th>
                              <th>Tax Regime</th>
                              <th>${payeRegime === "pre-2026" ? "CRA (₦)" : "Tax-Free Band (₦)"}</th>
                              <th>Annual PAYE (₦)</th>
                              <th>Monthly PAYE (₦)</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${tableRows}
                          </tbody>
                        </table>
                      `;
                      
                      exportToPDF("PAYE Schedule", content, `PAYE_Schedule_${payeRegime === "pre-2026" ? "Pre2026" : "2026+"}_${new Date().toISOString().split('T')[0]}.pdf`);
                    }}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    📄 PDF
                  </button>
                </div>
              )}
            </div>
            {!payeResult || selectedEmployeeIndex === null ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", transition: "color 0.3s ease" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
                <p style={{ fontSize: "14px", color: "var(--text-main)", transition: "color 0.3s ease" }}>Select an employee from the list to view details</p>
              </div>
            ) : (
              <div style={{ lineHeight: "2", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                <div style={{ 
                  backgroundColor: "var(--bg-soft)", 
                  padding: "16px", 
                  borderRadius: "8px", 
                  marginBottom: "16px",
                  border: "1px solid var(--border)",
                  transition: "background-color 0.3s ease, border-color 0.3s ease",
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: "12px", color: "var(--primary)", fontSize: "16px", transition: "color 0.3s ease" }}>
                    Employee Information
                  </h4>
                  <div style={{ fontSize: "15px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", transition: "border-color 0.3s ease" }}>
                      <span style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>Employee:</span>
                      <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>{emp.name || "Unnamed"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", transition: "border-color 0.3s ease" }}>
                      <span style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>Monthly Salary:</span>
                      <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>₦{Number(emp.salary || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                      <span style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>Annual Income:</span>
                      <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>₦{annual.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Show CRA only for Pre-2026 */}
                {payeRegime === "pre-2026" && cra && (
                  <div style={{ 
                    backgroundColor: "var(--primary-soft)", 
                    padding: "16px", 
                    borderRadius: "8px", 
                    marginBottom: "16px",
                    border: "1px solid var(--primary)",
                    transition: "background-color 0.3s ease, border-color 0.3s ease",
                  }}>
                    <h4 style={{ marginTop: 0, marginBottom: "12px", color: "var(--primary)", fontSize: "16px", transition: "color 0.3s ease" }}>
                      Consolidated Relief Allowance (CRA)
                      <span 
                        title="CRA was applicable under PITA (Pre-2026). From 1 January 2026, CRA is replaced by the ₦800,000 tax-free band under the Nigeria Tax Act 2025."
                        style={{
                          marginLeft: "8px",
                          cursor: "help",
                          fontSize: "14px",
                          color: "var(--primary)",
                          display: "inline-block",
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: "var(--primary)",
                          color: "white",
                          textAlign: "center",
                          lineHeight: "18px",
                          fontWeight: "bold",
                          transition: "background-color 0.3s ease",
                        }}
                      >
                        ?
                      </span>
                    </h4>
                    <div style={{ fontSize: "15px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--primary)", transition: "border-color 0.3s ease" }}>
                        <span style={{ color: "var(--text-main)", transition: "color 0.3s ease" }}>CRA Amount:</span>
                        <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>₦{cra.toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px", padding: "8px", backgroundColor: "var(--bg-soft)", borderRadius: "6px", lineHeight: "1.5", border: "1px solid var(--border)", transition: "color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease" }}>
                        <strong style={{ color: "var(--text-main)", transition: "color 0.3s ease" }}>Formula:</strong> ₦200,000 + (20% × Annual Gross Income)
                        <br />
                        <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                          ₦200,000 + (20% × ₦{annual.toLocaleString()}) = ₦{cra.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show Tax-Free Band only for 2026+ */}
                {payeRegime === "2026+" && (
                  <div style={{ 
                    backgroundColor: "var(--primary-soft)", 
                    padding: "16px", 
                    borderRadius: "8px", 
                    marginBottom: "16px",
                    border: "1px solid var(--primary)",
                    transition: "background-color 0.3s ease, border-color 0.3s ease",
                  }}>
                    <h4 style={{ marginTop: 0, marginBottom: "12px", color: "var(--primary)", fontSize: "16px", transition: "color 0.3s ease" }}>
                      Tax-Free Band
                      <span 
                        title="The ₦800,000 tax-free band is NOT a deduction. It is the first ₦800,000 of chargeable income that is taxed at 0% rate. This replaces the old CRA system."
                        style={{
                          marginLeft: "8px",
                          cursor: "help",
                          fontSize: "14px",
                          color: "var(--primary)",
                          display: "inline-block",
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: "var(--primary)",
                          color: "white",
                          textAlign: "center",
                          lineHeight: "18px",
                          fontWeight: "bold",
                          transition: "background-color 0.3s ease",
                        }}
                      >
                        ?
                      </span>
                    </h4>
                    <div style={{ fontSize: "15px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                        <span style={{ color: "var(--text-main)", transition: "color 0.3s ease" }}>Tax-Free Band:</span>
                        <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>₦800,000</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", fontStyle: "italic", transition: "color 0.3s ease" }}>
                        First ₦800,000 of chargeable income is taxed at 0% (tax-free band)
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px", padding: "10px", backgroundColor: "var(--bg-soft)", borderRadius: "6px", lineHeight: "1.5", border: "1px solid var(--border)", transition: "color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease" }}>
                        <strong style={{ color: "var(--text-main)", transition: "color 0.3s ease" }}>Legal Note:</strong> The ₦800,000 tax-free band is not a deduction or relief. Under the Nigeria Tax Act 2025, the first ₦800,000 of chargeable income is subject to a 0% tax rate. This replaces the previous Consolidated Relief Allowance (CRA) system.
                      </div>
                    </div>
                  </div>
                )}

                {/* Tax Breakdown */}
                {payeResult.breakdown && payeResult.breakdown.length > 0 && (
                  <div style={{
                    backgroundColor: "var(--bg-soft)",
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    border: "1px solid var(--border)",
                    transition: "background-color 0.3s ease, border-color 0.3s ease",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <h4 style={{ marginTop: 0, marginBottom: 0, color: "var(--primary)", fontSize: "16px", transition: "color 0.3s ease" }}>
                        📊 Progressive Tax Breakdown
                      </h4>
                      <span 
                        title={payeRegime === "pre-2026" 
                          ? "PITA (Pre-2026) progressive tax bands: First ₦300k @ 7%, Next ₦300k @ 11%, Next ₦500k @ 15%, Next ₦500k @ 19%, Next ₦1.6m @ 21%, Remainder @ 24%"
                          : "Nigeria Tax Act 2025 progressive tax bands: First ₦800k @ 0% (tax-free), Next ₦2.2m @ 15%, Next ₦9m @ 18%, Next ₦13m @ 21%, Next ₦25m @ 23%, Above ₦50m @ 25%"}
                        style={{
                          cursor: "help",
                          fontSize: "14px",
                          color: "var(--primary)",
                          display: "inline-block",
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: "var(--primary)",
                          color: "white",
                          textAlign: "center",
                          lineHeight: "18px",
                          fontWeight: "bold",
                          transition: "background-color 0.3s ease",
                        }}
                      >
                        ?
                      </span>
                    </div>
                    <div style={{ fontSize: "13px" }}>
                      {payeResult.breakdown.map((band, idx) => (
                        <div key={idx} style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          padding: "8px 0",
                          borderBottom: idx < payeResult.breakdown.length - 1 ? "1px solid var(--border)" : "none",
                          transition: "border-color 0.3s ease",
                        }}>
                          <span style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>{band.label}:</span>
                          <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>
                            ₦{band.taxableAmount.toLocaleString()} × {(band.rate * 100).toFixed(0)}% = ₦{Math.round(band.taxForBand).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ 
                  backgroundColor: "var(--bg-soft)", 
                  padding: "18px", 
                  borderRadius: "8px",
                  border: "2px solid var(--primary)",
                  transition: "background-color 0.3s ease, border-color 0.3s ease",
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: "14px", color: "var(--primary)", fontSize: "17px", fontWeight: 700, transition: "color 0.3s ease" }}>
                    PAYE Tax Summary
                  </h4>
                  <div style={{ fontSize: "15px", lineHeight: "1.8", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                    {payeRegime === "pre-2026" && (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", transition: "border-color 0.3s ease" }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 500, transition: "color 0.3s ease" }}>Chargeable Income (after CRA):</span>
                        <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>₦{payeResult.chargeableIncome.toLocaleString()}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", transition: "border-color 0.3s ease" }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: 500, transition: "color 0.3s ease" }}>Annual PAYE:</span>
                      <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: "17px", transition: "color 0.3s ease" }}>₦{Math.round(payeResult.totalTax).toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: 500, transition: "color 0.3s ease" }}>Monthly PAYE:</span>
                      <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: "17px", transition: "color 0.3s ease" }}>₦{Math.round(payeResult.totalTax / 12).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Tax Alerts */}
                <TaxAlerts
                  taxType="PAYE"
                  inputs={{
                    annualIncome: annual,
                    monthlySalary: Number(emp.salary || 0),
                  }}
                  outputs={{
                    totalTax: Math.round(payeResult.totalTax),
                    annualPAYE: Math.round(payeResult.totalTax),
                  }}
                  regime={payeRegime}
                />

                {/* Scenario Manager */}
                <ScenarioManager
                  taxType="PAYE"
                  inputs={{
                    "Employee Name": emp.name || "Unnamed",
                    "Monthly Salary": Number(emp.salary || 0),
                    "Annual Income": annual,
                  }}
                  outputs={{
                    "Annual PAYE": Math.round(payeResult.totalTax),
                    "Monthly PAYE": Math.round(payeResult.totalTax / 12),
                    ...(payeRegime === "pre-2026" && { "CRA": payeResult.cra }),
                  }}
                  regime={payeRegime}
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    /* ================= WHT ================= */
    if (active === "WHT") {
      return (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ marginTop: 0, marginBottom: 0, color: "var(--text-main)", transition: "color 0.3s ease" }}>Withholding Tax (WHT)</h3>
            {vendors.length > 0 && totalWHT > 0 && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => {
                    const headers = ["Vendor Name", "Type", "WHT Rate (%)", "Amount Paid (₦)", "WHT Withheld (₦)"];
                    const rows = vendors.map((v) => {
                      const amt = Number(v.amount) || 0;
                      const rate = v.type === "company" ? 0.1 : 0.05;
                      const wht = amt * rate;
                      return [
                        v.name || "Unnamed",
                        v.type === "company" ? "Company" : "Individual",
                        (rate * 100).toFixed(0),
                        amt.toLocaleString(),
                        wht.toLocaleString(),
                      ];
                    });
                    exportToCSV(headers, rows, `WHT_Schedule_${new Date().toISOString().split('T')[0]}.csv`);
                  }}
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
                  📥 CSV
                </button>
                <button
                  onClick={() => {
                    let tableRows = vendors.map((v) => {
                      const amt = Number(v.amount) || 0;
                      const rate = v.type === "company" ? 0.1 : 0.05;
                      const wht = amt * rate;
                      return `
                        <tr>
                          <td>${v.name || "Unnamed"}</td>
                          <td>${v.type === "company" ? "Company" : "Individual"}</td>
                          <td>${(rate * 100).toFixed(0)}%</td>
                          <td>₦${amt.toLocaleString()}</td>
                          <td>₦${wht.toLocaleString()}</td>
                        </tr>
                      `;
                    }).join("");
                    
                    const content = `
                      <h1>Withholding Tax (WHT) Schedule</h1>
                      <table>
                        <thead>
                          <tr>
                            <th>Vendor Name</th>
                            <th>Type</th>
                            <th>WHT Rate (%)</th>
                            <th>Amount Paid (₦)</th>
                            <th>WHT Withheld (₦)</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${tableRows}
                        </tbody>
                      </table>
                      <div class="summary">
                        <p><strong>Total WHT Payable:</strong> ₦${totalWHT.toLocaleString()}</p>
                      </div>
                    `;
                    exportToPDF("WHT Schedule", content, `WHT_Schedule_${new Date().toISOString().split('T')[0]}.pdf`);
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  📄 PDF
                </button>
              </div>
            )}
          </div>

          {/* WHT Educational Note */}
          <div style={{
            backgroundColor: "var(--bg-info-soft)",
            border: "1px solid var(--border-info)",
            borderRadius: "6px",
            padding: "14px",
            marginBottom: "20px",
            fontSize: "13px",
            color: "var(--text-info)",
            lineHeight: "1.6",
            transition: "background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease",
          }}>
            <div style={{ fontWeight: 600, marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>ℹ️</span>
              <span>WHT Credit Information</span>
            </div>
            <div>
              Withholding Tax (WHT) is an advance tax payment. It is generally <strong>creditable</strong> against the recipient's final income tax liability. WHT is not a final tax (except for dividends, which are subject to final WHT).
            </div>
          </div>

          {/* Tax Alerts */}
          {totalWHT > 0 && (
            <TaxAlerts
              taxType="WHT"
              inputs={{
                totalVendors: vendors.length,
              }}
              outputs={{
                totalWHT,
              }}
              regime="2026+"
            />
          )}

          {/* Share and Scenario Manager */}
          {totalWHT > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                <ShareTaxResults
                  taxType="WHT"
                  inputs={{
                    "Number of Vendors": vendors.length,
                  }}
                  outputs={{
                    "Total WHT Withheld": totalWHT,
                  }}
                  regime="2026+"
                />
              </div>
              <ScenarioManager
                taxType="WHT"
                inputs={{
                  "Number of Vendors": vendors.length,
                }}
                outputs={{
                  "Total WHT Withheld": totalWHT,
                }}
                regime="2026+"
              />
            </>
          )}

          {vendors.map((v, i) => {
            const amt = Number(v.amount) || 0;
            const rate = v.type === "company" ? 0.1 : 0.05;
            const wht = amt * rate;

            return (
              <div key={i} className="card" style={{ marginTop: i > 0 ? "16px" : "0", marginBottom: "16px" }}>
                <h4 style={{ marginTop: 0, marginBottom: "16px", fontSize: "16px", color: "var(--primary)", transition: "color 0.3s ease" }}>
                  Vendor #{i + 1}
                </h4>
                
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                    Vendor Name
                  </label>
                <input
                    placeholder="Enter vendor name"
                  value={v.name}
                  onChange={(e) => {
                    const c = [...vendors];
                    c[i].name = e.target.value;
                    setVendors(c);
                  }}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "16px",
                      backgroundColor: "var(--bg-card)",
                      color: "var(--text-main)",
                      transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                    Vendor Type
                  </label>
                <select
                  value={v.type}
                  onChange={(e) => {
                    const c = [...vendors];
                    c[i].type = e.target.value;
                    setVendors(c);
                  }}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "16px",
                      backgroundColor: "var(--bg-card)",
                      color: "var(--text-main)",
                      transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                  }}
                >
                  <option value="individual">Individual (5%)</option>
                  <option value="company">Company (10%)</option>
                </select>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                    Amount Paid (₦)
                  </label>
                <input
                    placeholder="Enter amount paid"
                  value={v.amount}
                  onChange={(e) => {
                    const c = [...vendors];
                    c[i].amount = e.target.value;
                    setVendors(c);
                  }}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "16px",
                      backgroundColor: "var(--bg-card)",
                      color: "var(--text-main)",
                      transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                    }}
                  />
                </div>

                {amt > 0 && (
                  <div style={{
                    backgroundColor: "var(--bg-soft)",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}>
                    <div style={{ lineHeight: "2", fontSize: "15px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                        <span style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>Amount Paid:</span>
                        <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>₦{amt.toLocaleString()}</span>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                        <span style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>WHT Rate:</span>
                        <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>{(rate * 100).toFixed(0)}%</span>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "14px", marginTop: "8px", backgroundColor: "var(--primary-soft)", borderRadius: "6px", border: "2px solid var(--primary)" }}>
                        <span style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-main)", transition: "color 0.3s ease" }}>WHT Withheld:</span>
                        <span style={{ fontWeight: 700, fontSize: "16px", color: "var(--primary)", transition: "color 0.3s ease" }}>₦{wht.toLocaleString()}</span>
                      </div>
                      
                      <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "var(--bg-soft)", borderRadius: "6px", fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.6", border: "1px solid var(--border)", transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease" }}>
                        <strong style={{ color: "var(--text-main)", transition: "color 0.3s ease" }}>Calculation Formula:</strong> Amount Paid × WHT Rate = WHT Withheld
                        <br />
                        <span style={{ fontFamily: "monospace", fontSize: "11px", display: "block", marginTop: "4px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                          ₦{amt.toLocaleString()} × {(rate * 100).toFixed(0)}% = ₦{wht.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={() =>
              setVendors([...vendors, { name: "", type: "individual", amount: "" }])
            }
            className="btn-primary"
            style={{
              width: "100%",
              padding: "12px",
              fontWeight: 600,
              marginTop: "16px",
            }}
          >
            ➕ Add Vendor
          </button>

          {vendors.length > 0 && totalWHT > 0 && (
            <div style={{
              marginTop: "24px",
              backgroundColor: "var(--primary-soft)",
              padding: "20px",
              borderRadius: "8px",
              border: "2px solid var(--primary)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "18px", marginBottom: "4px", color: "var(--text-main)", transition: "color 0.3s ease" }}>Total WHT Withheld:</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", transition: "color 0.3s ease" }}>
                    (Creditable against recipient's final tax liability)
                  </div>
                </div>
                <span style={{ fontWeight: 700, fontSize: "20px", color: "var(--primary)", transition: "color 0.3s ease" }}>₦{totalWHT.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    /* ================= CIT ================= */
    if (active === "CIT") {
      return (
        <div className="card">
          <h3 style={{ color: "var(--text-main)", transition: "color 0.3s ease" }}>Company Income Tax</h3>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
              Annual Turnover (₦)
            </label>
          <input
              placeholder="Enter annual turnover"
            value={turnover}
            onChange={(e) => setTurnover(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "16px",
                backgroundColor: "var(--bg-card)",
                color: "var(--text-main)",
                transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
              Allowable Expenses (₦)
            </label>
          <input
              placeholder="Enter allowable expenses"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "16px",
                backgroundColor: "var(--bg-card)",
                color: "var(--text-main)",
                transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
              }}
            />
            <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", transition: "color 0.3s ease" }}>
              💡 This field is automatically synced from Expense Tracking total
            </div>
          </div>

          {annualTurnover > 0 && (
            <div style={{
              backgroundColor: "var(--bg-soft)",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
            }}>
              <h4 style={{ marginTop: 0, marginBottom: "16px", color: "var(--primary)" }}>
                📊 Calculation Breakdown
              </h4>
              
              <div style={{ lineHeight: "2", fontSize: "15px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>Annual Turnover:</span>
                  <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>₦{annualTurnover.toLocaleString()}</span>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>Less: Allowable Expenses:</span>
                  <span style={{ fontWeight: 600, color: "#ef4444" }}>- ₦{annualExpenses.toLocaleString()}</span>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: "2px solid var(--primary)", borderBottom: "2px solid var(--primary)", marginTop: "8px", marginBottom: "8px", transition: "border-color 0.3s ease" }}>
                  <span style={{ fontWeight: 600, fontSize: "16px", color: "var(--text-main)", transition: "color 0.3s ease" }}>Profit (Taxable Income):</span>
                  <span style={{ fontWeight: 700, fontSize: "16px", color: "var(--primary)", transition: "color 0.3s ease" }}>₦{profit.toLocaleString()}</span>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>Company Size:</span>
                  <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>{company.size}</span>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>Tax Rate:</span>
                  <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>{(company.rate * 100).toFixed(0)}%</span>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", marginTop: "8px", backgroundColor: "var(--primary-soft)", borderRadius: "6px", padding: "12px", border: "2px solid var(--primary)", transition: "background-color 0.3s ease, border-color 0.3s ease" }}>
                  <span style={{ fontWeight: 700, fontSize: "18px", color: "var(--text-main)", transition: "color 0.3s ease" }}>Company Income Tax (CIT):</span>
                  <span style={{ fontWeight: 700, fontSize: "18px", color: "var(--primary)", transition: "color 0.3s ease" }}>₦{citPayable.toLocaleString()}</span>
                </div>
                
                {/* Education Tax (EDT) Section */}
                <div style={{ marginTop: "16px", padding: "16px", backgroundColor: "var(--bg-soft)", borderRadius: "8px", border: "1px solid var(--primary)", transition: "background-color 0.3s ease, border-color 0.3s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "16px", color: "var(--text-main)", transition: "color 0.3s ease" }}>Education Tax (EDT):</span>
                      {!isEDTApplicable && (
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "8px", fontStyle: "italic", transition: "color 0.3s ease" }}>
                          (Exempt - Small Company)
                        </span>
                      )}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "18px", color: "var(--primary)", transition: "color 0.3s ease" }}>₦{edtPayable.toLocaleString()}</span>
                  </div>
                  {isEDTApplicable && (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", transition: "color 0.3s ease" }}>
                      <div style={{ fontStyle: "italic", marginBottom: "4px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                        EDT applies to Medium (₦50m-₦100m) and Large (>₦100m) companies only
                      </div>
                      <div style={{ fontFamily: "monospace", backgroundColor: "var(--bg-card)", padding: "6px", borderRadius: "4px", color: "var(--text-main)", border: "1px solid var(--border)", transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease" }}>
                        ₦{profit.toLocaleString()} × 2.5% = ₦{edtPayable.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {!isEDTApplicable && (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", fontStyle: "italic", transition: "color 0.3s ease" }}>
                      Small companies (≤₦50m turnover) are exempt from Education Tax
                    </div>
                  )}
                </div>
                
                {/* Total Company Tax */}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", marginTop: "16px", backgroundColor: "var(--primary)", borderRadius: "6px", padding: "12px", border: "2px solid var(--primary)", transition: "background-color 0.3s ease, border-color 0.3s ease" }}>
                  <span style={{ fontWeight: 700, fontSize: "18px", color: "white", transition: "color 0.3s ease" }}>Total Company Tax (CIT + EDT):</span>
                  <span style={{ fontWeight: 700, fontSize: "18px", color: "white", transition: "color 0.3s ease" }}>₦{totalCompanyTax.toLocaleString()}</span>
                </div>
                
                <div style={{ marginTop: "16px", padding: "14px", backgroundColor: "var(--bg-soft)", borderRadius: "6px", fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6", border: "1px solid var(--border)", transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease" }}>
                  <strong style={{ color: "var(--text-main)", transition: "color 0.3s ease" }}>Calculation Formulas:</strong>
                  <div style={{ marginTop: "8px", fontFamily: "monospace", fontSize: "12px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                    <div style={{ marginBottom: "4px" }}>
                      CIT: ₦{profit.toLocaleString()} × {(company.rate * 100).toFixed(0)}% = ₦{citPayable.toLocaleString()}
                    </div>
                    {isEDTApplicable && (
                      <div style={{ marginBottom: "4px" }}>
                        EDT: ₦{profit.toLocaleString()} × 2.5% = ₦{edtPayable.toLocaleString()}
                      </div>
                    )}
                    <div style={{ marginTop: "6px", fontWeight: 600, paddingTop: "6px", borderTop: "1px solid var(--border)", color: "var(--text-main)", transition: "border-color 0.3s ease, color 0.3s ease" }}>
                      Total Company Tax: ₦{citPayable.toLocaleString()} + ₦{edtPayable.toLocaleString()} = ₦{totalCompanyTax.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tax Alerts */}
          <TaxAlerts
            taxType="CIT"
            inputs={{
              annualTurnover,
              expenses: annualExpenses,
            }}
            outputs={{
              profit,
              citPayable,
              edtPayable,
              totalCompanyTax,
            }}
            regime="2026+"
          />

          {/* Share and Scenario Manager */}
          {annualTurnover > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px", marginTop: "20px" }}>
                <ShareTaxResults
                  taxType="CIT"
                  inputs={{
                    "Annual Turnover": annualTurnover,
                    "Allowable Expenses": annualExpenses,
                  }}
                  outputs={{
                    "Profit": profit,
                    "CIT Payable": citPayable,
                    "EDT Payable": edtPayable,
                    "Total Company Tax": totalCompanyTax,
                  }}
                  regime="2026+"
                />
              </div>
              <ScenarioManager
                taxType="CIT"
                inputs={{
                  "Annual Turnover": annualTurnover,
                  "Allowable Expenses": annualExpenses,
                }}
                outputs={{
                  "Profit": profit,
                  "CIT Payable": citPayable,
                  "EDT Payable": edtPayable,
                  "Total Company Tax": totalCompanyTax,
                }}
                regime="2026+"
              />
            </>
          )}
        </div>
      );
    }

    /* ================= VAT ================= */
    if (active === "VAT") {
      const monthlySalesValue = Number(monthlySales) || 0;
      const monthlyPurchasesValue = Number(monthlyPurchases) || 0;
      
      return (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ marginTop: 0, marginBottom: 0 }}>Value Added Tax (VAT)</h3>
            {(monthlySalesValue > 0 || monthlyPurchasesValue > 0) && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => {
                    const headers = ["Item", "Amount (₦)"];
                    const rows = [
                      ["Monthly Sales", monthlySalesValue.toLocaleString()],
                      ["Output VAT (7.5%)", outputVAT.toLocaleString()],
                      ["Monthly Purchases", monthlyPurchasesValue.toLocaleString()],
                      ["Input VAT (7.5%)", inputVAT.toLocaleString()],
                      ["VAT Payable / Refundable", vatPayable.toLocaleString()],
                    ];
                    exportToCSV(headers, rows, `VAT_Summary_${new Date().toISOString().split('T')[0]}.csv`);
                  }}
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
                  📥 CSV
                </button>
                <button
                  onClick={() => {
                    const content = `
                      <h1>Monthly VAT Summary</h1>
                      <table>
                        <tr>
                          <th>Item</th>
                          <th>Amount (₦)</th>
                        </tr>
                        <tr>
                          <td>Monthly Sales</td>
                          <td>₦${monthlySalesValue.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td>Output VAT (7.5%)</td>
                          <td>₦${outputVAT.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td>Monthly Purchases</td>
                          <td>₦${monthlyPurchasesValue.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td>Input VAT (7.5%)</td>
                          <td>₦${inputVAT.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td><strong>VAT Payable / Refundable</strong></td>
                          <td><strong>₦${vatPayable.toLocaleString()}</strong></td>
                        </tr>
                      </table>
                      <div class="summary">
                        <p><strong>Formula:</strong> Output VAT - Input VAT = VAT Payable</p>
                        <p>₦${outputVAT.toLocaleString()} - ₦${inputVAT.toLocaleString()} = ₦${vatPayable.toLocaleString()}</p>
                      </div>
                    `;
                    exportToPDF("Monthly VAT Summary", content, `VAT_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  📄 PDF
                </button>
              </div>
            )}
          </div>

          {/* VAT Compliance Warning */}
          <div style={{
            backgroundColor: "var(--bg-warning-soft)",
            border: "1px solid var(--border-warning)",
            borderRadius: "6px",
            padding: "14px",
            marginBottom: "20px",
            fontSize: "13px",
            color: "var(--text-warning)",
            lineHeight: "1.6",
            transition: "background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease",
          }}>
            <div style={{ fontWeight: 600, marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>⚠️</span>
              <span>VAT Registration Requirement</span>
            </div>
            <div>
              Businesses with annual turnover of <strong>₦25,000,000 or more</strong> are required to register for VAT and file monthly VAT returns with FIRS, even where VAT payable is zero.
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
              Monthly Sales (₦)
            </label>
          <input
              placeholder="Enter monthly sales"
            value={monthlySales}
            onChange={(e) => setMonthlySales(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "16px",
                backgroundColor: "var(--bg-card)",
                color: "var(--text-main)",
                transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
              Monthly Purchases (₦)
            </label>
          <input
              placeholder="Enter monthly purchases"
            value={monthlyPurchases}
            onChange={(e) => setMonthlyPurchases(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "16px",
                backgroundColor: "var(--bg-card)",
                color: "var(--text-main)",
                transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
              }}
            />
          </div>

          {(monthlySalesValue > 0 || monthlyPurchasesValue > 0) && (
            <div style={{
              backgroundColor: "var(--bg-soft)",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
            }}>
              <h4 style={{ marginTop: 0, marginBottom: "16px", color: "var(--primary)" }}>
                📊 Calculation Breakdown
              </h4>
              
              <div style={{ lineHeight: "2", fontSize: "15px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>Monthly Sales:</span>
                  <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>₦{monthlySalesValue.toLocaleString()}</span>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>VAT Rate:</span>
                  <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>{(VAT_RATE * 100).toFixed(1)}%</span>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: "2px solid var(--primary)", borderBottom: "2px solid var(--primary)", marginTop: "8px", marginBottom: "8px", transition: "border-color 0.3s ease" }}>
                  <span style={{ fontWeight: 600, fontSize: "16px", color: "var(--text-main)", transition: "color 0.3s ease" }}>Output VAT (on Sales):</span>
                  <span style={{ fontWeight: 700, fontSize: "16px", color: "var(--primary)", transition: "color 0.3s ease" }}>₦{outputVAT.toLocaleString()}</span>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", marginTop: "8px" }}>
                  <span style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>Monthly Purchases:</span>
                  <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>₦{monthlyPurchasesValue.toLocaleString()}</span>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>VAT Rate:</span>
                  <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>{(VAT_RATE * 100).toFixed(1)}%</span>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: "2px solid #ef4444", borderBottom: "2px solid #ef4444", marginTop: "8px", marginBottom: "8px", transition: "border-color 0.3s ease" }}>
                  <span style={{ fontWeight: 600, fontSize: "16px", color: "var(--text-main)", transition: "color 0.3s ease" }}>Input VAT (on Purchases):</span>
                  <span style={{ fontWeight: 700, fontSize: "16px", color: "#ef4444" }}>₦{inputVAT.toLocaleString()}</span>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", padding: "14px", marginTop: "8px", backgroundColor: "var(--primary-soft)", borderRadius: "6px", border: "2px solid var(--primary)", transition: "background-color 0.3s ease, border-color 0.3s ease" }}>
                  <span style={{ fontWeight: 700, fontSize: "18px", color: "var(--text-main)", transition: "color 0.3s ease" }}>VAT Payable / Refundable:</span>
                  <span style={{ fontWeight: 700, fontSize: "18px", color: "var(--primary)", transition: "color 0.3s ease" }}>₦{vatPayable.toLocaleString()}</span>
                </div>
                
                <div style={{ marginTop: "16px", padding: "14px", backgroundColor: "var(--bg-soft)", borderRadius: "6px", fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6", border: "1px solid var(--border)", transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease" }}>
                  <strong style={{ color: "var(--text-main)", transition: "color 0.3s ease" }}>Calculation Formula:</strong> Output VAT - Input VAT = VAT Payable
                  <br />
                  <span style={{ fontFamily: "monospace", fontSize: "12px", display: "block", marginTop: "4px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                    ₦{outputVAT.toLocaleString()} - ₦{inputVAT.toLocaleString()} = ₦{vatPayable.toLocaleString()}
                  </span>
                  {vatPayable < 0 && (
                    <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "var(--bg-error-soft)", borderRadius: "6px", color: "var(--text-error)", lineHeight: "1.5", border: "1px solid var(--border-error)", transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease" }}>
                      <strong>Note:</strong> A negative value indicates VAT refundable from FIRS (Input VAT exceeds Output VAT).
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tax Alerts */}
          <TaxAlerts
            taxType="VAT"
            inputs={{
              monthlySales: monthlySalesValue,
              monthlyPurchases: monthlyPurchasesValue,
              annualTurnover: monthlySalesValue * 12,
            }}
            outputs={{
              outputVAT,
              inputVAT,
              vatPayable,
            }}
            regime="2026+"
          />

          {/* Share and Scenario Manager */}
          {(monthlySalesValue > 0 || monthlyPurchasesValue > 0) && (
            <>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px", marginTop: "20px" }}>
                <ShareTaxResults
                  taxType="VAT"
                  inputs={{
                    "Monthly Sales": monthlySalesValue,
                    "Monthly Purchases": monthlyPurchasesValue,
                  }}
                  outputs={{
                    "Output VAT": outputVAT,
                    "Input VAT": inputVAT,
                    "VAT Payable": vatPayable,
                  }}
                  regime="2026+"
                />
              </div>
              <ScenarioManager
                taxType="VAT"
                inputs={{
                  "Monthly Sales": monthlySalesValue,
                  "Monthly Purchases": monthlyPurchasesValue,
                }}
                outputs={{
                  "Output VAT": outputVAT,
                  "Input VAT": inputVAT,
                  "VAT Payable": vatPayable,
                }}
                regime="2026+"
              />
            </>
          )}
        </div>
      );
    }

    /* ================= COMPLIANCE ================= */
    if (active === "COMPLIANCE") {
      return (
        <div className="card">
          <h3 style={{ color: "var(--text-main)", transition: "color 0.3s ease" }}>Compliance Calendar</h3>

          <table style={{ width: "100%", borderCollapse: "collapse", color: "var(--text-main)", transition: "color 0.3s ease" }}>
            <tbody>
              {complianceCalendar.map((c, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)", transition: "border-color 0.3s ease" }}>
                  <td style={{ padding: "8px", color: "var(--text-main)", transition: "color 0.3s ease" }}>{c.tax}</td>
                  <td style={{ padding: "8px", color: "var(--text-main)", transition: "color 0.3s ease" }}>₦{Number(c.amount || 0).toLocaleString()}</td>
                  <td style={{ padding: "8px", color: "var(--text-main)", transition: "color 0.3s ease" }}>{c.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  // Show modal on first visit if no profile exists (only once per session)
  useEffect(() => {
    if (!userProfile && !sessionStorage.getItem("profile_modal_shown")) {
      const timer = setTimeout(() => {
        setShowProfileModal(true);
        sessionStorage.setItem("profile_modal_shown", "true");
      }, 500); // Small delay to let the page load
      return () => clearTimeout(timer);
    }
  }, [userProfile]);

  return (
    <>
      <DashboardLayout
        user={user}
        menuItems={menuItems}
        renderContent={renderContent}
        onEditUser={handleEditUser}
      />
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={handleSaveProfile}
        initialData={userProfile}
      />
    </>
  );
}
