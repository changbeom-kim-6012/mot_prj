'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiEye, FiMessageSquare, FiCalendar, FiUser, FiDownload } from 'react-icons/fi';
import Navigation from '@/components/Navigation';
import AnswerList from '@/components/qna/AnswerList';
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

export default function QnaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);

  const questionId = params.id as string;

  // 질문 상세 정보 불러오기
  useEffect(() => {
    if (questionId) {
      fetchQuestionDetail();
    }
  }, [questionId]);

  const fetchQuestionDetail = async () => {
    try {
      const response = await fetch(`http://localhost:8082/api/questions/${questionId}`);
      if (response.ok) {
        const data = await response.json();
        
        // 비공개 질문에 대한 접근 제어
        if (!data.isPublic) {
          // 로그인하지 않은 사용자는 접근 불가
          if (!isAuthenticated || !user) {
            setError('비공개 질문은 로그인이 필요합니다.');
            setLoading(false);
            return;
          }
          
          // 질문 작성자가 아니고 관리자도 아닌 경우 접근 불가
          if (data.authorEmail !== user.email && user.role !== 'ADMIN') {
            setError('비공개 질문은 작성자와 관리자만 볼 수 있습니다.');
            setLoading(false);
            return;
          }
        }
        
        setQuestion(data);
        // 답변 목록도 함께 불러오기 (실제로는 별도 API일 수 있음)
        fetchAnswers();
      } else {
        setError('질문을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('질문 조회 중 오류:', error);
      setError('질문을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async () => {
    try {
      const response = await fetch(`http://localhost:8082/api/questions/${questionId}/answers`);
      if (response.ok) {
        const data = await response.json();
        setAnswers(data);
      }
    } catch (error) {
      console.error('답변 조회 중 오류:', error);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAnswer.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8082/api/questions/${questionId}/answers`, {
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
        fetchAnswers(); // 답변 목록 새로고침
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

  const openAnswerModal = () => {
    setIsAnswerModalOpen(true);
  };

  const closeAnswerModal = () => {
    setIsAnswerModalOpen(false);
    setNewAnswer('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    link.href = `http://localhost:8082/api/attachments/download/${filePath}`;
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
            <p className="mt-4 text-gray-600">질문을 불러오는 중...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !question) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">접근 제한</h2>
            <p className="text-gray-600 mb-6">{error || '질문을 찾을 수 없습니다.'}</p>
            <Link
              href="/qna"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Q&A 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 뒤로가기 버튼 */}
          <div className="mb-6">
            <Link
              href="/qna"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Q&A 목록으로 돌아가기
            </Link>
          </div>

          {/* 질문 상세 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            {/* 질문 헤더 */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(question.status)}`}>
                    {getStatusText(question.status)}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {question.category1}
                  </span>
                  {!question.isPublic && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      비공개
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <FiUser className="w-4 h-4 mr-1" />
                    <span>{question.authorEmail}</span>
                  </div>
                  <div className="flex items-center">
                    <FiCalendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(question.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <FiEye className="w-4 h-4 mr-1" />
                    <span>조회 {question.viewCount}</span>
                  </div>
                  <div className="flex items-center">
                    <FiMessageSquare className="w-4 h-4 mr-1" />
                    <span>답변 {question.answerCount}개</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 질문 내용 */}
            <div className="prose max-w-none mb-6">
              <div className="whitespace-pre-wrap text-gray-700">{question.content}</div>
            </div>

            {/* 첨부파일 */}
            {question.filePath && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">첨부파일</h3>
                <button
                  onClick={() => handleFileDownload(question.filePath!)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiDownload className="w-4 h-4 mr-2" />
                  {question.filePath}
                </button>
              </div>
            )}
          </div>

          {/* 답변 작성 버튼 */}
          {isAuthenticated && (
            // 관리자, 전문가, 질문 작성자만 답변 작성 가능
            (user?.role === 'ADMIN' || 
             user?.role === 'EXPERT' || 
             user?.email === question?.authorEmail) && (
              <div className="flex justify-center mb-8">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                답변 ({answers.length}개)
              </h2>
            </div>
            
            {answers.length === 0 ? (
              <div className="text-center py-8">
                <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">아직 답변이 없습니다.</p>
              </div>
            ) : (
              <AnswerList
                answers={answers}
                onAnswerUpdate={fetchAnswers}
              />
            )}
          </div>

          {/* 답변 작성 모달 */}
          {isAnswerModalOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeAnswerModal}></div>
                </div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
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
                              rows={12}
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
        </div>
      </div>
    </main>
  );
} 