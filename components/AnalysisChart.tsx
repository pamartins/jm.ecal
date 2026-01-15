import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { CalculationResult } from '../types';

interface AnalysisChartProps {
  result: CalculationResult;
}

const AnalysisChart: React.FC<AnalysisChartProps> = ({ result }) => {
  const data = [
    {
      name: 'Monthly Outflow',
      Current: result.oldMonthlyTotal,
      New: result.newMonthlyTotal,
    },
  ];

  const debtData = [
    { name: 'Mortgage Payment', value: result.oldPrincipalAndInterest, type: 'Current' },
    { name: 'Liability Payments', value: result.totalLiabilityPayments, type: 'Current' },
    { name: 'New Mortgage', value: result.newPrincipalAndInterest, type: 'New' },
  ];

  return (
    <div className="space-y-8">
      <div className="h-80 w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Monthly Cash Flow Comparison</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              cursor={{fill: 'transparent'}}
            />
            <Legend />
            <Bar dataKey="Current" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={40} name="Current Monthly Total" label={{ position: 'right', formatter: (v: number) => `$${Math.round(v)}` }} />
            <Bar dataKey="New" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={40} name="New Monthly Total" label={{ position: 'right', formatter: (v: number) => `$${Math.round(v)}` }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-100 p-4 rounded-lg">
           <h4 className="font-semibold text-slate-600 text-sm uppercase mb-2">Current Breakdown</h4>
           <div className="space-y-2">
             <div className="flex justify-between items-center text-sm">
                <span>Mortgage P&I</span>
                <span className="font-medium">${Math.round(result.oldPrincipalAndInterest).toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-center text-sm text-red-500">
                <span>Debt Payments</span>
                <span className="font-medium">+ ${Math.round(result.totalLiabilityPayments).toLocaleString()}</span>
             </div>
             <div className="border-t border-slate-300 pt-2 flex justify-between items-center font-bold">
                <span>Total</span>
                <span>${Math.round(result.oldMonthlyTotal).toLocaleString()}</span>
             </div>
           </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
           <h4 className="font-semibold text-blue-600 text-sm uppercase mb-2">New Breakdown</h4>
           <div className="space-y-2">
             <div className="flex justify-between items-center text-sm">
                <span>New Mortgage P&I</span>
                <span className="font-medium">${Math.round(result.newPrincipalAndInterest).toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-center text-sm text-green-600">
                <span>Debt Payments</span>
                <span className="font-medium">$0</span>
             </div>
             <div className="border-t border-blue-200 pt-2 flex justify-between items-center font-bold text-blue-900">
                <span>Total</span>
                <span>${Math.round(result.newMonthlyTotal).toLocaleString()}</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisChart;