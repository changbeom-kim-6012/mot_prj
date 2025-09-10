'use client';

import { useState } from 'react';
import { Answer } from '@/types/qna';
import { FiThumbsUp, FiCheck, FiEdit2, FiX, FiCheck as FiSave, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { formatDate } from '@/utils/dateUtils';

interface AnswerListProps {
  answers: Answer[];
  onAcceptAnswer?: (answerId: string) => void;
  onVoteAnswer?: (answerId: string) => void;
  isAuthor?: boolean;
  onAnswerUpdate?: () => void;
}

export default function AnswerList({
  answers,
  onAcceptAnswer,
  onVoteAnswer,
  isAuthor = false,
  onAnswerUpdate,
}: AnswerListProps) {
  const { user } = useAuth();
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // 컴포넌트 로드 시 사용자 정보 출력
  console.log('AnswerList 컴포넌트 로드됨');
  console.log('현재 사용자 정보:', user);
  console.log('답변 개수:', answers.length);



  const isAnswerAuthor = (answer: Answer) => {
    return user?.email === answer.authorEmail;
  };

  const isAdmin = () => {
    const isAdminUser = user?.role === 'ADMIN';
    console.log('관리자 권한 확인:', {
      userEmail: user?.email,
      userRole: user?.role,
      isAdmin: isAdminUser
    });
    return isAdminUser;
  };

  const handleDeleteAnswer = async (answerId: number) => {
    console.log('=== 답변 삭제 버튼 클릭됨 ===');
    console.log('답변 ID:', answerId);
    console.log('현재 사용자:', user);
    console.log('사용자 이메일:', user?.email);
    console.log('사용자 권한:', user?.role);
    
    if (!confirm('정말로 이 답변을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      console.log('사용자가 삭제를 취소함');
      return;
    }

    try {
      console.log('답변 삭제 요청 시작:', answerId);
      console.log('사용자 정보:', user?.email, user?.role);
      
      const response = await axios.delete(`http://mot.erns.co.kr:8082/api/answers/${answerId}`, {
        params: {
          userEmail: user?.email,
          userRole: user?.role
        }
      });
      console.log('답변 삭제 응답:', response.status, response.statusText);
      
      if (response.status === 204) {
        alert('답변이 성공적으로 삭제되었습니다.');
        onAnswerUpdate?.(); // 부모 컴포넌트에 업데이트 알림
      } else {
        alert(`답변 삭제에 실패했습니다. 상태: ${response.status}`);
      }
    } catch (error: any) {
      console.error('답변 삭제 실패:', error);
      console.error('응답 데이터:', error.response?.data);
      console.error('응답 상태:', error.response?.status);
      
      let errorMessage = '답변 삭제에 실패했습니다.';
      if (error.response?.status === 404) {
        errorMessage = '삭제할 답변을 찾을 수 없습니다.';
      } else if (error.response?.status === 403) {
        errorMessage = '답변 삭제 권한이 없습니다.';
      } else if (error.response?.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
      
      alert(errorMessage);
    }
  };

  const handleEditClick = (answer: Answer) => {
    setEditingAnswerId(answer.id);
    setEditContent(answer.content);
  };

  const handleCancelEdit = () => {
    setEditingAnswerId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (answerId: number) => {
    if (!editContent.trim()) return;

    try {
      setIsUpdating(true);
      console.log('답변 수정 요청:', answerId);
      console.log('사용자 정보:', user?.email, user?.role);
      
      await axios.put(`http://mot.erns.co.kr:8082/api/answers/${answerId}`, {
        content: editContent
      }, {
        params: {
          userEmail: user?.email,
          userRole: user?.role
        }
      });
      
      setEditingAnswerId(null);
      setEditContent('');
      onAnswerUpdate?.(); // 부모 컴포넌트에 업데이트 알림
    } catch (error: any) {
      console.error('답변 수정 실패:', error);
      console.error('응답 상태:', error.response?.status);
      
      let errorMessage = '답변 수정에 실패했습니다.';
      if (error.response?.status === 403) {
        errorMessage = '답변 수정 권한이 없습니다.';
      } else if (error.response?.status === 404) {
        errorMessage = '수정할 답변을 찾을 수 없습니다.';
      }
      
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {answers.map((answer) => (
        <div
          key={answer.id}
          className="bg-white rounded-lg shadow-sm p-8"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-4">
                <div className="text-base text-gray-500">
                  {answer.authorName}
                  {answer.isExpertAnswer && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      전문가
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  {formatDate(answer.createdAt)}
                </div>
                {isAnswerAuthor(answer) && editingAnswerId !== answer.id && (
                  <button
                    onClick={() => handleEditClick(answer)}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    <FiEdit2 className="w-3 h-3" />
                    수정
                  </button>
                )}
                {/* 삭제 버튼 - 관리자 또는 답변 작성자 */}
                {(isAdmin() || isAnswerAuthor(answer)) && editingAnswerId !== answer.id && (
                  <button
                    onClick={() => handleDeleteAnswer(answer.id)}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 className="w-3 h-3" />
                    삭제
                  </button>
                )}
                {/* 디버깅 정보 표시 */}
                {user && (
                  <div className="text-xs text-gray-400">
                    사용자: {user.email} | 권한: {user.role} | 관리자: {isAdmin() ? '예' : '아니오'}
                  </div>
                )}
              </div>
              {editingAnswerId === answer.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={4}
                    placeholder="답변을 수정해주세요..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(answer.id)}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <FiSave className="w-4 h-4" />
                      {isUpdating ? '저장 중...' : '저장'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                    >
                      <FiX className="w-4 h-4" />
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-lg text-gray-700 whitespace-pre-wrap leading-relaxed">{answer.content}</div>
              )}
            </div>
            <div className="flex flex-col items-center gap-2 ml-4">
              <button
                onClick={() => onVoteAnswer?.(answer.id.toString())}
                className="flex flex-col items-center text-gray-500 hover:text-violet-600"
              >
                <FiThumbsUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 