'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiSearch, FiEye, FiMessageSquare, FiCalendar, FiUser, FiX, FiDownload } from 'react-icons/fi';
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
  contactInfo?: string;
  filePath?: string;
}

interface Answer {
  id: number;
  content: string;
  authorEmail: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  isExpertAnswer: boolean;
}

export default function QnaPage() {
  const { user, isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<{id:number, name:string}[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  
  // Q&A 상세 조회 모달 상태
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<Answer[]>([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);

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

  // Q&A 상세 조회 모달 열기
  const handleViewDetail = async (question: Question) => {
    setSelectedQuestion(question);
    setDetailModalOpen(true);
    setQuestionLoading(true);
    setQuestionError(null);
    
    try {
      // 질문 상세 정보 불러오기
      const response = await fetch(`http://localhost:8080/api/questions/${question.id}`);
      if (response.ok) {
        const data = await response.json();
        
        // 비공개 질문에 대한 접근 제어
        if (!data.isPublic) {
          if (!isAuthenticated || !user) {
            setQuestionError('비공개 질문은 로그인이 필요합니다.');
            setQuestionLoading(false);
            return;
          }
          
          if (data.authorEmail !== user.email && user.role !== 'ADMIN') {
            setQuestionError('비공개 질문은 작성자와 관리자만 볼 수 있습니다.');
            setQuestionLoading(false);
            return;
          }
        }
        
        setSelectedQuestion(data);
        // 답변 목록도 함께 불러오기
        fetchAnswers(question.id);
      } else {
        setQuestionError('질문을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('질문 조회 중 오류:', error);
      setQuestionError('질문을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setQuestionLoading(false);
    }
  };

  // 답변 목록 불러오기
  const fetchAnswers = async (questionId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/questions/${questionId}/answers`);
      if (response.ok) {
        const data = await response.json();
        setQuestionAnswers(data);
      }
    } catch (error) {
      console.error('답변 조회 중 오류:', error);
    }
  };

  // Q&A 상세 조회 모달 닫기
  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedQuestion(null);
    setQuestionAnswers([]);
    setQuestionError(null);
    setNewAnswer('');
    setIsAnswerModalOpen(false);
  };

  // 답변 작성 모달 열기
  const openAnswerModal = () => {
    setIsAnswerModalOpen(true);
  };

  // 답변 작성 모달 닫기
  const closeAnswerModal = () => {
    setIsAnswerModalOpen(false);
    setNewAnswer('');
  };

  // 답변 제출
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAnswer.trim() || !selectedQuestion) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8080/api/questions/${selectedQuestion.id}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newAnswer,
          authorEmail: user.email,
          authorId: user.email,
          authorName: user.name || user.email,
          isExpertAnswer: false
        }),
      });

      if (response.ok) {
        setNewAnswer('');
        setIsAnswerModalOpen(false);
        fetchAnswers(selectedQuestion.id); // 답변 목록 새로고침
        alert('답변이 등록되었습니다.');
      } else {
        alert('답변 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('답변 등록 중 오류:', error);
      alert('답변 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
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

  const handleFileDownload = (filePath: string) => {
    const link = document.createElement('a');
    link.href = `http://localhost:8080/api/attachments/download/${filePath}`;
    link.download = filePath;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                      
                      <button 
                        onClick={() => handleViewDetail(question)}
                        className="block w-full text-left"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                          {question.title}
                        </h3>
                      </button>
                      
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

      {/* Q&A 상세 조회 모달 */}
      {detailModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Q&A 상세</h3>
                <button onClick={handleCloseDetailModal} className="text-gray-400 hover:text-gray-600">
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              {questionLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">질문을 불러오는 중...</p>
                </div>
              ) : questionError ? (
                <div className="text-center py-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">접근 제한</h2>
                  <p className="text-gray-600 mb-6">{questionError}</p>
                  <button
                    onClick={handleCloseDetailModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    닫기
                  </button>
                </div>
              ) : selectedQuestion ? (
                <div className="space-y-6">
                  {/* 질문 상세 */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    {/* 질문 헤더 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedQuestion.status)}`}>
                            {getStatusText(selectedQuestion.status)}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {selectedQuestion.category1}
                          </span>
                          {!selectedQuestion.isPublic && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              비공개
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">{selectedQuestion.title}</h2>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <FiUser className="w-4 h-4 mr-1" />
                            <span>{selectedQuestion.authorEmail}</span>
                          </div>
                          <div className="flex items-center">
                            <FiCalendar className="w-4 h-4 mr-1" />
                            <span>{formatDate(selectedQuestion.createdAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <FiEye className="w-4 h-4 mr-1" />
                            <span>조회 {selectedQuestion.viewCount}</span>
                          </div>
                          <div className="flex items-center">
                            <FiMessageSquare className="w-4 h-4 mr-1" />
                            <span>답변 {selectedQuestion.answerCount}개</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 질문 내용 */}
                    <div className="prose max-w-none mb-4">
                      <div className="whitespace-pre-wrap text-gray-700">{selectedQuestion.content}</div>
                    </div>

                    {/* 첨부파일 */}
                    {selectedQuestion.filePath && (
                      <div className="border-t border-gray-200 pt-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">첨부파일</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {selectedQuestion.filePath}
                          </span>
                          {/* 관리자나 전문가는 공개/비공개 관계없이 파일보기 가능 */}
                          {(user?.role === 'ADMIN' || user?.role === 'EXPERT') ? (
                            <button
                              onClick={() => handleFileDownload(selectedQuestion.filePath!)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <FiDownload className="w-4 h-4 mr-2" />
                              파일보기
                            </button>
                          ) : (
                            /* 일반 사용자는 공개 질문만 파일보기 가능 */
                            selectedQuestion.isPublic ? (
                              isAuthenticated ? (
                                <button
                                  onClick={() => handleFileDownload(selectedQuestion.filePath!)}
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  <FiDownload className="w-4 h-4 mr-2" />
                                  파일보기
                                </button>
                              ) : (
                                <div className="relative group">
                                  <button
                                    disabled
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
                                  >
                                    <FiDownload className="w-4 h-4 mr-2" />
                                    파일보기
                                  </button>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                    로그인이 필요합니다
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                  </div>
                                </div>
                              )
                            ) : (
                              <button
                                disabled
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
                              >
                                <FiDownload className="w-4 h-4 mr-2" />
                                파일보기
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 답변 작성 버튼 */}
                  {isAuthenticated && (
                    (user?.role === 'ADMIN' || 
                     user?.role === 'EXPERT' || 
                     user?.email === selectedQuestion?.authorEmail) && (
                      <div className="flex justify-center">
                        <button
                          onClick={openAnswerModal}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FiMessageSquare className="w-5 h-5 mr-2" />
                          답변 작성
                        </button>
                      </div>
                    )
                  )}

                  {/* 답변 목록 */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        답변 ({questionAnswers.length}개)
                      </h3>
                    </div>
                    
                    {questionAnswers.length === 0 ? (
                      <div className="text-center py-8">
                        <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">아직 답변이 없습니다.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {questionAnswers.map((answer) => (
                          <div key={answer.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">{answer.authorName}</span>
                                {answer.isExpertAnswer && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    전문가 답변
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">{formatDate(answer.createdAt)}</span>
                            </div>
                            <div className="text-gray-700 whitespace-pre-wrap">{answer.content}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* 답변 작성 모달 */}
      {isAnswerModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeAnswerModal}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        답변 작성
                      </h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <FiUser className="w-4 h-4 mr-1" />
                        <span>답변자: {user?.email}</span>
                      </div>
                    </div>
                    <form onSubmit={handleSubmitAnswer}>
                      <div className="mb-4">
                        <textarea
                          value={newAnswer}
                          onChange={(e) => setNewAnswer(e.target.value)}
                          rows={8}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="답변을 입력해주세요..."
                          required
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting || !newAnswer.trim()}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isSubmitting ? '등록 중...' : '답변 등록'}
                </button>
                <button
                  type="button"
                  onClick={closeAnswerModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 