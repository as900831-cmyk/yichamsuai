import React, { useState, useEffect, useMemo } from 'react';
import { calculateTax } from './utils/taxCalculator';
import { EstateParams, HeirParams, DeductionParams, MinorHeirInput } from './types';
import { NumberInput } from './components/NumberInput';
import { ResultsSection } from './components/ResultsSection';
import { Info, Users, Wallet, Landmark, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { EXEMPTIONS, DEDUCTIONS } from './constants';

const App: React.FC = () => {
  // --- State ---
  
  // Estate Assets
  const [estate, setEstate] = useState<EstateParams>({
    totalRealEstate: 0,
    cashAndSavings: 0,
    stocksAndInvestments: 0,
    otherAssets: 0,
    isDutyRelatedDeath: false,
  });

  // Heirs
  const [heirs, setHeirs] = useState<HeirParams>({
    hasSpouse: true,
    parentsCount: 0,
    adultChildrenCount: 0,
    minorChildrenAges: [],
    siblingsCount: 0,
    minorSiblingsAges: [],
    grandparentsCount: 0,
    disabledDependentsCount: 0,
  });

  // Deductions
  const [deductions, setDeductions] = useState<DeductionParams>({
    funeralExpenses: true,
    funeralExpensesActual: 0,
    outstandingDebts: 0,
    unpaidTaxes: 0,
    publicLandValue: 0,
    farmingLandValue: 0,
  });

  // Helper state for minor inputs
  const [minorChildrenInputs, setMinorChildrenInputs] = useState<MinorHeirInput[]>([]);
  const [minorSiblingInputs, setMinorSiblingInputs] = useState<MinorHeirInput[]>([]);

  // Update main state when inputs change
  useEffect(() => {
    setHeirs(prev => ({
      ...prev,
      minorChildrenAges: minorChildrenInputs.map(i => i.age),
      minorSiblingsAges: minorSiblingInputs.map(i => i.age),
    }));
  }, [minorChildrenInputs, minorSiblingInputs]);

  // Derived Result
  const result = useMemo(() => calculateTax(estate, heirs, deductions), [estate, heirs, deductions]);

  // Handlers
  const addMinorChild = () => {
    setMinorChildrenInputs(prev => [...prev, { id: crypto.randomUUID(), age: 0 }]);
  };
  const removeMinorChild = (id: string) => {
    setMinorChildrenInputs(prev => prev.filter(p => p.id !== id));
  };
  const updateMinorChildAge = (id: string, age: number) => {
    setMinorChildrenInputs(prev => prev.map(p => p.id === id ? { ...p, age } : p));
  };

  // UI Toggles for sections (optional, keeping all open for now for simplicity on desktop, maybe stack on mobile)
  const [activeTab, setActiveTab] = useState<'input' | 'result'>('input');
  
  // Mobile only tab switch
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-10">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Landmark className="text-white w-5 h-5" />
            </div>
            <div>
               <h1 className="text-lg font-bold text-slate-900 leading-tight">114年遺產稅試算</h1>
               <p className="text-xs text-slate-500">適用 2025/1/1 後案件</p>
            </div>
          </div>
          <div className="hidden md:block text-xs text-slate-400">
             免稅額 {EXEMPTIONS.GENERAL / 10000}萬 | 配偶扣除 {DEDUCTIONS.SPOUSE / 10000}萬
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Estate Assets Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <Wallet className="text-emerald-600 w-5 h-5" />
                <h2 className="font-semibold text-slate-800">遺產總額資訊</h2>
              </div>
              <div className="p-4 space-y-4">
                 <NumberInput 
                    label="不動產總額 (土地公告現值 + 房屋評定現值)" 
                    value={estate.totalRealEstate} 
                    onChange={v => setEstate({...estate, totalRealEstate: v})}
                    helperText="含公共設施保留地及農地，若有將在扣除額中減除"
                 />
                 <NumberInput 
                    label="現金、存款及外幣" 
                    value={estate.cashAndSavings} 
                    onChange={v => setEstate({...estate, cashAndSavings: v})}
                 />
                 <NumberInput 
                    label="股票、證券及投資" 
                    value={estate.stocksAndInvestments} 
                    onChange={v => setEstate({...estate, stocksAndInvestments: v})}
                 />
                 <NumberInput 
                    label="其他財產 (車輛、專利權、債權等)" 
                    value={estate.otherAssets} 
                    onChange={v => setEstate({...estate, otherAssets: v})}
                 />
                 
                 <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">是否為執行公務死亡？</label>
                    <button 
                      onClick={() => setEstate({...estate, isDutyRelatedDeath: !estate.isDutyRelatedDeath})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${estate.isDutyRelatedDeath ? 'bg-emerald-600' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${estate.isDutyRelatedDeath ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                 </div>
                 {estate.isDutyRelatedDeath && (
                   <p className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded">免稅額將提高至 2,666 萬元</p>
                 )}
              </div>
            </div>

            {/* Heirs Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <Users className="text-blue-600 w-5 h-5" />
                <h2 className="font-semibold text-slate-800">繼承人及扣除額資訊</h2>
              </div>
              <div className="p-4 space-y-5">
                
                {/* Spouse */}
                <div className="flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">配偶健在</span>
                      <span className="text-xs text-slate-500">扣除額 {DEDUCTIONS.SPOUSE / 10000} 萬</span>
                   </div>
                   <button 
                      onClick={() => setHeirs({...heirs, hasSpouse: !heirs.hasSpouse})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${heirs.hasSpouse ? 'bg-blue-600' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${heirs.hasSpouse ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <NumberInput 
                      label="健在父母人數" 
                      value={heirs.parentsCount} 
                      onChange={v => setHeirs({...heirs, parentsCount: v})}
                      suffix="人"
                      placeholder="0"
                  />
                  <NumberInput 
                      label="重度身心障礙人數" 
                      value={heirs.disabledDependentsCount} 
                      onChange={v => setHeirs({...heirs, disabledDependentsCount: v})}
                      suffix="人"
                      placeholder="0"
                  />
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <NumberInput 
                      label="成年子女 (直系血親卑親屬) 人數" 
                      value={heirs.adultChildrenCount} 
                      onChange={v => setHeirs({...heirs, adultChildrenCount: v})}
                      suffix="人"
                  />
                </div>

                {/* Minor Children Section */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                   <div className="flex justify-between items-center">
                     <label className="text-sm font-medium text-slate-700">未成年子女</label>
                     <button 
                        onClick={addMinorChild}
                        className="text-xs bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                     >
                       <Plus size={14} /> 新增一位
                     </button>
                   </div>
                   {minorChildrenInputs.length === 0 && (
                     <p className="text-xs text-slate-400">無未成年子女資料</p>
                   )}
                   <div className="space-y-2">
                      {minorChildrenInputs.map((child, index) => (
                        <div key={child.id} className="flex items-center gap-2">
                           <span className="text-xs text-slate-500 w-8">#{index + 1}</span>
                           <div className="flex-1 relative rounded-md shadow-sm">
                              <input 
                                type="number" 
                                placeholder="輸入年齡"
                                max="17"
                                value={child.age || ''}
                                onChange={(e) => updateMinorChildAge(child.id, parseFloat(e.target.value))}
                                className="block w-full rounded-md border-slate-300 py-1.5 pl-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-slate-500 text-xs">歲</span>
                              </div>
                           </div>
                           <button onClick={() => removeMinorChild(child.id)} className="text-slate-400 hover:text-red-500 p-1">
                             <Trash2 size={16} />
                           </button>
                        </div>
                      ))}
                   </div>
                   {minorChildrenInputs.length > 0 && (
                     <p className="text-xs text-blue-600 bg-blue-50 p-1 rounded">
                       未成年人扣除額：每人 {DEDUCTIONS.LINEAL_DESCENDANT/10000}萬 + 距離18歲每年加扣 {DEDUCTIONS.MINOR_YEARLY_ADDITION/10000}萬
                     </p>
                   )}
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => {
                     // Toggle logic if needed, currently simply displayed
                  }}>
                    <label className="text-sm font-medium text-slate-700">其他受扶養親屬 (兄弟姊妹/祖父母)</label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <NumberInput 
                        label="受扶養人數" 
                        value={heirs.siblingsCount + heirs.grandparentsCount} 
                        onChange={v => setHeirs({...heirs, siblingsCount: v})} // Simplified binding
                        helperText="祖父母、兄弟姊妹"
                        suffix="人"
                     />
                     {/* Simplified minor sibling implementation: just a count for demo or extend later. Keeping simple for now. */}
                  </div>
                </div>

              </div>
            </div>

            {/* Other Deductions */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <Info className="text-amber-600 w-5 h-5" />
                <h2 className="font-semibold text-slate-800">其他扣除項目</h2>
              </div>
              <div className="p-4 space-y-4">
                 <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">喪葬費扣除 (138萬)</label>
                     <button 
                      onClick={() => setDeductions({...deductions, funeralExpenses: !deductions.funeralExpenses})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${deductions.funeralExpenses ? 'bg-amber-500' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${deductions.funeralExpenses ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                 </div>
                 
                 <NumberInput 
                    label="被繼承人死亡前未償債務" 
                    value={deductions.outstandingDebts} 
                    onChange={v => setDeductions({...deductions, outstandingDebts: v})}
                 />
                 <NumberInput 
                    label="應納未納稅捐 / 罰金" 
                    value={deductions.unpaidTaxes} 
                    onChange={v => setDeductions({...deductions, unpaidTaxes: v})}
                 />
                 <NumberInput 
                    label="公共設施保留地價值" 
                    value={deductions.publicLandValue} 
                    onChange={v => setDeductions({...deductions, publicLandValue: v})}
                    helperText="將全額從遺產總額中扣除"
                 />
                 <NumberInput 
                    label="農業使用之農地價值" 
                    value={deductions.farmingLandValue} 
                    onChange={v => setDeductions({...deductions, farmingLandValue: v})}
                    helperText="將全額從遺產總額中扣除"
                 />
              </div>
             </div>

          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
             <div className="sticky top-20">
               <ResultsSection result={result} />
             </div>
          </div>
          
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-slate-100 rounded-lg text-xs text-slate-500 leading-relaxed">
          <h4 className="font-bold mb-2 text-slate-600">免責聲明與注意事項：</h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>本試算結果僅供參考，實際稅額以國稅局核定為準。</li>
            <li>依據民國 114 年（2025年）1 月 1 日起發生之繼承案件標準計算。</li>
            <li>「扣除額」項目需符合遺產及贈與稅法規定（如受扶養親屬需有扶養事實且未滿18歲或滿60歲或身心障礙等條件）。</li>
            <li>剩餘財產差額分配請求權未列入本簡易試算，若行使請求權可進一步降低遺產淨額，建議諮詢專業會計師或代書。</li>
          </ul>
        </div>

      </main>
    </div>
  );
};

export default App;