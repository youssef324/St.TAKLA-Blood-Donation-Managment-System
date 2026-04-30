'use client';
import { useState } from 'react';

export default function Select({ 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select option', 
  error, 
  required,
  disabled,
  name,
  className = ''
}) {
  const [focused, setFocused] = useState(false);

  // Find the selected option label
  const selectedOption = options.find(opt => {
    const val = opt && typeof opt === 'object' && opt.hasOwnProperty('value') ? opt.value : opt;
    return String(val) === String(value);
  });
  const selectedLabel = selectedOption?.label || selectedOption || placeholder;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          name={name}
          value={value ?? ''}
          onChange={onChange}
          required={required}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full px-4 py-2.5 rounded-xl outline-none appearance-none cursor-pointer
            transition-all duration-300 bg-white border
            text-gray-900
            ${value !== undefined && value !== '' ? 'text-gray-900' : 'text-gray-400'}
            ${
              error
                ? 'border-red-500 ring-2 ring-red-200'
                : focused
                ? 'border-red-500 ring-2 ring-red-200 shadow-md'
                : 'border-gray-300 hover:border-gray-400'
            }
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          `}
        >
          <option value="" className="text-gray-400">{placeholder}</option>
          {options.map((option, i) => {
            const val = option && typeof option === 'object' && option.hasOwnProperty('value') ? option.value : option;
            const labelStr = option && typeof option === 'object' && option.hasOwnProperty('label') ? option.label : option;
            return (
              <option key={i} value={val} className="text-gray-900">
                {labelStr}
              </option>
            );
          })}
        </select>

        {/* Custom arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Floating Label for focus state */}
        {focused && (
          <div className="absolute left-3 -top-2 text-[10px] font-bold text-red-500 bg-white px-1 uppercase tracking-wider">
            {label || 'Selection'}
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs font-medium flex items-center gap-1 animate-shake">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}