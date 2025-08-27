'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiUsers, FiEye, FiDownload, FiSearch, FiPlus, FiInfo, FiSettings, FiTrendingUp, FiDatabase, FiTarget } from 'react-icons/fi';
import Navigation from '@/components/Navigation';
import FileViewer from '@/components/common/FileViewer';
import CourseOverviewModal from '@/components/common/CourseOverviewModal';

interface RelatedMaterial {
  id: number;
  title: string;
  description: string;
  fileName: string;
  filePath: string;
  category: string;
}

// 실제 데이터 구조 - Learning 카테고리 (공통코드 테이블)
interface LearningCategory {
  id: number;
  codeName: string;
  codeValue: string;
  description: string;
  parentId: number | null;
  menuName: string;
}

// 실제 데이터 구조 - Subject (Subject 테이블)
interface Subject {
  id: number;
  subjectCode: string;
  subjectDescription: string;
  subjectContent: string;
  curriculumFileName: string | null;
  curriculumFilePath: string | null;
  categoryId: number;
  sortOrder: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LearningPage() {
  const [relatedMaterials, setRelatedMaterials] = useState<RelatedMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<RelatedMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<{ fileName: string; fileUrl: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAdmin] = useState(true); // 임시로 true로 설정, 실제로는 AuthContext에서 가져와야 함
  const [overviewModalOpen, setOverviewModalOpen] = useState(false);
  
  // Learning 카테고리 및 Subject 관련 상태
  const [activeTab, setActiveTab] = useState<number | null>(null); // 현재 선택된 탭
  const [categories, setCategories] = useState<LearningCategory[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  // Learning 카테고리 데이터 로딩
  useEffect(() => {
    fetchLearningCategories();
  }, []);

  // 첫 번째 카테고리 선택 시 Subject 데이터 로딩
  useEffect(() => {
    if (activeTab && categories.length > 0) {
      fetchSubjects(activeTab);
    }
  }, [activeTab, categories.length]);

  // 관련자료 목록 불러오기
  useEffect(() => {
    fetchRelatedMaterials();
  }, []);

  // Learning 카테고리 데이터 가져오기 (공통코드 테이블)
  const fetchLearningCategories = async () => {
    try {
      setIsLoadingCategories(true);
      console.log('=== Learning 카테고리 데이터 요청 시작 ===');
      
      // 기본 공통코드 API 호출
      console.log('=== 기본 공통코드 API 호출 ===');
      const basicResponse = await fetch('http://localhost:8082/api/codes');
      console.log('기본 API 응답 상태:', basicResponse.status);
      
      if (basicResponse.ok) {
        const basicData = await basicResponse.json();
        console.log('=== 기본 공통코드 데이터 ===');
        console.log('전체 데이터 개수:', basicData.length);
        console.log('전체 데이터:', basicData);
        
        // 1단계: menu_name이 "Learning"인 마스터 코드 찾기
        const learningMaster = basicData.find((item: any) => 
          item.menuName === 'Learning' && item.parentId === null
        );
        console.log('=== Learning 마스터 코드 ===');
        console.log('Learning 마스터:', learningMaster);
        
        if (learningMaster) {
          // 2단계: code_name이 "교육과정 카테고리"인 2단계 코드 찾기
          const curriculumCategory = basicData.find((item: any) => 
            item.menuName === 'Learning' && 
            item.parentId === learningMaster.id && 
            item.codeName === '교육과정 카테고리'
          );
          console.log('=== 교육과정 카테고리 2단계 코드 ===');
          console.log('교육과정 카테고리:', curriculumCategory);
          
          if (curriculumCategory) {
            // 3단계: 교육과정 카테고리의 하위 코드들 중 pk 36~40 범위 찾기
            const learningCategories = basicData.filter((item: any) => 
              item.parentId === curriculumCategory.id && 
              item.id >= 36 && item.id <= 40
            );
            console.log('=== pk 36~40 범위 Learning 카테고리 ===');
            console.log('필터링된 카테고리 개수:', learningCategories.length);
            console.log('필터링된 카테고리:', learningCategories);
            
            if (learningCategories.length > 0) {
              setCategories(learningCategories);
              if (!activeTab) {
                setActiveTab(learningCategories[0].id);
                console.log('첫 번째 Learning 카테고리 선택됨:', learningCategories[0]);
              }
              return;
            }
          }
        }
        
        // 위의 3단계 계층 구조가 없으면 pk 36~40 범위 데이터를 직접 사용
        console.log('=== 3단계 계층 구조가 없어 pk 36~40 데이터 직접 사용 ===');
        const pk36to40 = basicData.filter((item: any) => item.id >= 36 && item.id <= 40);
        console.log('pk 36~40 데이터:', pk36to40);
        
        if (pk36to40.length > 0) {
          setCategories(pk36to40);
          if (!activeTab) {
            setActiveTab(pk36to40[0].id);
            console.log('첫 번째 pk 36~40 카테고리 선택됨:', pk36to40[0]);
          }
          return;
        }
      }
      
      // Learning-details API 호출 (백업)
      console.log('=== Learning-details API 호출 (백업) ===');
      const response = await fetch('http://localhost:8082/api/codes/learning-details');
      console.log('Learning-details API 응답 상태:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('=== Learning-details API 데이터 ===');
        console.log('데이터 개수:', data.length);
        console.log('데이터:', data);
        
        // Learning 메뉴의 교육과정 카테고리 하위 값들만 필터링
        const learningCategories = data.filter((item: any) => {
          console.log('필터링 중인 아이템:', item);
          const isLearning = item.menuName === 'Learning';
          const hasParent = item.parentId !== null;
          console.log(`menuName: ${item.menuName}, parentId: ${item.parentId}, isLearning: ${isLearning}, hasParent: ${hasParent}`);
          return isLearning && hasParent;
        });
        
        console.log('=== Learning-details API 필터링 결과 ===');
        console.log('필터링된 카테고리 개수:', learningCategories.length);
        console.log('필터링된 카테고리:', learningCategories);
        
        setCategories(learningCategories);
        
        // 첫 번째 카테고리를 기본 선택
        if (learningCategories.length > 0 && !activeTab) {
          setActiveTab(learningCategories[0].id);
          console.log('첫 번째 카테고리 선택됨:', learningCategories[0]);
        }
      } else {
        console.error('Learning 카테고리 조회 실패:', response.status);
        const errorText = await response.text();
        console.error('에러 응답 내용:', errorText);
      }
    } catch (error) {
      console.error('Learning 카테고리 조회 중 오류:', error);
      console.error('에러 상세:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Subject 데이터 가져오기 (Subject 테이블)
  const fetchSubjects = async (categoryId: number) => {
    try {
      setIsLoadingSubjects(true);
      console.log(`=== Subject 데이터 요청 시작 - 카테고리 ID: ${categoryId} ===`);
      
      const response = await fetch(`http://localhost:8082/api/subjects/category/${categoryId}`);
      console.log('Subject API 응답 상태:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('=== Subject 데이터 ===');
        console.log('Subject 개수:', data.length);
        console.log('Subject 데이터:', data);
        setSubjects(data);
      } else {
        console.error('Subject 조회 실패:', response.status);
        const errorText = await response.text();
        console.error('에러 응답 내용:', errorText);
        setSubjects([]);
      }
    } catch (error) {
      console.error('Subject 조회 중 오류:', error);
      console.error('에러 상세:', error);
      setSubjects([]);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const fetchRelatedMaterials = async () => {
    try {
      const response = await fetch('http://localhost:8082/api/library');
      if (response.ok) {
        const data = await response.json();
        // MOT 이론 및 방법론 관련 자료만 필터링
        const filteredData = data.filter((item: any) => 
          item.category === 'MOT 이론 및 방법론'
        ).map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          fileName: item.fileNames ? item.fileNames.split(',')[0].trim() : '',
          filePath: item.filePaths ? item.filePaths.split(',')[0].trim() : '',
          category: item.category
        }));
        setRelatedMaterials(filteredData);
      } else {
        console.error('관련자료 목록 조회 실패:', response.status);
      }
    } catch (error) {
      console.error('관련자료 목록 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = (fileName: string, filePath: string) => {
    // Library와 동일한 방식으로 파일보기 처리
    const encodedPath = encodeURIComponent(filePath).replace(/[!'()*]/g, function(c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
    const fileUrl = `http://localhost:8082/api/library/view/${encodedPath}`;
    
    console.log('=== Learning 파일 보기 디버깅 ===');
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

  // 검색 및 카테고리 필터링 기능
  useEffect(() => {
    let filtered = relatedMaterials;
    
    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(material => material.category === selectedCategory);
    }
    
    // 검색어 필터링
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredMaterials(filtered);
  }, [searchTerm, selectedCategory, relatedMaterials]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 검색은 이미 useEffect에서 실시간으로 처리됨
  };

  // 탭 변경 시 Subject 데이터 로딩
  const handleTabChange = (categoryId: number) => {
    setActiveTab(categoryId);
    fetchSubjects(categoryId);
  };

  // 현재 선택된 탭의 Subject 필터링
  const getCurrentTabSubjects = () => {
    return subjects.filter(subject => subject.categoryId === activeTab);
  };

  // 디버깅용 useEffect
  useEffect(() => {
    console.log('=== Learning 페이지 디버깅 ===');
    console.log('isAdmin 상태:', isAdmin);
    console.log('관련자료 개수:', relatedMaterials.length);
    console.log('필터링된 자료 개수:', filteredMaterials.length);
    console.log('========================');
  }, [isAdmin, relatedMaterials.length, filteredMaterials.length]);

  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-28">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b981,#059669)] opacity-30">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M0 32V.5H32" fill="none" stroke="rgba(255,255,255,0.1)"></path>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)"></rect>
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-700 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <FiUsers className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Learning</h1>
            </div>
            <button
              onClick={() => setOverviewModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white font-semibold hover:bg-white/30 transition-all duration-200 hover:scale-105"
            >
              <FiInfo className="w-5 h-5" />
              과정 Overview
            </button>
          </div>
          <p className="text-lg text-emerald-50 max-w-[1150px]">
            한국산업기술진흥협회에서 제공하는 MOT(기술경영) 실무역량 강화 및 전문가 양성을 위한 교육프로그램으로,<br/>
            변화하는 기업환경을 반영한 최신의 이론 및 방법론과 R&D 조직차원의 MOT 체계에 대한 실무기반의 교육체계를 제공합니다.
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Learning 카테고리 및 Subject 섹션 */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Tab Headers */}
            <div className="border-b border-gray-200">
              {isLoadingCategories ? (
                <div className="flex items-center justify-center px-8 py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                  <span className="ml-2 text-gray-600">카테고리 로딩 중...</span>
                </div>
              ) : categories.length > 0 ? (
                <div>
                  
                  {/* 카테고리 탭 */}
                  <div className="flex overflow-x-auto">
                    {categories.map((category, index) => (
                      <button
                        key={category.id}
                        className={`flex items-center gap-2 px-8 py-6 text-base font-medium whitespace-nowrap transition-all duration-200 ${
                          activeTab === category.id
                            ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50 font-semibold'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        onClick={() => handleTabChange(category.id)}
                      >
                        {index === 0 && <FiUsers className="w-5 h-5" />}
                        {index === 1 && <FiSettings className="w-5 h-5" />}
                        {index === 2 && <FiTrendingUp className="w-5 h-5" />}
                        {index === 3 && <FiDatabase className="w-5 h-5" />}
                        {index === 4 && <FiTarget className="w-5 h-5" />}
                        {category.codeName}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-8 py-6 text-gray-500">
                  <p>카테고리를 불러올 수 없습니다.</p>
                  <p className="text-sm text-gray-400 mt-2">개발자 도구 콘솔을 확인해주세요.</p>
                  <p className="text-sm text-gray-400 mt-1">예상 계층: Learning → 교육과정 카테고리 → pk 36~40</p>
                </div>
              )}
            </div>

            {/* Tab Content - Subject List */}
            <div className="p-8">

              {/* Subject List */}
              <div className="space-y-4">
                {isLoadingSubjects ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Subject 목록을 불러오는 중...</p>
                  </div>
                ) : getCurrentTabSubjects().length > 0 ? (
                  getCurrentTabSubjects().map((subject) => (
                    <div
                      key={subject.id}
                      className="p-6 border border-gray-200 rounded-lg hover:border-emerald-300 hover:shadow-md transition-all duration-200"
                    >
                      {/* 첫 번째 줄: Subject 코드, Description, Curriculum 파일 */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                            {subject.subjectCode}
                          </span>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {subject.subjectDescription}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {subject.curriculumFileName ? (
                            <>
                              <FiDownload className="w-4 h-4" />
                              <span>{subject.curriculumFileName}</span>
                            </>
                          ) : (
                            <span className="text-gray-400">파일 없음</span>
                          )}
                        </div>
                      </div>
                      
                      {/* 두 번째 줄: 주요내용 */}
                      <div className="pl-4">
                        <p className="text-gray-700 leading-relaxed">
                          {subject.subjectContent}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>해당 카테고리에 등록된 Subject가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 파일 보기 모달 */}
      {viewModalOpen && viewingFile && (
        <div>
          <FileViewer
            fileName={viewingFile.fileName}
            fileUrl={viewingFile.fileUrl}
            onClose={handleCloseViewModal}
          />
        </div>
      )}

      {/* 과정 Overview 모달 */}
      <CourseOverviewModal
        isOpen={overviewModalOpen}
        onClose={() => setOverviewModalOpen(false)}
      />
      </div>
    </main>
  );
} 