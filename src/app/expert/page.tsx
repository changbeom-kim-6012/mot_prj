'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { FiUser, FiMail, FiSearch, FiFilter } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Expert } from '@/types/expert';

export default function ExpertPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);

  // 활성 전문가 데이터 가져오기
  const fetchActiveExperts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/experts/active');
      setExperts(response.data);
      setFilteredExperts(response.data);
    } catch (error: any) {
      console.error('전문가 데이터 가져오기 실패:', error);
      setError('전문가 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 실행
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredExperts(experts);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      const response = await axios.get(`/api/experts/search/name?name=${encodeURIComponent(searchTerm)}`);
      setFilteredExperts(response.data);
    } catch (error: any) {
      console.error('검색 실패:', error);
      setError('검색에 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 전문분야별 필터링
  const handleFieldFilter = (field: string) => {
    setSelectedField(field);
    
    if (field === 'all') {
      setFilteredExperts(experts);
      return;
    }

    const filtered = experts.filter(expert => 
      expert.field && expert.field.toLowerCase().includes(field.toLowerCase())
    );
    setFilteredExperts(filtered);
  };

  // 엔터키 검색
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 전문분야 목록 추출
  const getUniqueFields = () => {
    const fields = experts
      .map(expert => expert.field)
      .filter(field => field && field.trim() !== '')
      .map(field => field!.split(',')[0].trim()) // 첫 번째 전문분야만 사용
      .filter((field, index, arr) => arr.indexOf(field) === index); // 중복 제거
    
    return fields;
  };

  useEffect(() => {
    fetchActiveExperts();
  }, []);

  if (loading && experts.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>데이터를 불러오는 중...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-28">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f6,#8b5cf6,#3b82f6)] opacity-30">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M0 32V.5H32" fill="none" stroke="rgba(255,255,255,0.1)"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)"></rect>
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <FiUser className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-white">전문가 프로필</h1>
            </div>
                         <p className="text-base text-blue-100 max-w-[1150px] text-right">
               기술경영 지식을 나누며 함께 성장하는 MOT Club입니다.
             </p>
             <p className="text-base text-blue-100 max-w-[1150px] text-right">
               여러분의 귀한 경험과 통찰을 지식 나눔을 통해 함께 발전해 나갈 분들 환영합니다.
             </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 검색 및 필터 영역 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 검색 입력 */}
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="전문가 이름으로 검색하세요"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>

            {/* 검색 버튼 */}
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FiSearch className="mr-2 h-4 w-4" />
              )}
              검색
            </button>
          </div>

          {/* 전문분야 필터 */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => handleFieldFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedField === 'all' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {getUniqueFields().map((field) => (
              <button
                key={field}
                onClick={() => handleFieldFilter(field)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedField === field 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {field}
              </button>
            ))}
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 전문가 목록 */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>데이터를 불러오는 중...</span>
            </div>
          </div>
        ) : filteredExperts.length === 0 ? (
          <div className="text-center py-12">
            <FiUser className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">전문가가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedField !== 'all' ? '검색 조건에 맞는 전문가가 없습니다.' : '등록된 전문가가 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredExperts.map((expert, index) => (
                <motion.div
                  key={expert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  {/* 프로필 헤더 */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                        <FiUser className="w-8 h-8 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-bold text-white">{expert.name}</h3>
                        <p className="text-blue-100 text-sm">{expert.field || '전문가'}</p>
                      </div>
                    </div>
                  </div>

                  {/* 프로필 내용 */}
                  <div className="p-6">
                    {/* 연락처 정보 */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <FiMail className="mr-3 h-4 w-4 text-gray-400" />
                        <span className="truncate">{expert.email}</span>
                      </div>
                    </div>

                    {/* 학력 및 경력 */}
                    {(expert.education || expert.career) && (
                      <div className="space-y-4">
                        {expert.education && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">학력</h4>
                            <div className="text-sm text-gray-600 whitespace-pre-line">
                              {expert.education}
                            </div>
                          </div>
                        )}
                        {expert.career && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">경력</h4>
                            <div className="text-sm text-gray-600 whitespace-pre-line">
                              {expert.career}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* 요약 정보 */}
        <div className="mt-8 text-sm text-gray-500 text-center">
          총 {filteredExperts.length}명의 전문가가 표시됩니다.
        </div>
        </div>
      </div>
    </main>
  );
} 