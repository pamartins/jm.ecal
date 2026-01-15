import React, { useState, useEffect, useRef } from 'react';
import { Download, Calculator, Trash2, Plus, Sparkles, TrendingUp, TrendingDown, Home, CreditCard, DollarSign } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import { CurrentHome, Liability, NewHome, CalculationResult, ScenarioType } from './types';
import { SCENARIOS } from './constants';
import { calculateScenario, formatCurrency } from './utils/math';
import AnalysisChart from './components/AnalysisChart';
import { generateFinancialInsight } from './services/geminiService';

// Moved components outside to avoid recreation on every render and fix TS type inference issues
const InputLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{children}</label>
);

const InputField = ({ 
  value, 
  onChange, 
  type = "number",
  prefix 
}: { 
  value: number | string, 
  onChange: (val: any) => void, 
  type?: string,
  prefix?: string 
}) => (
  <div className="relative">
    {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{prefix}</span>}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
      className={`w-full bg-white border border-slate-200 text-slate-900 rounded-md py-2 ${prefix ? 'pl-8' : 'pl-3'} pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm`}
    />
  </div>
);

const App: React.FC = () => {
  // --- State ---
  const [currentHome, setCurrentHome] = useState<CurrentHome>({
    value: 500000,
    mortgageBalance: 300000,
    interestRate: 3.0,
    propertyTaxYearly: 6000,
    hoaMonthly: 50,
  });

  const [liabilities, setLiabilities] = useState<Liability[]>([
    { id: '1', name: 'Car Loan', balance: 25000, monthlyPayment: 450 },
    { id: '2', name: 'Credit Card', balance: 12000, monthlyPayment: 300 },
  ]);

  const [newHome, setNewHome] = useState<NewHome>({
    price: 600000,
    interestRate: 6.5,
    propertyTaxYearly: 7200,
    hoaMonthly: 100,
    closingCostsPercent: 2,
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  useEffect(() => {
    const res = calculateScenario(currentHome, liabilities, newHome);
    setResult(res);
  }, [currentHome, liabilities, newHome]);

  // --- Handlers ---
  const loadScenario = (type: ScenarioType) => {
    const scenario = SCENARIOS[type];
    setCurrentHome(scenario.current);
    setLiabilities(scenario.liabilities.map(l => ({...l, id: Math.random().toString()})));
    setNewHome(scenario.newHome);
    setAiInsight(''); // Reset AI on scenario change
  };

  const handleLiabilityChange = (id: string, field: keyof Liability, value: string | number) => {
    setLiabilities(prev => prev.map(l => 
      l.id === id ? { ...l, [field]: value } : l
    ));
  };

  const addLiability = () => {
    setLiabilities(prev => [...prev, { id: Math.random().toString(), name: 'New Debt', balance: 0, monthlyPayment: 0 }]);
  };

  const removeLiability = (id: string) => {
    setLiabilities(prev => prev.filter(l => l.id !== id));
  };

  const fetchAiInsight = async () => {
    if (!result) return;
    setLoadingAi(true);
    const insight = await generateFinancialInsight(currentHome, liabilities, newHome, result);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  const exportPdf = async () => {
    if (!resultsRef.current) return;
    const canvas = await html2canvas(resultsRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('Equity_Unlock_Analysis.pdf');
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-slate-900 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calculator className="text-blue-400" />
              Equity Unlock Calculator
            </h1>
            <p className="text-slate-400 text-sm mt-1">Visualize the power of debt consolidation</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => loadScenario(ScenarioType.CONSERVATIVE)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded border border-slate-700 transition">Low Rate Ex</button>
            <button onClick={() => loadScenario(ScenarioType.MODERATE)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded border border-slate-700 transition">Med Rate Ex</button>
            <button onClick={() => loadScenario(ScenarioType.AGGRESSIVE)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded border border-slate-700 transition">High Rate Ex</button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: INPUTS */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Current Home Section */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                <Home className="w-5 h-5 text-slate-500" />
                <h2 className="font-bold text-slate-700">Current Situation</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <InputLabel>Home Value</InputLabel>
                  <InputField prefix="$" value={currentHome.value} onChange={(v) => setCurrentHome({...currentHome, value: v})} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <InputLabel>Mortgage Balance</InputLabel>
                  <InputField prefix="$" value={currentHome.mortgageBalance} onChange={(v) => setCurrentHome({...currentHome, mortgageBalance: v})} />
                </div>
                <div>
                  <InputLabel>Interest Rate (%)</InputLabel>
                  <InputField value={currentHome.interestRate} onChange={(v) => setCurrentHome({...currentHome, interestRate: v})} />
                </div>
                <div>
                  <InputLabel>Yearly Taxes</InputLabel>
                  <InputField prefix="$" value={currentHome.propertyTaxYearly} onChange={(v) => setCurrentHome({...currentHome, propertyTaxYearly: v})} />
                </div>
                <div>
                  <InputLabel>HOA Monthly</InputLabel>
                  <InputField prefix="$" value={currentHome.hoaMonthly} onChange={(v) => setCurrentHome({...currentHome, hoaMonthly: v})} />
                </div>
              </div>
            </section>

            {/* Liabilities Section */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-slate-500" />
                  <h2 className="font-bold text-slate-700">Liabilities to Payoff</h2>
                </div>
                <button onClick={addLiability} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Debt
                </button>
              </div>
              <div className="p-6 space-y-4">
                {liabilities.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-end bg-slate-50 p-3 rounded-md">
                    <div className="col-span-4">
                      <InputLabel>Type</InputLabel>
                      <InputField type="text" value={item.name} onChange={(v) => handleLiabilityChange(item.id, 'name', v)} />
                    </div>
                    <div className="col-span-3">
                      <InputLabel>Balance</InputLabel>
                      <InputField prefix="$" value={item.balance} onChange={(v) => handleLiabilityChange(item.id, 'balance', v)} />
                    </div>
                    <div className="col-span-3">
                      <InputLabel>Payment</InputLabel>
                      <InputField prefix="$" value={item.monthlyPayment} onChange={(v) => handleLiabilityChange(item.id, 'monthlyPayment', v)} />
                    </div>
                    <div className="col-span-2 flex justify-center pb-2">
                      <button onClick={() => removeLiability(item.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {liabilities.length === 0 && <p className="text-slate-400 text-center italic text-sm">No liabilities added.</p>}
              </div>
            </section>

            {/* New Home Section */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-slate-500" />
                <h2 className="font-bold text-slate-700">New Home Scenario</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <InputLabel>Purchase Price</InputLabel>
                  <InputField prefix="$" value={newHome.price} onChange={(v) => setNewHome({...newHome, price: v})} />
                </div>
                <div>
                  <InputLabel>New Interest Rate (%)</InputLabel>
                  <InputField value={newHome.interestRate} onChange={(v) => setNewHome({...newHome, interestRate: v})} />
                </div>
                <div>
                  <InputLabel>Closing Costs (%)</InputLabel>
                  <InputField value={newHome.closingCostsPercent} onChange={(v) => setNewHome({...newHome, closingCostsPercent: v})} />
                </div>
                <div>
                  <InputLabel>New Yearly Taxes</InputLabel>
                  <InputField prefix="$" value={newHome.propertyTaxYearly} onChange={(v) => setNewHome({...newHome, propertyTaxYearly: v})} />
                </div>
                <div>
                  <InputLabel>New HOA Monthly</InputLabel>
                  <InputField prefix="$" value={newHome.hoaMonthly} onChange={(v) => setNewHome({...newHome, hoaMonthly: v})} />
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="lg:col-span-7">
            {result && (
              <div ref={resultsRef} className="bg-slate-50 rounded-2xl p-6 md:p-8 space-y-6">
                
                {/* Result Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Financial Projection</h2>
                    <p className="text-slate-500">Comparing your current cash flow vs. the proposed move.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={fetchAiInsight}
                      disabled={loadingAi}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      {loadingAi ? 'Analyzing...' : 'AI Advisor'}
                    </button>
                    <button 
                      onClick={exportPdf}
                      className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg font-medium transition shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                  </div>
                </div>

                {/* Big Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl shadow-sm border ${result.monthlySavings > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                       {result.monthlySavings > 0 ? <TrendingUp className="w-5 h-5 text-green-600" /> : <TrendingDown className="w-5 h-5 text-red-600" />}
                       <span className={`text-sm font-semibold uppercase ${result.monthlySavings > 0 ? 'text-green-700' : 'text-red-700'}`}>Monthly Savings</span>
                    </div>
                    <div className={`text-3xl font-bold ${result.monthlySavings > 0 ? 'text-green-800' : 'text-red-800'}`}>
                      {result.monthlySavings > 0 ? '+' : ''}{formatCurrency(result.monthlySavings)}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                       <DollarSign className="w-5 h-5 text-blue-600" />
                       <span className="text-sm font-semibold uppercase text-slate-500">Debt Eliminated</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">
                      {formatCurrency(result.totalLiabilitiesPayoff)}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                       <Home className="w-5 h-5 text-indigo-600" />
                       <span className="text-sm font-semibold uppercase text-slate-500">Equity to New Home</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">
                      {formatCurrency(result.availableDownPayment)}
                    </div>
                  </div>
                </div>

                {/* AI Insight Box */}
                {aiInsight && (
                  <div className="bg-purple-50 border border-purple-200 p-6 rounded-xl animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h3 className="font-bold text-purple-900">AI Advisor Insight</h3>
                    </div>
                    <div className="prose prose-purple prose-sm max-w-none text-slate-700">
                      <div dangerouslySetInnerHTML={{ __html: aiInsight.replace(/\n/g, '<br/>') }} />
                    </div>
                  </div>
                )}

                {/* Charts */}
                <AnalysisChart result={result} />

                {/* Detailed Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                      <tr>
                        <th className="px-6 py-3">Details</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="px-6 py-3">Gross Equity (Current Home)</td>
                        <td className="px-6 py-3 text-right font-medium">{formatCurrency(result.netEquity)}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3 text-slate-500">(-) Estimated Selling Costs (~7%)</td>
                        <td className="px-6 py-3 text-right text-red-500">-{formatCurrency(result.sellingCosts)}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3 text-slate-500">(-) Liability Payoff</td>
                        <td className="px-6 py-3 text-right text-red-500">-{formatCurrency(result.totalLiabilitiesPayoff)}</td>
                      </tr>
                      <tr className="bg-blue-50/50">
                        <td className="px-6 py-3 font-semibold text-blue-900">(=) Remaining for Down Payment</td>
                        <td className="px-6 py-3 text-right font-bold text-blue-900">{formatCurrency(result.availableDownPayment)}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-3">New Loan Amount</td>
                        <td className="px-6 py-3 text-right">{formatCurrency(result.newLoanAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;