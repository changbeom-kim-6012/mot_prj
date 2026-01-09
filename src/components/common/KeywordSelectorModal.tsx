'use client';

import { useState, useEffect } from 'react';
import { FiX, FiSearch, FiCheck, FiPlus } from 'react-icons/fi';
import { getApiUrl } from '@/config/api';

interface Keyword {
  id: number;
  menuType: string;
  keyword: string;
  description?: string;
  isActive: boolean;
}

interface KeywordSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuType: string; // 'Library', 'Learning', 'Research', 'Q&A'
  currentKeywords: string; // 현재 입력된 키워드 (쉼표로 구분)
  onSelectKeywords: (keywords: string) => void; // 선택된 키워드를 반환하는 콜백
}

export default function KeywordSelectorModal({
  isOpen,
  onClose,
  menuType,
  currentKeywords,
  onSelectKeywords
}: KeywordSelectorModalProps) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [customKeyword, setCustomKeyword] = useState('');

  // 현재 키워드를 파싱하여 선택 상태로 설정
  useEffect(() => {
    if (isOpen && currentKeywords) {
      const keywordList = currentKeywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
      setSelectedKeywords(new Set(keywordList));
    } else if (isOpen) {
      setSelectedKeywords(new Set());
    }
  }, [isOpen, currentKeywords]);

  // 키워드 목록 조회
  useEffect(() => {
    if (isOpen) {
      fetchKeywords();
    }
  }, [isOpen, menuType]);

  const fetchKeywords = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl(`/api/keywords/active/menu/${menuType}`));
      if (!response.ok) {
        throw new Error('키워드 목록 조회 실패');
      }
      const data = await response.json();
      setKeywords(data);
    } catch (error) {
      console.error('키워드 목록 조회 실패:', error);
      setKeywords([]);
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 키워드 목록
  const filteredKeywords = keywords.filter(keyword =>
    keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (keyword.description && keyword.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 키워드 선택/해제
  const toggleKeyword = (keyword: string) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keyword)) {
      newSelected.delete(keyword);
    } else {
      newSelected.add(keyword);
    }
    setSelectedKeywords(newSelected);
  };

  // 커스텀 키워드 추가
  const addCustomKeyword = () => {
    if (customKeyword.trim()) {
      const trimmed = customKeyword.trim();
      const newSelected = new Set(selectedKeywords);
      newSelected.add(trimmed);
      setSelectedKeywords(newSelected);
      setCustomKeyword('');
    }
  };

  // 선택된 키워드 적용
  const handleApply = () => {
    const keywordArray = Array.from(selectedKeywords);
    const keywordString = keywordArray.join(', ');
    onSelectKeywords(keywordString);
    onClose();
  };

  // 선택된 키워드 제거
  const removeKeyword = (keyword: string) => {
    const newSelected = new Set(selectedKeywords);
    newSelected.delete(keyword);
    setSelectedKeywords(newSelected);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">키워드 선택</h3>
            <p className="text-sm text-gray-500 mt-1">{menuType} 메뉴의 키워드를 선택하거나 추가하세요</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* 검색 및 커스텀 키워드 입력 */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          {/* 검색 */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="키워드 검색..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* 커스텀 키워드 추가 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customKeyword}
              onChange={(e) => setCustomKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomKeyword();
                }
              }}
              placeholder="새 키워드를 입력하고 Enter 또는 추가 버튼을 클릭하세요"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <button
              onClick={addCustomKeyword}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="w-4 h-4 mr-1" />
              추가
            </button>
          </div>
        </div>

        {/* 선택된 키워드 표시 */}
        {selectedKeywords.size > 0 && (
          <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 mr-2">선택된 키워드:</span>
              {Array.from(selectedKeywords).map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 키워드 목록 */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredKeywords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? '검색 결과가 없습니다.' : '등록된 키워드가 없습니다.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {filteredKeywords.map((keyword) => {
                const isSelected = selectedKeywords.has(keyword.keyword);
                return (
                  <button
                    key={keyword.id}
                    onClick={() => toggleKeyword(keyword.keyword)}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{keyword.keyword}</div>
                      {keyword.description && (
                        <div className="text-sm text-gray-500 mt-1">{keyword.description}</div>
                      )}
                    </div>
                    {isSelected && (
                      <FiCheck className="w-5 h-5 text-blue-600 ml-3" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            취소
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            적용 ({selectedKeywords.size}개)
          </button>
        </div>
      </div>
    </div>
  );
}







