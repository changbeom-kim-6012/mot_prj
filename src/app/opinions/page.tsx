'use client';

import Navigation from '@/components/Navigation';
import { FiSearch, FiBookOpen, FiFileText, FiX, FiList, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface Article {
  id: number;
  title: string;
  authorName: string;
  abstractText: string;
  references: string;
  keywords: string;
  fullText?: string;
  status: string;
  category: string;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
}

export default function OpinionsPage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'abstract' | 'fulltext'>('abstract');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      try {
        console.log('Fetching opinions from API...');
        console.log('Request URL:', 'http://192.168.0.101:8082/api/opinions');
        console.log('Current origin:', window.location.origin);
        console.log('Auth state:', { isAuthenticated, user: user?.email });
        
        const res = await axios.get('http://192.168.0.101:8082/api/opinions', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        console.log('API Response:', res.data);
        
        // 승인된 기고와 로그인한 사용자의 임시저장 기고 필터링
        let filteredArticles = res.data.filter((article: Article) => {
          // 승인된 기고는 모두 표시
          if (article.status === '등록승인') {
            return true;
          }
          // 로그인한 사용자의 임시저장 기고도 표시
          if (isAuthenticated && user && article.status === '임시저장' && article.authorName.includes(user.email)) {
            return true;
          }
          return false;
        });
        
        console.log('Filtered articles:', filteredArticles);
        
        setArticles(filteredArticles);
        setFilteredArticles(filteredArticles); // 최초 전체 목록
        setError(null);
      } catch (e: any) {
        console.error('Error fetching opinions:', e);
        console.error('Error details:', e.response?.data || e.message);
        setError(`목록을 불러오지 못했습니다. (${e.response?.status || '연결 오류'})`);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, [isAuthenticated, user]); // 의존성 배열에 isAuthenticated와 user 추가

  // 검색어나 카테고리가 변경될 때 자동으로 필터링 적용
  useEffect(() => {
    handleSearch();
  }, [searchTerm, selectedCategory, isAuthenticated, user]);

  // Agora 카테고리 불러오기
  useEffect(() => {
    console.log('Fetching categories from API...');
    fetch('http://192.168.0.101:8082/api/codes/agora-details', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
      .then(res => {
        console.log('Category API response status:', res.status);
        console.log('Category API response headers:', res.headers);
        return res.json();
      })
      .then(data => {
        console.log('Category API data:', data);
        if (Array.isArray(data)) {
          const categoryList = data.map((c:any) => ({ id: c.id, name: c.codeName }));
          console.log('Processed categories:', categoryList);
          setCategories(categoryList);
        }
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
        setCategories([]);
      });
  }, []);

  // 검색 및 필터링
  const handleSearch = () => {
    // 먼저 현재 로그인 상태에 맞게 전체 articles를 다시 필터링
    const currentUserArticles = articles.filter(article => {
      // 승인된 기고는 모두 표시
      if (article.status === '등록승인') {
        return true;
      }
      // 로그인한 사용자의 임시저장 기고도 표시
      if (isAuthenticated && user && article.status === '임시저장' && article.authorName.includes(user.email)) {
        return true;
      }
      return false;
    });

    // 그 다음 검색 및 카테고리 필터링 적용
    const filtered = currentUserArticles.filter(article => {
      const matchesSearch = searchTerm.trim() === '' || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        article.abstractText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.keywords.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.fullText && article.fullText.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = !selectedCategory || article.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredArticles(filtered);
  };

  const years = ["2024", "2023", "2022", "2021"];
  const volumes = ["vol.4 no.3", "vol.4 no.2", "vol.4 no.1", "vol.3 no.4"];
  const searchTypes = [
    { value: "title", label: "제목" },
    { value: "keyword", label: "키워드" },
    { value: "abstract", label: "초록/내용" },
    { value: "author", label: "저자" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const handleAbstractView = (article: Article) => {
    setSelectedArticle(article);
    setModalType('abstract');
    setIsModalOpen(true);
  };

  const handleFullTextView = (article: Article) => {
    setSelectedArticle(article);
    setModalType('fulltext');
    setIsModalOpen(true);
  };

  const handleFullTextFromModal = () => {
    if (selectedArticle && selectedArticle.fullText) {
      setModalType('fulltext');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
    setModalType('abstract');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-28">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-amber-800 to-amber-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#d97706,#f59e0b)] opacity-30">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M0 32V.5H32" fill="none" stroke="rgba(255,255,255,0.1)"></path>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)"></rect>
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <FiBookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">기고 안내</h1>
          </div>
          <p className="text-base text-amber-100 max-w-3xl ml-16">
            R&D 및 MOT 관련 주제에 대한 여러분의 기고를 환영합니다.<br/>
            다양한 관점과 혁신적인 아이디어를 자유롭게 공유해 주세요.
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-center space-x-4">
            <div className="w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 pl-3 pr-6 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">모든 카테고리</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="w-32">
              <select 
                className="w-full h-10 pl-3 pr-6 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                defaultValue="title"
              >
                {searchTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="검색어를 입력하세요"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <button 
              onClick={handleSearch}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <FiSearch className="mr-2 h-4 w-4" />
              검색
            </button>
            {user && (user.role === 'EXPERT' || user.role === 'ADMIN') ? (
              <Link href="/opinions/register">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
                  <FiBookOpen className="mr-2 h-4 w-4" />
                  Opinion 등록
                </button>
              </Link>
            ) : (
              <div className="relative group">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-400 cursor-not-allowed">
                  <FiBookOpen className="mr-2 h-4 w-4" />
                  Opinion 등록
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  {!user ? '로그인 후 작성할 수 있습니다' : '전문가 또는 관리자만 작성할 수 있습니다'}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Articles List */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-8 space-y-4"
        >
          {loading ? (
            <div className="text-center text-gray-400 py-12">로딩 중...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center text-gray-400 py-12">등록된 Agora가 없습니다.</div>
          ) : filteredArticles.map((article) => (
            <motion.div
              key={article.id}
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {/* 임시저장된 기고는 제목 클릭 시 수정 페이지로 이동 */}
                    {article.status === '임시저장' && isAuthenticated && user && article.authorName.includes(user.email) ? (
                      <Link href={`/opinions/register?edit=${article.id}`}>
                        <h3 className="text-lg font-medium text-gray-900 hover:text-indigo-600 transition-colors duration-200 cursor-pointer">
                          {article.title}
                        </h3>
                      </Link>
                    ) : (
                      <Link href={`/opinions/${article.id}`}>
                        <h3 className="text-lg font-medium text-gray-900 hover:text-indigo-600 transition-colors duration-200 cursor-pointer">
                          {article.title}
                        </h3>
                      </Link>
                    )}
                    {article.status === '임시저장' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        작성중
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {article.authorName}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {article.references}
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* 임시저장된 기고는 수정 버튼 표시 */}
                    {article.status === '임시저장' && isAuthenticated && user && article.authorName.includes(user.email) ? (
                      <Link href={`/opinions/register?edit=${article.id}`}>
                        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200">
                          <FiUser className="mr-2 h-4 w-4" />
                          계속 작성
                        </button>
                      </Link>
                    ) : (
                      /* 승인된 기고는 기존 버튼들 표시 */
                      <button 
                        onClick={() => handleAbstractView(article)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                      >
                        <FiFileText className="mr-2 h-4 w-4" />
                        초록/요약 보기
                      </button>
                    )}
                    {/* 임시저장된 기고가 아니고 전문이 있는 경우에만 전문 보기 버튼 표시 */}
                    {article.status !== '임시저장' && article.fullText && (
                      isAuthenticated && user ? (
                        <button 
                          onClick={() => handleFullTextView(article)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                          <FiList className="mr-2 h-4 w-4" />
                          전문 보기
                        </button>
                      ) : (
                        <div className="relative group">
                          <button 
                            disabled
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-400 cursor-not-allowed"
                          >
                            <FiList className="mr-2 h-4 w-4" />
                            전문 보기
                          </button>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                            로그인 후 확인할 수 있습니다
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Abstract Modal */}
      {isModalOpen && selectedArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleCloseModal}
          />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`text-white p-4 ${modalType === 'abstract' ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-blue-600 to-blue-700'}`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    {modalType === 'abstract' ? '초록/내용' : '전문 (Full Text)'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-white hover:text-opacity-80 transition-colors duration-200"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
                <h3 className="text-lg font-medium mt-2 text-opacity-90">
                  {selectedArticle.title}
                </h3>
                <p className="text-sm text-opacity-80 mt-1">
                  {selectedArticle.authorName}
                </p>
              </div>

              {/* Content */}
              <div className="p-3 max-h-[75vh] overflow-y-auto">
                {modalType === 'abstract' ? (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedArticle.abstractText}
                      </p>
                    </div>
                    
                    {/* Source Info */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">참고문헌</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {selectedArticle.references}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {selectedArticle.fullText}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
                <div></div>
                <div className="flex items-center space-x-3">
                  {modalType === 'abstract' && selectedArticle.fullText && (
                    isAuthenticated && user ? (
                      <button
                        onClick={handleFullTextFromModal}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        <FiList className="mr-2 h-4 w-4" />
                        전문보기
                      </button>
                    ) : (
                      <div className="relative group">
                        <button
                          disabled
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-400 cursor-not-allowed"
                        >
                          <FiList className="mr-2 h-4 w-4" />
                          전문보기
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          로그인 후 확인할 수 있습니다
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                    )
                  )}
                  {modalType === 'fulltext' && (
                    <button
                      onClick={() => setModalType('abstract')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                      <FiFileText className="mr-2 h-4 w-4" />
                      초록보기
                    </button>
                  )}
                  <button
                    onClick={handleCloseModal}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      </div>
    </main>
  );
} 