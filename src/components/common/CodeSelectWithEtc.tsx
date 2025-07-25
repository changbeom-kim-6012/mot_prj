import React, { useState, useEffect } from 'react';
import { useCommonCodes, CommonCode } from '@/hooks/useCommonCodes';

interface CodeSelectWithEtcProps {
  menuName: string;
  value: string;
  onChange: (value: string) => void;
  etcValue?: string;
  onEtcChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  hideEtcInput?: boolean;
}

export const CodeSelectWithEtc: React.FC<CodeSelectWithEtcProps> = ({ 
  menuName, 
  value, 
  onChange, 
  etcValue = '', 
  onEtcChange, 
  placeholder, 
  className = '',
  disabled = false,
  hideEtcInput = false
}) => {
  const { codes, hasEtc, loading, error } = useCommonCodes(menuName);
  const [showEtcInput, setShowEtcInput] = useState(false);

  useEffect(() => {
    setShowEtcInput(value === '기타');
  }, [value]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-3 border border-gray-300 rounded-lg bg-gray-50">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-500">로딩 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 border border-red-300 rounded-lg bg-red-50 text-red-600 text-sm">
        오류: {error}
      </div>
    );
  }

  return (
    <div className={showEtcInput && hasEtc && onEtcChange && !hideEtcInput ? "grid grid-cols-2 gap-2" : "space-y-2"}>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
        disabled={disabled}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {codes.map(code => (
          <option key={code.id} value={code.codeName}>
            {code.codeName}
          </option>
        ))}
      </select>
      
      {hasEtc && showEtcInput && onEtcChange && !hideEtcInput && (
        <input
          type="text"
          value={etcValue}
          onChange={(e) => onEtcChange(e.target.value)}
          placeholder="기타를 선택하면 입력 가능"
          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={disabled}
        />
      )}
    </div>
  );
}; 