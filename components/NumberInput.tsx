import React from 'react';

interface NumberInputProps {
  label: string;
  value: number | undefined;
  onChange: (val: number) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  helperText?: string;
  className?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  prefix = "NT$",
  suffix,
  placeholder = "0",
  helperText,
  className = ""
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="relative rounded-md shadow-sm">
        {prefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-slate-500 sm:text-sm">{prefix}</span>
          </div>
        )}
        <input
          type="number"
          min="0"
          value={value === undefined || value === 0 ? '' : value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={`block w-full rounded-md border-slate-300 py-2 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 sm:text-sm sm:leading-6 border ${prefix ? 'pl-12' : 'pl-3'} ${suffix ? 'pr-12' : 'pr-3'}`}
          placeholder={placeholder}
        />
        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-slate-500 sm:text-sm">{suffix}</span>
          </div>
        )}
      </div>
      {helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};