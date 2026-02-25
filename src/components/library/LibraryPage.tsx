'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiSearch, FiEye, FiDownload, FiCalendar, FiUser, FiX, FiBookOpen, FiTrash2, FiEdit, FiArrowLeft, FiMessageSquare, FiList } from 'react-icons/fi';
import Navigation from '@/components/Navigation';
import FileViewer from '@/components/common/FileViewer';
import RegisterLibraryItemForm from '@/components/library/RegisterLibraryItemForm';
import InquiryListModal from '@/components/inquiries/InquiryListModal';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/dateUtils';
import { getApiUrl } from '@/config/api';

interface LibraryItem {
  id: number;
  category: string;
  title: string;
  author: string;
  description: string;
  keywords: string;
  fileNames: string;
  filePaths: string;
  fileTypes?: string; // 파일 타입 정보 (view-only, downloadable)
  createdAt: string;
  updatedAt: string;
}

interface LibraryResponse {
  content: LibraryItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export default function LibraryPage() {
  const { user, isAuthenticated } = useAuth();
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<{id:number, name:string}[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [size] = useState(10);
  
  // 파일 보기 관련 상태
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<{ fileName: string; fileUrl: string } | null>(null);
  
  // 자료 상세 조회 모달 상태
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  
  // 수정 모달 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  
  // 자료등록 모달 상태
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  // 관련 문의/요청 모달 상태
  const [inquiryListModalOpen, setInquiryListModalOpen] = useState(false);
  
  // 문의/요청 건수 상태 (itemId -> { inquiryCount: number, responseCount: number })
  const [inquiryCounts, setInquiryCounts] = useState<{ [key: number]: { inquiryCount: number; responseCount: number } }>({});

  // 툴팁 위치 계산 함수
  const handleTooltipMouseEnter = (e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = target.getAttribute('title') || '';
    tooltip.style.cssText = `
      position: fixed;
      background-color: #000;
      color: #fff;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      pointer-events: none;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top - 40}px;
      transform: translateX(-50%);
    `;
    document.body.appendChild(tooltip);
  };

  const handleTooltipMouseLeave = () => {
    const tooltip = document.querySelector('.custom-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  };

  // 카테고리 불러오기
  useEffect(() => {
    fetch('/api/codes/menu/Library/details')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data.map((c:any) => ({ id: c.id, name: c.codeName })));
        }
      })
      .catch(() => setCategories([]));
  }, []);

  // 자료 목록 불러오기
  useEffect(() => {
    fetchLibraryItems(currentPage);
  }, [currentPage, searchTerm, selectedCategory]);

  const fetchLibraryItems = async (page: number = 0) => {
    try {
      setLoading(true);
      console.log('=== Library 목록 조회 시작 ===');
      
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());
      
      if (searchTerm && searchTerm.trim()) {
        params.append('keyword', searchTerm.trim());
      }
      if (selectedCategory && selectedCategory.trim()) {
        params.append('category', selectedCategory.trim());
      }
      
      const url = getApiUrl(`/api/library?${params.toString()}`);
      console.log('API URL:', url);
      
      const response = await fetch(url);
      console.log('API 응답 상태:', response.status, response.statusText);
      
      if (response.ok) {
        const data: LibraryResponse = await response.json();
        
        console.log('서버에서 받은 데이터:', data);
        
        // 안전하게 데이터 설정
        const items = data?.content || [];
        setLibraryItems(items);
        setTotalPages(data?.totalPages || 0);
        setTotalElements(data?.totalElements || 0);
        setCurrentPage(data?.currentPage || 0);
        
        // 각 자료에 대한 문의/요청 건수 조회
        fetchInquiryCounts(items);
      } else {
        const errorText = await response.text();
        console.error('자료 목록 조회 실패:', response.status, response.statusText);
        console.error('에러 응답 내용:', errorText);
        setLibraryItems([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('자료 목록 조회 중 오류:', error);
      console.error('에러 상세:', error);
      setLibraryItems([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // 검색 시 첫 페이지로 이동
    setCurrentPage(0);
    // useEffect가 자동으로 fetchLibraryItems를 호출함
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // 카테고리 변경 시 첫 페이지로 이동
    setCurrentPage(0);
    // useEffect가 자동으로 fetchLibraryItems를 호출함
  };

  const handleViewFile = (fileName: string, filePath: string) => {
    // 쿼리 파라미터 방식으로 파일 경로 처리 (긴 경로나 특수문자 처리에 유리)
    try {
      const encodedPath = encodeURIComponent(filePath.trim());
      const fileUrl = getApiUrl(`/api/library/view?path=${encodedPath}`);
      
      setViewingFile({ fileName, fileUrl });
      setViewModalOpen(true);
    } catch (error) {
      console.error('파일 경로 처리 중 오류:', error);
      alert('파일 경로 처리 중 오류가 발생했습니다.');
    }
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setViewingFile(null);
  };

  // 문의/요청 건수 조회 함수
  const fetchInquiryCounts = async (items: LibraryItem[]) => {
    const counts: { [key: number]: { inquiryCount: number; responseCount: number } } = {};
    
    // 각 자료에 대해 문의/요청 건수 조회
    await Promise.all(
      items.map(async (item) => {
        try {
          const url = getApiUrl(`/api/inquiries?refTable=library&refId=${item.id}`);
          console.log(`문의/요청 건수 조회 URL (item ${item.id}):`, url);
          const response = await fetch(url);
          
          if (response.ok) {
            const inquiries: any[] = await response.json();
            console.log(`문의/요청 조회 결과 (item ${item.id}):`, inquiries);
            
            const inquiryCount = inquiries.length;
            
            // responses가 이미 포함되어 있으면 사용, 없으면 별도 조회
            let responseCount = 0;
            for (const inquiry of inquiries) {
              if (inquiry.responses && Array.isArray(inquiry.responses) && inquiry.responses.length > 0) {
                responseCount++;
              } else {
                // 별도로 응답 조회
                try {
                  const responseUrl = getApiUrl(`/api/inquiries/${inquiry.id}/responses`);
                  const responseRes = await fetch(responseUrl);
                  if (responseRes.ok) {
                    const responses = await responseRes.json();
                    if (responses && responses.length > 0) {
                      responseCount++;
                    }
                  }
                } catch (err) {
                  console.error(`응답 조회 실패 (inquiry ${inquiry.id}):`, err);
                }
              }
            }
            
            console.log(`건수 계산 결과 (item ${item.id}): inquiryCount=${inquiryCount}, responseCount=${responseCount}`);
            counts[item.id] = { inquiryCount, responseCount };
          } else {
            console.error(`문의/요청 건수 조회 실패 (item ${item.id}):`, response.status, response.statusText);
            counts[item.id] = { inquiryCount: 0, responseCount: 0 };
          }
        } catch (error) {
          console.error(`문의/요청 건수 조회 실패 (item ${item.id}):`, error);
          counts[item.id] = { inquiryCount: 0, responseCount: 0 };
        }
      })
    );
    
    console.log('최종 건수 결과:', counts);
    setInquiryCounts(counts);
  };

  const handleViewDetail = (item: LibraryItem) => {
    console.log('=== 자료 상세보기 디버깅 ===');
    console.log('선택된 자료:', item);
    console.log('현재 사용자:', user);
    console.log('사용자 권한:', user?.role);
    console.log('자료 작성자:', item.author);
    console.log('사용자명:', user?.name);
    console.log('관리자 권한:', user?.role === 'ADMIN');
    console.log('전문가 권한:', user?.role === 'EXPERT');
    console.log('자신의 자료:', user?.name === item.author);
    console.log('수정/삭제 가능:', user?.role === 'ADMIN' || (user?.role === 'EXPERT' && user?.name === item.author));
    console.log('========================');
    
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteItem = async (item: LibraryItem) => {
    // 권한 확인 - 관리자만 삭제 가능
    if (!isAuthenticated || !user) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    if (user.role !== 'ADMIN') {
      alert('자료를 삭제할 권한이 없습니다. 관리자만 삭제할 수 있습니다.');
      return;
    }
    
    if (!confirm(`"${item.title}" 자료를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/library/${item.id}`), {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('자료가 성공적으로 삭제되었습니다.');
        setDetailModalOpen(false);
        setSelectedItem(null);
        fetchLibraryItems(); // 목록 새로고침
      } else {
        alert('자료 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('자료 삭제 중 오류:', error);
      alert('자료 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEditItem = (item: LibraryItem) => {
    // 권한 확인 - 관리자 또는 자료 등록자만 수정 가능
    if (!isAuthenticated || !user) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    // 관리자이거나 자료를 등록한 사람(작성자)만 수정 가능
    const isAdmin = user.role === 'ADMIN';
    const isAuthor = item.author === user.name;
    
    if (!isAdmin && !isAuthor) {
      alert('자료를 수정할 권한이 없습니다. 관리자 또는 자료를 등록한 사람만 수정할 수 있습니다.');
      return;
    }
    
    setEditingItem(item);
    setEditModalOpen(true);
    setDetailModalOpen(false); // 상세 모달 닫기
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingItem(null);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setEditingItem(null);
    fetchLibraryItems(); // 목록 새로고침
  };

  const handleOpenRegisterModal = () => {
    setRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setRegisterModalOpen(false);
  };

  const handleRegisterSuccess = () => {
    setRegisterModalOpen(false);
    fetchLibraryItems(); // 목록 새로고침
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">자료를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
                  <div className="pt-28">
      
      {/* 커스텀 툴팁 스타일 */}
      <style jsx global>{`
        /* 브라우저 기본 툴팁 완전 비활성화 */
        [title] {
          position: relative;
        }
        
        /* 브라우저 기본 툴팁 숨기기 */
        [title]:hover::after {
          display: none !important;
        }
        
        [title]:hover::before {
          display: none !important;
        }
        
        /* 모든 기본 툴팁 스타일 무효화 */
        *[title] {
          -webkit-tooltip: none !important;
          tooltip: none !important;
        }
        
        /* 브라우저별 기본 툴팁 비활성화 */
        *[title]:hover {
          -webkit-tooltip: none !important;
          tooltip: none !important;
        }
      `}</style>
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 text-white rounded-2xl">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f6,#2563eb)] opacity-30">
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M0 32V.5H32" fill="none" stroke="rgba(255,255,255,0.1)"></path>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)"></rect>
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-700 to-transparent"></div>
          </div>
          <div className="relative px-4 sm:px-6 lg:px-8 py-[19px]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <FiBookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-[24px] font-bold text-white">MOT Open Repository</h1>
          </div>
          <p className="text-base text-blue-50 max-w-[1150px] text-right">
            MOT Club 자료 공유방은 교육 교재, 웹진 등 기술경영 관련 지식자산 플랫폼으로<br/>
            회원이라면 누구나 자유롭게 접근하고 활용할 수 있는 열린공간입니다.
          </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        
        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex items-center gap-4">
            {/* 카테고리 선택 (width 50% 줄임) */}
            <div className="w-1/6">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">모든 카테고리</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            {/* 검색 입력과 버튼을 중앙정렬 */}
            <div className="flex-1 flex justify-center items-center gap-4">
              <div className="relative w-2/5">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="자료 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <button
                onClick={handleSearch}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                검색
              </button>
            </div>
            
            {/* 자료 등록 버튼 (현 위치 그대로) */}
            <div className="w-1/6 flex justify-end">
              {isAuthenticated && user && (user.role === 'ADMIN' || user.role === 'EXPERT') ? (
                <button
                  onClick={handleOpenRegisterModal}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiPlus className="mr-2" />
                  자료 등록
                </button>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-400 bg-gray-300 cursor-not-allowed"
                  title="관리자 또는 전문가만 자료를 등록할 수 있습니다."
                >
                  <FiPlus className="mr-2" />
                  자료 등록
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 자료 목록 - 원래 테이블 구조 */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-[10%] min-w-[80px] px-3 lg:px-6 py-3 text-left text-sm lg:text-[16px] font-bold text-gray-700 whitespace-nowrap">카테고리</th>
                <th scope="col" className="w-auto px-3 lg:px-6 py-3 text-left text-sm lg:text-[16px] font-bold text-gray-700 whitespace-nowrap">제목</th>
                <th scope="col" className="w-[12%] min-w-[80px] px-3 lg:px-6 py-3 text-center text-sm lg:text-[16px] font-bold text-gray-700 whitespace-nowrap">저자/강사</th>
                <th scope="col" className="w-[10%] min-w-[80px] px-3 lg:px-6 py-3 text-center text-sm lg:text-[16px] font-bold text-gray-700 whitespace-nowrap">등록일</th>
                <th scope="col" className="w-[10%] min-w-[76px] px-3 lg:px-6 py-3 text-center text-sm lg:text-[16px] font-bold text-gray-700 whitespace-nowrap">문의/요청</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!libraryItems || libraryItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    자료가 없습니다.
                  </td>
                </tr>
              ) : (
                libraryItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 truncate max-w-full">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-3 lg:px-6 py-4">
                    <div className="text-sm lg:text-[16px] font-medium text-gray-900 cursor-pointer hover:text-blue-600 truncate" onClick={() => handleViewDetail(item)} title={item.title}>
                      {item.title}
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm lg:text-[16px] text-gray-900 truncate block">{item.author}</span>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm lg:text-[16px] text-gray-900">{formatDate(item.createdAt)}</span>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-center text-sm lg:text-[16px] text-gray-900">
                    {inquiryCounts[item.id] && inquiryCounts[item.id].inquiryCount > 0 ? (
                      <span className="text-blue-600 font-medium">
                        {inquiryCounts[item.id].responseCount}/{inquiryCounts[item.id].inquiryCount}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이징 */}
        {totalPages > 1 && (
          <div className="mt-4 px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg flex items-center justify-between">
            <div className="text-sm text-gray-700">
              총 <span className="font-medium">{totalElements}</span>건 중{' '}
              <span className="font-medium">{currentPage * size + 1}</span>-
              <span className="font-medium">
                {Math.min((currentPage + 1) * size, totalElements)}
              </span>
              건 표시
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 파일 보기 모달 */}
      {viewModalOpen && viewingFile && (
        <FileViewer
          fileName={viewingFile.fileName}
          fileUrl={viewingFile.fileUrl}
          onClose={handleCloseViewModal}
        />
      )}

      {/* 자료 상세 조회 모달 */}
      {detailModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative p-6 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[95vh] overflow-y-auto">
            <div className="mt-3">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">자료 상세 정보</h3>
                <div className="flex items-center gap-2">
                  {/* 자료 관련 문의/요청 버튼 */}
                  {isAuthenticated && user && (
                    <button
                      onClick={() => setInquiryListModalOpen(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <FiMessageSquare className="w-4 h-4 mr-2" />
                      자료 관련 문의/요청
                    </button>
                  )}
                  <button
                    onClick={handleCloseDetailModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* 자료 정보 */}
              <div className="space-y-4">
                                 <div>
                   <label className="block text-base font-bold text-gray-700 mb-2">카테고리</label>
                   <div className="pl-4">
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                       {selectedItem.category}
                     </span>
                   </div>
                 </div>

                 <div>
                   <label className="block text-base font-bold text-gray-700 mb-2">제목</label>
                   <div className="pl-4">
                     <p className="text-base text-gray-900">{selectedItem.title}</p>
                   </div>
                 </div>

                 <div>
                   <label className="block text-base font-bold text-gray-700 mb-2">저자/강사</label>
                   <div className="pl-4">
                     <div className="flex items-center">
                       <FiUser className="h-4 w-4 text-gray-400 mr-2" />
                       <span className="text-base text-gray-900">{selectedItem.author}</span>
                     </div>
                   </div>
                 </div>

                 <div>
                   <label className="block text-base font-bold text-gray-700 mb-2">설명</label>
                   <div className="pl-4">
                     <div className="bg-gray-50 p-4 rounded-lg">
                       <p className="text-base text-gray-900 whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere">{selectedItem.description}</p>
                     </div>
                   </div>
                 </div>

                 <div>
                   <label className="block text-base font-bold text-gray-700 mb-2">키워드</label>
                   <div className="pl-4">
                     <p className="text-base text-gray-900">{selectedItem.keywords}</p>
                   </div>
                 </div>

                 <div>
                   <label className="block text-base font-bold text-gray-700 mb-2">등록일</label>
                   <div className="pl-4">
                     <div className="flex items-center">
                       <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                       <span className="text-base text-gray-900">{formatDate(selectedItem.createdAt)}</span>
                     </div>
                   </div>
                 </div>

                 {selectedItem.fileNames && selectedItem.filePaths && (
                   <div>
                     <label className="block text-base font-bold text-gray-700 mb-2">첨부파일</label>
                     <div className="pl-4">
                       <div className="space-y-2">
                         {selectedItem.fileNames.split(',').map((fileName, index) => {
                           const filePath = selectedItem.filePaths.split(',')[index];
                           const fileType = selectedItem.fileTypes ? selectedItem.fileTypes.split(',')[index]?.trim() : 'downloadable';
                           const isViewOnly = fileType === 'view-only';
                           
                           return (
                             <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                               <div className="flex items-center gap-2">
                                 <span className="text-base text-gray-900">{fileName.trim()}</span>
                                 {isViewOnly && (
                                   <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                     보기만
                                   </span>
                                 )}
                               </div>
                               <div className="flex space-x-2">
                                 <button
                                   onClick={isAuthenticated && user ? () => {
                                     const encodedPath = encodeURIComponent(filePath.trim());
                                     const fileUrl = getApiUrl(`/api/library/view?path=${encodedPath}`);
                                     setViewingFile({ fileName: fileName.trim(), fileUrl });
                                     setViewModalOpen(true);
                                   } : undefined}
                                   disabled={!isAuthenticated || !user}
                                   className={`inline-flex items-center px-2 py-1 border text-xs font-medium rounded ${
                                     isAuthenticated && user
                                       ? 'text-blue-700 bg-blue-100 hover:bg-blue-200 border-transparent cursor-pointer'
                                       : 'text-gray-400 bg-gray-100 border-gray-300 cursor-not-allowed'
                                   }`}
                                   title={isAuthenticated && user ? "파일 보기" : "자료 보기는 로그인이 필요합니다"}
                                   onMouseEnter={handleTooltipMouseEnter}
                                   onMouseLeave={handleTooltipMouseLeave}
                                 >
                                   <FiEye className="mr-1" />
                                   파일보기
                                 </button>
                                 {!isViewOnly && (
                                   <button
                                     onClick={isAuthenticated && user ? () => {
                                       const encodedPath = encodeURIComponent(filePath.trim()).replace(/[!'()*]/g, function(c) {
                                         return '%' + c.charCodeAt(0).toString(16);
                                       });
                                       window.open(getApiUrl(`/api/library/download/${encodedPath}`), '_blank');
                                     } : undefined}
                                     disabled={!isAuthenticated || !user}
                                     className={`inline-flex items-center px-2 py-1 border text-xs font-medium rounded ${
                                       isAuthenticated && user
                                         ? 'text-green-700 bg-green-100 hover:bg-green-200 border-transparent cursor-pointer'
                                         : 'text-gray-400 bg-gray-100 border-gray-300 cursor-not-allowed'
                                     }`}
                                     title={isAuthenticated && user ? "다운로드" : "자료 보기는 로그인이 필요합니다"}
                                     onMouseEnter={handleTooltipMouseEnter}
                                     onMouseLeave={handleTooltipMouseLeave}
                                   >
                                     <FiDownload className="mr-1" />
                                     다운로드
                                   </button>
                                 )}
                               </div>
                             </div>
                           );
                         })}
                       </div>
                     </div>
                   </div>
                 )}
              </div>

              {/* 모달 푸터 */}
              <div className="flex justify-end items-center mt-6 pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  {isAuthenticated && user && (
                    <>
                      {/* 수정 버튼: 관리자 또는 자료 등록자만 표시 */}
                      {(user.role === 'ADMIN' || (selectedItem && selectedItem.author === user.name)) && (
                        <button
                          onClick={() => handleEditItem(selectedItem)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FiEdit className="mr-2 h-4 w-4" />
                          수정
                        </button>
                      )}
                      {/* 삭제 버튼: 관리자만 표시 */}
                      {user.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDeleteItem(selectedItem)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FiTrash2 className="mr-2 h-4 w-4" />
                          삭제
                        </button>
                      )}
                    </>
                  )}
                  <button
                    onClick={handleCloseDetailModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 자료 수정 모달 */}
      {editModalOpen && editingItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">자료 수정</h3>
                <button
                  onClick={handleCloseEditModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              {/* 수정 폼 */}
              <RegisterLibraryItemForm 
                editItem={editingItem} 
                onClose={handleCloseEditModal}
                onSuccess={handleEditSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {/* 자료등록 모달 */}
      {registerModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-4 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-1">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">자료 등록</h3>
                <button
                  onClick={handleCloseRegisterModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* 등록 폼 */}
              <RegisterLibraryItemForm 
                onClose={handleCloseRegisterModal}
                onSuccess={handleRegisterSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {/* 관련 문의/요청 작성 모달 */}
      {/* 문의/요청 이력 모달 */}
      {inquiryListModalOpen && selectedItem && (
        <InquiryListModal
          isOpen={inquiryListModalOpen}
          onClose={() => setInquiryListModalOpen(false)}
          refTable="library"
          refId={selectedItem.id}
          refTitle={selectedItem.title}
          userEmail={user?.email}
        />
      )}
      </div>
    </div>
  );
} 