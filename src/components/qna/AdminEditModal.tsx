'use client';

import { useState, useEffect } from 'react';
import { FiX, FiSave, FiTrash2, FiEdit3, FiMessageSquare, FiUser, FiCalendar, FiEye, FiDownload, FiUpload } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/dateUtils';
import { getApiUrl } from '@/config/api';
import FileViewer from '@/components/common/FileViewer';

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
  onQuestionDelete?: () => void;
}

export default function AdminEditModal({
  isOpen,
  onClose,
  question,
  answers,
  onQuestionUpdate,
  onAnswerUpdate,
  onQuestionDelete
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [shouldDeleteFile, setShouldDeleteFile] = useState(false);

  // 답변 수정 상태
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
  const [answerForm, setAnswerForm] = useState({
    content: ''
  });

  // 로딩 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 파일 뷰어 상태
  const [viewingFile, setViewingFile] = useState<{ url: string; name: string } | null>(null);

  // 카테고리 목록 상태
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // 카테고리 목록 가져오기
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      console.log('=== AdminEditModal 카테고리 데이터 요청 시작 ===');
      const response = await fetch(getApiUrl('/api/codes/menu/qna/details'));
      console.log('카테고리 API 응답 상태:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('카테고리 API 데이터:', data);
        
        if (Array.isArray(data)) {
          const categoryList = data.map((c: any) => c.codeName);
          console.log('처리된 카테고리 목록:', categoryList);
          setCategories(categoryList);
        } else {
          console.error('카테고리 데이터가 배열이 아닙니다:', data);
          setCategories(['일반', '기술', '비즈니스', '교육', '기타']);
        }
      } else {
        console.error('카테고리 목록 조회 실패:', response.status);
        // 기본 카테고리 목록 설정
        setCategories(['일반', '기술', '비즈니스', '교육', '기타']);
      }
    } catch (error) {
      console.error('카테고리 목록 조회 중 오류:', error);
      // 기본 카테고리 목록 설정
      setCategories(['일반', '기술', '비즈니스', '교육', '기타']);
    } finally {
      setIsLoadingCategories(false);
    }
  };

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
      setSelectedFile(null);
      setShouldDeleteFile(false);
      // 카테고리 목록 가져오기
      fetchCategories();
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
      
      // 파일 삭제 플래그 추가 (백엔드에서 처리할 수 있도록)
      if (shouldDeleteFile) {
        formData.append('deleteFile', 'true');
      }
      
      // 새 파일이 선택된 경우 추가
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await fetch(getApiUrl(`/api/questions/${question.id}`), {
        method: 'PUT',
        headers: {
          'User-Email': user?.email || '',
          'User-Role': user?.role || ''
        },
        body: formData,
      });

      if (response.ok) {
        setIsEditingQuestion(false);
        setSelectedFile(null);
        setShouldDeleteFile(false);
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
      const url = new URL(getApiUrl(`/api/answers/${editingAnswerId}`));
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

  const handleQuestionDelete = async () => {
    if (!question) return;
    
    if (!confirm(`정말로 이 질문을 삭제하시겠습니까?\n\n"${question.title}"\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl(`/api/questions/${question.id}`), {
        method: 'DELETE',
        headers: {
          'User-Email': user?.email || '',
          'User-Role': user?.role || ''
        }
      });

      if (response.ok || response.status === 204) {
        alert('질문이 성공적으로 삭제되었습니다.');
        onClose();
        if (onQuestionDelete) {
          onQuestionDelete();
        } else {
          onQuestionUpdate();
        }
      } else {
        throw new Error('질문 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('질문 삭제 오류:', error);
      setError('질문 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerDelete = async (answerId: number) => {
    if (!confirm('이 답변을 삭제하시겠습니까?')) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const url = new URL(getApiUrl(`/api/answers/${answerId}`));
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

  const handleFileView = (filePath: string) => {
    // Q&A 파일 보기 URL 생성
    const encodedFilePath = encodeURIComponent(filePath);
    const fileUrl = getApiUrl(`/api/library/qna/view/${encodedFilePath}`);
    setViewingFile({ url: fileUrl, name: filePath });
  };

  const handleCloseFileViewer = () => {
    setViewingFile(null);
  };

  // UUID를 제거하고 원본 파일명만 추출하는 함수
  const getOriginalFileName = (filePath: string): string => {
    if (!filePath) return filePath;
    // UUID_원본파일명 형식에서 원본 파일명만 추출
    // UUID는 보통 36자 (8-4-4-4-12 형식)이지만, 언더스코어 이후의 부분을 가져옴
    const lastUnderscoreIndex = filePath.lastIndexOf('_');
    if (lastUnderscoreIndex !== -1 && lastUnderscoreIndex < filePath.length - 1) {
      // 언더스코어가 있고 그 이후에 문자가 있으면 원본 파일명으로 간주
      return filePath.substring(lastUnderscoreIndex + 1);
    }
    return filePath;
  };

  const handleFileDelete = async () => {
    if (!question) return;
    
    if (!confirm('정말로 이 첨부파일을 삭제하시겠습니까?')) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', question.title);
      formData.append('content', question.content);
      formData.append('category1', question.category1);
      formData.append('isPublic', question.isPublic.toString());
      formData.append('contactInfo', question.contactInfo || '');
      formData.append('deleteFile', 'true'); // 파일 삭제 플래그

      const response = await fetch(getApiUrl(`/api/questions/${question.id}`), {
        method: 'PUT',
        headers: {
          'User-Email': user?.email || '',
          'User-Role': user?.role || ''
        },
        body: formData,
      });

      if (response.ok) {
        onQuestionUpdate();
        alert('첨부파일이 성공적으로 삭제되었습니다.');
      } else {
        throw new Error('첨부파일 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('첨부파일 삭제 오류:', error);
      setError('첨부파일 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingQuestion(!isEditingQuestion)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiEdit3 className="w-4 h-4 mr-2" />
                  {isEditingQuestion ? '편집 취소' : '질문 편집'}
                </button>
                <button
                  onClick={handleQuestionDelete}
                  disabled={isSubmitting}
                  className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiTrash2 className="w-4 h-4 mr-2" />
                  질문 삭제
                </button>
              </div>
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
                    {isLoadingCategories ? (
                      <div className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50">
                        <span className="text-gray-500">카테고리 로딩 중...</span>
                      </div>
                    ) : (
                      <select
                        value={questionForm.category1}
                        onChange={(e) => setQuestionForm({ ...questionForm, category1: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    )}
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

                {/* 첨부파일 관리 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    첨부파일
                  </label>
                  <div className="space-y-3">
                    {/* 기존 파일 표시 */}
                    {question.filePath && question.filePath !== '[NULL]' && question.filePath.trim() !== '' && !shouldDeleteFile && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm text-gray-700 truncate">{getOriginalFileName(question.filePath)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleFileView(question.filePath!)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                          >
                            <FiEye className="w-4 h-4 mr-1" />
                            파일보기
                          </button>
                          <button
                            type="button"
                            onClick={() => setShouldDeleteFile(true)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4 mr-1" />
                            삭제
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* 파일 삭제 확인 메시지 */}
                    {shouldDeleteFile && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700 mb-2">기존 파일이 삭제됩니다.</p>
                        <button
                          type="button"
                          onClick={() => setShouldDeleteFile(false)}
                          className="text-sm text-red-600 hover:text-red-700 underline"
                        >
                          취소
                        </button>
                      </div>
                    )}
                    
                    {/* 새 파일 선택 */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <FiUpload className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{selectedFile ? '파일 변경' : '파일 선택'}</span>
                        <input
                          type="file"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setSelectedFile(e.target.files[0]);
                              setShouldDeleteFile(false); // 새 파일 선택 시 삭제 플래그 해제
                            }
                          }}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                        />
                      </label>
                      {selectedFile && (
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-sm text-gray-600 truncate">{selectedFile.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setShouldDeleteFile(false);
                            }}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            취소
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, Word, Excel, PowerPoint, 텍스트, 압축 파일을 업로드할 수 있습니다.
                    </p>
                  </div>
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
                  <h4 className="text-lg font-semibold text-gray-900 break-all overflow-wrap-break-word">{question.title}</h4>
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
                <p className="text-gray-700 mb-3 whitespace-pre-wrap break-all overflow-wrap-break-word">{question.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <FiUser className="w-4 h-4" />
                      <span className="break-all overflow-wrap-break-word">{question.authorEmail}</span>
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
                      <span className="break-all overflow-wrap-break-word">연락처: {question.contactInfo}</span>
                    </div>
                  )}
                </div>
                
                {/* 첨부파일 */}
                {question.filePath && question.filePath !== '[NULL]' && question.filePath.trim() !== '' && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">첨부파일</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 break-all overflow-wrap-break-word">
                        {getOriginalFileName(question.filePath)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFileView(question.filePath!)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FiEye className="w-4 h-4 mr-2" />
                          파일보기
                        </button>
                        {/* 조회 모드에서는 삭제 버튼 숨김 */}
                        {isEditingQuestion && (
                          <button
                            onClick={handleFileDelete}
                            className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <FiTrash2 className="w-4 h-4 mr-2" />
                            삭제
                          </button>
                        )}
                      </div>
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
                            <p className="text-gray-700 whitespace-pre-wrap break-all overflow-wrap-break-word">{answer.content}</p>
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
                              <span className="break-all overflow-wrap-break-word">{answer.authorEmail}</span>
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

      {/* 파일 뷰어 */}
      {viewingFile && (
        <FileViewer
          fileUrl={viewingFile.url}
          fileName={viewingFile.name}
          onClose={handleCloseFileViewer}
        />
      )}
    </div>
  );
}
