'use client';

import { useState, useEffect, useRef } from 'react';
import { FiX, FiSearch, FiBook, FiUsers, FiMessageSquare, FiEdit3, FiFileText, FiCalendar, FiUser, FiDatabase } from 'react-icons/fi';
import Link from 'next/link';
import KeywordTableModal from './KeywordTableModal';

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  if (!isOpen) return null;

  // TODO: 실제 검색 API 연동 시 사용
  const mockResults: Record<TabType, SearchResult[]> = {
    'Library': [
      {
        id: 1,
        title: '외부 교육자료 샘플 데이터',
        description: '외부 교육자료 샘플 데이터 설명',
        category: '기타 - 외부 교육자료',
        author: 'guest23',
        date: '2025.09.09',
        href: '/library'
      },
      {
        id: 2,
        title: 'KOITA MOT 기술경영 부서장 교육 25년 9월',
        description: '기술경영 부서장 교육 자료',
        category: '기타 - 외부 교육자료',
        author: 'admin',
        date: '2025.09.10',
        href: '/library'
      }
    ],
    'Learning': [
      {
        id: 1,
        title: 'z-10: 집에서 개발 테스트용 DB 확인용',
        description: '개발 테스트용 학습 자료',
        category: '기초 과정',
        author: 'admin',
        date: '2025.09.08',
        href: '/learning'
      }
    ],
    'Research': [
      {
        id: 1,
        title: '기술전략수립과 기술로드맵의 활용',
        description: '기술전략 수립 방법론 및 로드맵 활용에 대한 연구',
        category: '기술전략',
        author: '연구자1',
        date: '2025.09.05',
        href: '/opinions'
      },
      {
        id: 2,
        title: '기업의 환경분석 개념, 방법론 및 활용',
        description: '기업 환경분석에 대한 개념과 방법론',
        category: '환경분석',
        author: '연구자2',
        date: '2025.09.06',
        href: '/opinions'
      }
    ],
    'Q&A': [
      {
        id: 1,
        title: 'R&D 관리체계의 혁신을 위한 접근 방법 (중견기업)',
        description: '중견기업의 R&D 관리체계 혁신에 대한 질문',
        category: 'R&D 관리',
        author: 'user@example.com',
        date: '2025.09.07',
        href: '/qna'
      },
      {
        id: 2,
        title: '기술로드맵의 전개시 Layer의 구성 방법',
        description: '기술로드맵 Layer 구성에 대한 질문',
        category: '기술로드맵',
        author: 'user2@example.com',
        date: '2025.09.08',
        href: '/qna'
      }
    ]
  };

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

  const results = mockResults[activeTab];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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
                    // TODO: 검색 실행
                    e.preventDefault();
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
              onClick={() => {
                // TODO: 검색 실행
                if (searchQuery.trim()) {
                  // 검색 로직 실행
                }
              }}
              className="inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
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
                    {results.length > 0 && (
                      <span className={`
                        ml-2 px-2 py-0.5 rounded-full text-xs
                        ${isActive ? 'bg-gray-100 text-gray-700' : 'bg-gray-200 text-gray-600'}
                      `}>
                        {results.length}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 검색 결과 영역 */}
        <div className="flex-1 overflow-y-auto p-6">
          {!searchQuery.trim() ? (
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
                <Link
                  key={result.id}
                  href={result.href}
                  onClick={onClose}
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
                </Link>
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
                  <span>전체 결과: {Object.values(mockResults).flat().length}개</span>
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
      </div>
    </div>
  );
}

