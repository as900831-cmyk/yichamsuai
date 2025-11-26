// All values in New Taiwan Dollar (TWD)
// Based on 2025 (Year 114) adjustments

export const EXEMPTIONS = {
  GENERAL: 13330000,
  DUTY_RELATED: 26660000,
};

export const DEDUCTIONS = {
  SPOUSE: 5530000,
  PARENT: 1380000, // Per parent
  LINEAL_DESCENDANT: 560000, // Per person
  DEPENDENT_SIBLING_GRANDPARENT: 560000, // Per person
  DISABILITY: 6930000, // Per person
  FUNERAL: 1380000,
  // For minors: 560,000 per year until 18
  MINOR_YEARLY_ADDITION: 560000, 
  AGE_OF_MAJORITY: 18,
};

// 2025 (Year 114) Updated Brackets
// Tier 1: 0 - 56,210,000 (10%)
// Tier 2: 56,210,001 - 112,420,000 (15%) - Diff: 2,810,500
// Tier 3: 112,420,001+ (20%) - Diff: 8,431,500
export const TAX_BRACKETS = [
  { limit: 56210000, rate: 0.10, deduction: 0 },
  { limit: 112420000, rate: 0.15, deduction: 2810500 },
  { limit: Infinity, rate: 0.20, deduction: 8431500 },
];

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

export const formatNumber = (val: number) => {
    return new Intl.NumberFormat('zh-TW').format(val);
};