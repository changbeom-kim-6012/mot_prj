'use client';

import { useState } from 'react';
import { FiX, FiSend, FiLock, FiUnlock } from 'react-icons/fi';
import { getApiUrl } from '@/config/api';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  refTable: string;
  refId: number;
  refTitle: string;
  userEmail: string;
  onSuccess?: () => void;
}

export default function InquiryModal({
  isOpen,
  onClose,
  refTable,
  refId,
  refTitle,
  userEmail,
  onSuccess
}: InquiryModalProps) {
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    if (content.trim().length < 10) {
      setError('내용을 10자 이상 입력해주세요.');
      return;
    }

    if (content.trim().length > 300) {
      setError('내용은 300자 이하로 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const inquiryData = {
        refTable,
        refId,
        type: '질문', // 기본값으로 고정
        content: content.trim(),
        authorEmail: userEmail,
        isPublic
      };

      console.log('관련 문의/요청 등록:', inquiryData);
      
      const response = await fetch(getApiUrl('/api/inquiries'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || '등록에 실패했습니다.');
      }

      alert('문의/요청이 등록되었습니다.');
      setContent('');
      setIsPublic(true);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('등록 실패:', err);
      setError(err.message || '등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">관련 문의/요청</h3>
            <p className="text-sm text-gray-500 mt-1">본 자료/교육/질문/연구 관련하여 추가 문의사항이나 요청사항 등록</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* 본문 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
              <p>{error}</p>
            </div>
          )}

          {/* 내용 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              문의/요청 내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => {
                if (e.target.value.length <= 300) {
                  setContent(e.target.value);
                }
              }}
              rows={3}
              maxLength={300}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="질문, 제안, 또는 요청 내용을 입력해주세요..."
              required
            />
            <p className="mt-1 text-xs text-gray-500">{content.length}/300자</p>
          </div>

          {/* 공개 여부 */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                {isPublic ? <FiUnlock className="w-4 h-4" /> : <FiLock className="w-4 h-4" />}
                공개 (다른 사용자도 볼 수 있습니다)
              </span>
            </label>
          </div>

          {/* 작성자 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              작성자 이메일
            </label>
            <input
              type="email"
              value={userEmail}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          {/* 버튼 */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FiSend className="w-4 h-4" />
              {isSubmitting ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

