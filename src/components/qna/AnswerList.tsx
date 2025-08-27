'use client';

import { useState } from 'react';
import { Answer } from '@/types/qna';
import { FiThumbsUp, FiCheck, FiEdit2, FiX, FiCheck as FiSave } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const isAnswerAuthor = (answer: Answer) => {
    return user?.email === answer.authorEmail;
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
      await axios.put(`http://localhost:8082/api/answers/${answerId}`, {
        content: editContent
      });
      
      setEditingAnswerId(null);
      setEditContent('');
      onAnswerUpdate?.(); // 부모 컴포넌트에 업데이트 알림
    } catch (error) {
      console.error('답변 수정 실패:', error);
      alert('답변 수정에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {answers.map((answer) => (
        <div
          key={answer.id}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-4">
                <div className="text-sm text-gray-500">{answer.authorName}</div>
                <div className="text-xs text-gray-400">
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
                <div className="text-gray-700 whitespace-pre-wrap">{answer.content}</div>
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