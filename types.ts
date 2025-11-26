export interface HeirParams {
  hasSpouse: boolean;
  parentsCount: number; // 0, 1, or 2
  adultChildrenCount: number;
  minorChildrenAges: number[]; // Array of ages for minor children
  siblingsCount: number;
  minorSiblingsAges: number[]; // Array of ages for minor dependent siblings
  grandparentsCount: number;
  disabledDependentsCount: number; // Number of heirs with severe disability
}

export interface EstateParams {
  totalRealEstate: number; // Land + House assessed value
  cashAndSavings: number;
  stocksAndInvestments: number;
  otherAssets: number;
  isDutyRelatedDeath: boolean; // Died in line of duty (doubles exemption)
}

export interface DeductionParams {
  funeralExpenses: boolean; // Apply standard deduction
  funeralExpensesActual: number; // If not standard, user input (rarely used over standard, but good to have logic for)
  outstandingDebts: number;
  unpaidTaxes: number;
  publicLandValue: number; // Public facility reserved land (tax exempt but included in total)
  farmingLandValue: number; // Agricultural land for agricultural use
}

export interface TaxResult {
  totalEstateValue: number;
  taxableEstateValue: number; // Gross - Exemptions - Deductions
  exemptionAmount: number;
  deductionAmount: number;
  grossTax: number;
  taxBracketRate: number;
  progressiveDifference: number;
  finalTaxPayable: number;
  breakdown: {
    exemptionDetails: { label: string; amount: number }[];
    deductionDetails: { label: string; amount: number }[];
  };
}

export interface MinorHeirInput {
  id: string;
  age: number;
}