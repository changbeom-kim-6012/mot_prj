'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiSearch, FiEye, FiDownload, FiCalendar, FiUser, FiX, FiBookOpen, FiTrash2, FiEdit, FiArrowLeft } from 'react-icons/fi';
import Navigation from '@/components/Navigation';
import FileViewer from '@/components/common/FileViewer';
import RegisterLibraryItemForm from '@/components/library/RegisterLibraryItemForm';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/dateUtils';

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

export default function LibraryPage() {
  const { user, isAuthenticated } = useAuth();
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<{id:number, name:string}[]>([]);
  const [filteredItems, setFilteredItems] = useState<LibraryItem[]>([]);
  
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
    fetch('http://121.140.143.9:8082/api/codes/menu/Library/details')
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
    fetchLibraryItems();
  }, []);

  const fetchLibraryItems = async () => {
    try {
      const response = await fetch('http://121.140.143.9:8082/api/library');
      if (response.ok) {
        const data = await response.json();
        
        // 날짜 데이터 검증 및 로깅
        if (Array.isArray(data)) {
          data.forEach((item, index) => {
            console.log(`Library Item ${index}:`, {
              id: item.id,
              title: item.title,
              createdAt: item.createdAt,
              createdAtType: typeof item.createdAt,
              createdAtValid: item.createdAt ? !isNaN(new Date(item.createdAt).getTime()) : false
            });
          });
        }
        
        setLibraryItems(data);
        setFilteredItems(data); // 최초 전체 목록
      } else {
        console.error('자료 목록 조회 실패:', response.status);
      }
    } catch (error) {
      console.error('자료 목록 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filtered = libraryItems.filter(item => {
      const matchesSearch = searchTerm.trim() === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 카테고리 필터링 로직 개선
      let matchesCategory = true;
      if (selectedCategory) {
        if (selectedCategory === '기타') {
          // 기타 선택 시: 드롭다운에 없는 커스텀 카테고리들만 필터링
          const dropdownCategories = categories.map(cat => cat.name);
          matchesCategory = !dropdownCategories.includes(item.category);
        } else {
          // 일반 카테고리 선택 시: 정확히 일치하는 것만
          matchesCategory = item.category === selectedCategory;
        }
      }
      
      return matchesSearch && matchesCategory;
    });
    setFilteredItems(filtered);
  };

  const handleViewFile = (fileName: string, filePath: string) => {
    // PDF 뷰어 모달로 표시
    const encodedPath = encodeURIComponent(filePath).replace(/[!'()*]/g, function(c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
    const fileUrl = `http://121.140.143.9:8082/api/library/view/${encodedPath}`;
    
    console.log('=== 파일 보기 디버깅 ===');
    console.log('원본 fileName:', fileName);
    console.log('원본 filePath:', filePath);
    console.log('인코딩된 filePath:', encodedPath);
    console.log('생성된 fileUrl:', fileUrl);
    console.log('========================');
    
    setViewingFile({ fileName, fileUrl });
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setViewingFile(null);
  };

  const handleViewDetail = (item: LibraryItem) => {
    console.log('=== 자료 상세보기 디버깅 ===');
    console.log('선택된 자료:', item);
    console.log('현재 사용자:', user);
    console.log('사용자 권한:', user?.role);
    console.log('자료 작성자:', item.author);
    console.log('사용자명:', user?.username);
    console.log('관리자 권한:', user?.role === 'ADMIN');
    console.log('전문가 권한:', user?.role === 'EXPERT');
    console.log('자신의 자료:', user?.username === item.author);
    console.log('수정/삭제 가능:', user?.role === 'ADMIN' || (user?.role === 'EXPERT' && user?.username === item.author));
    console.log('========================');
    
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteItem = async (item: LibraryItem) => {
    // 권한 확인
    if (!isAuthenticated || !user) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    if (user.role !== 'ADMIN' && !(user.role === 'EXPERT' && user.username === item.author)) {
      alert('자료를 삭제할 권한이 없습니다.');
      return;
    }
    
    if (!confirm(`"${item.title}" 자료를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`http://121.140.143.9:8082/api/library/${item.id}`, {
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
    // 권한 확인
    if (!isAuthenticated || !user) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    if (user.role !== 'ADMIN' && !(user.role === 'EXPERT' && user.username === item.author)) {
      alert('자료를 수정할 권한이 없습니다.');
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
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white">
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <FiBookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">자료실</h1>
          </div>
          <p className="text-lg text-blue-50 max-w-[1150px] text-right">
            기술경영 및 R&D 관련 교육교재, 기술과 혁신 웹진 등 MOT 관련된 자료 공유방<br/>
            연구관리 및 기술경영과 관련된 모든 자료를 축적하고, 회원들의 자유로운 접근이 가능한 공간입니다.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-4">
            {/* 카테고리 선택 (width 50% 줄임) */}
            <div className="w-1/6">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-32 px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">카테고리</th>
                <th scope="col" className="flex-1 px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">제목</th>
                <th scope="col" className="w-32 px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">저자/강사</th>
                <th scope="col" className="w-32 px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">등록일</th>
                <th scope="col" className="w-48 px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">파일</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="w-32 px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.category.startsWith('기타') ? item.category : item.category}
                        </span>
                      </td>
                  <td className="flex-1 px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => handleViewDetail(item)}>
                      {item.title}
                    </div>
                  </td>
                  <td className="w-32 px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiUser className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{item.author}</span>
                    </div>
                  </td>
                  <td className="w-32 px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{formatDate(item.createdAt)}</span>
                    </div>
                  </td>
                  <td className="w-48 px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.fileNames ? `${item.fileNames.split(',').length}개 파일` : '0개 파일'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
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
                <button
                  onClick={handleCloseDetailModal}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiArrowLeft className="w-4 h-4 mr-2" />
                  목록으로 돌아가기
                </button>
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
                       <p className="text-base text-gray-900 whitespace-pre-wrap leading-relaxed">{selectedItem.description}</p>
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
                                     const encodedPath = encodeURIComponent(filePath.trim()).replace(/[!'()*]/g, function(c) {
                                       return '%' + c.charCodeAt(0).toString(16);
                                     });
                                     const fileUrl = `http://121.140.143.9:8082/api/library/view/${encodedPath}`;
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
                                       window.open(`http://121.140.143.9:8082/api/library/download/${encodedPath}`, '_blank');
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
              <div className="flex justify-between mt-6">
                {isAuthenticated && user && (
                  (user.role === 'ADMIN' || 
                   (user.role === 'EXPERT' && selectedItem && selectedItem.author === user.username)
                  )) && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditItem(selectedItem)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiEdit className="mr-2 h-4 w-4" />
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteItem(selectedItem)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FiTrash2 className="mr-2 h-4 w-4" />
                      삭제
                    </button>
                  </div>
                )}
                <button
                  onClick={handleCloseDetailModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-base rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  닫기
                </button>
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
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  목록으로 돌아가기
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
      </div>
    </div>
  );
} 