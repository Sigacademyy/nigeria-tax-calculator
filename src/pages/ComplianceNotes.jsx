import "../styles/ui.css";

export default function ComplianceNotes() {
  return (
    <div className="container compliance-notes-container" style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>
      <div className="card" style={{ padding: "40px" }}>
        <h1 style={{ 
          color: "var(--primary)", 
          marginTop: 0, 
          marginBottom: "8px",
          fontSize: "32px",
          fontWeight: 700,
          transition: "color 0.3s ease",
        }}>
          Nigeria Tax Act 2025 – Compliance Notes
        </h1>
        <p style={{ 
          color: "var(--text-muted)", 
          fontSize: "16px", 
          marginBottom: "40px",
          fontStyle: "italic",
          transition: "color 0.3s ease",
        }}>
          Informational guide for tax compliance under the Nigeria Tax Act, 2025
        </p>

        {/* Overview Section */}
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ 
            color: "var(--primary)", 
            fontSize: "24px", 
            marginBottom: "16px",
            paddingBottom: "8px",
            borderBottom: "2px solid var(--primary)",
            transition: "color 0.3s ease, border-color 0.3s ease",
          }}>
            1. Overview
          </h2>
          <div style={{ lineHeight: "1.8", fontSize: "15px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
            <p style={{ marginBottom: "12px" }}>
              <strong>Effective Date:</strong> The Nigeria Tax Act, 2025 came into effect on <strong style={{ color: "var(--primary)", transition: "color 0.3s ease" }}>1 January 2026</strong>.
            </p>
            <p style={{ marginBottom: "12px" }}>
              <strong>Purpose:</strong> The Act modernizes Nigeria's tax system, simplifies tax administration, and aligns with international best practices. It introduces significant changes to personal income tax (PIT), company income tax (CIT), and related tax obligations.
            </p>
            <p>
              This legislation replaces previous tax provisions and introduces new tax bands, thresholds, and compliance requirements for individuals and businesses operating in Nigeria.
            </p>
          </div>
        </section>

        {/* Key Changes Section */}
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ 
            color: "var(--primary)", 
            fontSize: "24px", 
            marginBottom: "20px",
            paddingBottom: "8px",
            borderBottom: "2px solid var(--primary)",
            transition: "color 0.3s ease, border-color 0.3s ease",
          }}>
            2. Key Changes
          </h2>
          
          <div style={{ lineHeight: "1.8", fontSize: "15px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
            <div style={{ 
              marginBottom: "24px", 
              padding: "20px", 
              backgroundColor: "var(--bg-soft)", 
              borderRadius: "8px",
              border: "1px solid var(--border)",
              transition: "background-color 0.3s ease, border-color 0.3s ease",
            }}>
              <h3 style={{ color: "var(--primary)", fontSize: "18px", marginTop: 0, marginBottom: "12px", transition: "color 0.3s ease" }}>
                Personal Income Tax (PIT) Changes
              </h3>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                <li style={{ marginBottom: "8px" }}>
                  <strong>Removal of CRA:</strong> The Consolidated Relief Allowance (CRA) system has been abolished. CRA was previously calculated as ₦200,000 + 20% of gross income.
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <strong>Introduction of Tax-Free Band:</strong> A new ₦800,000 tax-free band replaces CRA. The first ₦800,000 of chargeable income is taxed at 0% (not a deduction, but a 0% tax rate).
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <strong>New Progressive Tax Bands:</strong>
                  <ul style={{ marginTop: "8px", paddingLeft: "20px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                    <li>First ₦800,000: 0% (Tax-Free)</li>
                    <li>Next ₦2,200,000: 15%</li>
                    <li>Next ₦9,000,000: 18%</li>
                    <li>Next ₦13,000,000: 21%</li>
                    <li>Next ₦25,000,000: 23%</li>
                    <li>Above ₦50,000,000: 25%</li>
                  </ul>
                </li>
              </ul>
            </div>

            <div style={{ 
              marginBottom: "24px", 
              padding: "20px", 
              backgroundColor: "var(--bg-soft)", 
              borderRadius: "8px",
              border: "1px solid var(--border)",
              transition: "background-color 0.3s ease, border-color 0.3s ease",
            }}>
              <h3 style={{ color: "var(--primary)", fontSize: "18px", marginTop: 0, marginBottom: "12px", transition: "color 0.3s ease" }}>
                Company Income Tax (CIT) Changes
              </h3>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                <li style={{ marginBottom: "8px" }}>
                  <strong>Company Classification:</strong>
                  <ul style={{ marginTop: "8px", paddingLeft: "20px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                    <li><strong>Small Company:</strong> Annual turnover ≤ ₦25,000,000 (0% CIT rate)</li>
                    <li><strong>Medium Company:</strong> Annual turnover > ₦25,000,000 and ≤ ₦100,000,000 (20% CIT rate)</li>
                    <li><strong>Large Company:</strong> Annual turnover > ₦100,000,000 (30% CIT rate)</li>
                  </ul>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <strong>Education Tax (EDT):</strong> 2.5% of assessable profits applies to Medium and Large companies only. Small companies (≤₦50,000,000 turnover) are exempt from EDT.
                </li>
              </ul>
            </div>

            <div style={{ 
              marginBottom: "24px", 
              padding: "20px", 
              backgroundColor: "var(--bg-soft)", 
              borderRadius: "8px",
              border: "1px solid var(--border)",
              transition: "background-color 0.3s ease, border-color 0.3s ease",
            }}>
              <h3 style={{ color: "var(--primary)", fontSize: "18px", marginTop: 0, marginBottom: "12px", transition: "color 0.3s ease" }}>
                Value Added Tax (VAT) Requirements
              </h3>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                <li style={{ marginBottom: "8px" }}>
                  <strong>Registration Threshold:</strong> Businesses with annual turnover of <strong>₦25,000,000 or more</strong> are required to register for VAT.
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <strong>Filing Requirement:</strong> VAT-registered businesses must file monthly VAT returns with FIRS, even where VAT payable is zero.
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <strong>VAT Rate:</strong> 7.5% (unchanged)
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* PAYE Summary Section */}
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ 
            color: "var(--primary)", 
            fontSize: "24px", 
            marginBottom: "20px",
            paddingBottom: "8px",
            borderBottom: "2px solid var(--primary)",
            transition: "color 0.3s ease, border-color 0.3s ease",
          }}>
            3. PAYE Summary: Pre-2026 vs 2026+
          </h2>
          
          <div className="paye-comparison" style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
            gap: "20px",
            marginBottom: "20px",
          }}>
            {/* Pre-2026 Column */}
            <div style={{ 
              padding: "20px", 
              backgroundColor: "var(--bg-soft)", 
              borderRadius: "8px",
              border: "2px solid var(--primary)",
              opacity: 0.9,
              transition: "background-color 0.3s ease, border-color 0.3s ease, opacity 0.3s ease",
            }}>
              <h3 style={{ 
                color: "var(--primary)", 
                fontSize: "18px", 
                marginTop: 0, 
                marginBottom: "16px",
                fontWeight: 700,
                transition: "color 0.3s ease",
              }}>
                Pre-2026 (PITA)
              </h3>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-main)", lineHeight: "1.8", transition: "color 0.3s ease" }}>
                <li style={{ marginBottom: "8px" }}>
                  <strong>Consolidated Relief Allowance (CRA):</strong> ₦200,000 + 20% of gross income
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <strong>Tax Bands:</strong>
                  <ul style={{ marginTop: "4px", paddingLeft: "20px", fontSize: "14px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                    <li>First ₦300,000 @ 7%</li>
                    <li>Next ₦300,000 @ 11%</li>
                    <li>Next ₦500,000 @ 15%</li>
                    <li>Next ₦500,000 @ 19%</li>
                    <li>Next ₦1,600,000 @ 21%</li>
                    <li>Remainder @ 24%</li>
                  </ul>
                </li>
                <li>
                  <strong>Status:</strong> No longer applicable from 1 January 2026
                </li>
              </ul>
            </div>

            {/* 2026+ Column */}
            <div style={{ 
              padding: "20px", 
              backgroundColor: "var(--primary-soft)", 
              borderRadius: "8px",
              border: "2px solid var(--primary)",
              transition: "background-color 0.3s ease, border-color 0.3s ease",
            }}>
              <h3 style={{ 
                color: "var(--primary)", 
                fontSize: "18px", 
                marginTop: 0, 
                marginBottom: "16px",
                fontWeight: 700,
                transition: "color 0.3s ease",
              }}>
                2026+ (Nigeria Tax Act 2025)
              </h3>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-main)", lineHeight: "1.8", transition: "color 0.3s ease" }}>
                <li style={{ marginBottom: "8px" }}>
                  <strong>Tax-Free Band:</strong> First ₦800,000 at 0% rate (not a deduction)
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <strong>Tax Bands:</strong>
                  <ul style={{ marginTop: "4px", paddingLeft: "20px", fontSize: "14px", color: "var(--text-main)", transition: "color 0.3s ease" }}>
                    <li>First ₦800,000 @ 0% (Tax-Free)</li>
                    <li>Next ₦2,200,000 @ 15%</li>
                    <li>Next ₦9,000,000 @ 18%</li>
                    <li>Next ₦13,000,000 @ 21%</li>
                    <li>Next ₦25,000,000 @ 23%</li>
                    <li>Above ₦50,000,000 @ 25%</li>
                  </ul>
                </li>
                <li>
                  <strong>Status:</strong> Current and applicable from 1 January 2026
                </li>
              </ul>
            </div>
          </div>

          <div style={{ 
            padding: "16px", 
            backgroundColor: "var(--bg-soft)", 
            borderRadius: "8px",
            border: "1px solid var(--primary)",
            fontSize: "14px",
            color: "var(--text-main)",
            lineHeight: "1.6",
            transition: "background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease",
          }}>
            <strong>Important Note:</strong> Employers must use the 2026+ regime for all PAYE calculations from 1 January 2026 onwards. The Pre-2026 regime is provided in this calculator for historical reference and prior year calculations only.
          </div>
        </section>

        {/* Disclaimer Section */}
        <section style={{ 
          marginBottom: "20px",
          padding: "24px",
          backgroundColor: "var(--bg-soft)",
          borderRadius: "8px",
          border: "2px solid var(--primary)",
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}>
          <h2 style={{ 
            color: "var(--primary)", 
            fontSize: "20px", 
            marginTop: 0,
            marginBottom: "12px",
            fontWeight: 700,
            transition: "color 0.3s ease",
          }}>
            ⚠️ Disclaimer
          </h2>
          <div style={{ 
            lineHeight: "1.8", 
            fontSize: "14px", 
            color: "var(--text-main)",
            transition: "color 0.3s ease",
          }}>
            <p style={{ marginBottom: "12px" }}>
              <strong>Informational Purpose Only:</strong> This compliance guide and the associated tax calculator are provided for informational and estimation purposes only. They are not intended to serve as legal, accounting, or tax advice.
            </p>
            <p style={{ marginBottom: "12px" }}>
              <strong>Not a Substitute for Professional Advice:</strong> Tax laws are complex and subject to interpretation. The information provided here should not be used as a substitute for professional tax, legal, or accounting advice. Tax obligations may vary based on individual circumstances, business structures, and specific transactions.
            </p>
            <p>
              <strong>Consult a Professional:</strong> Always consult with a qualified tax professional, certified public accountant, or the Federal Inland Revenue Service (FIRS) for official tax filings, compliance requirements, and specific tax advice tailored to your situation.
            </p>
          </div>
        </section>

        {/* Footer Note */}
        <div style={{ 
          marginTop: "40px",
          padding: "16px",
          textAlign: "center",
          fontSize: "13px",
          color: "var(--text-muted)",
          borderTop: "1px solid var(--border)",
          transition: "color 0.3s ease, border-color 0.3s ease",
        }}>
          <p style={{ margin: 0 }}>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p style={{ margin: "8px 0 0 0" }}>
            For official tax legislation, please refer to the Nigeria Tax Act, 2025 as published by the Federal Government of Nigeria.
          </p>
        </div>
      </div>
    </div>
  );
}

