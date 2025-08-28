'use client';

import Navigation from '@/components/Navigation';
import { FiSearch, FiFileText, FiPlus, FiRefreshCw, FiX, FiEye } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { CommunityItem, CommonCode } from '@/types/community';
import { useAuth } from '@/context/AuthContext';

export default function NewsPage() {
  const { user, isAuthenticated } = useAuth();
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [categories, setCategories] = useState<CommonCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CommunityItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  // 관리자 권한 확인
  const isAdmin = user?.role === 'ADMIN';

  // 공통코드 카테고리 가져오기
  const fetchCategories = async () => {
    try {
      console.log('카테고리 데이터 가져오기 시작...');
      const response = await axios.get('/api/codes/menu/Community/details');
      console.log('카테고리 응답:', response.data);
      setCategories(response.data || []);
    } catch (error) {
      console.error('카테고리 가져오기 실패:', error);
      setError('카테고리를 불러오는데 실패했습니다.');
    }
  };

  // Community 데이터 가져오기
  const fetchCommunities = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Community 데이터 가져오기 시작...');
      
      const response = await axios.get('/api/community');
      console.log('Community API 응답:', response);
      
      const data = response.data || [];
      console.log('Community 데이터:', data);
      
      if (Array.isArray(data)) {
        setCommunities(data);
        console.log('Community 데이터 설정 완료:', data.length, '개');
      } else {
        console.error('API 응답이 배열이 아닙니다:', data);
        setCommunities([]);
        setError('데이터 형식이 올바르지 않습니다.');
      }
    } catch (error: any) {
      console.error('Community 데이터 가져오기 실패:', error);
      console.error('에러 상세:', error.response?.data);
      console.error('에러 상태:', error.response?.status);
      setCommunities([]);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 실행
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchCommunities();
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      console.log('검색 시작:', searchTerm);
      
      const response = await axios.get(`/api/community/search?q=${encodeURIComponent(searchTerm)}`);
      const data = response.data || [];
      
      if (Array.isArray(data)) {
        setCommunities(data);
        console.log('검색 결과:', data.length, '개');
      } else {
        setCommunities([]);
        setError('검색 결과 형식이 올바르지 않습니다.');
      }
    } catch (error: any) {
      console.error('검색 실패:', error);
      setCommunities([]);
      setError('검색에 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 카테고리별 필터링
  const handleCategoryFilter = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    if (categoryId === 'all') {
      fetchCommunities();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('카테고리 필터링:', categoryId);
      
      const response = await axios.get(`/api/community/category/${categoryId}`);
      const data = response.data || [];
      
      if (Array.isArray(data)) {
        setCommunities(data);
        console.log('카테고리 필터 결과:', data.length, '개');
      } else {
        setCommunities([]);
        setError('필터 결과 형식이 올바르지 않습니다.');
      }
    } catch (error: any) {
      console.error('카테고리 필터링 실패:', error);
      setCommunities([]);
      setError('필터링에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 초록/내용 보기 모달 열기
  const handleShowModal = (item: CommunityItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  // 전문보기 버튼 클릭
  const handleViewFull = () => {
    if (selectedItem) {
      window.location.href = `/news/${selectedItem.id}`;
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCommunities();
  }, []);

  // 엔터키 검색
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 카테고리별 카운트 계산
  const getCategoryCount = (categoryName: string) => {
    return communities.filter(item => item.categoryName === categoryName).length;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '.').replace(/\s/g, '');
  };

  if (loading && communities.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <FiRefreshCw className="animate-spin h-5 w-5" />
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
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-rose-800 to-slate-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e11d48,#f43f5e,#e11d48)] opacity-30">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M0 32V.5H32" fill="none" stroke="rgba(255,255,255,0.1)"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)"></rect>
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <FiFileText className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-white">정보마당</h1>
            </div>
                         <p className="text-base text-rose-100 max-w-[1150px] text-right">
               MOT Club 회원들과 나누고 싶은 소식을 자유롭게 등록할 수 있습니다.<br/>
               등록 내용이 본 사이트의 취지에 맞지 않는 경우에는 사전통지 없이 삭제될 수 있습니다.
             </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Categories Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-64 flex-shrink-0"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => handleCategoryFilter('all')}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 ${
                  selectedCategory === 'all' ? 'bg-indigo-50 text-indigo-700' : ''
                }`}
              >
                <span className="text-gray-700">전체</span>
                <span className="text-sm text-gray-400">{communities.length}</span>
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.id.toString())}
                  className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0 ${
                    selectedCategory === category.id.toString() ? 'bg-indigo-50 text-indigo-700' : ''
                  }`}
                >
                  <span className="text-gray-700">{category.codeName}</span>
                  <span className="text-sm text-gray-400">{getCategoryCount(category.codeName)}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6"
            >
              <div className="flex items-center space-x-4">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full h-10 pl-10 pr-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="검색어를 입력하세요"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiSearch className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 flex-shrink-0 disabled:opacity-50"
                >
                  {isSearching ? (
                    <FiRefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FiSearch className="mr-2 h-4 w-4" />
                  )}
                  검색
                </button>
                {isAdmin ? (
                  <Link 
                    href="/news/register"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    <FiPlus className="mr-2 h-4 w-4" />
                    등록
                  </Link>
                ) : (
                  <div className="relative group">
                    <button
                      disabled
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-400 cursor-not-allowed transition-colors duration-200"
                      title="등록권한이 없습니다."
                    >
                      <FiPlus className="mr-2 h-4 w-4" />
                      등록
                    </button>
                    {/* 툴팁 */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      등록권한이 없습니다.
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Error Message */}
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

            {/* Community List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="flex items-center space-x-2">
                    <FiRefreshCw className="animate-spin h-5 w-5" />
                    <span>데이터를 불러오는 중...</span>
                  </div>
                </div>
              ) : communities.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? '검색 결과가 없습니다.' : '등록된 게시글이 없습니다.'}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="col-span-2 text-sm font-medium text-gray-500">카테고리</div>
                    <div className="col-span-7 text-sm font-medium text-gray-500">제목</div>
                    <div className="col-span-2 text-sm font-medium text-gray-500">작성일</div>
                    <div className="col-span-1 text-sm font-medium text-gray-500">작성자</div>
                  </div>
                  {communities.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="col-span-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {item.categoryName || '기타'}
                        </span>
                      </div>
                      <div className="col-span-7">
                        <button
                          onClick={() => handleShowModal(item)}
                          className="text-gray-900 font-medium hover:text-indigo-600 transition-colors duration-150 cursor-pointer block w-full text-left"
                        >
                          {item.title}
                        </button>
                      </div>
                      <div className="col-span-2 text-sm text-gray-500">
                        {formatDate(item.createdAt)}
                      </div>
                      <div className="col-span-1 text-sm text-gray-500">
                        {item.author}
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 초록/내용 보기 모달 */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            {/* 모달 헤더 */}
            <div className="bg-green-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Community Title</h3>
                <p className="text-sm text-green-100 mt-1">{selectedItem.title}</p>
                <p className="text-xs text-green-200 mt-1">{selectedItem.author}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-green-200 transition-colors duration-200"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    초록
                  </label>
                  <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                    {selectedItem.content && selectedItem.content.length > 200 
                      ? `${selectedItem.content.substring(0, 200)}...` 
                      : selectedItem.content || '초록이 없습니다.'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    참고문헌
                  </label>
                  <div className="bg-blue-50 p-3 rounded-md text-sm text-gray-700">
                    참고문헌 정보가 없습니다.
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            <div className="bg-gray-50 px-6 py-4 flex justify-center items-center border-t border-gray-200 space-x-3" style={{ minHeight: '60px' }}>
              <button
                onClick={handleCloseModal}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                style={{ display: 'inline-flex', visibility: 'visible', opacity: 1 }}
              >
                닫기
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </main>
  );
} 