import { EstateParams, HeirParams, DeductionParams, TaxResult } from '../types';
import { EXEMPTIONS, DEDUCTIONS, TAX_BRACKETS } from '../constants';

export const calculateTax = (
  estate: EstateParams,
  heirs: HeirParams,
  deductions: DeductionParams
): TaxResult => {
  // 1. Calculate Total Estate Value
  // Note: Public land and farming land are often part of total assets but deducted later, 
  // or excluded. Conventionally in simple calcs, we treat them as deductions from the Gross if included in Gross.
  // Here we assume the user inputs 'Total Real Estate' inclusive of these, and we deduct them.
  const totalEstateValue = 
    (estate.totalRealEstate || 0) + 
    (estate.cashAndSavings || 0) + 
    (estate.stocksAndInvestments || 0) + 
    (estate.otherAssets || 0);

  // 2. Calculate Exemption (免稅額)
  const exemptionAmount = estate.isDutyRelatedDeath ? EXEMPTIONS.DUTY_RELATED : EXEMPTIONS.GENERAL;

  // 3. Calculate Deductions (扣除額)
  const deductionDetails: { label: string; amount: number }[] = [];
  let totalDeductions = 0;

  // Spouse
  if (heirs.hasSpouse) {
    deductionDetails.push({ label: '配偶扣除額', amount: DEDUCTIONS.SPOUSE });
    totalDeductions += DEDUCTIONS.SPOUSE;
  }

  // Parents
  if (heirs.parentsCount > 0) {
    const amount = heirs.parentsCount * DEDUCTIONS.PARENT;
    deductionDetails.push({ label: `父母扣除額 (${heirs.parentsCount}人)`, amount });
    totalDeductions += amount;
  }

  // Lineal Descendants (Adults)
  if (heirs.adultChildrenCount > 0) {
    const amount = heirs.adultChildrenCount * DEDUCTIONS.LINEAL_DESCENDANT;
    deductionDetails.push({ label: `成年子女扣除額 (${heirs.adultChildrenCount}人)`, amount });
    totalDeductions += amount;
  }

  // Lineal Descendants (Minors)
  if (heirs.minorChildrenAges.length > 0) {
    let amount = 0;
    heirs.minorChildrenAges.forEach(age => {
      // Base deduction
      let childDed = DEDUCTIONS.LINEAL_DESCENDANT;
      // Additional for years until 18
      if (age < DEDUCTIONS.AGE_OF_MAJORITY) {
        childDed += (DEDUCTIONS.AGE_OF_MAJORITY - age) * DEDUCTIONS.MINOR_YEARLY_ADDITION;
      }
      amount += childDed;
    });
    deductionDetails.push({ label: `未成年子女扣除額 (${heirs.minorChildrenAges.length}人，含加扣)`, amount });
    totalDeductions += amount;
  }

  // Siblings / Grandparents (Dependents) - Simplified logic assuming they meet dependent criteria if entered here
  // Note: Usually require proof of dependency.
  if (heirs.siblingsCount > 0) {
      const amount = heirs.siblingsCount * DEDUCTIONS.DEPENDENT_SIBLING_GRANDPARENT;
      deductionDetails.push({ label: `受扶養兄弟姊妹扣除額 (${heirs.siblingsCount}人)`, amount });
      totalDeductions += amount;
  }
  // Minor Siblings specific calculation if needed (logic similar to children), but standard form usually groups basics.
  // We will implement the minor sibling logic if ages provided.
  if (heirs.minorSiblingsAges.length > 0) {
      let amount = 0;
      heirs.minorSiblingsAges.forEach(age => {
          let sibDed = DEDUCTIONS.DEPENDENT_SIBLING_GRANDPARENT;
          if (age < DEDUCTIONS.AGE_OF_MAJORITY) {
              sibDed += (DEDUCTIONS.AGE_OF_MAJORITY - age) * DEDUCTIONS.MINOR_YEARLY_ADDITION;
          }
          amount += sibDed;
      });
      deductionDetails.push({ label: `未成年受扶養兄弟姊妹扣除額 (${heirs.minorSiblingsAges.length}人)`, amount });
      totalDeductions += amount;
  }

  if (heirs.grandparentsCount > 0) {
      const amount = heirs.grandparentsCount * DEDUCTIONS.DEPENDENT_SIBLING_GRANDPARENT;
      deductionDetails.push({ label: `祖父母扣除額 (${heirs.grandparentsCount}人)`, amount });
      totalDeductions += amount;
  }

  // Disability
  if (heirs.disabledDependentsCount > 0) {
    const amount = heirs.disabledDependentsCount * DEDUCTIONS.DISABILITY;
    deductionDetails.push({ label: `重度以上身心障礙扣除額 (${heirs.disabledDependentsCount}人)`, amount });
    totalDeductions += amount;
  }

  // Funeral
  if (deductions.funeralExpenses) {
    deductionDetails.push({ label: '喪葬費扣除額', amount: DEDUCTIONS.FUNERAL });
    totalDeductions += DEDUCTIONS.FUNERAL;
  }

  // Debts/Taxes
  if ((deductions.outstandingDebts || 0) > 0) {
    deductionDetails.push({ label: '被繼承人死亡前未償債務', amount: deductions.outstandingDebts });
    totalDeductions += deductions.outstandingDebts;
  }
  if ((deductions.unpaidTaxes || 0) > 0) {
    deductionDetails.push({ label: '被繼承人死亡前應納未納稅捐', amount: deductions.unpaidTaxes });
    totalDeductions += deductions.unpaidTaxes;
  }

  // Land Deductions (Non-taxable assets included in estate)
  if ((deductions.publicLandValue || 0) > 0) {
    deductionDetails.push({ label: '公共設施保留地扣除額', amount: deductions.publicLandValue });
    totalDeductions += deductions.publicLandValue;
  }
  if ((deductions.farmingLandValue || 0) > 0) {
    deductionDetails.push({ label: '農業用地扣除額', amount: deductions.farmingLandValue });
    totalDeductions += deductions.farmingLandValue;
  }

  // 4. Net Taxable Estate (課稅遺產淨額)
  let taxableEstateValue = totalEstateValue - exemptionAmount - totalDeductions;
  if (taxableEstateValue < 0) taxableEstateValue = 0;

  // 5. Calculate Tax
  let finalTaxPayable = 0;
  let taxBracketRate = 0;
  let progressiveDifference = 0;

  // Find the applicable bracket based on constants
  // Brackets are sorted: 0-56.21M, 56.21M-112.42M, 112.42M+
  const bracket = TAX_BRACKETS.find(b => taxableEstateValue <= b.limit) || TAX_BRACKETS[TAX_BRACKETS.length - 1];
  
  taxBracketRate = bracket.rate;
  progressiveDifference = bracket.deduction;
  finalTaxPayable = (taxableEstateValue * taxBracketRate) - progressiveDifference;

  if (finalTaxPayable < 0) finalTaxPayable = 0;

  return {
    totalEstateValue,
    taxableEstateValue,
    exemptionAmount,
    deductionAmount: totalDeductions,
    grossTax: taxableEstateValue * taxBracketRate, // Conceptual
    taxBracketRate,
    progressiveDifference,
    finalTaxPayable,
    breakdown: {
      exemptionDetails: [
        { label: estate.isDutyRelatedDeath ? '執行公務死亡免稅額' : '一般免稅額', amount: exemptionAmount }
      ],
      deductionDetails
    }
  };
};