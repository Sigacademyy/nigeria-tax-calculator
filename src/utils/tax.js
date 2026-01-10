// src/utils/tax.js
// Nigeria Tax Act 2025 - PAYE calculation (2026+)
// First ₦800,000 is tax-free (0% rate)

export function calculatePITWithBreakdown(annualIncome) {
  let remaining = annualIncome;
  let totalTax = 0;

  if (annualIncome <= 0) {
    return { totalTax: 0, breakdown: [] };
  }

  const breakdown = [];

  // First ₦800,000 is tax-free (0% rate)
  const taxFreeAmount = Math.min(annualIncome, 800000);
  if (taxFreeAmount > 0) {
    breakdown.push({
      label: "First ₦800,000 (Tax-Free)",
      taxableAmount: taxFreeAmount,
      rate: 0.0,
      taxForBand: 0,
    });
  }
  remaining -= taxFreeAmount;

  if (remaining <= 0) {
    return { totalTax: 0, breakdown };
  }

  // Progressive tax bands after tax-free amount
  const bands = [
    { label: "Next ₦2,200,000", limit: 2200000, rate: 0.15 },
    { label: "Next ₦9,000,000", limit: 9000000, rate: 0.18 },
    { label: "Next ₦13,000,000", limit: 13000000, rate: 0.21 },
    { label: "Next ₦25,000,000", limit: 25000000, rate: 0.23 },
    { label: "Above ₦50,000,000", limit: Infinity, rate: 0.25 },
  ];

  for (const band of bands) {
    if (remaining <= 0) break;

    const taxableAmount = Math.min(remaining, band.limit);
    const taxForBand = taxableAmount * band.rate;

    breakdown.push({
      label: band.label,
      taxableAmount,
      rate: band.rate,
      taxForBand,
    });

    totalTax += taxForBand;
    remaining -= taxableAmount;
  }

  return { totalTax, breakdown };
}
