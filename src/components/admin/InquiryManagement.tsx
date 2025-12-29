'use client';

import { useState, useEffect } from 'react';
import { FiMessageSquare, FiUser, FiCalendar, FiLock, FiUnlock, FiChevronDown, FiChevronUp, FiSearch, FiFilter, FiSend, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { formatDate } from '@/utils/dateUtils';
import { getApiUrl } from '@/config/api';
import { useAuth } from '@/context/AuthContext';

interface Inquiry {
  id: number;
  refTable: string;
  refId: number;
  refTitle?: string;
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

export default function InquiryManagement() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRefTable, setFilterRefTable] = useState<'all' | 'library' | 'learning_subjects' | 'questions' | 'opinions' | 'learning_programs'>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [responseContent, setResponseContent] = useState<{ [key: number]: string }>({});
  const [submittingResponse, setSubmittingResponse] = useState<{ [key: number]: boolean }>({});
  const [editingInquiryId, setEditingInquiryId] = useState<number | null>(null);
  const [editingResponseId, setEditingResponseId] = useState<number | null>(null);
  const [editInquiryContent, setEditInquiryContent] = useState<{ [key: number]: string }>({});
  const [editInquiryType, setEditInquiryType] = useState<{ [key: number]: '질문' | '제안' | '요청' }>({});
  const [editInquiryPublic, setEditInquiryPublic] = useState<{ [key: number]: boolean }>({});
  const [editResponseContent, setEditResponseContent] = useState<{ [key: number]: string }>({});
  const [submittingEdit, setSubmittingEdit] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const url = getApiUrl('/api/inquiries');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('조회에 실패했습니다.');
      }

      const data: Inquiry[] = await response.json();
      
      // 각 inquiry에 대한 응답 조회 및 refTitle 가져오기
      const inquiriesWithDetails = await Promise.all(
        data.map(async (inquiry) => {
          try {
            // responses 배열이 이미 포함되어 있으면 사용
            let response = undefined;
            if ((inquiry as any).responses && Array.isArray((inquiry as any).responses) && (inquiry as any).responses.length > 0) {
              response = (inquiry as any).responses[0];
            } else {
              // 별도로 응답 조회
              const responseUrl = getApiUrl(`/api/inquiries/${inquiry.id}/responses`);
              const responseRes = await fetch(responseUrl);
              if (responseRes.ok) {
                const responses = await responseRes.json();
                response = responses.length > 0 ? responses[0] : undefined;
              }
            }

            // refTitle 가져오기 (선택적)
            let refTitle = '';
            try {
              const refUrl = getApiUrl(`/api/${inquiry.refTable}/${inquiry.refId}`);
              const refRes = await fetch(refUrl);
              if (refRes.ok) {
                const refData = await refRes.json();
                refTitle = refData.title || refData.programName || refData.subjectDescription || '';
              }
            } catch (err) {
              console.error('refTitle 조회 실패:', err);
            }

            return {
              ...inquiry,
              refTitle,
              response
            };
          } catch (err) {
            console.error(`상세 정보 조회 실패 (inquiry ${inquiry.id}):`, err);
            return inquiry;
          }
        })
      );

      setInquiries(inquiriesWithDetails);
    } catch (error) {
      console.error('조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (inquiryId: number) => {
    const content = responseContent[inquiryId]?.trim();
    if (!content || content.length < 10) {
      alert('답변 내용을 10자 이상 입력해주세요.');
      return;
    }

    setSubmittingResponse({ ...submittingResponse, [inquiryId]: true });

    try {
      const responseData = {
        content: content,
        authorEmail: user?.email || '',
        authorName: user?.name || ''
      };

      const response = await fetch(getApiUrl(`/api/inquiries/${inquiryId}/responses`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseData)
      });

      if (!response.ok) {
        throw new Error('답변 등록에 실패했습니다.');
      }

      alert('답변이 등록되었습니다.');
      setResponseContent({ ...responseContent, [inquiryId]: '' });
      fetchInquiries(); // 목록 새로고침
    } catch (error: any) {
      console.error('답변 등록 실패:', error);
      alert(error.message || '답변 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmittingResponse({ ...submittingResponse, [inquiryId]: false });
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

  const handleEditInquiry = (inquiry: Inquiry) => {
    setEditingInquiryId(inquiry.id);
    setEditInquiryContent({ ...editInquiryContent, [inquiry.id]: inquiry.content });
    setEditInquiryType({ ...editInquiryType, [inquiry.id]: inquiry.type });
    setEditInquiryPublic({ ...editInquiryPublic, [inquiry.id]: inquiry.isPublic });
  };

  const handleCancelEditInquiry = (inquiryId: number) => {
    setEditingInquiryId(null);
    setEditInquiryContent({ ...editInquiryContent, [inquiryId]: '' });
    setEditInquiryType({ ...editInquiryType, [inquiryId]: '질문' });
    setEditInquiryPublic({ ...editInquiryPublic, [inquiryId]: true });
  };

  const handleUpdateInquiry = async (inquiryId: number) => {
    const content = editInquiryContent[inquiryId]?.trim();
    if (!content || content.length < 10) {
      alert('내용을 10자 이상 입력해주세요.');
      return;
    }

    setSubmittingEdit({ ...submittingEdit, [`inquiry_${inquiryId}`]: true });

    try {
      const updateData = {
        content: content,
        type: editInquiryType[inquiryId],
        isPublic: editInquiryPublic[inquiryId]
      };

      const response = await fetch(getApiUrl(`/api/inquiries/${inquiryId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('수정에 실패했습니다.');
      }

      alert('문의/요청이 수정되었습니다.');
      setEditingInquiryId(null);
      fetchInquiries();
    } catch (error: any) {
      console.error('수정 실패:', error);
      alert(error.message || '수정 중 오류가 발생했습니다.');
    } finally {
      setSubmittingEdit({ ...submittingEdit, [`inquiry_${inquiryId}`]: false });
    }
  };

  const handleDeleteInquiry = async (inquiryId: number) => {
    if (!confirm('정말로 이 문의/요청을 삭제하시겠습니까?')) {
      return;
    }

    setSubmittingEdit({ ...submittingEdit, [`delete_inquiry_${inquiryId}`]: true });

    try {
      const response = await fetch(getApiUrl(`/api/inquiries/${inquiryId}`), {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('삭제에 실패했습니다.');
      }

      alert('문의/요청이 삭제되었습니다.');
      fetchInquiries();
    } catch (error: any) {
      console.error('삭제 실패:', error);
      alert(error.message || '삭제 중 오류가 발생했습니다.');
    } finally {
      setSubmittingEdit({ ...submittingEdit, [`delete_inquiry_${inquiryId}`]: false });
    }
  };

  const handleEditResponse = (response: InquiryResponse) => {
    setEditingResponseId(response.id);
    setEditResponseContent({ ...editResponseContent, [response.id]: response.content });
  };

  const handleCancelEditResponse = (responseId: number) => {
    setEditingResponseId(null);
    setEditResponseContent({ ...editResponseContent, [responseId]: '' });
  };

  const handleUpdateResponse = async (responseId: number) => {
    const content = editResponseContent[responseId]?.trim();
    if (!content || content.length < 10) {
      alert('답변 내용을 10자 이상 입력해주세요.');
      return;
    }

    setSubmittingEdit({ ...submittingEdit, [`response_${responseId}`]: true });

    try {
      const updateData = {
        content: content
      };

      const response = await fetch(getApiUrl(`/api/inquiries/responses/${responseId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('수정에 실패했습니다.');
      }

      alert('답변이 수정되었습니다.');
      setEditingResponseId(null);
      fetchInquiries();
    } catch (error: any) {
      console.error('수정 실패:', error);
      alert(error.message || '수정 중 오류가 발생했습니다.');
    } finally {
      setSubmittingEdit({ ...submittingEdit, [`response_${responseId}`]: false });
    }
  };

  const handleDeleteResponse = async (responseId: number) => {
    if (!confirm('정말로 이 답변을 삭제하시겠습니까?')) {
      return;
    }

    setSubmittingEdit({ ...submittingEdit, [`delete_response_${responseId}`]: true });

    try {
      const response = await fetch(getApiUrl(`/api/inquiries/responses/${responseId}`), {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('삭제에 실패했습니다.');
      }

      alert('답변이 삭제되었습니다.');
      fetchInquiries();
    } catch (error: any) {
      console.error('삭제 실패:', error);
      alert(error.message || '삭제 중 오류가 발생했습니다.');
    } finally {
      setSubmittingEdit({ ...submittingEdit, [`delete_response_${responseId}`]: false });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '질문': return 'bg-blue-100 text-blue-800';
      case '제안': return 'bg-green-100 text-green-800';
      case '요청': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRefTableLabel = (refTable: string) => {
    switch (refTable) {
      case 'library': return 'Library';
      case 'learning_subjects': return 'Learning (과목)';
      case 'learning_programs': return 'Learning (프로그램)';
      case 'questions': return 'Q&A';
      case 'opinions': return 'Research';
      default: return refTable;
    }
  };

  const filteredInquiries = inquiries
    .filter(inquiry => {
      const matchesSearch = searchTerm === '' || 
        inquiry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.authorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inquiry.refTitle && inquiry.refTitle.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRefTable = filterRefTable === 'all' || inquiry.refTable === filterRefTable;

      return matchesSearch && matchesRefTable;
    })
    .sort((a, b) => {
      // 최신순 정렬 (createdAt 기준 내림차순)
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

  // 페이징 계산
  const totalPages = Math.ceil(filteredInquiries.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedInquiries = filteredInquiries.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">문의/요청 관리</h2>

        {/* 검색 및 필터 */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <select
              value={filterRefTable}
              onChange={(e) => {
                setFilterRefTable(e.target.value as any);
                setCurrentPage(0); // 필터 변경 시 첫 페이지로
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">메뉴 선택</option>
              <option value="library">Library</option>
              <option value="learning_subjects">Learning (과목)</option>
              <option value="learning_programs">Learning (프로그램)</option>
              <option value="questions">Q&A</option>
              <option value="opinions">Research</option>
            </select>
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(0); // 검색어 변경 시 첫 페이지로
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCurrentPage(0);
                    fetchInquiries();
                  }
                }}
                placeholder="내용, 작성자, 제목으로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => {
                setCurrentPage(0); // 검색 시 첫 페이지로
                fetchInquiries();
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiSearch className="w-4 h-4 mr-2" />
              검색
            </button>
          </div>
        </div>

        {/* 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiMessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>등록된 문의/요청이 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedInquiries.map((inquiry) => {
              const isExpanded = expandedIds.has(inquiry.id);

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
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700">
                        {getRefTableLabel(inquiry.refTable)}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {!inquiry.isPublic && <FiLock className="w-4 h-4" />}
                        <FiUser className="w-4 h-4" />
                        <span>{inquiry.authorEmail}</span>
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
                      {!inquiry.response && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          답변 대기
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
                        <p className="text-xs text-gray-500 mb-1">관련 항목</p>
                        <p className="text-sm font-medium text-gray-900">{inquiry.refTitle || `ID: ${inquiry.refId}`}</p>
                      </div>
                      <div>
                        {editingInquiryId === inquiry.id ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">유형</label>
                              <div className="flex gap-4">
                                {(['질문', '제안', '요청'] as const).map((option) => (
                                  <label key={option} className="flex items-center">
                                    <input
                                      type="radio"
                                      value={option}
                                      checked={editInquiryType[inquiry.id] === option}
                                      onChange={() => setEditInquiryType({ ...editInquiryType, [inquiry.id]: option })}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">내용</label>
                              <textarea
                                value={editInquiryContent[inquiry.id] || ''}
                                onChange={(e) => setEditInquiryContent({ ...editInquiryContent, [inquiry.id]: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                            </div>
                            <div>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={editInquiryPublic[inquiry.id] ?? true}
                                  onChange={(e) => setEditInquiryPublic({ ...editInquiryPublic, [inquiry.id]: e.target.checked })}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">공개</span>
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateInquiry(inquiry.id)}
                                disabled={submittingEdit[`inquiry_${inquiry.id}`]}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              >
                                <FiEdit2 className="w-4 h-4 mr-1" />
                                {submittingEdit[`inquiry_${inquiry.id}`] ? '저장 중...' : '저장'}
                              </button>
                              <button
                                onClick={() => handleCancelEditInquiry(inquiry.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                              >
                                <FiX className="w-4 h-4 mr-1" />
                                취소
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap flex-1">{inquiry.content}</p>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditInquiry(inquiry);
                                }}
                                className="inline-flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
                              >
                                <FiEdit2 className="w-3 h-3 mr-1" />
                                수정
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteInquiry(inquiry.id);
                                }}
                                disabled={submittingEdit[`delete_inquiry_${inquiry.id}`]}
                                className="inline-flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                <FiTrash2 className="w-3 h-3 mr-1" />
                                삭제
                              </button>
                            </div>
                          </div>
                        )}
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
                            <div className="flex gap-2 ml-2">
                              {editingResponseId === inquiry.response.id ? (
                                <>
                                  <button
                                    onClick={() => handleCancelEditResponse(inquiry.response!.id)}
                                    className="text-xs text-gray-600 hover:text-gray-800"
                                  >
                                    <FiX className="w-3 h-3" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEditResponse(inquiry.response!)}
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    <FiEdit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteResponse(inquiry.response!.id)}
                                    disabled={submittingEdit[`delete_response_${inquiry.response!.id}`]}
                                    className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                                  >
                                    <FiTrash2 className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          {editingResponseId === inquiry.response.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editResponseContent[inquiry.response.id] || ''}
                                onChange={(e) => setEditResponseContent({ ...editResponseContent, [inquiry.response!.id]: e.target.value })}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateResponse(inquiry.response!.id)}
                                  disabled={submittingEdit[`response_${inquiry.response!.id}`]}
                                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                  <FiEdit2 className="w-4 h-4 mr-1" />
                                  {submittingEdit[`response_${inquiry.response!.id}`] ? '저장 중...' : '저장'}
                                </button>
                                <button
                                  onClick={() => handleCancelEditResponse(inquiry.response!.id)}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                                >
                                  <FiX className="w-4 h-4 mr-1" />
                                  취소
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {inquiry.response.content}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                          <p className="text-sm text-gray-700 mb-3">아직 답변이 없습니다.</p>
                          <div className="space-y-2">
                            <textarea
                              value={responseContent[inquiry.id] || ''}
                              onChange={(e) => setResponseContent({ ...responseContent, [inquiry.id]: e.target.value })}
                              rows={4}
                              placeholder="답변 내용을 입력하세요 (10줄 정도)"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <button
                              onClick={() => handleSubmitResponse(inquiry.id)}
                              disabled={submittingResponse[inquiry.id] || !responseContent[inquiry.id]?.trim()}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              <FiSend className="w-4 h-4 mr-2" />
                              {submittingResponse[inquiry.id] ? '등록 중...' : '답변 등록'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
              })}
            </div>
            
            {/* 페이징 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                
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
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            )}
            
            {/* 결과 수 표시 */}
            <div className="text-center text-sm text-gray-500 mt-4">
              총 {filteredInquiries.length}개 중 {startIndex + 1}-{Math.min(endIndex, filteredInquiries.length)}번째
            </div>
          </>
        )}
      </div>
    </div>
  );
}

