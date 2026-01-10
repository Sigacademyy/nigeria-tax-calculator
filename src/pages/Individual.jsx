import { useState } from "react";
import { calculatePIT2025 } from "../utils/pit";
import { MINIMUM_WAGE_ANNUAL, PIT_BANDS_2025 } from "../utils/constants";
import ShareTaxResults from "../components/ShareTaxResults";
import TaxAlerts from "../components/TaxAlerts";
import ScenarioManager from "../components/ScenarioManager";

export default function Individual() {
  const [mode, setMode] = useState("ANNUAL");
  const [annualIncomeInput, setAnnualIncomeInput] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyBreakdown, setMonthlyBreakdown] = useState(
    Array(12).fill("")
  );

  const [pension, setPension] = useState(0);
  const [nhf, setNhf] = useState(0);
  const [nhis, setNhis] = useState(0);
  const [rentPaid, setRentPaid] = useState(0);
  const [selectedBandIndex, setSelectedBandIndex] = useState(null);

  // -----------------------------
  // Determine Annual Income
  // -----------------------------
  let annualIncome = 0;

  if (mode === "ANNUAL") {
    annualIncome = Number(annualIncomeInput) || 0;
  }

  if (mode === "FIXED_MONTHLY") {
    annualIncome = (Number(monthlyIncome) || 0) * 12;
  }

  if (mode === "VARIABLE_MONTHLY") {
    annualIncome = monthlyBreakdown.reduce(
      (sum, val) => sum + (Number(val) || 0),
      0
    );
  }

  const isMinimumWage =
    annualIncome > 0 && annualIncome <= MINIMUM_WAGE_ANNUAL;

  const pit =
    !isMinimumWage && annualIncome > 0
      ? calculatePIT2025({
          grossIncome: annualIncome,
          pension,
          nhf,
          nhis,
          rentPaid,
        })
      : null;

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // =============================
  // JSX
  // =============================
  return (
    <div className="container">
      <div className="card">
        <h2 style={{ color: "var(--text-main)", transition: "color 0.3s ease" }}>Individual Income Tax (PIT)</h2>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
            Income Type
          </label>
          <select 
            value={mode} 
            onChange={(e) => setMode(e.target.value)}
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
            <option value="ANNUAL">Annual Income</option>
            <option value="FIXED_MONTHLY">Fixed Monthly Income (×12)</option>
            <option value="VARIABLE_MONTHLY">Variable Monthly Income</option>
          </select>
        </div>

        {mode === "ANNUAL" && (
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
              Annual Income (₦)
            </label>
            <input
              type="number"
              placeholder="Enter annual income"
              value={annualIncomeInput}
              onChange={(e) => setAnnualIncomeInput(e.target.value)}
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
        )}

        {mode === "FIXED_MONTHLY" && (
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
              Monthly Income (₦)
            </label>
            <input
              type="number"
              placeholder="Enter monthly income"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
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
            <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-muted)", transition: "color 0.3s ease" }}>
              Annual Income: ₦{(Number(monthlyIncome) * 12 || 0).toLocaleString()}
            </div>
          </div>
        )}

        {mode === "VARIABLE_MONTHLY" && (
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "12px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
              Monthly Income Breakdown (₦)
            </label>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
              gap: "12px" 
            }}>
              {months.map((month, index) => (
                <div key={month}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--text-muted)", transition: "color 0.3s ease" }}>
                    {month}
                  </label>
                  <input
                    type="number"
                    value={monthlyBreakdown[index]}
                    onChange={(e) => {
                      const copy = [...monthlyBreakdown];
                      copy[index] = e.target.value;
                      setMonthlyBreakdown(copy);
                    }}
                    placeholder="0"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      fontSize: "14px",
                      backgroundColor: "var(--bg-card)",
                      color: "var(--text-main)",
                      transition: "border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease",
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-muted)", transition: "color 0.3s ease" }}>
              Total Annual Income: ₦{annualIncome.toLocaleString()}
            </div>
          </div>
        )}

        {annualIncome > 0 && (
          <>
            {isMinimumWage ? (
              <div style={{
                backgroundColor: "#d1fae5",
                padding: "20px",
                borderRadius: "8px",
                border: "2px solid #10b981",
                marginTop: "24px",
              }}>
                <h4 style={{ marginTop: 0, marginBottom: "12px", color: "#065f46" }}>
                  ✓ Minimum Wage Exemption
                </h4>
                <p style={{ color: "#065f46", margin: 0, fontSize: "15px" }}>
                  This income falls within the Minimum Wage exemption.
                  <br />
                  <strong style={{ fontSize: "18px" }}>PIT Payable: ₦0</strong>
                </p>
              </div>
            ) : (
              <>
                <div style={{
                  backgroundColor: "var(--bg-soft)",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  marginTop: "24px",
                  marginBottom: "24px",
                  transition: "background-color 0.3s ease, border-color 0.3s ease",
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: "16px", color: "var(--primary)", transition: "color 0.3s ease" }}>
                    📊 Income Summary
                  </h4>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "2px solid var(--primary)", transition: "border-color 0.3s ease" }}>
                    <span style={{ fontWeight: 600, fontSize: "16px", color: "var(--text-main)", transition: "color 0.3s ease" }}>Annual Income:</span>
                    <span style={{ fontWeight: 700, fontSize: "16px", color: "var(--primary)", transition: "color 0.3s ease" }}>₦{annualIncome.toLocaleString()}</span>
                  </div>
                </div>

                <h4 style={{ marginBottom: "16px", color: "var(--text-main)", transition: "color 0.3s ease" }}>Eligible Deductions (Nigeria Tax Act 2025)</h4>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                      Pension (₦)
                    </label>
                    <input
                      type="number"
                      value={pension}
                      onChange={(e) => setPension(+e.target.value)}
                      placeholder="0"
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

                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                      NHF (₦)
                    </label>
                    <input
                      type="number"
                      value={nhf}
                      onChange={(e) => setNhf(+e.target.value)}
                      placeholder="0"
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

                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                      NHIS (₦)
                    </label>
                    <input
                      type="number"
                      value={nhis}
                      onChange={(e) => setNhis(+e.target.value)}
                      placeholder="0"
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

                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                      Annual Rent Paid (₦)
                    </label>
                    <input
                      type="number"
                      value={rentPaid}
                      onChange={(e) => setRentPaid(+e.target.value)}
                      placeholder="0"
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
                </div>

                <div style={{
                  backgroundColor: "var(--bg-soft)",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  marginBottom: "24px",
                  transition: "background-color 0.3s ease, border-color 0.3s ease",
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: "16px", color: "var(--primary)", transition: "color 0.3s ease" }}>
                    📊 Deductions Breakdown
                  </h4>
                  
                  <div style={{ lineHeight: "2", fontSize: "15px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                    {pension > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", transition: "border-color 0.3s ease" }}>
                        <span style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>Pension:</span>
                        <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>₦{pension.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {nhf > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", transition: "border-color 0.3s ease" }}>
                        <span style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>NHF:</span>
                        <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>₦{nhf.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {nhis > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", transition: "border-color 0.3s ease" }}>
                        <span style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>NHIS:</span>
                        <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>₦{nhis.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {rentPaid > 0 && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", transition: "border-color 0.3s ease" }}>
                          <span style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>Annual Rent Paid:</span>
                          <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>₦{rentPaid.toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", transition: "border-color 0.3s ease" }}>
                          <span style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>Rent Relief (20% capped at ₦500,000):</span>
                          <span style={{ fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>₦{pit.rentRelief.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                    
                    {pit.totalDeductions === 0 && (
                      <div style={{ padding: "12px", textAlign: "center", color: "var(--text-muted)", fontStyle: "italic", transition: "color 0.3s ease" }}>
                        No deductions entered
                      </div>
                    )}
                    
                    {pit.totalDeductions > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: "2px solid var(--primary)", marginTop: "8px", transition: "border-color 0.3s ease" }}>
                        <span style={{ fontWeight: 600, fontSize: "16px", color: "var(--text-main)", transition: "color 0.3s ease" }}>Total Deductions:</span>
                        <span style={{ fontWeight: 700, fontSize: "16px", color: "var(--primary)", transition: "color 0.3s ease" }}>₦{pit.totalDeductions.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{
                  backgroundColor: "var(--primary-soft)",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "2px solid var(--primary)",
                  marginBottom: "24px",
                  transition: "background-color 0.3s ease, border-color 0.3s ease",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0" }}>
                    <span style={{ fontWeight: 700, fontSize: "18px", color: "var(--text-main)", transition: "color 0.3s ease" }}>Chargeable Income:</span>
                    <span style={{ fontWeight: 700, fontSize: "18px", color: "var(--primary)", transition: "color 0.3s ease" }}>₦{pit.chargeableIncome.toLocaleString()}</span>
                  </div>
                  <div style={{ 
                    marginTop: "12px", 
                    padding: "12px", 
                    backgroundColor: "var(--bg-soft)", 
                    borderRadius: "6px", 
                    fontSize: "13px", 
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                    transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
                  }}>
                    <strong style={{ color: "var(--text-main)", transition: "color 0.3s ease" }}>Formula:</strong> Annual Income - Total Deductions = Chargeable Income
                    <br />
                    <span style={{ fontFamily: "monospace", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                      ₦{annualIncome.toLocaleString()} - ₦{pit.totalDeductions.toLocaleString()} = ₦{pit.chargeableIncome.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div style={{
                  backgroundColor: "var(--bg-soft)",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  marginBottom: "24px",
                  transition: "background-color 0.3s ease, border-color 0.3s ease",
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: "8px", color: "var(--primary)", transition: "color 0.3s ease" }}>
                    📊 Progressive Tax Breakdown
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px", transition: "color 0.3s ease" }}>
                    Click on any band to see detailed calculation breakdown
                  </p>

                  <table width="100%" style={{ borderCollapse: "collapse", backgroundColor: "var(--bg-card)", borderRadius: "6px", overflow: "hidden", transition: "background-color 0.3s ease" }}>
                    <thead>
                      <tr style={{ backgroundColor: "var(--primary)" }}>
                        <th align="left" style={{ padding: "12px", color: "white", fontWeight: 600 }}>Band</th>
                        <th align="right" style={{ padding: "12px", color: "white", fontWeight: 600 }}>Taxed</th>
                        <th align="right" style={{ padding: "12px", color: "white", fontWeight: 600 }}>Rate</th>
                        <th align="right" style={{ padding: "12px", color: "white", fontWeight: 600 }}>Tax</th>
                      </tr>
                    </thead>
                  <tbody>
                    {pit.breakdown.map((b, i) => {
                      const isSelected = selectedBandIndex === i;
                      return (
                        <tr
                          key={i}
                          onClick={() => setSelectedBandIndex(isSelected ? null : i)}
                          style={{
                            cursor: "pointer",
                            backgroundColor: isSelected ? "var(--primary-soft)" : "transparent",
                            transition: "background-color 0.2s",
                            color: "var(--text-main)",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = "var(--bg-soft)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <td style={{ padding: "10px", fontWeight: isSelected ? 600 : 400, color: "var(--text-main)", transition: "color 0.3s ease" }}>
                            {b.label}
                            {isSelected && " ▼"}
                          </td>
                          <td align="right" style={{ padding: "10px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                            ₦{b.taxableAmount.toLocaleString()}
                          </td>
                          <td align="right" style={{ padding: "10px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                            {b.rate * 100}%
                          </td>
                          <td align="right" style={{ padding: "10px", fontWeight: 600, color: "var(--text-main)", transition: "color 0.3s ease" }}>
                            ₦{Math.round(b.taxForBand).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  </table>
                </div>

                {selectedBandIndex !== null && pit.breakdown[selectedBandIndex] && (
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "20px",
                      backgroundColor: "var(--bg-soft)",
                      border: "2px solid var(--primary)",
                      borderRadius: "8px",
                      transition: "background-color 0.3s ease, border-color 0.3s ease",
                    }}
                  >
                    <h4 style={{ color: "var(--primary)", marginTop: 0, marginBottom: "16px", transition: "color 0.3s ease" }}>
                      Detailed Calculation Breakdown: {pit.breakdown[selectedBandIndex].label}
                    </h4>

                    <div style={{ lineHeight: "1.8", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                      <div style={{ marginBottom: "12px" }}>
                        <strong>Step 1: Calculate Chargeable Income</strong>
                        <div style={{ marginLeft: "20px", color: "var(--text-muted)", transition: "color 0.3s ease" }}>
                          <div style={{ marginBottom: "8px" }}>
                            <strong>Gross Annual Income:</strong> ₦{pit.grossIncome.toLocaleString()}
                          </div>
                          <div style={{ marginBottom: "8px" }}>
                            <strong>Less: Eligible Deductions:</strong>
                            <div style={{ marginLeft: "20px", marginTop: "4px" }}>
                              {pension > 0 && <div>Pension: ₦{pension.toLocaleString()}</div>}
                              {nhf > 0 && <div>NHF: ₦{nhf.toLocaleString()}</div>}
                              {nhis > 0 && <div>NHIS: ₦{nhis.toLocaleString()}</div>}
                              {pit.rentRelief > 0 && (
                                <div>
                                  Rent Relief (20% of ₦{rentPaid.toLocaleString()}, capped at ₦500,000): ₦{pit.rentRelief.toLocaleString()}
                                </div>
                              )}
                              {pit.totalDeductions === 0 && <div style={{ color: "var(--text-muted)", transition: "color 0.3s ease" }}>No deductions entered</div>}
                            </div>
                          </div>
                          <div style={{ borderTop: "1px solid var(--border)", marginTop: "8px", paddingTop: "8px", fontWeight: 600, fontSize: "15px", transition: "border-color 0.3s ease" }}>
                            <strong>Chargeable Income:</strong> ₦{pit.chargeableIncome.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <strong>Step 2: Determine Band Range</strong>
                        <div style={{ marginLeft: "20px", color: "var(--text-muted)", transition: "color 0.3s ease" }}>
                          {(() => {
                            const band = pit.breakdown[selectedBandIndex];
                            const bandDef = PIT_BANDS_2025[selectedBandIndex];
                            const cumulativeBefore = pit.breakdown
                              .slice(0, selectedBandIndex)
                              .reduce((sum, b) => sum + b.taxableAmount, 0);
                            const bandStart = cumulativeBefore;
                            const bandEnd = cumulativeBefore + band.taxableAmount;

                            return (
                              <>
                                <div>
                                  Band Range: ₦{bandStart.toLocaleString()} to ₦{bandEnd.toLocaleString()}
                                </div>
                                <div>
                                  Maximum Band Limit: ₦{bandDef.limit === Infinity ? "∞ (No upper limit)" : bandDef.limit.toLocaleString()}
                                </div>
                                <div>
                                  Amount in this band: ₦{band.taxableAmount.toLocaleString()}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <strong>Step 3: Calculate Tax for This Band</strong>
                        <div style={{ marginLeft: "20px", color: "var(--text-muted)", transition: "color 0.3s ease" }}>
                          <div>
                            Taxable Amount × Tax Rate = Tax for Band
                          </div>
                          <div style={{ marginLeft: "20px", fontFamily: "monospace" }}>
                            ₦{pit.breakdown[selectedBandIndex].taxableAmount.toLocaleString()} × {(pit.breakdown[selectedBandIndex].rate * 100).toFixed(1)}% = ₦{Math.round(pit.breakdown[selectedBandIndex].taxForBand).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <strong>Step 4: Cumulative Calculation</strong>
                        <div style={{ marginLeft: "20px", color: "var(--text-muted)", transition: "color 0.3s ease" }}>
                          {(() => {
                            const cumulativeTax = pit.breakdown
                              .slice(0, selectedBandIndex + 1)
                              .reduce((sum, b) => sum + b.taxForBand, 0);
                            const cumulativeAmount = pit.breakdown
                              .slice(0, selectedBandIndex + 1)
                              .reduce((sum, b) => sum + b.taxableAmount, 0);

                            return (
                              <>
                                <div>
                                  Cumulative Taxable Amount (up to this band): ₦{cumulativeAmount.toLocaleString()}
                                </div>
                                <div>
                                  Cumulative Tax (up to this band): ₦{Math.round(cumulativeTax).toLocaleString()}
                                </div>
                                {selectedBandIndex < pit.breakdown.length - 1 && (
                                  <div style={{ marginTop: "8px", color: "var(--text-muted)", fontSize: "13px", transition: "color 0.3s ease" }}>
                                    Remaining chargeable income: ₦{(pit.chargeableIncome - cumulativeAmount).toLocaleString()}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      <div style={{ 
                        marginTop: "16px", 
                        padding: "12px", 
                        backgroundColor: "var(--bg-card)", 
                        borderRadius: "6px",
                        border: "1px solid var(--primary)",
                        transition: "background-color 0.3s ease, border-color 0.3s ease",
                      }}>
                        <strong style={{ color: "var(--primary)", transition: "color 0.3s ease" }}>Final Result for This Band:</strong>
                        <div style={{ marginTop: "8px", fontSize: "18px", fontWeight: 700, color: "var(--text-main)", transition: "color 0.3s ease" }}>
                          Tax Payable: ₦{Math.round(pit.breakdown[selectedBandIndex].taxForBand).toLocaleString()}
                        </div>
                        <div style={{ marginTop: "4px", fontSize: "14px", color: "var(--text-muted)", transition: "color 0.3s ease" }}>
                          Monthly Equivalent: ₦{Math.round(pit.breakdown[selectedBandIndex].taxForBand / 12).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{
                  backgroundColor: "var(--primary-soft)",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "2px solid var(--primary)",
                  marginTop: "24px",
                  transition: "background-color 0.3s ease, border-color 0.3s ease",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h4 style={{ marginTop: 0, marginBottom: 0, color: "var(--primary)", transition: "color 0.3s ease" }}>
                      💰 Tax Summary
                    </h4>
                    <ShareTaxResults
                      taxType="Individual (PIT)"
                      inputs={{
                        "Annual Income": annualIncome,
                        "Pension": pension,
                        "NHF": nhf,
                        "NHIS": nhis,
                        "Rent Paid": rentPaid,
                      }}
                      outputs={{
                        "Total Annual PIT": Math.round(pit.totalTax),
                        "Monthly PIT": Math.round(pit.totalTax / 12),
                        "Chargeable Income": pit.chargeableIncome,
                      }}
                      regime="2026+"
                    />
                  </div>
                  
                  <div style={{ lineHeight: "2", fontSize: "15px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "2px solid var(--primary)", transition: "border-color 0.3s ease" }}>
                      <span style={{ fontWeight: 700, fontSize: "18px", color: "var(--text-main)", transition: "color 0.3s ease" }}>Total Annual PIT:</span>
                      <span style={{ fontWeight: 700, fontSize: "18px", color: "var(--primary)", transition: "color 0.3s ease" }}>₦{Math.round(pit.totalTax).toLocaleString()}</span>
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", marginTop: "8px" }}>
                      <span style={{ fontWeight: 600, fontSize: "16px", color: "var(--text-main)", transition: "color 0.3s ease" }}>Monthly PIT (derived):</span>
                      <span style={{ fontWeight: 600, fontSize: "16px", color: "var(--primary)", transition: "color 0.3s ease" }}>₦{Math.round(pit.totalTax / 12).toLocaleString()}</span>
                    </div>
                    
                    <div style={{ 
                      marginTop: "16px", 
                      padding: "12px", 
                      backgroundColor: "var(--bg-soft)", 
                      borderRadius: "6px", 
                      fontSize: "13px", 
                      color: "var(--text-muted)",
                      border: "1px solid var(--border)",
                      transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
                    }}>
                      <strong style={{ color: "var(--text-main)", transition: "color 0.3s ease" }}>Calculation:</strong> Total Annual PIT ÷ 12 = Monthly PIT
                      <br />
                      <span style={{ fontFamily: "monospace", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                        ₦{Math.round(pit.totalTax).toLocaleString()} ÷ 12 = ₦{Math.round(pit.totalTax / 12).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tax Alerts */}
                <TaxAlerts
                  taxType="Individual"
                  inputs={{
                    annualIncome,
                    monthlySalary: annualIncome / 12,
                  }}
                  outputs={{
                    totalTax: Math.round(pit.totalTax),
                    annualPAYE: Math.round(pit.totalTax),
                  }}
                  regime="2026+"
                />

                {/* Scenario Manager */}
                <ScenarioManager
                  taxType="Individual (PIT)"
                  inputs={{
                    "Annual Income": annualIncome,
                    "Pension": pension,
                    "NHF": nhf,
                    "NHIS": nhis,
                    "Rent Paid": rentPaid,
                  }}
                  outputs={{
                    "Total Annual PIT": Math.round(pit.totalTax),
                    "Monthly PIT": Math.round(pit.totalTax / 12),
                    "Chargeable Income": pit.chargeableIncome,
                  }}
                  regime="2026+"
                />
              </>
            )}
          </>
        )}

        <p style={{ marginTop: "30px", fontSize: "13px", color: "var(--text-muted)", transition: "color 0.3s ease" }}>
          PIT calculated strictly under the Nigeria Tax Act, 2025.
          <br />
          All deductions must be supported by valid evidence.
        </p>
      </div>
    </div>
  );
}
