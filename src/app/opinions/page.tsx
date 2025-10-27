'use client';

import Navigation from '@/components/Navigation';
import { FiSearch, FiBookOpen, FiFileText, FiX, FiList, FiUser, FiPaperclip, FiCalendar, FiTag } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import FileViewer from '@/components/common/FileViewer';
import { getApiUrl } from '@/config/api';

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

interface Attachment {
  id: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  note?: string;
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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedArticleDetail, setSelectedArticleDetail] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [attachments, setAttachments] = useState<{ [key: number]: Attachment[] }>({});
  const [selectedFile, setSelectedFile] = useState<{ url: string; name: string } | null>(null);
  
  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10); // 기고는 10개씩 표시
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      try {
        console.log('Fetching opinions from API...');
        console.log('Request URL:', getApiUrl('/api/opinions'));
        console.log('Current origin:', window.location.origin);
        console.log('Auth state:', { isAuthenticated, user: user?.email });
        
        const res = await axios.get(getApiUrl('/api/opinions'), {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        console.log('API Response:', res.data);
        
        // 임시저장 이외의 모든 기고는 모든 사용자에게 표시, 임시저장은 작성자에게만 표시
        let filteredArticles = res.data.filter((article: Article) => {
          // 임시저장이 아닌 모든 기고는 모든 사용자에게 표시
          if (article.status !== '임시저장') {
            return true;
          }
          // 임시저장 기고는 작성자에게만 표시
          if (article.status === '임시저장' && isAuthenticated && user && article.authorName.includes(user.email)) {
            return true;
          }
          return false;
        });
        
        console.log('Filtered articles:', filteredArticles);
        
        // 임시저장된 기고를 맨 앞으로 정렬
        const sortedArticles = filteredArticles.sort((a: Article, b: Article) => {
          // 임시저장 상태를 우선순위로 정렬
          if (a.status === '임시저장' && b.status !== '임시저장') return -1;
          if (a.status !== '임시저장' && b.status === '임시저장') return 1;
          // 같은 상태라면 생성일 기준 내림차순
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setArticles(sortedArticles);
        setFilteredArticles(sortedArticles); // 최초 전체 목록
        
        // 초기 페이징 정보 설정
        const totalPages = Math.ceil(filteredArticles.length / pageSize);
        setTotalPages(totalPages);
        setTotalElements(filteredArticles.length);
        setCurrentPage(0);
        
        setError(null);
        
        // 각 기고의 첨부파일 불러오기
        const attachmentPromises = filteredArticles.map(async (article: Article) => {
          try {
            const attachmentRes = await axios.get(getApiUrl(`/api/attachments`), {
              params: {
                refTable: 'opinions',
                refId: article.id
              }
            });
            return { articleId: article.id, attachments: attachmentRes.data };
          } catch (error) {
            console.error(`첨부파일 불러오기 실패 (기고 ID: ${article.id}):`, error);
            return { articleId: article.id, attachments: [] };
          }
        });
        
        const attachmentResults = await Promise.all(attachmentPromises);
        const attachmentMap: { [key: number]: Attachment[] } = {};
        attachmentResults.forEach(result => {
          attachmentMap[result.articleId] = result.attachments;
        });
        setAttachments(attachmentMap);
        
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

  // 자동 검색 제거 - 엔터키나 검색버튼 클릭 시에만 검색

  // Agora 카테고리 불러오기
  useEffect(() => {
    console.log('Fetching categories from API...');
    fetch(getApiUrl('/api/codes/agora-details'), {
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
      // 임시저장이 아닌 모든 기고는 모든 사용자에게 표시
      if (article.status !== '임시저장') {
        return true;
      }
      // 임시저장 기고는 작성자에게만 표시
      if (article.status === '임시저장' && isAuthenticated && user && article.authorName.includes(user.email)) {
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
    
    // 임시저장된 기고를 맨 앞으로 정렬
    const sortedFiltered = filtered.sort((a: Article, b: Article) => {
      // 임시저장 상태를 우선순위로 정렬
      if (a.status === '임시저장' && b.status !== '임시저장') return -1;
      if (a.status !== '임시저장' && b.status === '임시저장') return 1;
      // 같은 상태라면 생성일 기준 내림차순
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    setFilteredArticles(sortedFiltered);
    
    // 페이징 정보 업데이트
    const totalPages = Math.ceil(sortedFiltered.length / pageSize);
    setTotalPages(totalPages);
    setTotalElements(sortedFiltered.length);
    setCurrentPage(0); // 검색/필터링 시 첫 페이지로 이동
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

  const handleDetailView = async (article: Article) => {
    try {
      // 상세 정보를 가져오는 API 호출
      const apiUrl = (process.env.NODE_ENV as string) === 'production' 
        ? `http://www.motclub.co.kr/api/opinions/${article.id}`
        : `http://localhost:8084/api/opinions/${article.id}`;
      
      const response = await axios.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: false,
      });
      
      setSelectedArticleDetail(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('상세 정보 로드 실패:', error);
      alert('상세 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleFileView = (filePath: string, fileName: string) => {
    console.log('handleFileView 호출됨:', { filePath, fileName });
    
    // 파일 경로에서 파일명만 추출 (UUID_originalName 형식)
    // Windows와 Unix 경로 구분자를 모두 처리
    const pathParts = filePath.split(/[\\\/]/);
    const storedFileName = pathParts[pathParts.length - 1];
    
    console.log('추출된 파일명:', storedFileName);
    
    // 파일명만 인코딩 (전체 경로가 아닌)
    const encodedFileName = encodeURIComponent(storedFileName);
    const fileUrl = getApiUrl(`/api/attachments/view/${encodedFileName}`);
    
    console.log('생성된 파일 URL:', fileUrl);
    console.log('URL 구성 요소:', {
      baseUrl: getApiUrl(''),
      endpoint: '/api/attachments/view/',
      fileName: storedFileName,
      encodedFileName: encodedFileName
    });
    
    setSelectedFile({ url: fileUrl, name: fileName });
  };

  const handleCloseFileViewer = () => {
    setSelectedFile(null);
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
            <h1 className="text-2xl font-bold text-white">논단, 칼럼, 시선 공유</h1>
          </div>
                     <p className="text-base text-amber-100 max-w-[1150px] text-right">
             R&D 및 MOT 관련하여 다양한 주제에 대해서<br/>
             다양한 분야의 전문가가 각자의 관점에서 다채롭게 전개하는 의견을 공유하는 광장입니다.
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
          <div className="flex items-center gap-4">
            {/* 카테고리 선택 */}
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
            
            {/* 제목/키워드 선택, 단어검색, 검색 버튼을 중앙정렬 */}
            <div className="flex-1 flex justify-center items-center gap-4">
              {/* <div className="w-32">
                <select 
                  className="w-full h-10 pl-3 pr-6 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  defaultValue="title"
                >
                  {searchTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div> */}
              <div className="relative w-1/3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="검색어를 입력하세요"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <button 
                onClick={handleSearch}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <FiSearch className="mr-2 h-4 w-4" />
                검색
              </button>
            </div>
            
            {/* Opinion 등록 버튼 (현재 위치 그대로) */}
            <div>
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
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                    {!user ? '로그인 후 작성할 수 있습니다' : '전문가 또는 관리자만 작성할 수 있습니다'}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              )}
            </div>
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
          ) : (() => {
            // 현재 페이지에 해당하는 기고만 표시
            const startIndex = currentPage * pageSize;
            const endIndex = startIndex + pageSize;
            const currentPageArticles = filteredArticles.slice(startIndex, endIndex);
            
            return currentPageArticles.map((article) => (
            <motion.div
              key={article.id}
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                {/* 왼쪽: 제목, 작성자 */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {/* 임시저장된 기고는 제목 클릭 시 수정 페이지로 이동 */}
                    {article.status === '임시저장' && isAuthenticated && user && article.authorName.includes(user.email) ? (
                      <Link href={`/opinions/register?edit=${article.id}`}>
                        <h3 className="text-lg font-medium text-gray-900 hover:text-indigo-600 transition-colors duration-200 cursor-pointer">
                          {article.title}
                        </h3>
                      </Link>
                    ) : (
                      isAuthenticated ? (
                        <h3 
                          className="text-lg font-medium text-gray-900 hover:text-indigo-600 transition-colors duration-200 cursor-pointer"
                          onClick={() => handleDetailView(article)}
                        >
                          {article.title}
                        </h3>
                      ) : (
                        <h3 
                          className="text-lg font-medium text-gray-400 cursor-not-allowed"
                          title="로그인이 필요합니다"
                        >
                          {article.title}
                        </h3>
                      )
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
                
                  {/* 오른쪽: 버튼들 */}
                  <div className="flex items-center space-x-2 ml-4">
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
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                            로그인 후 확인할 수 있습니다
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      )
                    )}
                    {/* 첨부파일이 있는 경우 전문파일보기 버튼 표시 */}
                    {attachments[article.id] && attachments[article.id].length > 0 && (
                      isAuthenticated && user ? (
                        <button 
                          onClick={() => handleFileView(attachments[article.id][0].filePath, attachments[article.id][0].fileName)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                        >
                          <FiPaperclip className="mr-2 h-4 w-4" />
                          전문파일보기
                        </button>
                      ) : (
                        <div className="relative group">
                          <button 
                            disabled
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-400 cursor-not-allowed"
                          >
                            <FiPaperclip className="mr-2 h-4 w-4" />
                            전문파일보기
                          </button>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                            로그인 후 확인할 수 있습니다
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
              </div>
            </motion.div>
            ));
          })()}
        </motion.div>
        
        {/* 페이징 컴포넌트 */}
        {!loading && !error && totalPages > 0 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            {/* 이전 페이지 버튼 */}
            {totalPages > 1 && (
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
            )}

            {/* 페이지 번호들 */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (currentPage < 3) {
                pageNum = i;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === pageNum
                      ? 'text-white bg-blue-600 border border-blue-600'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}

            {/* 다음 페이지 버튼 */}
            {totalPages > 1 && (
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            )}
          </div>
        )}

        {/* 전체 결과 수 표시 */}
        {!loading && !error && totalElements > 0 && (
          <div className="text-center text-sm text-gray-500 mt-4">
            총 {totalElements}개의 기고 중 {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)}번째
          </div>
        )}
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
              className="relative bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col"
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
              <div className="p-3 flex-1 overflow-y-auto">
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
              <div className="bg-gray-50 px-4 py-2 flex justify-between items-center flex-shrink-0">
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
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
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

      {/* File Viewer */}
      {selectedFile && (
        <FileViewer
          fileUrl={selectedFile.url}
          fileName={selectedFile.name}
          onClose={handleCloseFileViewer}
        />
      )}

      {/* 상세페이지 팝업 모달 */}
      {showDetailModal && selectedArticleDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2 break-all overflow-wrap-break-word">
                    {selectedArticleDetail.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <FiUser className="h-4 w-4" />
                      {selectedArticleDetail.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCalendar className="h-4 w-4" />
                      {new Date(selectedArticleDetail.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedArticleDetail.status === '등록승인' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedArticleDetail.status === '등록대기'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedArticleDetail.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedArticleDetail(null);
                  }}
                  className="text-white hover:text-gray-200 transition-colors duration-200"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* 초록 */}
              {selectedArticleDetail.abstractText && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiFileText className="h-5 w-5 text-indigo-600" />
                    초록
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 break-all overflow-wrap-break-word whitespace-pre-line">
                      {selectedArticleDetail.abstractText}
                    </p>
                  </div>
                </div>
              )}

              {/* 전문 */}
              {selectedArticleDetail.fullText && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiFileText className="h-5 w-5 text-indigo-600" />
                    전문
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 break-all overflow-wrap-break-word whitespace-pre-line">
                      {selectedArticleDetail.fullText}
                    </p>
                  </div>
                </div>
              )}

              {/* 참고문헌 */}
              {selectedArticleDetail.references && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiBookOpen className="h-5 w-5 text-indigo-600" />
                    참고문헌
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 break-all overflow-wrap-break-word whitespace-pre-line">
                      {selectedArticleDetail.references}
                    </p>
                  </div>
                </div>
              )}

              {/* 키워드 */}
              {selectedArticleDetail.keywords && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiTag className="h-5 w-5 text-indigo-600" />
                    키워드
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticleDetail.keywords.split(',').map((keyword: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full break-all overflow-wrap-break-word"
                      >
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 모달 푸터 */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedArticleDetail(null);
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
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