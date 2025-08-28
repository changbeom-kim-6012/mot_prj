'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiUser, FiMail, FiCalendar, FiEye } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Expert, ExpertCreate, ExpertUpdate, ExpertSearchParams } from '@/types/expert';

interface ExpertManagementProps {
  onEditExpert: (expert: Expert) => void;
  onCreateExpert: () => void;
  showExpertModal?: boolean;
}

export default function ExpertManagement({ onEditExpert, onCreateExpert, showExpertModal }: ExpertManagementProps) {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<'name' | 'email' | 'field'>('name');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);

  // 전문가 데이터 가져오기
  const fetchExperts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/experts');
      setExperts(response.data);
      setFilteredExperts(response.data);
    } catch (error: any) {
      console.error('전문가 데이터 가져오기 실패:', error);
      setError('전문가 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 실행
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredExperts(experts);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      
      let response;
      switch (searchField) {
        case 'name':
          response = await axios.get(`/api/experts/search/name?name=${encodeURIComponent(searchTerm)}`);
          break;
        case 'email':
          response = await axios.get(`/api/experts/search?email=${encodeURIComponent(searchTerm)}`);
          break;
        case 'field':
          response = await axios.get(`/api/experts/search/field?field=${encodeURIComponent(searchTerm)}`);
          break;
        default:
          response = await axios.get(`/api/experts/search?name=${encodeURIComponent(searchTerm)}`);
      }
      
      setFilteredExperts(response.data);
    } catch (error: any) {
      console.error('검색 실패:', error);
      setError('검색에 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 상태별 필터링
  const handleStatusFilter = async (status: string) => {
    setStatusFilter(status);
    
    if (status === 'all') {
      setFilteredExperts(experts);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/experts/status/${status}`);
      setFilteredExperts(response.data);
    } catch (error: any) {
      console.error('상태 필터링 실패:', error);
      setError('필터링에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 전문가 삭제
  const handleDeleteExpert = async (expertId: number, expertName: string) => {
    if (!window.confirm(`정말로 ${expertName} 전문가를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await axios.delete(`/api/experts/${expertId}`);
      alert('전문가가 삭제되었습니다.');
      fetchExperts(); // 목록 새로고침
    } catch (error: any) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  // 엔터키 검색
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}/${day}`;
  };

  // 상태별 스타일
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 상태 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '활성';
      case 'INACTIVE':
        return '비활성';
      case 'PENDING':
        return '승인대기';
      default:
        return status;
    }
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  // 모달이 닫힐 때 목록 새로고침
  useEffect(() => {
    if (showExpertModal === false) {
      // 모달이 닫힌 후 약간의 지연을 두고 목록 새로고침
      const timer = setTimeout(() => {
        fetchExperts();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showExpertModal]);

  if (loading && experts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 영역 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 검색 필드 선택 */}
                     <select
             value={searchField}
             onChange={(e) => setSearchField(e.target.value as any)}
             className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
           >
             <option value="name">이름</option>
             <option value="email">이메일</option>
             <option value="field">전문분야</option>
           </select>

          {/* 검색 입력 */}
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="검색어를 입력하세요"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>

          {/* 검색 버튼 */}
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <FiSearch className="mr-2 h-4 w-4" />
            )}
            검색
          </button>

          {/* 전문가 등록 버튼 */}
          <button
            onClick={onCreateExpert}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            전문가 등록
          </button>
        </div>

        {/* 상태 필터 */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => handleStatusFilter('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
              statusFilter === 'all' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => handleStatusFilter('ACTIVE')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
              statusFilter === 'ACTIVE' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            활성
          </button>
          <button
            onClick={() => handleStatusFilter('INACTIVE')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
              statusFilter === 'INACTIVE' 
                ? 'bg-gray-100 text-gray-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            비활성
          </button>
          <button
            onClick={() => handleStatusFilter('PENDING')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
              statusFilter === 'PENDING' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            승인대기
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 전문가 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>데이터를 불러오는 중...</span>
            </div>
          </div>
        ) : filteredExperts.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            {searchTerm || statusFilter !== 'all' ? '검색 결과가 없습니다.' : '등록된 전문가가 없습니다.'}
          </div>
        ) : (
          <div>
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-1/6 px-2 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    전문가 정보
                  </th>
                                     <th className="w-1/8 px-2 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                     직책
                   </th>
                  <th className="w-1/3 px-2 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    전문분야
                  </th>
                  <th className="w-1/12 px-2 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="w-1/12 px-2 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    최근 로그인
                  </th>
                  <th className="w-1/12 px-2 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="w-1/12 px-2 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredExperts.map((expert, index) => (
                    <motion.tr
                      key={expert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-2 py-4">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{expert.name}</div>
                          <div className="flex items-center text-xs text-gray-500 truncate">
                            <FiMail className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{expert.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <div className="text-sm text-gray-900">
                          {expert.position && (
                            <div className="text-xs text-gray-500 truncate">
                              {expert.position}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <div className="text-sm text-gray-900 leading-tight" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: '1.2',
                          maxHeight: '3.6rem'
                        }}>
                          {expert.field || '-'}
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <div className="text-sm text-gray-900">{formatDate(expert.createdAt)}</div>
                      </td>
                      <td className="px-2 py-4">
                        <div className="text-sm text-gray-900">
                          {expert.lastLogin ? formatDate(expert.lastLogin) : '-'}
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getStatusStyle(expert.status)}`}>
                          {getStatusText(expert.status)}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => onEditExpert(expert)}
                            className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-1"
                            title="수정"
                          >
                            <FiEdit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpert(expert.id, expert.name)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1"
                            title="삭제"
                          >
                            <FiTrash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 