'use client';

import { useState, useEffect, useRef } from 'react';
import { FiX, FiCheck, FiBook, FiUsers, FiMessageSquare, FiEdit3, FiMove, FiSearch } from 'react-icons/fi';
import { getApiUrl } from '@/config/api';

interface Keyword {
  id: number;
  menuType: string;
  keyword: string;
  description?: string;
  isActive: boolean;
}

interface KeywordTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectKeyword: (keyword: string) => void; // 선택된 키워드를 검색어로 전달
  searchQuery?: string; // 통합 검색의 검색어
  onSearchQueryChange?: (query: string) => void; // 검색어 변경 콜백
}

type MenuType = 'Library' | 'Learning' | 'Research' | 'Q&A';

const MENU_TYPES: MenuType[] = ['Library', 'Learning', 'Research', 'Q&A'];

const menuIcons = {
  'Library': FiBook,
  'Learning': FiUsers,
  'Research': FiEdit3,
  'Q&A': FiMessageSquare
};

const menuColors = {
  'Library': 'text-blue-600 border-blue-600 bg-blue-50',
  'Learning': 'text-emerald-600 border-emerald-600 bg-emerald-50',
  'Research': 'text-amber-600 border-amber-600 bg-amber-50',
  'Q&A': 'text-violet-600 border-violet-600 bg-violet-50'
};

export default function KeywordTableModal({
  isOpen,
  onClose,
  onSelectKeyword,
  searchQuery: externalSearchQuery = '',
  onSearchQueryChange
}: KeywordTableModalProps) {
  // activeMenu는 더 이상 사용하지 않지만, 호환성을 위해 유지
  const [activeMenu] = useState<MenuType>('Library');
  const [keywords, setKeywords] = useState<Record<MenuType, Keyword[]>>({
    'Library': [],
    'Learning': [],
    'Research': [],
    'Q&A': []
  });
  const [loading, setLoading] = useState<Record<MenuType, boolean>>({
    'Library': false,
    'Learning': false,
    'Research': false,
    'Q&A': false
  });
  
  // 검색어 상태 (통합 검색과 동기화)
  const [searchTerm, setSearchTerm] = useState('');
  
  // 선택된 키워드들 (여러 개 선택 가능)
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  
  // 드래그 관련 상태
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  // 통합 검색의 검색어와 동기화
  useEffect(() => {
    setSearchTerm(externalSearchQuery);
  }, [externalSearchQuery]);

  // 각 메뉴별 키워드 조회
  useEffect(() => {
    if (isOpen) {
      MENU_TYPES.forEach(menuType => {
        fetchKeywords(menuType);
      });
      // 모달이 열릴 때 위치 초기화 (원복)
      setPosition({ x: 0, y: 0 });
      // 선택된 키워드 초기화
      setSelectedKeywords(new Set());
    }
  }, [isOpen]);
  
  // 검색어 변경 핸들러
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // 통합 검색 모달의 검색어도 동기화
    if (onSearchQueryChange) {
      onSearchQueryChange(value);
    }
  };

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
      e.preventDefault();
    }
  };

  // 드래그 중
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && modalRef.current) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // 화면 경계 체크
        const modalWidth = modalRef.current.offsetWidth;
        const modalHeight = modalRef.current.offsetHeight;
        const maxX = window.innerWidth - modalWidth;
        const maxY = window.innerHeight - modalHeight;
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // 드래그 중 텍스트 선택 방지
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragOffset]);

  const fetchKeywords = async (menuType: MenuType) => {
    setLoading(prev => ({ ...prev, [menuType]: true }));
    try {
      const response = await fetch(getApiUrl(`/api/keywords/active/menu/${menuType}`));
      if (!response.ok) {
        throw new Error('키워드 목록 조회 실패');
      }
      const data = await response.json();
      setKeywords(prev => ({ ...prev, [menuType]: data }));
    } catch (error) {
      console.error(`${menuType} 키워드 목록 조회 실패:`, error);
      setKeywords(prev => ({ ...prev, [menuType]: [] }));
    } finally {
      setLoading(prev => ({ ...prev, [menuType]: false }));
    }
  };

  // 키워드 토글 (선택/해제)
  const handleToggleKeyword = (keyword: string) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keyword)) {
      newSelected.delete(keyword);
    } else {
      newSelected.add(keyword);
    }
    setSelectedKeywords(newSelected);
  };

  // 선택완료 버튼 클릭
  const handleCompleteSelection = () => {
    console.log('handleCompleteSelection 호출됨, 선택된 키워드:', Array.from(selectedKeywords));
    
    if (selectedKeywords.size === 0) {
      alert('키워드를 선택해주세요.');
      return;
    }
    
    // 선택된 키워드들을 공백으로 구분하여 검색어에 추가
    const keywordArray = Array.from(selectedKeywords);
    const keywordString = keywordArray.join(' ');
    
    console.log('키워드 문자열:', keywordString);
    console.log('현재 통합 검색어:', externalSearchQuery);
    
    // 통합 검색의 검색어에 추가 (externalSearchQuery 사용)
    if (externalSearchQuery.trim()) {
      // 기존 검색어가 있으면 공백으로 구분하여 추가
      const newQuery = `${externalSearchQuery} ${keywordString}`;
      console.log('새 검색어 (기존 있음):', newQuery);
      onSelectKeyword(newQuery);
    } else {
      // 검색어가 없으면 선택한 키워드들로 설정
      console.log('새 검색어 (기존 없음):', keywordString);
      onSelectKeyword(keywordString);
    }
    
    // 모달 닫기
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-30 overflow-y-auto h-full w-full z-[60] flex items-start justify-center p-4 pt-48">
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[60vh] flex flex-col mt-4"
        style={{
          transform: position.x !== 0 || position.y !== 0 ? `translate(${position.x}px, ${position.y}px)` : undefined,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      >
        {/* 헤더 - 드래그 가능 영역 */}
        <div
          className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiMove className="w-5 h-5 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900">키워드 테이블</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onMouseDown={(e) => e.stopPropagation()} // 드래그 방지
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
          
          {/* 검색 입력 필드와 선택완료 버튼 */}
          <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="키워드 검색..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCompleteSelection();
              }}
              disabled={selectedKeywords.size === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={selectedKeywords.size === 0 ? '키워드를 선택해주세요' : `${selectedKeywords.size}개 키워드 선택됨`}
            >
              선택완료 {selectedKeywords.size > 0 && `(${selectedKeywords.size})`}
            </button>
          </div>
        </div>

        {/* 키워드 테이블 영역 */}
        <div className="flex-1 overflow-y-auto">
          {Object.values(loading).some(l => l) ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="p-6">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="w-32 px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                      메뉴
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                      키워드
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {MENU_TYPES.map((menuType) => {
                    const Icon = menuIcons[menuType];
                    const menuKeywords = searchTerm === '' 
                      ? keywords[menuType]
                      : keywords[menuType].filter(keyword =>
                          keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (keyword.description && keyword.description.toLowerCase().includes(searchTerm.toLowerCase()))
                        );
                    
                    return (
                      <tr key={menuType} className="hover:bg-gray-50">
                        <td className="w-32 px-4 py-4 align-top border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-gray-600 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900 truncate">{menuType}</span>
                            {menuKeywords.length > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-600 flex-shrink-0">
                                {menuKeywords.length}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 border-b border-gray-100">
                          {menuKeywords.length === 0 ? (
                            <div className="text-sm text-gray-400 italic">
                              {searchTerm ? '검색 결과가 없습니다.' : '등록된 키워드가 없습니다.'}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {menuKeywords.map((keyword) => {
                                const isSelected = selectedKeywords.has(keyword.keyword);
                                return (
                                  <button
                                    key={keyword.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('키워드 클릭:', keyword.keyword, '현재 선택 상태:', isSelected);
                                      handleToggleKeyword(keyword.keyword);
                                      console.log('선택 후 상태:', selectedKeywords.has(keyword.keyword));
                                    }}
                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors text-sm ${
                                      isSelected
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50 text-gray-900'
                                    }`}
                                  >
                                    <span className="font-medium">{keyword.keyword}</span>
                                    {isSelected && <FiCheck className="w-4 h-4 text-blue-600" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

