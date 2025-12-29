'use client';

import { useState, useEffect } from 'react';
import { FiX, FiMessageSquare, FiUser, FiCalendar, FiLock, FiUnlock, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { formatDate } from '@/utils/dateUtils';
import InquiryModal from './InquiryModal';
import { getApiUrl } from '@/config/api';

interface Inquiry {
  id: number;
  type: '질문' | '제안' | '요청';
  content: string;
  authorEmail: string;
  isPublic: boolean;
  createdAt: string;
  response?: InquiryResponse;
}

interface InquiryResponse {
  id: number;
  content: string;
  authorEmail: string;
  authorName?: string;
  createdAt: string;
}

interface InquiryListModalProps {
  isOpen: boolean;
  onClose: () => void;
  refTable: string;
  refId: number;
  refTitle: string;
  userEmail?: string;
}

export default function InquiryListModal({
  isOpen,
  onClose,
  refTable,
  refId,
  refTitle,
  userEmail
}: InquiryListModalProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchInquiries();
    }
  }, [isOpen, refTable, refId]);

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = getApiUrl(`/api/inquiries?refTable=${refTable}&refId=${refId}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('조회에 실패했습니다.');
      }

      const data: Inquiry[] = await response.json();
      
      // 응답이 이미 포함되어 있으면 사용, 없으면 별도 조회
      const inquiriesWithResponses = await Promise.all(
        data.map(async (inquiry) => {
          // responses 배열이 있고 첫 번째 응답이 있으면 사용
          if ((inquiry as any).responses && Array.isArray((inquiry as any).responses) && (inquiry as any).responses.length > 0) {
            return {
              ...inquiry,
              response: (inquiry as any).responses[0]
            };
          }
          
          // 별도로 응답 조회
          try {
            const responseUrl = getApiUrl(`/api/inquiries/${inquiry.id}/responses`);
            const responseRes = await fetch(responseUrl);
            if (responseRes.ok) {
              const responses = await responseRes.json();
              return {
                ...inquiry,
                response: responses.length > 0 ? responses[0] : undefined
              };
            }
          } catch (err) {
            console.error(`응답 조회 실패 (inquiry ${inquiry.id}):`, err);
          }
          return inquiry;
        })
      );

      // 공개 여부 필터링 (작성자 본인 또는 공개 항목만 표시)
      const filtered = inquiriesWithResponses.filter(inquiry => 
        inquiry.isPublic || inquiry.authorEmail === userEmail
      );

      setInquiries(filtered);
    } catch (err) {
      console.error('조회 실패:', err);
      setError('조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '질문': return 'bg-blue-100 text-blue-800';
      case '제안': return 'bg-green-100 text-green-800';
      case '요청': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">문의/요청 이력</h3>
              <p className="text-sm text-gray-500 mt-1">본 자료/교육/질문/연구 관련하여 추가 문의사항이나 요청사항 등록</p>
            </div>
            <div className="flex items-center gap-2">
              {/* 문의/요청 등록 버튼 */}
              {userEmail && (
                <button
                  onClick={() => setInquiryModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FiMessageSquare className="mr-2 h-4 w-4" />
                  문의/요청 등록
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
              <p>{error}</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiMessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>등록된 관련 문의/요청이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inquiry) => {
                const isExpanded = expandedIds.has(inquiry.id);
                const isMine = inquiry.authorEmail === userEmail;

                return (
                  <div
                    key={inquiry.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* 헤더 */}
                    <div
                      className="bg-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer"
                      onClick={() => toggleExpand(inquiry.id)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(inquiry.type)}`}>
                          {inquiry.type}
                        </span>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {!inquiry.isPublic && <FiLock className="w-4 h-4" />}
                          <FiUser className="w-4 h-4" />
                          <span className={isMine ? 'font-medium text-blue-600' : ''}>
                            {inquiry.authorEmail}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FiCalendar className="w-3 h-3" />
                          <span>{formatDate(inquiry.createdAt)}</span>
                        </div>
                        {inquiry.response && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            답변 완료
                          </span>
                        )}
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                    </div>

                    {/* 내용 */}
                    {isExpanded && (
                      <div className="p-4 space-y-4">
                        <div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{inquiry.content}</p>
                        </div>

                        {/* 답변 */}
                        {inquiry.response ? (
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                            <div className="flex items-center gap-2 mb-2">
                              <FiMessageSquare className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">전문가 답변</span>
                              {inquiry.response.authorName && (
                                <span className="text-xs text-blue-700">
                                  ({inquiry.response.authorName})
                                </span>
                              )}
                              <span className="text-xs text-blue-600 ml-auto">
                                {formatDate(inquiry.response.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {inquiry.response.content}
                            </p>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 italic">
                            아직 답변이 없습니다.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 관련 문의/요청 작성 모달 */}
      {inquiryModalOpen && userEmail && (
        <InquiryModal
          isOpen={inquiryModalOpen}
          onClose={() => setInquiryModalOpen(false)}
          refTable={refTable}
          refId={refId}
          refTitle={refTitle}
          userEmail={userEmail}
          onSuccess={() => {
            fetchInquiries();
          }}
        />
      )}
    </div>
  );
}

