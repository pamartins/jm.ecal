import { GoogleGenAI } from "@google/genai";
import { CalculationResult, CurrentHome, Liability, NewHome } from "../types";
import { formatCurrency } from "../utils/math";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateFinancialInsight = async (
  current: CurrentHome,
  liabilities: Liability[],
  newHome: NewHome,
  result: CalculationResult
): Promise<string> => {
  const liabilitySummary = liabilities.map(l => `${l.name}: ${formatCurrency(l.balance)} balance, ${formatCurrency(l.monthlyPayment)}/mo`).join('; ');
  
  const prompt = `
    Act as an expert real estate financial advisor.
    Analyze the following scenario for a homeowner considering moving from a low interest rate mortgage to a higher one to consolidate debt.

    **Current Situation:**
    - Home Value: ${formatCurrency(current.value)}
    - Current Mortgage Balance: ${formatCurrency(current.mortgageBalance)}
    - Current Rate: ${current.interestRate}%
    - Liabilities to Payoff: ${liabilitySummary} (Total Payments: ${formatCurrency(result.totalLiabilityPayments)})
    - Total Current Monthly Outflow (Housing + Debt): ${formatCurrency(result.oldMonthlyTotal)}

    **New Scenario:**
    - New Home Price: ${formatCurrency(newHome.price)}
    - New Interest Rate: ${newHome.interestRate}%
    - New Loan Amount: ${formatCurrency(result.newLoanAmount)}
    - New Monthly Housing Payment: ${formatCurrency(result.newMonthlyTotal)}
    
    **Result:**
    - Net Monthly Savings: ${formatCurrency(result.monthlySavings)}
    - Total Debt Eliminated: ${formatCurrency(result.totalLiabilitiesPayoff)}

    Provide a concise, professional, and persuasive summary (approx 150 words) explaining whether this is a good financial move. 
    Focus on "Cash Flow" vs "Interest Rate". 
    Use a tone that is empathetic to the fear of losing a 3% rate but highlights the freedom of eliminating bad debt.
    Format the output with markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not generate insight at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate AI insights due to an API configuration issue. Please check your API key.";
  }
};