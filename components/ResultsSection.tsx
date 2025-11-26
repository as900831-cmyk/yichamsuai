import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TaxResult } from '../types';
import { formatCurrency, formatNumber } from '../constants';
import { Calculator, ChevronRight, TrendingDown, Coins, ScrollText } from 'lucide-react';

interface ResultsSectionProps {
  result: TaxResult;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b']; // Emerald, Blue, Amber

export const ResultsSection: React.FC<ResultsSectionProps> = ({ result }) => {
  const pieData = [
    { name: '免稅額', value: result.exemptionAmount },
    { name: '扣除額', value: result.deductionAmount },
    { name: '課稅淨額', value: result.taxableEstateValue },
  ];

  return (
    <div className="space-y-6">
      {/* Top Card: Final Tax */}
      <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-emerald-100 text-lg font-medium mb-1">預估應納遺產稅額</h2>
          <div className="text-4xl md:text-5xl font-bold tracking-tight">
            {formatCurrency(result.finalTaxPayable)}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-emerald-100/80">
            <div className="flex items-center gap-1">
               <span className="bg-emerald-800 px-2 py-1 rounded text-white">適用稅率 {(result.taxBracketRate * 100).toFixed(0)}%</span>
            </div>
            {result.progressiveDifference > 0 && (
              <div className="flex items-center gap-1">
                <span>累進差額: -{formatNumber(result.progressiveDifference)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="absolute right-[-20px] top-[-20px] opacity-10">
          <Coins size={200} />
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Calculator size={18} />
            <span className="text-sm font-medium">遺產總額</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{formatNumber(result.totalEstateValue)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <TrendingDown size={18} />
            <span className="text-sm font-medium">免稅額 + 扣除額</span>
          </div>
          <p className="text-xl font-bold text-emerald-600">
            {formatNumber(result.exemptionAmount + result.deductionAmount)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <ScrollText size={18} />
            <span className="text-sm font-medium">課稅遺產淨額</span>
          </div>
          <p className="text-xl font-bold text-blue-600">{formatNumber(result.taxableEstateValue)}</p>
        </div>
      </div>

      {/* Breakdown Details */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
           <h3 className="font-semibold text-slate-800 flex items-center gap-2">
             <Calculator size={18} className="text-emerald-600"/>
             試算明細
           </h3>
        </div>
        <div className="p-0 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart */}
          <div className="h-64 md:h-full min-h-[300px] flex flex-col items-center justify-center p-4">
            <h4 className="text-sm text-slate-500 mb-4 font-medium">遺產金額結構</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center text-xs text-slate-400 mt-2">
              * 圖表顯示總額如何被免稅額與扣除額抵銷
            </div>
          </div>

          {/* Detailed List */}
          <div className="space-y-4 p-4">
             {/* Formula */}
            <div className="bg-slate-50 p-3 rounded-lg text-sm font-mono text-slate-600 border border-slate-200">
               遺產總額 - (免稅額 + 扣除額) = 課稅淨額
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-600">遺產總額</span>
                <span className="font-semibold">{formatNumber(result.totalEstateValue)}</span>
              </div>
              
              <div className="pl-4 border-l-2 border-emerald-500 space-y-2">
                 <div className="flex justify-between items-center text-emerald-700 font-medium">
                    <span>(-) 免稅額合計</span>
                    <span>{formatNumber(result.exemptionAmount)}</span>
                 </div>
                 {result.breakdown.exemptionDetails.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center text-slate-500 text-xs">
                     <span>{item.label}</span>
                     <span>{formatNumber(item.amount)}</span>
                   </div>
                 ))}
              </div>

              <div className="pl-4 border-l-2 border-blue-500 space-y-2">
                 <div className="flex justify-between items-center text-blue-700 font-medium">
                    <span>(-) 扣除額合計</span>
                    <span>{formatNumber(result.deductionAmount)}</span>
                 </div>
                 {result.breakdown.deductionDetails.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center text-slate-500 text-xs">
                     <span>{item.label}</span>
                     <span>{formatNumber(item.amount)}</span>
                   </div>
                 ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 font-bold text-base">
                <span className="text-slate-900">課稅遺產淨額</span>
                <span className="text-blue-600">{formatNumber(result.taxableEstateValue)}</span>
              </div>

              <div className="bg-emerald-50 p-3 rounded-lg space-y-2 mt-4">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-emerald-900">稅率</span>
                    <span className="font-bold text-emerald-900">{(result.taxBracketRate * 100).toFixed(0)}%</span>
                 </div>
                 {result.progressiveDifference > 0 && (
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-emerald-900">累進差額</span>
                      <span className="font-bold text-emerald-900">-{formatNumber(result.progressiveDifference)}</span>
                   </div>
                 )}
                 <div className="flex justify-between items-center text-base pt-2 border-t border-emerald-200">
                    <span className="font-bold text-emerald-900">應納稅額</span>
                    <span className="font-bold text-emerald-900">{formatCurrency(result.finalTaxPayable)}</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};