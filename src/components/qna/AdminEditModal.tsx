'use client';

import { useState, useEffect } from 'react';
import { FiX, FiSave, FiTrash2, FiEdit3, FiMessageSquare, FiUser, FiCalendar, FiEye, FiDownload } from 'react-icons/fi';
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

interface Answer {
  id: number;
  content: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
  isExpertAnswer: boolean;
}

interface AdminEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  answers: Answer[];
  onQuestionUpdate: () => void;
  onAnswerUpdate: () => void;
}

export default function AdminEditModal({
  isOpen,
  onClose,
  question,
  answers,
  onQuestionUpdate,
  onAnswerUpdate
}: AdminEditModalProps) {
  const { user } = useAuth();
  
  // 질문 수정 상태
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    title: '',
    content: '',
    category1: '',
    isPublic: true,
    contactInfo: ''
  });

  // 답변 수정 상태
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
  const [answerForm, setAnswerForm] = useState({
    content: ''
  });

  // 로딩 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모달이 열릴 때 폼 데이터 초기화
  useEffect(() => {
    if (isOpen && question) {
      setQuestionForm({
        title: question.title,
        content: question.content,
        category1: question.category1,
        isPublic: question.isPublic,
        contactInfo: question.contactInfo || ''
      });
      setIsEditingQuestion(false);
      setEditingAnswerId(null);
      setAnswerForm({ content: '' });
      setError(null);
    }
  }, [isOpen, question]);

  // 관리자 권한 확인
  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    return null;
  }

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', questionForm.title);
      formData.append('content', questionForm.content);
      formData.append('category1', questionForm.category1);
      formData.append('isPublic', questionForm.isPublic.toString());
      formData.append('contactInfo', questionForm.contactInfo);

      const response = await fetch(`http://localhost:8082/api/questions/${question.id}`, {
        method: 'PUT',
        headers: {
          'User-Email': user?.email || '',
          'User-Role': user?.role || ''
        },
        body: formData,
      });

      if (response.ok) {
        setIsEditingQuestion(false);
        onQuestionUpdate();
        alert('질문이 성공적으로 수정되었습니다.');
      } else {
        throw new Error('질문 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('질문 수정 오류:', error);
      setError('질문 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnswerId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const url = new URL(`http://localhost:8082/api/answers/${editingAnswerId}`);
      url.searchParams.append('userEmail', user?.email || '');
      url.searchParams.append('userRole', user?.role || '');

      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: answerForm.content
        }),
      });

      if (response.ok) {
        setEditingAnswerId(null);
        setAnswerForm({ content: '' });
        onAnswerUpdate();
        alert('답변이 성공적으로 수정되었습니다.');
      } else {
        throw new Error('답변 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('답변 수정 오류:', error);
      setError('답변 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerDelete = async (answerId: number) => {
    if (!confirm('이 답변을 삭제하시겠습니까?')) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const url = new URL(`http://localhost:8082/api/answers/${answerId}`);
      url.searchParams.append('userEmail', user?.email || '');
      url.searchParams.append('userRole', user?.role || '');

      const response = await fetch(url.toString(), {
        method: 'DELETE',
      });

      if (response.ok) {
        onAnswerUpdate();
        alert('답변이 성공적으로 삭제되었습니다.');
      } else {
        throw new Error('답변 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('답변 삭제 오류:', error);
      setError('답변 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditingAnswer = (answer: Answer) => {
    setEditingAnswerId(answer.id);
    setAnswerForm({ content: answer.content });
  };

  const cancelEditingAnswer = () => {
    setEditingAnswerId(null);
    setAnswerForm({ content: '' });
  };

  const handleFileDownload = (filePath: string) => {
    const link = document.createElement('a');
    // Q&A 전용 파일 다운로드 API 사용
    link.href = `http://localhost:8082/api/library/qna/download/${filePath}`;
    link.download = filePath;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen || !question) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FiEdit3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">관리자 편집 모드</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* 질문 편집 섹션 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">질문 정보</h3>
              <button
                onClick={() => setIsEditingQuestion(!isEditingQuestion)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiEdit3 className="w-4 h-4 mr-2" />
                {isEditingQuestion ? '편집 취소' : '질문 편집'}
              </button>
            </div>

            {isEditingQuestion ? (
              <form onSubmit={handleQuestionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    value={questionForm.title}
                    onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    내용
                  </label>
                  <textarea
                    value={questionForm.content}
                    onChange={(e) => setQuestionForm({ ...questionForm, content: e.target.value })}
                    rows={6}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리
                    </label>
                    <input
                      type="text"
                      value={questionForm.category1}
                      onChange={(e) => setQuestionForm({ ...questionForm, category1: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={questionForm.isPublic}
                      onChange={(e) => setQuestionForm({ ...questionForm, isPublic: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                      공개 질문
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연락처 정보
                  </label>
                  <input
                    type="text"
                    value={questionForm.contactInfo}
                    onChange={(e) => setQuestionForm({ ...questionForm, contactInfo: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingQuestion(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    {isSubmitting ? '저장 중...' : '저장'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">{question.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      question.isPublic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {question.isPublic ? '공개' : '비공개'}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {question.category1}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-3 whitespace-pre-wrap">{question.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <FiUser className="w-4 h-4" />
                      <span>{question.authorEmail}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiCalendar className="w-4 h-4" />
                      <span>{formatDate(question.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiEye className="w-4 h-4" />
                      <span>{question.viewCount}회 조회</span>
                    </div>
                  </div>
                  {question.contactInfo && (
                    <div className="text-gray-600">
                      연락처: {question.contactInfo}
                    </div>
                  )}
                </div>
                
                {/* 첨부파일 */}
                {question.filePath && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">첨부파일</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {question.filePath}
                      </span>
                      <button
                        onClick={() => handleFileDownload(question.filePath!)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FiDownload className="w-4 h-4 mr-2" />
                        파일 다운로드
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 답변 편집 섹션 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">답변 관리 ({answers.length}개)</h3>
            
            {answers.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">아직 답변이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {answers.map((answer) => (
                  <div key={answer.id} className="bg-gray-50 rounded-lg p-4">
                    {editingAnswerId === answer.id ? (
                      <form onSubmit={handleAnswerSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            답변 내용
                          </label>
                          <textarea
                            value={answerForm.content}
                            onChange={(e) => setAnswerForm({ content: e.target.value })}
                            rows={4}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={cancelEditingAnswer}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            취소
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            <FiSave className="w-4 h-4 mr-2" />
                            {isSubmitting ? '저장 중...' : '저장'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-gray-700 whitespace-pre-wrap">{answer.content}</p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => startEditingAnswer(answer)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="답변 수정"
                            >
                              <FiEdit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAnswerDelete(answer.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="답변 삭제"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <FiUser className="w-4 h-4" />
                              <span>{answer.authorEmail}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FiCalendar className="w-4 h-4" />
                              <span>{formatDate(answer.createdAt)}</span>
                            </div>
                            {answer.isExpertAnswer && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                전문가 답변
                              </span>
                            )}
                          </div>
                          {answer.updatedAt !== answer.createdAt && (
                            <div className="text-gray-400">
                              수정됨: {formatDate(answer.updatedAt)}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
