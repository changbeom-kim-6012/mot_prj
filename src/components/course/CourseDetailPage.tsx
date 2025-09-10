'use client';

import Navigation from '@/components/Navigation';
import { FiClock, FiBook, FiAward, FiCheckCircle, FiPackage, FiTarget, FiList, FiUpload, FiDownload, FiTrash2, FiX, FiPlus, FiEye, FiPaperclip } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import FileViewer from '@/components/common/FileViewer';

interface TopicItem {
  subtitle: string;
  goal: string;
  content: string[];
}

interface Topic {
  id: number;
  title: string;
  items: TopicItem[] | string[];
}

interface Instructor {
  name: string;
  title: string;
  description: string;
}

interface CourseData {
  title: string;
  subtitle: string;
  description: string;
  topics: Topic[];
  instructor: Instructor;
  duration: string;
  format: string;
  level: string;
  prerequisites: string[];
  materials: string[];
}

interface CourseMaterial {
  id: number;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
}

interface CourseDetailPageProps {
  course: CourseData;
}

export default function CourseDetailPage({ course }: CourseDetailPageProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isLoggedIn = isAuthenticated;
  const courseId = course.title === 'MOT 이론 및 방법론' ? '1' : '2';

  // 각 아이템별 자료 상태 관리
  const [materialsMap, setMaterialsMap] = useState<Record<string, CourseMaterial[]>>({});
  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});
  const [uploadFilesMap, setUploadFilesMap] = useState<Record<string, FileWithType[]>>({});
  const [uploadTitleMap, setUploadTitleMap] = useState<Record<string, string>>({});
  const [uploadDescriptionMap, setUploadDescriptionMap] = useState<Record<string, string>>({});
  const [showUploadModalMap, setShowUploadModalMap] = useState<Record<string, boolean>>({});
  const [showTypeModalMap, setShowTypeModalMap] = useState<Record<string, boolean>>({});
  const [pendingFilesMap, setPendingFilesMap] = useState<Record<string, File[]>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement|null>>({});

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
  };interface FileWithType {
    file: File;
    fileType: 'view-only' | 'downloadable';
  }


  
  // 파일 보기 관련 상태
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<{fileName: string, filePath: string} | null>(null);

  // 아이템별 자료 리스트 조회
  useEffect(() => {
    if (useDetailedStructure) {
      // 상세 구조 (course/1용)
      course.topics.forEach(topic => {
        topic.items.forEach((item, itemIndex) => {
          if (isDetailedItem(item)) {
            const itemKey = `${courseId}-${getSectionId(topic.id)}-${topic.id}-${itemIndex + 1}`;
            fetchMaterials(itemKey);
          }
        });
      });
    } else {
      // 단순 구조 (course/2용)
      course.topics.forEach(topic => {
        const itemKey = `${courseId}-${topic.id}-1`;
        fetchMaterials(itemKey);
      });
    }
  }, [course.topics, courseId]);

  const fetchMaterials = async (itemKey: string) => {
    try {
      const [courseId, sectionId, topicId, itemId] = itemKey.split('-');
      const response = await fetch(`http://motclub.co.kr/api/course-materials?courseId=${courseId}&sectionId=${sectionId}&topicId=${topicId}&itemId=${itemId}`);
      if (response.ok) {
        const data = await response.json();
        setMaterialsMap(prev => ({ ...prev, [itemKey]: data }));
      }
    } catch (error) {
      console.error('자료 조회 실패:', error);
      setMaterialsMap(prev => ({ ...prev, [itemKey]: [] }));
    }
  };

  const handleFileChange = (itemKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setPendingFilesMap(prev => ({ ...prev, [itemKey]: fileArray }));
      setShowTypeModalMap(prev => ({ ...prev, [itemKey]: true }));
    }
  };

  const handleTypeSelection = (itemKey: string, fileType: 'view-only' | 'downloadable') => {
    const pendingFiles = pendingFilesMap[itemKey] || [];
    const newFilesWithType: FileWithType[] = pendingFiles.map(file => ({
      file,
      fileType
    }));
    
    setUploadFilesMap(prev => ({ 
      ...prev, 
      [itemKey]: [...(prev[itemKey] || []), ...newFilesWithType] 
    }));
    setShowTypeModalMap(prev => ({ ...prev, [itemKey]: false }));
    setPendingFilesMap(prev => ({ ...prev, [itemKey]: [] }));
  };

  const handleCancelTypeSelection = (itemKey: string) => {
    setShowTypeModalMap(prev => ({ ...prev, [itemKey]: false }));
    setPendingFilesMap(prev => ({ ...prev, [itemKey]: [] }));
  };

  const removeFile = (itemKey: string, index: number) => {
    setUploadFilesMap(prev => ({
      ...prev,
      [itemKey]: prev[itemKey]?.filter((_, i) => i !== index) || []
    }));
    
    // 파일 input 필드 초기화
    if (fileInputRefs.current[itemKey]) {
      fileInputRefs.current[itemKey]!.value = '';
    }
  };

  const toggleFileType = (itemKey: string, index: number) => {
    setUploadFilesMap(prev => ({
      ...prev,
      [itemKey]: prev[itemKey]?.map((fileWithType, i) => 
        i === index 
          ? { ...fileWithType, fileType: fileWithType.fileType === 'view-only' ? 'downloadable' : 'view-only' }
          : fileWithType
      ) || []
    }));
  };

  const handleUpload = async (itemKey: string) => {
    const files = uploadFilesMap[itemKey] || [];
    if (files.length === 0 || !uploadTitleMap[itemKey]) {
      alert('파일과 제목을 입력해주세요.');
      return;
    }

    setUploadingMap(prev => ({ ...prev, [itemKey]: true }));
    
    try {
      const [courseId, sectionId, topicId, itemId] = itemKey.split('-');
      
      // 각 파일을 개별적으로 업로드
      for (const fileWithType of files) {
        const formData = new FormData();
        formData.append('courseId', courseId);
        formData.append('sectionId', sectionId);
        formData.append('topicId', topicId);
        formData.append('itemId', itemId);
        formData.append('title', uploadTitleMap[itemKey]);
        formData.append('description', uploadDescriptionMap[itemKey] || '');
        formData.append('uploadedBy', user?.name || 'Unknown');
        formData.append('file', fileWithType.file);
        formData.append('fileType', fileWithType.fileType);

        const response = await fetch('http://motclub.co.kr/api/course-materials', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('파일 업로드 실패');
        }
      }

      alert('자료가 성공적으로 등록되었습니다.');
      setShowUploadModalMap(prev => ({ ...prev, [itemKey]: false }));
      setUploadFilesMap(prev => ({ ...prev, [itemKey]: [] }));
      setUploadTitleMap(prev => ({ ...prev, [itemKey]: '' }));
      setUploadDescriptionMap(prev => ({ ...prev, [itemKey]: '' }));
      // 등록 성공 후 파일 input 필드 초기화
      if (fileInputRefs.current[itemKey]) {
        fileInputRefs.current[itemKey]!.value = '';
      }
      fetchMaterials(itemKey);
    } catch (error) {
      alert('자료 등록에 실패했습니다.');
    } finally {
      setUploadingMap(prev => ({ ...prev, [itemKey]: false }));
    }
  };

  const handleDelete = async (itemKey: string, materialId: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`http://motclub.co.kr/api/course-materials/${materialId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        alert('자료가 삭제되었습니다.');
        fetchMaterials(itemKey);
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      alert('서버 연결에 실패했습니다.');
    }
  };

  const handleDownload = async (material: CourseMaterial) => {
    try {
      const response = await fetch(`http://motclub.co.kr/api/course-materials/download/${material.id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = material.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('파일 다운로드에 실패했습니다.');
      }
    } catch (error) {
      alert('서버 연결에 실패했습니다.');
    }
  };

  const handleViewFile = (fileName: string, materialId: number) => {
    // Library와 동일한 방식으로 파일보기 처리
    const encodedPath = encodeURIComponent(materialId.toString()).replace(/[!'()*]/g, function(c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
    const fileUrl = `http://motclub.co.kr/api/course-materials/view/${encodedPath}`;
    
    console.log('=== Course 파일 보기 디버깅 ===');
    console.log('원본 fileName:', fileName);
    console.log('원본 materialId:', materialId);
    console.log('인코딩된 materialId:', encodedPath);
    console.log('생성된 fileUrl:', fileUrl);
    console.log('========================');
    
    setViewingFile({ fileName, filePath: materialId.toString() });
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setViewingFile(null);
  };

  const getSectionId = (topicId: number): string => {
    if (course.title === 'MOT 이론 및 방법론') {
      if (topicId === 1) return 'I';
      if (topicId === 2) return 'II';
      if (topicId === 3) return 'III';
    }
    return topicId.toString();
  };

  // 아이템이 새로운 구조인지 확인하는 헬퍼 함수
  const isDetailedItem = (item: any): item is TopicItem => {
    return typeof item === 'object' && 'subtitle' in item && 'goal' in item && 'content' in item;
  };

  // 현재 course가 상세 구조를 사용하는지 확인 (course/1만 상세 구조 사용)
  const useDetailedStructure = course.title === 'MOT 이론 및 방법론';

  return (
    <main className="min-h-screen bg-gray-50">
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
      <div className="bg-white border-b">
        <div className="min-h-[156px] flex flex-col justify-center w-full">
                      <div className="max-w-[1400px] w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 mx-auto flex items-center justify-between">
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-lg text-gray-500">{course.description}</p>
            </div>
            <button
              className="ml-4 px-5 py-2 bg-gray-100 text-gray-800 rounded-lg border border-gray-300 hover:bg-gray-200 font-medium shadow"
              onClick={() => router.back()}
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
      {/* Course Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {course.topics.map((topic) => (
            <div key={topic.id} className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-4">
                {topic.title}
              </h3>
              
              {useDetailedStructure ? (
                // 새로운 상세 구조 (course/1용)
                <div className="space-y-8">
                  {topic.items.map((item, index) => (
                    <div key={index} className="border-l-4 border-emerald-500 pl-6">
                      {isDetailedItem(item) ? (
                        <div className="flex gap-6">
                          {/* 과정 설명 영역 (Width 15% 감소) */}
                          <div className="flex-1 min-w-0" style={{ width: '85%' }}>
                            <h4 className="text-xl font-semibold text-gray-800 mb-4">
                              {item.subtitle}
                            </h4>
                            
                            {/* 목표 섹션 */}
                            <div className="bg-emerald-50 rounded-lg p-4 mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <FiTarget className="h-5 w-5 text-emerald-600" />
                                <h5 className="font-semibold text-emerald-800">목표</h5>
                              </div>
                              <p className="text-gray-700 leading-relaxed">{item.goal}</p>
                            </div>
                            
                            {/* 주요내용 섹션 */}
                            <div className="bg-blue-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <FiList className="h-5 w-5 text-blue-600" />
                                <h5 className="font-semibold text-blue-800">주요내용</h5>
                              </div>
                              <ul className="space-y-2">
                                {item.content.map((contentItem, contentIndex) => (
                                  <li key={contentIndex} className="flex items-start">
                                    <FiCheckCircle className="h-4 w-4 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                                    <span className="text-gray-700 leading-relaxed">{contentItem}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          {/* 자료 등록/조회 영역 */}
                          <div className="w-96 min-w-[400px] flex flex-col">
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="font-semibold text-gray-800">관련 자료</h5>
                                {isAdmin && (
                                  <button
                                    onClick={() => setShowUploadModalMap(prev => ({ ...prev, [`${courseId}-${getSectionId(topic.id)}-${topic.id}-${index + 1}`]: true }))}
                                    className="flex items-center gap-1 text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                                  >
                                    <FiPlus className="h-3 w-3" />
                                    등록
                                  </button>
                                )}
                              </div>
                              
                              {/* 자료 목록 */}
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {materialsMap[`${courseId}-${getSectionId(topic.id)}-${topic.id}-${index + 1}`]?.map((material) => (
                                  <div key={material.id} className="bg-white rounded border p-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{material.title}</p>
                                        <p className="text-xs text-gray-500">{material.fileName}</p>
                                      </div>
                                      <div className="flex items-center gap-1 ml-2">
                                        <button
                                          onClick={isAuthenticated && user ? () => handleViewFile(material.fileName, material.id) : undefined}
                                          disabled={!isAuthenticated || !user}
                                          className={`text-xs px-2 py-1 rounded border ${
                                            isAuthenticated && user
                                              ? 'text-green-600 hover:text-green-800 border-green-200 hover:bg-green-50 cursor-pointer'
                                              : 'text-gray-400 border-gray-300 bg-gray-100 cursor-not-allowed'
                                          }`}
                                          title={isAuthenticated && user ? "파일 보기" : "자료 보기는 로그인이 필요합니다"}
                                          onMouseEnter={handleTooltipMouseEnter}
                                          onMouseLeave={handleTooltipMouseLeave}
                                        >
                                          파일보기
                                        </button>
                                        <button
                                          onClick={isAuthenticated && user ? () => handleDownload(material) : undefined}
                                          disabled={!isAuthenticated || !user}
                                          className={`text-xs px-2 py-1 rounded border ${
                                            isAuthenticated && user
                                              ? 'text-blue-600 hover:text-blue-800 border-blue-200 hover:bg-blue-50 cursor-pointer'
                                              : 'text-gray-400 border-gray-300 bg-gray-100 cursor-not-allowed'
                                          }`}
                                          title={isAuthenticated && user ? "다운로드" : "자료 보기는 로그인이 필요합니다"}
                                          onMouseEnter={handleTooltipMouseEnter}
                                          onMouseLeave={handleTooltipMouseLeave}
                                        >
                                          다운로드
                                        </button>
                                        {isAdmin && (
                                          <button
                                            onClick={() => handleDelete(`${courseId}-${getSectionId(topic.id)}-${topic.id}-${index + 1}`, material.id)}
                                            className="text-red-600 hover:text-red-800 p-1"
                                            title="삭제"
                                          >
                                            <FiTrash2 className="h-3 w-3" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {(!materialsMap[`${courseId}-${getSectionId(topic.id)}-${topic.id}-${index + 1}`] || materialsMap[`${courseId}-${getSectionId(topic.id)}-${topic.id}-${index + 1}`].length === 0) && (
                                  <p className="text-sm text-gray-500 text-center py-4">등록된 자료가 없습니다.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start">
                          <FiCheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <span className="text-gray-600">{item as string}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // 기존 단순 구조 (course/2용)
                <div className="flex flex-col xl:flex-row gap-8">
                  {/* 교과목 설명 */}
                  <div className="flex-1 min-w-0">
                    <ul className="space-y-4">
                      {topic.items.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <FiCheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <span className="text-gray-600">{item as string}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* 자료 리스트/등록 영역 */}
                  <div className="w-96 min-w-[400px] flex flex-col items-end">
                    <div className="w-full bg-gray-50 rounded border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-gray-800">관련 자료</h5>
                        {isAdmin && (
                          <button 
                            onClick={() => setShowUploadModalMap(prev => ({ ...prev, [`${courseId}-${topic.id}-1`]: true }))}
                            className="flex items-center gap-1 text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                          >
                            <FiPlus className="h-3 w-3" />
                            등록
                          </button>
                        )}
                      </div>
                      
                      {/* 자료 목록 */}
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {materialsMap[`${courseId}-${topic.id}-1`]?.map((material) => (
                          <div key={material.id} className="bg-white rounded border p-2">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{material.title}</p>
                                <p className="text-xs text-gray-500">{material.fileName}</p>
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  onClick={isAuthenticated && user ? () => handleViewFile(material.fileName, material.id) : undefined}
                                  disabled={!isAuthenticated || !user}
                                  className={`text-xs px-2 py-1 rounded border ${
                                    isAuthenticated && user
                                      ? 'text-green-600 hover:text-green-800 border-green-200 hover:bg-green-50 cursor-pointer'
                                      : 'text-gray-400 border-gray-300 bg-gray-100 cursor-not-allowed'
                                  }`}
                                  title={isAuthenticated && user ? "파일 보기" : "자료 보기는 로그인이 필요합니다"}
                                  onMouseEnter={handleTooltipMouseEnter}
                                  onMouseLeave={handleTooltipMouseLeave}
                                >
                                  파일보기
                                </button>
                                <button
                                  onClick={isAuthenticated && user ? () => handleDownload(material) : undefined}
                                  disabled={!isAuthenticated || !user}
                                  className={`text-xs px-2 py-1 rounded border ${
                                    isAuthenticated && user
                                      ? 'text-blue-600 hover:text-blue-800 border-blue-200 hover:bg-blue-50 cursor-pointer'
                                      : 'text-gray-400 border-gray-300 bg-gray-100 cursor-not-allowed'
                                  }`}
                                  title={isAuthenticated && user ? "다운로드" : "자료 보기는 로그인이 필요합니다"}
                                  onMouseEnter={handleTooltipMouseEnter}
                                  onMouseLeave={handleTooltipMouseLeave}
                                >
                                  다운로드
                                </button>
                                {isAdmin && (
                                  <button
                                    onClick={() => handleDelete(`${courseId}-${topic.id}-1`, material.id)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                    title="삭제"
                                  >
                                    <FiTrash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!materialsMap[`${courseId}-${topic.id}-1`] || materialsMap[`${courseId}-${topic.id}-1`].length === 0) && (
                          <p className="text-sm text-gray-500 text-center py-4">등록된 자료가 없습니다.</p>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          ))}
        </div>

        {/* 자료 등록 모달 */}
        {Object.entries(showUploadModalMap).map(([itemKey, show]) => {
          if (!show) return null;
          
          return (
            <div key={itemKey} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">자료 등록</h3>
                  <button
                    onClick={() => {
                      setShowUploadModalMap(prev => ({ ...prev, [itemKey]: false }));
                      // 모달 닫을 때 파일 input 필드 초기화
                      if (fileInputRefs.current[itemKey]) {
                        fileInputRefs.current[itemKey]!.value = '';
                      }
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                    <input
                      type="text"
                      value={uploadTitleMap[itemKey] || ''}
                      onChange={(e) => setUploadTitleMap(prev => ({ ...prev, [itemKey]: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="자료 제목을 입력하세요"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                    <textarea
                      value={uploadDescriptionMap[itemKey] || ''}
                      onChange={(e) => setUploadDescriptionMap(prev => ({ ...prev, [itemKey]: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="자료에 대한 설명을 입력하세요"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">파일</label>
                    <input
                      ref={(el) => fileInputRefs.current[itemKey] = el}
                      type="file"
                      multiple
                      onChange={(e) => handleFileChange(itemKey, e)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {(uploadFilesMap[itemKey] || []).length > 0 && (
                      <div className="mt-2 space-y-2">
                        {uploadFilesMap[itemKey]?.map((fileWithType, index) => (
                          <div key={index} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            <div className="flex items-center">
                              <FiPaperclip className="h-5 w-5 text-gray-500 mr-2" />
                              <span>{fileWithType.file.name} ({(fileWithType.file.size / 1024).toFixed(2)} KB)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleFileType(itemKey, index)}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                  fileWithType.fileType === 'view-only'
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                                title={fileWithType.fileType === 'view-only' ? '파일보기만 가능' : '다운로드 가능'}
                              >
                                {fileWithType.fileType === 'view-only' ? (
                                  <>
                                    <FiEye className="h-3 w-3" />
                                    보기만
                                  </>
                                ) : (
                                  <>
                                    <FiDownload className="h-3 w-3" />
                                    다운로드
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeFile(itemKey, index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FiX className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      onClick={() => {
                        setShowUploadModalMap(prev => ({ ...prev, [itemKey]: false }));
                        // 취소할 때 파일 input 필드 초기화
                        if (fileInputRefs.current[itemKey]) {
                          fileInputRefs.current[itemKey]!.value = '';
                        }
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => handleUpload(itemKey)}
                      disabled={uploadingMap[itemKey]}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      {uploadingMap[itemKey] ? '등록 중...' : '등록'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* 파일 타입 선택 모달 */}
        {Object.entries(showTypeModalMap).map(([itemKey, show]) => {
          if (!show) return null;
          
          return (
            <div key={itemKey} className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <FiUpload className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                    파일 타입 선택
                  </h3>
                  <div className="mt-2 px-7 py-3">
                    <p className="text-sm text-gray-500 mb-4">
                      선택된 파일 {(pendingFilesMap[itemKey] || []).length}개에 대한 타입을 선택해주세요.
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => handleTypeSelection(itemKey, 'downloadable')}
                        className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <FiDownload className="mr-2 h-4 w-4" />
                        다운로드 가능 (파일보기 + 다운로드)
                      </button>
                      <button
                        onClick={() => handleTypeSelection(itemKey, 'view-only')}
                        className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FiEye className="mr-2 h-4 w-4" />
                        보기만 가능 (다운로드 불가)
                      </button>
                    </div>
                  </div>
                  <div className="items-center px-4 py-3">
                    <button
                      onClick={() => handleCancelTypeSelection(itemKey)}
                      className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* 파일 View 모달 */}
        {viewModalOpen && viewingFile && (
          <FileViewer
            fileName={viewingFile.fileName}
            fileUrl={`http://motclub.co.kr/api/course-materials/view/${encodeURIComponent(viewingFile.filePath).replace(/[!'()*]/g, function(c) {
              return '%' + c.charCodeAt(0).toString(16);
            })}`}
            onClose={handleCloseViewModal}
          />
        )}
      </div>
      </div>
    </main>
  );
} 