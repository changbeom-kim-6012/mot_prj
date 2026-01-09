'use client';

import { useState, useEffect, useRef } from 'react';
import { FiX, FiSearch, FiBook, FiUsers, FiMessageSquare, FiEdit3, FiFileText, FiCalendar, FiUser, FiDatabase } from 'react-icons/fi';
import KeywordTableModal from './KeywordTableModal';
import SearchDetailModal from './SearchDetailModal';
import { searchUnified, UnifiedSearchResult, SearchItem } from '@/utils/unifiedSearchApi';

interface UnifiedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery?: string;
}

type TabType = 'Library' | 'Learning' | 'Research' | 'Q&A';

interface SearchResult {
  id: number;
  title: string;
  description?: string;
  category?: string;
  author?: string;
  date?: string;
  href: string;
}

export default function UnifiedSearchModal({
  isOpen,
  onClose,
  searchQuery: initialQuery = ''
}: UnifiedSearchModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('Library');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showKeywordTableModal, setShowKeywordTableModal] = useState(false);
  const [searchResults, setSearchResults] = useState<UnifiedSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<{ category: TabType; id: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSearchQuery(initialQuery);
    // 모달이 열릴 때 검색 결과 초기화
    if (isOpen && !initialQuery) {
      setSearchResults([]);
      setError(null);
    }
  }, [initialQuery, isOpen]);

  // 검색 실행
  const performSearch = async (query: string) => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await searchUnified(query.trim());
      setSearchResults(results);
    } catch (err) {
      console.error('검색 오류:', err);
      setError('검색 중 오류가 발생했습니다.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const tabs: TabType[] = ['Library', 'Learning', 'Research', 'Q&A'];
  const tabIcons = {
    'Library': FiBook,
    'Learning': FiUsers,
    'Research': FiEdit3,
    'Q&A': FiMessageSquare
  };
  const tabColors = {
    'Library': 'text-blue-600 border-blue-600',
    'Learning': 'text-emerald-600 border-emerald-600',
    'Research': 'text-amber-600 border-amber-600',
    'Q&A': 'text-violet-600 border-violet-600'
  };

  // 현재 탭의 검색 결과 가져오기
  const currentTabResult = searchResults.find(result => result.category === activeTab);
  const results: SearchResult[] = currentTabResult?.items.map(item => {
    let formattedDate: string | undefined;
    if (item.createdAt) {
      try {
        const date = new Date(item.createdAt);
        formattedDate = date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\./g, '.').replace(/\s/g, '');
      } catch (e) {
        formattedDate = undefined;
      }
    }
    
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      author: item.author,
      date: formattedDate,
      href: item.href
    };
  }) || [];

  const handleItemClick = (category: TabType, id: number) => {
    setSelectedDetail({ category, id });
    setDetailModalOpen(true);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold text-gray-900">통합 검색</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
          
          {/* 검색 입력 필드 */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    performSearch(searchQuery);
                  }
                }}
                placeholder="검색어를 입력하세요..."
                className="block w-full pl-10 pr-3 py-3 border-2 border-blue-400 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm"
                style={{ 
                  boxShadow: searchQuery ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : undefined 
                }}
              />
            </div>
            {/* 검색 버튼 */}
            <button
              onClick={() => performSearch(searchQuery)}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSearch className="w-4 h-4 mr-2" />
              검색
            </button>
            {/* 키워드 테이블 버튼 */}
            <button
              onClick={() => setShowKeywordTableModal(true)}
              className="inline-flex items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <FiDatabase className="w-4 h-4 mr-2" />
              키워드 테이블
            </button>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tabIcons[tab];
              const isActive = activeTab === tab;
              const colorClass = tabColors[tab];
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-6 py-3 text-sm font-medium border-b-2 transition-colors
                    ${isActive 
                      ? `${colorClass} border-b-2` 
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab}</span>
                    {(() => {
                      const tabResult = searchResults.find(r => r.category === tab);
                      const count = tabResult?.items.length || 0;
                      return count > 0 ? (
                        <span className={`
                          ml-2 px-2 py-0.5 rounded-full text-xs
                          ${isActive ? 'bg-gray-100 text-gray-700' : 'bg-gray-200 text-gray-600'}
                        `}>
                          {count}
                        </span>
                      ) : null;
                    })()}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 검색 결과 영역 */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 text-lg">검색 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-500 text-lg">{error}</p>
            </div>
          ) : !searchQuery.trim() ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">검색어를 입력하세요</p>
              <p className="text-gray-400 text-sm mt-2">Library, Learning, Research, Q&A에서 통합 검색합니다</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">검색 결과가 없습니다</p>
              <p className="text-gray-400 text-sm mt-2">다른 검색어를 시도해보세요</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleItemClick(activeTab, result.id)}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {result.title}
                      </h4>
                      {result.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {result.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {result.category && (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100">
                            {result.category}
                          </span>
                        )}
                        {result.author && (
                          <span className="flex items-center gap-1">
                            <FiUser className="w-3 h-3" />
                            {result.author}
                          </span>
                        )}
                        {result.date && (
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            {result.date}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <FiFileText className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                {searchQuery.trim() && (
                  <>
                    <span>전체 결과: {searchResults.reduce((sum, r) => sum + r.items.length, 0)}개</span>
                    <span className="text-gray-400">|</span>
                    <span>{activeTab} 결과: {results.length}개</span>
                  </>
                )}
              </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>

        {/* 키워드 테이블 모달 */}
        <KeywordTableModal
          isOpen={showKeywordTableModal}
          onClose={() => setShowKeywordTableModal(false)}
          searchQuery={searchQuery}
          onSearchQueryChange={(query) => {
            // 키워드 테이블의 검색어 변경 시 통합 검색의 검색어도 동기화
            setSearchQuery(query);
          }}
          onSelectKeyword={(keywords) => {
            // 선택된 키워드들을 검색어 입력 필드에 추가
            if (searchQuery.trim()) {
              // 기존 검색어가 있으면 공백으로 구분하여 추가
              setSearchQuery(`${searchQuery} ${keywords}`);
            } else {
              // 검색어가 없으면 선택한 키워드들로 설정
              setSearchQuery(keywords);
            }
            // 입력 필드에 포커스를 주어 추가 입력이 가능한 상태로 만들기
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.focus();
                // 커서를 입력 필드 끝으로 이동
                const length = inputRef.current.value.length;
                inputRef.current.setSelectionRange(length, length);
                inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }, 100);
          }}
        />

        {/* 상세 조회 모달 */}
        {selectedDetail && (
          <SearchDetailModal
            isOpen={detailModalOpen}
            onClose={() => {
              setDetailModalOpen(false);
              setSelectedDetail(null);
            }}
            category={selectedDetail.category}
            itemId={selectedDetail.id}
          />
        )}
      </div>
    </div>
  );
}

