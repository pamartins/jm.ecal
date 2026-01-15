import { CurrentHome, Liability, NewHome, ScenarioType } from './types';
import { v4 as uuidv4 } from 'uuid'; // Simulation of unique IDs

export const SCENARIOS = {
  [ScenarioType.CONSERVATIVE]: {
    current: {
      value: 650000,
      mortgageBalance: 400000,
      interestRate: 3.25,
      propertyTaxYearly: 7500,
      hoaMonthly: 50,
    } as CurrentHome,
    liabilities: [
      { id: '1', name: 'Auto Loan', balance: 35000, monthlyPayment: 650 },
      { id: '2', name: 'Credit Cards', balance: 15000, monthlyPayment: 400 },
    ] as Liability[],
    newHome: {
      price: 750000,
      interestRate: 6.5,
      propertyTaxYearly: 8500,
      hoaMonthly: 100,
      closingCostsPercent: 2,
    } as NewHome
  },
  [ScenarioType.MODERATE]: {
    current: {
      value: 850000,
      mortgageBalance: 500000,
      interestRate: 3.0,
      propertyTaxYearly: 9000,
      hoaMonthly: 150,
    } as CurrentHome,
    liabilities: [
      { id: '1', name: 'SUV Loan', balance: 45000, monthlyPayment: 850 },
      { id: '2', name: 'Student Loans', balance: 60000, monthlyPayment: 600 },
      { id: '3', name: 'Credit Cards', balance: 25000, monthlyPayment: 750 },
    ] as Liability[],
    newHome: {
      price: 900000,
      interestRate: 6.8, // Slightly higher rate
      propertyTaxYearly: 10000,
      hoaMonthly: 200,
      closingCostsPercent: 2,
    } as NewHome
  },
  [ScenarioType.AGGRESSIVE]: {
    current: {
      value: 1200000,
      mortgageBalance: 600000,
      interestRate: 2.8,
      propertyTaxYearly: 14000,
      hoaMonthly: 300,
    } as CurrentHome,
    liabilities: [
      { id: '1', name: 'Luxury Car', balance: 80000, monthlyPayment: 1400 },
      { id: '2', name: 'Personal Loan', balance: 50000, monthlyPayment: 1100 },
      { id: '3', name: 'Credit Consolidation', balance: 40000, monthlyPayment: 1200 },
    ] as Liability[],
    newHome: {
      price: 1400000,
      interestRate: 7.2,
      propertyTaxYearly: 16000,
      hoaMonthly: 400,
      closingCostsPercent: 2,
    } as NewHome
  }
};