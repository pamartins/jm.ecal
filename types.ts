export interface Liability {
  id: string;
  name: string;
  balance: number;
  monthlyPayment: number;
}

export interface CurrentHome {
  value: number;
  mortgageBalance: number;
  interestRate: number;
  propertyTaxYearly: number;
  hoaMonthly: number;
}

export interface NewHome {
  price: number;
  interestRate: number;
  propertyTaxYearly: number;
  hoaMonthly: number;
  closingCostsPercent: number; // For the buy side
}

export interface CalculationResult {
  netEquity: number;
  sellingCosts: number;
  totalLiabilitiesPayoff: number;
  availableDownPayment: number;
  newLoanAmount: number;
  oldMonthlyTotal: number;
  newMonthlyTotal: number;
  monthlySavings: number;
  breakEvenMonths: number;
  oldPrincipalAndInterest: number;
  newPrincipalAndInterest: number;
  totalLiabilityPayments: number;
}

export enum ScenarioType {
  CONSERVATIVE = 'CONSERVATIVE',
  MODERATE = 'MODERATE',
  AGGRESSIVE = 'AGGRESSIVE'
}