'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiSearch, FiEye, FiMessageSquare, FiCalendar, FiUser } from 'react-icons/fi';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';

interface Question {
  id: number;
  title: string;
  content: string;
  authorEmail: string;
  createdAt: string;
  category1: string;
  viewCount: number;
  answerCount: number;
  status: string;
  isPublic: boolean;
}

export default function QnaPage() {
  const { user, isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<{id:number, name:string}[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  // 카테고리 불러오기 (Library 패턴과 동일)
  useEffect(() => {
    fetch('http://localhost:8080/api/codes/menu/Q&A/details')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data.map((c:any) => ({ id: c.id, name: c.codeName })));
        }
      })
      .catch(() => setCategories([]));
  }, []);

  // 질문 목록 불러오기
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/questions');
      
      if (response.ok) {
        const data = await response.json();
        
        // 데이터 타입 확인 및 변환
        const processedData = data.map((question: any) => ({
          ...question,
          isPublic: Boolean(question.isPublic)
        }));
        
        setQuestions(processedData);
        setFilteredQuestions(processedData);
      } else {
        console.error('질문 목록 조회 실패:', response.status);
      }
    } catch (error) {
      console.error('질문 목록 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filtered = questions.filter(question => {
      const matchesSearch = searchTerm.trim() === '' || question.title.toLowerCase().includes(searchTerm.toLowerCase()) || question.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || question.category1 === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredQuestions(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return '작성중';
      case 'APPROVED': return '승인';
      case 'REJECTED': return '거절';
      case 'OPEN': return '진행중';
      case 'CLOSED': return '완료';
      default: return '진행중';
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">질문 목록을 불러오는 중...</p>
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
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-800 to-purple-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#9333ea,#7c3aed)] opacity-30">
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <FiMessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Q&A</h1>
          </div>
          <p className="text-lg text-purple-50 max-w-3xl">
            기술경영, R&D 기획 및 관리에 대한 이슈, 타사 사례 등 MOT 관련 정보 한마당<br/>
            전문가에게 질문하고 답변을 받아보세요.
          </p>
        </div>
      </div>

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* 검색 및 필터 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">모든 카테고리</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="질문 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end items-center space-x-4">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 bg-white rounded-md shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
                >
                  검색
                </button>
                {isAuthenticated ? (
                  <Link
                    href="/qna/write"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    질문하기
                  </Link>
                ) : (
                  <div className="relative group">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed">
                      <FiPlus className="w-4 h-4 mr-2" />
                      질문하기
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      로그인 후 질문할 수 있습니다
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 질문 목록 */}
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FiMessageSquare className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">질문이 없습니다</h3>
                <p className="text-gray-500">
                  {searchTerm || selectedCategory ? '검색 조건에 맞는 질문이 없습니다.' : '아직 등록된 질문이 없습니다.'}
                </p>
              </div>
            ) : (
              filteredQuestions.map((question) => (
                <div key={question.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(question.status)}`}>
                          {getStatusText(question.status)}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {question.category1}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          question.isPublic 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {question.isPublic ? '공개' : '비공개'}
                        </span>
                      </div>
                      
                      <Link href={`/qna/${question.id}`} className="block">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                          {question.title}
                        </h3>
                      </Link>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {question.content}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <FiUser className="w-4 h-4 mr-1" />
                            <span>{question.authorEmail}</span>
                          </div>
                          <div className="flex items-center">
                            <FiCalendar className="w-4 h-4 mr-1" />
                            <span>{formatDate(question.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <FiEye className="w-4 h-4 mr-1" />
                            <span>{question.viewCount}</span>
                          </div>
                          <div className="flex items-center">
                            <FiMessageSquare className="w-4 h-4 mr-1" />
                            <span>{question.answerCount}개 답변</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          </div>
        </div>
      </div>
    </main>
  );
} 