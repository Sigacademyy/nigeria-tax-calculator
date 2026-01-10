import { PIT_BANDS_2025, RENT_RELIEF_CAP } from "./constants";


export function calculatePIT2025({
grossIncome,
pension = 0,
nhf = 0,
nhis = 0,
rentPaid = 0,
}) {
// Eligible deductions per Section 30
const rentRelief = Math.min(rentPaid * 0.2, RENT_RELIEF_CAP);


const totalDeductions =
Math.max(0, pension) +
Math.max(0, nhf) +
Math.max(0, nhis) +
Math.max(0, rentRelief);


const chargeableIncome = Math.max(grossIncome - totalDeductions, 0);


let remaining = chargeableIncome;
let totalTax = 0;
const breakdown = [];


for (const band of PIT_BANDS_2025) {
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
grossIncome,
totalDeductions,
rentRelief,
chargeableIncome,
totalTax,
breakdown,
};
}