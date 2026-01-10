// Pre-2026 PAYE calculation (PITA - with CRA)
// Consolidated Relief Allowance (CRA) = ₦200,000 + (20% × annual gross income)

export const PITA_BANDS_PRE_2026 = [
  { label: "First ₦300,000", limit: 300_000, rate: 0.07 },
  { label: "Next ₦300,000", limit: 300_000, rate: 0.11 },
  { label: "Next ₦500,000", limit: 500_000, rate: 0.15 },
  { label: "Next ₦500,000", limit: 500_000, rate: 0.19 },
  { label: "Next ₦1,600,000", limit: 1_600_000, rate: 0.21 },
  { label: "Remainder", limit: Infinity, rate: 0.24 },
];

export function calculateCRA(annualGrossIncome) {
  return 200_000 + annualGrossIncome * 0.2;
}

export function calculatePAYEPre2026(annualGrossIncome) {
  // Calculate CRA
  const cra = calculateCRA(annualGrossIncome);
  
  // Calculate chargeable income after CRA
  const chargeableIncome = Math.max(annualGrossIncome - cra, 0);
  
  if (chargeableIncome <= 0) {
    return {
      grossIncome: annualGrossIncome,
      cra,
      chargeableIncome: 0,
      totalTax: 0,
      breakdown: [],
    };
  }
  
  // Apply old PITA progressive bands
  let remaining = chargeableIncome;
  let totalTax = 0;
  const breakdown = [];
  
  for (const band of PITA_BANDS_PRE_2026) {
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
  
  return {
    grossIncome: annualGrossIncome,
    cra,
    chargeableIncome,
    totalTax,
    breakdown,
  };
}

