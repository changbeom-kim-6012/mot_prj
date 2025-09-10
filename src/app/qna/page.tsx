'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiSearch, FiEye, FiMessageSquare, FiCalendar, FiUser, FiX, FiDownload, FiTrash2, FiArrowLeft, FiLock } from 'react-icons/fi';
import Navigation from '@/components/Navigation';
import AnswerList from '@/components/qna/AnswerList';
import AdminEditModal from '@/components/qna/AdminEditModal';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/dateUtils';

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

interface PageInfo {
  content: Question[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<{id:number, name:string}[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  
  // 페이징 상태 (클라이언트 사이드 페이징)
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);

  // 페이지 로드 시 사용자 정보 출력
  console.log('QnaPage 컴포넌트 로드됨');
  console.log('인증 상태:', isAuthenticated);
  console.log('사용자 정보:', user);
  
  // Q&A 상세 조회 모달 상태
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<Answer[]>([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);

  // 관리자 편집 모달 상태
  const [isAdminEditModalOpen, setIsAdminEditModalOpen] = useState(false);

  // 카테고리 불러오기 (Library 패턴과 동일)
  useEffect(() => {
    fetch('http://mot.erns.co.kr/api/codes/menu/qna/details')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data.map((c:any) => ({ id: c.id, name: c.codeName })));
        }
      })
      .catch(() => setCategories([]));
  }, []);

  // 질문 목록 불러오기 (한 번만 실행)
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      console.log('=== Q&A 목록 조회 시작 ===');
      
      // 모든 데이터를 가져오기 위해 큰 사이즈로 요청
      const url = `http://mot.erns.co.kr/api/questions?page=0&size=1000`;
      console.log('API URL:', url);
      
      const response = await fetch(url);
      console.log('API 응답 상태:', response.status, response.statusText);
      
      if (response.ok) {
        const data: PageInfo = await response.json();
        
        console.log('서버에서 받은 페이징 데이터:', data);
        
        // 데이터 타입 확인 및 변환
        const processedData = data.content.map((question: any) => {
          console.log(`질문 ID ${question.id}: isPublic = ${question.isPublic}, 타입 = ${typeof question.isPublic}`);
          return {
            ...question,
            isPublic: Boolean(question.isPublic)
          };
        });
        
        console.log('처리된 데이터:', processedData);
        
        setAllQuestions(processedData);
        setQuestions(processedData);
        setFilteredQuestions(processedData);
        setTotalElements(processedData.length);
        setTotalPages(Math.ceil(processedData.length / pageSize));
      } else {
        const errorText = await response.text();
        console.error('질문 목록 조회 실패:', response.status, response.statusText);
        console.error('에러 응답 내용:', errorText);
        setAllQuestions([]);
        setQuestions([]);
        setFilteredQuestions([]);
      }
    } catch (error) {
      console.error('질문 목록 조회 중 오류:', error);
      console.error('에러 상세:', error);
      setAllQuestions([]);
      setQuestions([]);
      setFilteredQuestions([]);
    } finally {
      setLoading(false);
      console.log('=== Q&A 목록 조회 완료 ===');
    }
  };

  const handleSearch = async () => {
    console.log('검색 실행:', searchTerm);
    setCurrentPage(0); // 검색 시 첫 페이지로 이동
    
    // 검색어가 있으면 서버에서 검색, 없으면 현재 카테고리로 다시 조회
    if (searchTerm.trim()) {
      await fetchQuestionsBySearch(searchTerm.trim());
    } else {
      await fetchQuestionsByCategory(selectedCategoryId);
    }
  };

  const fetchQuestionsBySearch = async (keyword: string) => {
    try {
      setLoading(true);
      console.log('=== 검색어로 Q&A 목록 조회 시작 ===');
      console.log('검색어:', keyword);
      
      const url = `http://mot.erns.co.kr/api/questions/category/${selectedCategoryId}?keyword=${keyword}&page=0&size=1000`;
      console.log('검색 API URL:', url);
      
      const response = await fetch(url);
      console.log('API 응답 상태:', response.status, response.statusText);
      
      if (response.ok) {
        const data: PageInfo = await response.json();
        
        console.log('서버에서 받은 검색 결과:', data);
        
        // 데이터 타입 확인 및 변환
        const processedData = data.content.map((question: any) => {
          console.log(`질문 ID ${question.id}: isPublic = ${question.isPublic}, 타입 = ${typeof question.isPublic}`);
          return {
            ...question,
            isPublic: Boolean(question.isPublic)
          };
        });
        
        console.log('처리된 검색 데이터:', processedData);
        
        setAllQuestions(processedData);
        setQuestions(processedData);
        setFilteredQuestions(processedData);
        setTotalElements(processedData.length);
        setTotalPages(Math.ceil(processedData.length / pageSize));
      } else {
        const errorText = await response.text();
        console.error('검색 실패:', response.status, response.statusText);
        console.error('에러 응답 내용:', errorText);
        setAllQuestions([]);
        setQuestions([]);
        setFilteredQuestions([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('검색 중 오류:', error);
      console.error('에러 상세:', error);
      setAllQuestions([]);
      setQuestions([]);
      setFilteredQuestions([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
      console.log('=== 검색 완료 ===');
    }
  };

  const handleCategoryChange = async (categoryName: string) => {
    console.log('카테고리 변경:', categoryName);
    console.log('사용 가능한 카테고리 목록:', categories);
    
    // 빈 값이면 전체 목록 조회
    if (!categoryName || categoryName.trim() === '') {
      console.log('빈 카테고리 선택, 전체 목록 조회');
      setSelectedCategory('');
      setSelectedCategoryId(null);
      await fetchQuestionsByCategory(null);
      return;
    }
    
    setSelectedCategory(categoryName);
    setCurrentPage(0); // 카테고리 변경 시 첫 페이지로 이동
    console.log('카테고리 변경 완료, 새 카테고리:', categoryName);
    
    // 카테고리 이름으로 ID 찾기
    const category = categories.find(cat => cat.name === categoryName);
    const categoryId = category ? category.id : null;
    setSelectedCategoryId(categoryId);
    
    console.log('찾은 카테고리 ID:', categoryId);
    
    // 카테고리별 DB 검색 (카테고리 ID로)
    await fetchQuestionsByCategory(categoryId);
  };

  const fetchQuestionsByCategory = async (categoryId: number | null) => {
    try {
      setLoading(true);
      console.log('=== 카테고리별 Q&A 목록 조회 시작 ===');
      console.log('선택된 카테고리 ID:', categoryId);
      console.log('사용 가능한 카테고리 목록:', categories);
      
      let url;
      if (categoryId && categoryId > 0) {
        // 특정 카테고리 ID로 검색
        url = `http://mot.erns.co.kr/api/questions/category/${categoryId}?page=0&size=1000`;
        console.log('카테고리 ID 필터 적용됨:', categoryId);
        console.log('생성된 URL:', url);
      } else {
        // 전체 목록 조회
        url = `http://mot.erns.co.kr/api/questions?page=0&size=1000`;
        console.log('전체 목록 조회');
      }
      
      console.log('최종 API URL:', url);
      const response = await fetch(url);
      console.log('API 응답 상태:', response.status, response.statusText);
      console.log('API 응답 헤더:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data: PageInfo = await response.json();
        
        console.log('서버에서 받은 페이징 데이터:', data);
        
        // 데이터 타입 확인 및 변환
        const processedData = data.content.map((question: any) => {
          console.log(`질문 ID ${question.id}: isPublic = ${question.isPublic}, 타입 = ${typeof question.isPublic}`);
          return {
            ...question,
            isPublic: Boolean(question.isPublic)
          };
        });
        
        console.log('처리된 데이터:', processedData);
        
        setAllQuestions(processedData);
        setQuestions(processedData);
        setFilteredQuestions(processedData);
        setTotalElements(processedData.length);
        setTotalPages(Math.ceil(processedData.length / pageSize));
      } else {
        const errorText = await response.text();
        console.error('카테고리별 질문 목록 조회 실패:', response.status, response.statusText);
        console.error('에러 응답 내용:', errorText);
        console.error('요청한 카테고리 ID:', categoryId);
        console.error('요청 URL:', url);
        
        // 403 오류인 경우 전체 목록으로 폴백
        if (response.status === 403) {
          console.log('403 오류 발생, 전체 목록으로 폴백 시도');
          const fallbackUrl = `http://mot.erns.co.kr/api/questions?page=0&size=1000`;
          const fallbackResponse = await fetch(fallbackUrl);
          if (fallbackResponse.ok) {
            const fallbackData: PageInfo = await fallbackResponse.json();
            const processedData = fallbackData.content.map((question: any) => ({
              ...question,
              isPublic: Boolean(question.isPublic)
            }));
            setAllQuestions(processedData);
            setQuestions(processedData);
            setFilteredQuestions(processedData);
            setTotalElements(processedData.length);
            setTotalPages(Math.ceil(processedData.length / pageSize));
            console.log('폴백 성공: 전체 목록 로드됨');
            return;
          }
        }
        
        setAllQuestions([]);
        setQuestions([]);
        setFilteredQuestions([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('카테고리별 질문 목록 조회 중 오류:', error);
      console.error('에러 상세:', error);
      setAllQuestions([]);
      setQuestions([]);
      setFilteredQuestions([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
      console.log('=== 카테고리별 Q&A 목록 조회 완료 ===');
    }
  };

  // Q&A 상세 조회 모달 열기
  const handleViewDetail = async (question: Question) => {
    // 관리자 권한 확인
    const isAdmin = user?.role === 'ADMIN';
    
    if (isAdmin) {
      // 관리자는 편집 모달 열기
      setSelectedQuestion(question);
      setIsAdminEditModalOpen(true);
      setQuestionLoading(true);
      setQuestionError(null);
      
      try {
        console.log('=== Q&A 상세 조회 시작 ===');
        console.log('질문 ID:', question.id);
        // 질문 상세 정보 불러오기
        const response = await fetch(`http://mot.erns.co.kr/api/questions/${question.id}`);
        console.log('질문 상세 API 응답 상태:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('질문 상세 데이터:', data);
          setSelectedQuestion(data);
          // 답변 목록도 함께 불러오기
          fetchAnswers(question.id);
        } else {
          const errorText = await response.text();
          console.error('질문 상세 조회 실패:', response.status, errorText);
          setQuestionError('질문을 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('질문 조회 중 오류:', error);
        setQuestionError('질문을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setQuestionLoading(false);
      }
    } else {
      // 일반 사용자는 기존 조회 모달 열기
      // 로그인 확인
      if (!isAuthenticated) {
        setQuestionError('질문 상세 조회는 로그인이 필요합니다.');
        setDetailModalOpen(true);
        setQuestionLoading(false);
        return;
      }
      
      setSelectedQuestion(question);
      setDetailModalOpen(true);
      setQuestionLoading(true);
      setQuestionError(null);
      
      try {
        console.log('=== Q&A 상세 조회 시작 ===');
        console.log('질문 ID:', question.id);
        // 질문 상세 정보 불러오기
        const response = await fetch(`http://mot.erns.co.kr/api/questions/${question.id}`);
        console.log('질문 상세 API 응답 상태:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('질문 상세 데이터:', data);
          setSelectedQuestion(data);
          // 답변 목록도 함께 불러오기
          fetchAnswers(question.id);
        } else {
          const errorText = await response.text();
          console.error('질문 상세 조회 실패:', response.status, errorText);
          setQuestionError('질문을 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('질문 조회 중 오류:', error);
        setQuestionError('질문을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setQuestionLoading(false);
      }
    }
  };

  // 답변 목록 불러오기
  const fetchAnswers = async (questionId: number) => {
    try {
      console.log('=== 답변 목록 조회 시작 ===');
      console.log('질문 ID:', questionId);
      const response = await fetch(`http://mot.erns.co.kr/api/questions/${questionId}/answers`);
      console.log('답변 목록 API 응답 상태:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('답변 목록 데이터:', data);
        setQuestionAnswers(data);
      } else {
        const errorText = await response.text();
        console.error('답변 목록 조회 실패:', response.status, errorText);
      }
    } catch (error) {
      console.error('답변 조회 중 오류:', error);
      console.error('에러 상세:', error);
    } finally {
      console.log('=== 답변 목록 조회 완료 ===');
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

  // 관리자 편집 모달 닫기
  const handleCloseAdminEditModal = () => {
    setIsAdminEditModalOpen(false);
    setSelectedQuestion(null);
    setQuestionAnswers([]);
    setQuestionError(null);
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

  // 질문 삭제
  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('정말로 이 질문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const response = await fetch(`http://mot.erns.co.kr/api/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('질문이 성공적으로 삭제되었습니다.');
        // 상세 모달 닫기
        handleCloseDetailModal();
        // 질문 목록 새로고침
        fetchQuestions();
      } else {
        alert('질문 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('질문 삭제 중 오류:', error);
      alert('질문 삭제 중 오류가 발생했습니다.');
    }
  };

  // 답변 제출
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAnswer.trim() || !selectedQuestion) return;

    setIsSubmitting(true);
    try {
      // 전문가 답변 여부 설정
      const isExpertAnswer = user.role?.toUpperCase() === 'EXPERT';
      
      console.log('답변 등록 요청 데이터:', {
        questionId: selectedQuestion.id,
        content: newAnswer,
        authorEmail: user.email,
        authorId: user.email,
        authorName: user.name || user.email,
        isExpertAnswer: isExpertAnswer
      });

      const response = await fetch(`http://mot.erns.co.kr/api/questions/${selectedQuestion.id}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newAnswer,
          authorEmail: user.email,
          authorId: user.email,
          authorName: user.name || user.email,
          isExpertAnswer: isExpertAnswer
        }),
      });

      console.log('답변 등록 응답 상태:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('답변 등록 성공:', result);
        setNewAnswer('');
        setIsAnswerModalOpen(false);
        fetchAnswers(selectedQuestion.id); // 답변 목록 새로고침
        alert(isExpertAnswer ? '전문가 답변이 등록되었습니다.' : '답변이 등록되었습니다.');
      } else {
        const errorText = await response.text();
        console.error('답변 등록 실패:', response.status, errorText);
        alert(`답변 등록에 실패했습니다.\n상태: ${response.status}\n오류: ${errorText}`);
      }
    } catch (error) {
      console.error('답변 등록 중 오류:', error);
      alert(`답변 등록 중 오류가 발생했습니다.\n오류: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
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
    // Q&A 전용 파일 다운로드 API 사용
    link.href = `http://mot.erns.co.kr/api/library/qna/download/${filePath}`;
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <FiMessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Q&A</h1>
          </div>
          <p className="text-lg text-purple-50 max-w-[1150px] text-right">
            기술경영, R&D 기획 및 관리에 대한 이슈, 타사 사례 등 MOT 관련 정보 한마당<br/>
            전문가에게 질문하고 답변을 받아보세요.
          </p>
        </div>
      </div>

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* 검색 및 필터 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-4">
              {/* 카테고리 선택 (width 50% 줄임) */}
              <div className="w-1/6">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">모든 카테고리</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              {/* 검색 입력과 버튼을 중앙정렬 */}
              <div className="flex-1 flex justify-center items-center gap-4">
                <div className="relative w-2/5">
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
                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
                >
                  검색
                </button>
              </div>
              
              {/* 질문하기 버튼 (현 위치 그대로) */}
              <div className="w-1/6 flex justify-end">
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
            {(() => {
              // 현재 페이지에 해당하는 데이터만 표시
              const startIndex = currentPage * pageSize;
              const endIndex = startIndex + pageSize;
              const currentPageQuestions = filteredQuestions.slice(startIndex, endIndex);
              
              return currentPageQuestions.length === 0 ? (
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
                currentPageQuestions.map((question) => (
                <div key={question.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {/* 상태 태그 숨김 처리 */}
                        {/* <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(question.status)}`}>
                          {getStatusText(question.status)}
                        </span> */}
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
                      
                      {/* 비공개 질문은 내용 숨김 */}
                      {question.isPublic ? (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {question.content}
                        </p>
                      ) : (
                        <div className="bg-gray-100 rounded-lg p-4 mb-4">
                          <div className="flex items-center text-gray-500">
                            <FiLock className="w-4 h-4 mr-2" />
                            <span className="text-sm">비공개 질문입니다. 로그인 후 상세 보기를 클릭하여 내용을 확인하세요.</span>
                          </div>
                        </div>
                      )}
                      
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
              );
            })()}
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
                <button 
                  onClick={handleCloseDetailModal} 
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiArrowLeft className="w-4 h-4 mr-2" />
                  목록으로 돌아가기
                </button>
              </div>
              
              {questionLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">질문을 불러오는 중...</p>
                </div>
              ) : questionError ? (
                <div className="text-center py-8">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiLock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인 필요</h2>
                    <p className="text-gray-600 mb-6">{questionError}</p>
                    <p className="text-sm text-gray-500 mb-6">
                      질문 상세 조회를 위해서는 로그인이 필요합니다.
                    </p>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleCloseDetailModal}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      닫기
                    </button>
                    <Link
                      href="/login"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      로그인하기
                    </Link>
                  </div>
                </div>
              ) : selectedQuestion ? (
                <div className="space-y-6">
                  {/* 질문 상세 */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    {/* 질문 헤더 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          {/* 상태 태그 숨김 처리 */}
                          {/* <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedQuestion.status)}`}>
                            {getStatusText(selectedQuestion.status)}
                          </span> */}
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

                  

                    {/* 답변 작성 버튼과 삭제 버튼 */}
                    <div className="flex justify-between items-center">
                      {/* 왼쪽 공간 */}
                      <div className="w-20"></div>
                    
                    {/* 답변 작성 버튼 - 중앙 */}
                    <div className="flex justify-center flex-1">
                      {isAuthenticated && (
                        (user?.role?.toUpperCase() === 'ADMIN' || 
                         user?.role?.toUpperCase() === 'EXPERT' || 
                         user?.email === selectedQuestion?.authorEmail) && (
                          <button
                            onClick={openAnswerModal}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <FiMessageSquare className="w-5 h-5 mr-2" />
                            {user?.role?.toUpperCase() === 'EXPERT' ? '전문가 답변 작성' : '답변 작성'}
                          </button>
                        )
                      )}
                    </div>
                    
                    {/* 관리자 삭제 버튼 - 오른쪽 */}
                    <div>
                      {isAuthenticated && user && user.role?.toUpperCase() === 'ADMIN' && (
                        <button
                          onClick={() => handleDeleteQuestion(selectedQuestion!.id)}
                          className="inline-flex items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FiTrash2 className="w-5 h-5 mr-2" />
                          삭제
                        </button>
                      )}
                    </div>
                  </div>

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
                      <AnswerList
                        answers={questionAnswers}
                        onAnswerUpdate={() => fetchAnswers(selectedQuestion!.id)}
                      />
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
                        {user?.role?.toUpperCase() === 'EXPERT' ? '전문가 답변 작성' : '답변 작성'}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <FiUser className="w-4 h-4 mr-1" />
                        <span>답변자: {user?.email} ({user?.role?.toUpperCase() === 'EXPERT' ? '전문가' : user?.role?.toUpperCase() === 'ADMIN' ? '관리자' : '사용자'})</span>
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
                  {isSubmitting ? '등록 중...' : (user?.role?.toUpperCase() === 'EXPERT' ? '전문가 답변 등록' : '답변 등록')}
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

      {/* 페이징 컴포넌트 */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8 mb-8">
          {/* 이전 페이지 버튼 */}
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>

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
          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      )}

      {/* 전체 결과 수 표시 */}
      {!loading && (
        <div className="text-center text-sm text-gray-500 mb-4">
          총 {totalElements}개의 질문 중 {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)}번째
        </div>
      )}

      {/* 관리자 편집 모달 */}
      <AdminEditModal
        isOpen={isAdminEditModalOpen}
        onClose={handleCloseAdminEditModal}
        question={selectedQuestion}
        answers={questionAnswers}
        onQuestionUpdate={fetchQuestions}
        onAnswerUpdate={() => selectedQuestion && fetchAnswers(selectedQuestion.id)}
      />
    </main>
  );
} 