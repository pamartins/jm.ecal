import { Liability, CurrentHome, NewHome, CalculationResult } from '../types';

export const calculateMortgagePayment = (principal: number, annualRate: number, years: number = 30): number => {
  if (annualRate === 0) return principal / (years * 12);
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export const calculateScenario = (
  current: CurrentHome,
  liabilities: Liability[],
  newHome: NewHome
): CalculationResult => {
  // 1. Sell Side
  const sellingCosts = current.value * 0.07; // Assumed 7% for agent fees + closing
  const grossEquity = current.value - current.mortgageBalance;
  const netProceedsAfterSale = grossEquity - sellingCosts;

  // 2. Liability Payoff
  const totalLiabilitiesBalance = liabilities.reduce((acc, curr) => acc + curr.balance, 0);
  const totalLiabilityPayments = liabilities.reduce((acc, curr) => acc + curr.monthlyPayment, 0);

  // 3. Buy Side
  // We use the proceeds to pay off debt first, remainder goes to down payment
  // If proceeds aren't enough to pay debt, we assume partial payoff or user brings cash (simplified: assume full payoff for this calc to work as intended)
  let availableDownPayment = netProceedsAfterSale - totalLiabilitiesBalance;
  
  // Prevent negative down payment in logic (implies user needs cash to close)
  // For the sake of the tool, we track it raw, but loan calc needs positive principal
  
  const buyingClosingCosts = newHome.price * (newHome.closingCostsPercent / 100);
  availableDownPayment = availableDownPayment - buyingClosingCosts;

  const newLoanAmount = newHome.price - availableDownPayment;

  // 4. Monthly Obligations - OLD
  // Need to estimate original loan amount or just calc P&I based on current balance? 
  // *Critically*: Users usually know their payment. But we asked for rate/balance. 
  // We will calculate P&I based on current balance re-amortized over 30 years for simplicity, 
  // or strictly use the balance as if it were a new loan. 
  // Accuracy Note: To be perfect we'd need original loan amount + start date. 
  // Proxy: Calculate P&I on current balance at current rate.
  const oldPrincipalAndInterest = calculateMortgagePayment(current.mortgageBalance, current.interestRate);
  const oldMonthlyTotal = 
    oldPrincipalAndInterest + 
    (current.propertyTaxYearly / 12) + 
    current.hoaMonthly + 
    totalLiabilityPayments;

  // 5. Monthly Obligations - NEW
  const newPrincipalAndInterest = calculateMortgagePayment(newLoanAmount, newHome.interestRate);
  const newMonthlyTotal = 
    newPrincipalAndInterest + 
    (newHome.propertyTaxYearly / 12) + 
    newHome.hoaMonthly;

  return {
    netEquity: grossEquity,
    sellingCosts,
    totalLiabilitiesPayoff: totalLiabilitiesBalance,
    availableDownPayment,
    newLoanAmount,
    oldPrincipalAndInterest,
    newPrincipalAndInterest,
    totalLiabilityPayments,
    oldMonthlyTotal,
    newMonthlyTotal,
    monthlySavings: oldMonthlyTotal - newMonthlyTotal,
    breakEvenMonths: 0, // Complex calc, skipping for MVP visuals
  };
};