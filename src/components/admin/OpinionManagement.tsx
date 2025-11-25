'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '@/config/api';
import { useAuth } from '@/context/AuthContext';

interface Opinion {
  id: number;
  title: string;
  authorName: string;
  createdAt: string;
  status: string;
  abstractText: string;
  keywords: string;
  references: string;
  fullText?: string;
  category: string;
  attachmentPath?: string;
}

export default function OpinionManagement() {
  const { user } = useAuth();
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpinion, setSelectedOpinion] = useState<Opinion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullTextModalOpen, setIsFullTextModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    fetchOpinions();
  }, []);

  const fetchOpinions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl('/api/opinions'));
      setOpinions(response.data);
    } catch (error) {
      console.error('Opinion 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      setUpdatingStatus(id);
      console.log('Sending status update request:', { id, newStatus });
      
      // 방법 1: JSON 방식 (기존)
      let response;
      try {
        response = await axios.patch(getApiUrl(`/api/opinions/${id}/status`), {
          status: newStatus
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        console.log('JSON 방식 실패, 간단한 방식으로 재시도...');
        // 방법 2: 간단한 방식 (대안)
        response = await axios.put(getApiUrl(`/api/opinions/${id}/status-simple?status=${newStatus}`));
      }
      
      console.log('Status update response:', response);
      
      if (response.status === 200) {
        fetchOpinions(); // 목록 새로고침
        alert('상태가 업데이트되었습니다.');
      } else {
        alert('상태 업데이트에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('상태 업데이트 실패 상세:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        alert(`상태 업데이트에 실패했습니다. (${error.response.status})`);
      } else if (error.request) {
        console.error('Request error:', error.request);
        alert('서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.');
      } else {
        alert('상태 업데이트에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await axios.delete(getApiUrl(`/api/opinions/${id}`), {
        headers: {
          'User-Role': user?.role || '',
        },
      });
      fetchOpinions(); // 목록 새로고침
      alert('삭제되었습니다.');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const openModal = (opinion: Opinion) => {
    setSelectedOpinion(opinion);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOpinion(null);
  };

  const openFullTextModal = () => {
    setIsFullTextModalOpen(true);
  };

  const closeFullTextModal = () => {
    setIsFullTextModalOpen(false);
  };

  const openAttachment = () => {
    if (selectedOpinion?.attachmentPath) {
      window.open(getApiUrl(`/uploads/opinions/${selectedOpinion.attachmentPath}`), '_blank');
    } else {
      alert('첨부파일이 없습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      '등록대기': { color: 'bg-yellow-100 text-yellow-800', label: '등록대기' },
      '등록승인': { color: 'bg-green-100 text-green-800', label: '등록승인' },
      '등록거부': { color: 'bg-red-100 text-red-800', label: '등록거부' },
      '임시저장': { color: 'bg-gray-100 text-gray-800', label: '임시저장' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['임시저장'];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Agora 관리</h3>
        <p className="mt-1 text-sm text-gray-500">
          사용자가 등록한 기고를 관리하고 승인/거부할 수 있습니다.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-2/5 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                제목
              </th>
              <th className="w-1/8 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                저자
              </th>
              <th className="w-1/8 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="w-1/12 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="w-1/8 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                등록일
              </th>
              <th className="w-1/8 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {opinions.map((opinion) => (
              <tr key={opinion.id} className="hover:bg-gray-50">
                <td className="px-3 py-4">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-40" title={opinion.title}>
                    {opinion.title}
                  </div>
                </td>
                <td className="px-2 py-4 text-sm text-gray-500">
                  <div className="truncate max-w-16" title={opinion.authorName}>
                    {opinion.authorName}
                  </div>
                </td>
                <td className="px-2 py-4 text-sm text-gray-500">
                  <div className="truncate max-w-16" title={opinion.category}>
                    {opinion.category}
                  </div>
                </td>
                <td className="px-2 py-4">
                  {getStatusBadge(opinion.status)}
                </td>
                <td className="px-2 py-4 text-sm text-gray-500">
                  {new Date(opinion.createdAt).toLocaleDateString()}
                </td>
                <td className="px-2 py-4 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    {opinion.status === '등록대기' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(opinion.id, '등록승인')}
                          disabled={updatingStatus === opinion.id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="승인"
                        >
                          {updatingStatus === opinion.id ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(opinion.id, '등록거부')}
                          disabled={updatingStatus === opinion.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="거부"
                        >
                          {updatingStatus === opinion.id ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => openModal(opinion)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="상세보기"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <div className="w-3"></div>
                    <button
                      onClick={() => handleDelete(opinion.id)}
                      className="text-red-600 hover:text-red-900"
                      title="삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 상세보기 모달 */}
      {isModalOpen && selectedOpinion && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {selectedOpinion.title}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">저자</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedOpinion.authorName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">카테고리</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedOpinion.category}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">초록</label>
                        <p className="mt-1 text-sm text-gray-900 whitespace-pre-line break-words overflow-wrap-break-word">{selectedOpinion.abstractText}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">키워드</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedOpinion.keywords}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">참고문헌</label>
                        <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{selectedOpinion.references}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {selectedOpinion.fullText && (
                          <button
                            type="button"
                            onClick={openFullTextModal}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            전문보기
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={openAttachment}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          첨부문서 보기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <span className="text-sm font-medium text-gray-700">상태 변경:</span>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="등록대기"
                          checked={selectedOpinion.status === '등록대기'}
                          onChange={() => handleStatusUpdate(selectedOpinion.id, '등록대기')}
                          disabled={updatingStatus === selectedOpinion.id}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">등록대기</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="등록승인"
                          checked={selectedOpinion.status === '등록승인'}
                          onChange={() => handleStatusUpdate(selectedOpinion.id, '등록승인')}
                          disabled={updatingStatus === selectedOpinion.id}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">등록승인</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="등록거부"
                          checked={selectedOpinion.status === '등록거부'}
                          onChange={() => handleStatusUpdate(selectedOpinion.id, '등록거부')}
                          disabled={updatingStatus === selectedOpinion.id}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">등록거부</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="임시저장"
                          checked={selectedOpinion.status === '임시저장'}
                          onChange={() => handleStatusUpdate(selectedOpinion.id, '임시저장')}
                          disabled={updatingStatus === selectedOpinion.id}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">임시저장</span>
                      </label>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 전문보기 모달 */}
      {isFullTextModalOpen && selectedOpinion && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeFullTextModal}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      전문 내용
                    </h3>
                    <div className="max-h-[500px] overflow-y-auto">
                      <p className="text-sm text-gray-900 whitespace-pre-line leading-relaxed">
                        {selectedOpinion.fullText}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={closeFullTextModal}
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 