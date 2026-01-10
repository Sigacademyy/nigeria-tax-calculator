// Smart alerts and warnings rules engine

export function evaluateTaxAlerts(data) {
  const alerts = [];
  const { taxType, inputs, outputs, regime } = data;

  // VAT Registration Threshold Alert
  if (taxType === "VAT" || taxType === "CIT") {
    const annualTurnover = inputs.annualTurnover || inputs.monthlySales * 12 || 0;
    if (annualTurnover >= 25_000_000 && annualTurnover < 25_100_000) {
      alerts.push({
        type: "warning",
        title: "VAT Registration Threshold",
        message: `Your annual turnover (₦${annualTurnover.toLocaleString()}) has reached the ₦25,000,000 VAT registration threshold. You are required to register for VAT with FIRS.`,
        icon: "⚠️",
      });
    }
  }

  // SME CIT Exemption Alert
  if (taxType === "CIT") {
    const annualTurnover = inputs.annualTurnover || 0;
    if (annualTurnover > 0 && annualTurnover <= 25_000_000) {
      alerts.push({
        type: "info",
        title: "Small Company Exemption",
        message: `Your company qualifies as a Small Company (turnover ≤ ₦25,000,000) and is exempt from Company Income Tax (0% rate).`,
        icon: "ℹ️",
      });
    }
  }

  // PAYE Unusually High Alert
  if (taxType === "PAYE" || taxType === "Individual") {
    const annualIncome = inputs.annualIncome || inputs.monthlySalary * 12 || 0;
    const taxPayable = outputs.totalTax || outputs.annualPAYE || 0;
    if (annualIncome > 0 && taxPayable > 0) {
      const taxRate = (taxPayable / annualIncome) * 100;
      if (taxRate > 20) {
        alerts.push({
          type: "warning",
          title: "High Effective Tax Rate",
          message: `Your effective tax rate is ${taxRate.toFixed(1)}%, which is above the typical range. Consider reviewing your deductions and tax planning strategies.`,
          icon: "⚠️",
        });
      }
    }
  }

  // Possible Structure Inefficiency (CIT vs Individual)
  if (taxType === "CIT") {
    const profit = outputs.profit || 0;
    const citPayable = outputs.citPayable || 0;
    if (profit > 0 && citPayable > 0) {
      // If profit is relatively small, individual tax might be lower
      if (profit <= 10_000_000) {
        alerts.push({
          type: "info",
          title: "Tax Structure Consideration",
          message: `For profits of ₦${profit.toLocaleString()}, you may want to compare with individual tax rates. Business structure can impact overall tax liability.`,
          icon: "💡",
        });
      }
    }
  }

  // Education Tax Applicability
  if (taxType === "CIT") {
    const annualTurnover = inputs.annualTurnover || 0;
    if (annualTurnover > 50_000_000 && !outputs.edtPayable) {
      alerts.push({
        type: "info",
        title: "Education Tax (EDT)",
        message: `Your company qualifies for Education Tax (2.5% of assessable profits) as turnover exceeds ₦50,000,000.`,
        icon: "ℹ️",
      });
    }
  }

  // WHT Credit Reminder
  if (taxType === "WHT") {
    const totalWHT = outputs.totalWHT || 0;
    if (totalWHT > 0) {
      alerts.push({
        type: "info",
        title: "WHT Credit Information",
        message: `Remember that WHT (₦${totalWHT.toLocaleString()}) is generally creditable against the recipient's final income tax liability.`,
        icon: "ℹ️",
      });
    }
  }

  return alerts;
}

