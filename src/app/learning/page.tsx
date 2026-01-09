'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiUsers, FiEye, FiDownload, FiSearch, FiPlus, FiInfo, FiSettings, FiTrendingUp, FiDatabase, FiTarget, FiFileText, FiList } from 'react-icons/fi';
import Navigation from '@/components/Navigation';
import LocalPDFViewer from '@/components/common/LocalPDFViewer';
import CourseOverviewModal from '@/components/common/CourseOverviewModal';
import SubjectCreateModal from '@/components/learning/SubjectCreateModal';
import SubjectEditModal from '@/components/learning/SubjectEditModal';
import ProgramDetailModal from '@/components/learning/ProgramDetailModal';
import CustomProgramCreateModal from '@/components/learning/CustomProgramCreateModal';
import CustomProgramViewModal from '@/components/learning/CustomProgramViewModal';
import { useAuth } from '@/context/AuthContext';
import { fetchLearningPrograms } from '@/utils/learningProgramApi';
import { LearningProgram } from '@/types/learningProgram';
import { fetchCustomPrograms, CustomProgram } from '@/utils/customProgramApi';
import { getApiUrl } from '@/config/api';

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

// 변환된 Program 데이터 타입
interface TransformedProgram {
  id: number;
  programCode: string;
  programName: string;
  programType?: string;
  programGoal: string;
  mainContent: string;
  curriculumPdf: string;
  curriculumFileName?: string;
  curriculumFilePath?: string;
  subjects?: Array<{
    id: number;
    subjectCode: string;
    subjectDescription: string;
    curriculumFileName?: string;
    curriculumFilePath?: string;
  }>;
}

export default function LearningPage() {
  const { user, isAuthenticated } = useAuth();
  const [relatedMaterials, setRelatedMaterials] = useState<RelatedMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<RelatedMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<{ fileName: string; fileUrl: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [overviewModalOpen, setOverviewModalOpen] = useState(false);
  const [subjectCreateModalOpen, setSubjectCreateModalOpen] = useState(false);
  const [subjectEditModalOpen, setSubjectEditModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [programDetailModalOpen, setProgramDetailModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  
  // Custom Program 관련 상태
  const [customPrograms, setCustomPrograms] = useState<CustomProgram[]>([]);
  const [isLoadingCustomPrograms, setIsLoadingCustomPrograms] = useState(false);
  const [customProgramCreateModalOpen, setCustomProgramCreateModalOpen] = useState(false);
  const [customProgramEditModalOpen, setCustomProgramEditModalOpen] = useState(false);
  const [selectedCustomProgram, setSelectedCustomProgram] = useState<CustomProgram | null>(null);
  
  // Learning 카테고리 및 Subject 관련 상태
  const [activeMainTab, setActiveMainTab] = useState<'SUBJECT' | 'PROGRAM_PHASE' | 'PROGRAM_ROLE_LEVEL' | 'PROGRAM_CUSTOM'>('SUBJECT'); // 메인 탭 (SUBJECT / PROGRAM(Level-based) / PROGRAM(Topic-based) / PROGRAM(Custom-tailored))
  const [activeTab, setActiveTab] = useState<number | null>(null); // 현재 선택된 카테고리 탭
  const [categories, setCategories] = useState<LearningCategory[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  
  // Learning Program 관련 상태
  const [programs, setPrograms] = useState<TransformedProgram[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  
  // Custom Program 검색 상태
  const [customProgramSearchTerm, setCustomProgramSearchTerm] = useState('');
  
  // 문의/요청 건수 상태 (itemId -> { inquiryCount: number, responseCount: number })
  const [subjectInquiryCounts, setSubjectInquiryCounts] = useState<{ [key: number]: { inquiryCount: number; responseCount: number } }>({});
  const [programInquiryCounts, setProgramInquiryCounts] = useState<{ [key: number]: { inquiryCount: number; responseCount: number } }>({});

  // Subject 문의/요청 건수 조회 함수
  const fetchSubjectInquiryCounts = async (items: Subject[]) => {
    const counts: { [key: number]: { inquiryCount: number; responseCount: number } } = {};
    
    await Promise.all(
      items.map(async (item) => {
        try {
          const url = getApiUrl(`/api/inquiries?refTable=learning_subjects&refId=${item.id}`);
          const response = await fetch(url);
          
          if (response.ok) {
            const inquiries: any[] = await response.json();
            const inquiryCount = inquiries.length;
            
            let responseCount = 0;
            for (const inquiry of inquiries) {
              if (inquiry.responses && Array.isArray(inquiry.responses) && inquiry.responses.length > 0) {
                responseCount++;
              } else {
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
            
            counts[item.id] = { inquiryCount, responseCount };
          } else {
            counts[item.id] = { inquiryCount: 0, responseCount: 0 };
          }
        } catch (error) {
          console.error(`문의/요청 건수 조회 실패 (subject ${item.id}):`, error);
          counts[item.id] = { inquiryCount: 0, responseCount: 0 };
        }
      })
    );
    
    setSubjectInquiryCounts(counts);
  };

  // Program 문의/요청 건수 조회 함수
  const fetchProgramInquiryCounts = async (items: TransformedProgram[]) => {
    const counts: { [key: number]: { inquiryCount: number; responseCount: number } } = {};
    
    await Promise.all(
      items.map(async (item) => {
        try {
          const url = getApiUrl(`/api/inquiries?refTable=learning_programs&refId=${item.id}`);
          const response = await fetch(url);
          
          if (response.ok) {
            const inquiries: any[] = await response.json();
            const inquiryCount = inquiries.length;
            
            let responseCount = 0;
            for (const inquiry of inquiries) {
              if (inquiry.responses && Array.isArray(inquiry.responses) && inquiry.responses.length > 0) {
                responseCount++;
              } else {
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
            
            counts[item.id] = { inquiryCount, responseCount };
          } else {
            counts[item.id] = { inquiryCount: 0, responseCount: 0 };
          }
        } catch (error) {
          console.error(`문의/요청 건수 조회 실패 (program ${item.id}):`, error);
          counts[item.id] = { inquiryCount: 0, responseCount: 0 };
        }
      })
    );
    
    setProgramInquiryCounts(counts);
  };

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

  // PROGRAM_PHASE 또는 PROGRAM_ROLE_LEVEL 탭 활성화 시 Program 데이터 로딩
  useEffect(() => {
    if (activeMainTab === 'PROGRAM_PHASE' || activeMainTab === 'PROGRAM_ROLE_LEVEL') {
      fetchPrograms();
    }
  }, [activeMainTab]);

  // PROGRAM_CUSTOM 탭 활성화 시 Custom Program 데이터 로딩
  useEffect(() => {
    if (activeMainTab === 'PROGRAM_CUSTOM') {
      fetchCustomProgramsData();
    }
  }, [activeMainTab]);

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
      const basicResponse = await fetch('/api/codes');
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
      const response = await fetch('/api/codes/learning-details');
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
      
      const response = await fetch(`/api/subjects/category/${categoryId}`);
      console.log('Subject API 응답 상태:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('=== Subject 데이터 ===');
        console.log('Subject 개수:', data.length);
        console.log('Subject 데이터:', data);
        
        // Curriculum 파일 경로 정보 확인
        data.forEach((subject: any, index: number) => {
          console.log(`Subject ${index + 1}:`, {
            id: subject.id,
            subjectCode: subject.subjectCode,
            subjectDescription: subject.subjectDescription,
            curriculumFileName: subject.curriculumFileName,
            curriculumFilePath: subject.curriculumFilePath,
            // 파일 경로 상세 분석
            hasFileName: !!subject.curriculumFileName,
            hasFilePath: !!subject.curriculumFilePath,
            fileNameLength: subject.curriculumFileName?.length || 0,
            filePathLength: subject.curriculumFilePath?.length || 0
          });
        });
        
        setSubjects(data);
        // 문의/요청 건수 조회
        fetchSubjectInquiryCounts(data);
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
      const response = await fetch('/api/library');
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

  // Subject 추가 성공 시 목록 새로고침
  const handleSubjectCreateSuccess = () => {
    if (activeTab) {
      fetchSubjects(activeTab);
    }
  };

  // Subject 수정 성공 시 목록 새로고침
  const handleSubjectEditSuccess = () => {
    if (activeTab) {
      fetchSubjects(activeTab);
    }
  };

  // Subject 삭제 성공 시 목록 새로고침
  const handleSubjectDeleteSuccess = () => {
    if (activeTab) {
      fetchSubjects(activeTab);
    }
  };

  // Subject Description 클릭 시 수정 모달 열기
  const handleSubjectDescriptionClick = (subject: any) => {
    setSelectedSubject(subject);
    setSubjectEditModalOpen(true);
    
    console.log('모달 열기 완료');
  };

  // Subject 데이터 업데이트 (파일 삭제 후 등)
  const handleSubjectUpdate = (updatedSubject: any) => {
    setSelectedSubject(updatedSubject);
  };

  // Curriculum 파일 보기 처리
  const handleViewCurriculumFile = async (fileName: string, filePath: string | null) => {
    console.log('=== Curriculum 파일 보기 시작 ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('fileName:', fileName);
    console.log('filePath:', filePath);
    console.log('현재 사용자:', user);
    console.log('현재 시간:', new Date().toISOString());
    
    if (!isAuthenticated) {
      console.log('로그인이 필요합니다. 파일 보기 불가.');
      return;
    }
    
    // filePath가 없는 경우
    if (!filePath) {
      console.log('filePath가 null입니다.');
      alert('파일 경로 정보가 없습니다. 파일을 다시 업로드해주세요.');
      return;
    }
    
    // 쿼리 파라미터 방식으로 파일 경로 처리 (URL 인코딩 문제 해결)
    try {
      // 쿼리 파라미터로 전달 (더 안전한 방식)
      const encodedPath = encodeURIComponent(filePath.trim());
      const fileUrl = getApiUrl(`/api/library/view?path=${encodedPath}`);
      
      console.log('=== Curriculum 파일 보기 디버깅 ===');
      console.log('원본 fileName:', fileName);
      console.log('원본 filePath:', filePath);
      console.log('인코딩된 filePath:', encodedPath);
      console.log('생성된 fileUrl:', fileUrl);
      console.log('========================');
      
      // 파일 존재 여부 확인 없이 바로 파일 조회 시도
      console.log('파일 조회 시도:', fileUrl);
      setViewingFile({ fileName, fileUrl });
      setViewModalOpen(true);
    } catch (error) {
      console.error('파일 경로 처리 중 오류:', error);
      alert('파일 경로 처리 중 오류가 발생했습니다.');
    }
  };

  // 현재 선택된 탭의 Subject 필터링 및 subjectCode 순서로 정렬
  const getCurrentTabSubjects = () => {
    const filteredSubjects = subjects.filter(subject => subject.categoryId === activeTab);
    // subjectCode 순서로 정렬
    return filteredSubjects.sort((a, b) => a.subjectCode.localeCompare(b.subjectCode));
  };

  // PROGRAM_PHASE 탭용 프로그램 필터링
  const getPhasePrograms = () => {
    return programs.filter((p: any) => 
      p.programType === 'Level-based' || 
      p.programType === 'Phase-based' || 
      p.programType === 'Phase' ||
      !p.programType // programType이 없는 경우도 포함
    );
  };

  // PROGRAM_ROLE_LEVEL 탭용 프로그램 필터링
  const getRoleLevelPrograms = () => {
    return programs.filter((p: any) => p.programType === 'Topic-based');
  };

  // Program 데이터 가져오기
  const fetchPrograms = async () => {
    try {
      setIsLoadingPrograms(true);
      console.log('=== Program 데이터 요청 시작 ===');
      
      const data = await fetchLearningPrograms();
      console.log('Program 데이터 조회 성공:', data);
      
      // 데이터 변환 (프론트엔드 형식에 맞게)
      const transformedPrograms = data.map((program: LearningProgram) => ({
        id: program.id,
        programCode: program.code,
        programName: program.description,
        programType: program.programType,
        programGoal: program.programGoal || '',
        mainContent: program.mainContent || '',
        curriculumPdf: program.curriculumFileName || program.curriculumPdf || '',
        curriculumFileName: program.curriculumFileName,
        curriculumFilePath: program.curriculumFilePath,
        subjects: program.subjects?.map((subject: any) => ({
          id: subject.id,
          subjectCode: subject.subjectCode || subject.code,
          subjectDescription: subject.subjectDescription || subject.description,
          curriculumFileName: subject.curriculumFileName,
          curriculumFilePath: subject.curriculumFilePath
        })) || []
      }));
      
      console.log('변환된 Program 데이터:', transformedPrograms);
      console.log('Level-based 프로그램 수:', transformedPrograms.filter((p: any) => p.programType === 'Level-based').length);
      console.log('Topic-based 프로그램 수:', transformedPrograms.filter((p: any) => p.programType === 'Topic-based').length);
      console.log('모든 programType 값:', transformedPrograms.map((p: any) => ({ id: p.id, programType: p.programType })));
      
      setPrograms(transformedPrograms);
      // 문의/요청 건수 조회
      fetchProgramInquiryCounts(transformedPrograms);
    } catch (error) {
      console.error('Program 데이터 조회 실패:', error);
      setPrograms([]);
    } finally {
      setIsLoadingPrograms(false);
    }
  };

  // Program 생성 성공 핸들러
  const handleProgramCreateSuccess = () => {
    fetchPrograms();
  };

  // Program 수정 성공 핸들러
  const handleProgramUpdateSuccess = () => {
    fetchPrograms();
  };

  // Program 삭제 성공 핸들러
  const handleProgramDeleteSuccess = () => {
    fetchPrograms();
  };

  // Custom Program 데이터 가져오기
  const fetchCustomProgramsData = async () => {
    try {
      setIsLoadingCustomPrograms(true);
      const data = await fetchCustomPrograms();
      setCustomPrograms(data);
    } catch (error) {
      console.error('Custom Program 데이터 조회 실패:', error);
      setCustomPrograms([]);
    } finally {
      setIsLoadingCustomPrograms(false);
    }
  };

  // Custom Program 생성 성공 핸들러
  const handleCustomProgramCreateSuccess = () => {
    fetchCustomProgramsData();
  };

  // Custom Program 수정 성공 핸들러
  const handleCustomProgramUpdateSuccess = () => {
    fetchCustomProgramsData();
  };

  // Custom Program 삭제 성공 핸들러
  const handleCustomProgramDeleteSuccess = () => {
    fetchCustomProgramsData();
  };

  // Custom Program 클릭 시 수정 모달 열기
  const handleCustomProgramClick = (program: CustomProgram) => {
    if (isAuthenticated && user && (user.role === 'ADMIN' || user.role === 'EXPERT')) {
      setSelectedCustomProgram(program);
      setCustomProgramEditModalOpen(true);
    }
  };

  // 디버깅용 useEffect
  useEffect(() => {
    console.log('=== Learning 페이지 디버깅 ===');
    console.log('isAuthenticated 상태:', isAuthenticated);
    console.log('관련자료 개수:', relatedMaterials.length);
    console.log('필터링된 자료 개수:', filteredMaterials.length);
    console.log('========================');
  }, [isAuthenticated, relatedMaterials.length, filteredMaterials.length]);

  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-28">
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-300 via-emerald-400 to-emerald-500 text-white rounded-2xl">
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
          <div className="relative px-4 sm:px-6 lg:px-8 py-[19px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <FiUsers className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-[24px] font-bold text-white">MOT Curriculum</h1>
            </div>
            <div className="flex items-center gap-3 -ml-[30px] mr-[64px]">
              {isAuthenticated && user && user.role === 'ADMIN' && (
                <>
                  {activeMainTab === 'SUBJECT' && (
                    <button
                      onClick={() => setSubjectCreateModalOpen(true)}
                      className="flex items-center gap-2 px-3 py-1 bg-emerald-500 hover:bg-emerald-600 backdrop-blur-md border border-emerald-400 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-105"
                    >
                      <FiPlus className="w-5 h-5" />
                      Subject 추가
                    </button>
                  )}
                  {(activeMainTab === 'PROGRAM_PHASE' || activeMainTab === 'PROGRAM_ROLE_LEVEL') && (
                    <button
                      onClick={() => {
                        setSelectedProgram(null);
                        setProgramDetailModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-6 py-[7px] bg-emerald-500 hover:bg-emerald-600 backdrop-blur-md border border-emerald-400 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-105"
                    >
                      <FiPlus className="w-5 h-5" />
                      Program 추가
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => setOverviewModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white font-semibold hover:bg-white/30 transition-all duration-200 hover:scale-105"
              >
                <FiInfo className="w-5 h-5" />
                MOT Overview
              </button>
            </div>
          </div>
          <p className="text-base text-emerald-50 max-w-[1150px] text-right">
            MOT 관련된 모든 교과목을 체계적으로 관리하고<br />
            교육과정(Program)과 교과목을 연계하여 교육에 대해 정보를 제공합니다.
          </p>
          </div>
        </div>
      </div>

      {/* Main Tab Section (SUBJECT / PROGRAM(Level-based) / PROGRAM(Topic-based)) */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-3">
        <div className="flex gap-2 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveMainTab('SUBJECT')}
            className={`px-6 py-3 text-[18px] font-bold transition-all duration-200 ${
              activeMainTab === 'SUBJECT'
                ? 'text-emerald-600 border-b-2 border-emerald-600 -mb-[2px]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            SUBJECT
          </button>
          <button
            onClick={() => setActiveMainTab('PROGRAM_PHASE')}
            className={`px-6 py-3 text-[18px] font-bold transition-all duration-200 ${
              activeMainTab === 'PROGRAM_PHASE'
                ? 'text-emerald-600 border-b-2 border-emerald-600 -mb-[2px]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            PROGRAM(Level-based)
          </button>
          <button
            onClick={() => setActiveMainTab('PROGRAM_ROLE_LEVEL')}
            className={`px-6 py-3 text-[18px] font-bold transition-all duration-200 ${
              activeMainTab === 'PROGRAM_ROLE_LEVEL'
                ? 'text-emerald-600 border-b-2 border-emerald-600 -mb-[2px]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            PROGRAM(Topic-based)
          </button>
          <button
            onClick={() => setActiveMainTab('PROGRAM_CUSTOM')}
            className={`px-6 py-3 text-[18px] font-bold transition-all duration-200 ${
              activeMainTab === 'PROGRAM_CUSTOM'
                ? 'text-emerald-600 border-b-2 border-emerald-600 -mb-[2px]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            PROGRAM(Custom-tailored)
          </button>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-[2px] pb-12">
        {/* SUBJECT 탭 내용 */}
        {activeMainTab === 'SUBJECT' && (
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
                        className={`flex items-center gap-2 px-8 py-[10px] text-base font-medium whitespace-nowrap transition-all duration-200 ${
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
                      className="px-6 py-3 border border-gray-200 rounded-lg hover:border-emerald-300 hover:shadow-md transition-all duration-200"
                    >
                      {/* 첫 번째 줄: Subject 코드, Description, Curriculum 파일 */}
                      <div className="flex items-center justify-between mb-[6px]">
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                            {subject.subjectCode}
                          </span>
                                                     <h4 
                             className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-emerald-600 transition-colors"
                             onClick={() => {
                               console.log('Subject 클릭됨!');
                               handleSubjectDescriptionClick(subject);
                             }}
                             title="클릭하여 수정"
                           >
                            {subject.subjectDescription}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {subject.curriculumFileName && subject.curriculumFileName !== '[NULL]' && subject.curriculumFileName.trim() !== '' ? (
                            <div className="flex items-center gap-3">
                              <span className="text-gray-600">{subject.curriculumFileName}</span>
                              <div className="relative group">
                                <button
                                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                                    isAuthenticated 
                                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  }`}
                                  onClick={() => {
                                    if (isAuthenticated) {
                                      handleViewCurriculumFile(subject.curriculumFileName || '', subject.curriculumFilePath);
                                    }
                                  }}
                                  title={isAuthenticated ? "파일 보기" : "파일조회에는 로그인이 필요합니다"}
                                  disabled={!isAuthenticated}
                                >
                                  {subject.curriculumFileName?.toLowerCase().endsWith('.pdf') ? (
                                    <FiEye className="w-3 h-3" />
                                  ) : (
                                    <FiFileText className="w-3 h-3" />
                                  )}
                                  <span>파일보기</span>
                                </button>
                                
                                {/* 툴팁 */}
                                {!isAuthenticated && (
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                    파일조회에는 로그인이 필요합니다
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                  </div>
                                )}
                              </div>
                              {/* 문의/요청 건수 표시 */}
                              {subjectInquiryCounts[subject.id] && subjectInquiryCounts[subject.id].inquiryCount > 0 && (
                                <span className="text-sm text-gray-600">
                                  문의/요청 : {subjectInquiryCounts[subject.id].responseCount}/{subjectInquiryCounts[subject.id].inquiryCount}
                                </span>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      
                      {/* 두 번째 줄: 주요내용 */}
                      <div className="pl-4">
                        <p className="text-[18px] text-gray-700 leading-relaxed">
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
        )}

        {/* PROGRAM(Level-based) 탭 내용 */}
        {activeMainTab === 'PROGRAM_PHASE' && (
          <section className="mb-12">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8">
                {/* PROGRAM(Phase) 리스트 */}
                <div className="space-y-4">
                  {isLoadingPrograms ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Program 목록을 불러오는 중...</p>
                    </div>
                  ) : (() => {
                    const phasePrograms = getPhasePrograms();
                    console.log('PROGRAM_PHASE 필터링 결과:', {
                      전체: programs.length,
                      필터링됨: phasePrograms.length,
                      programTypes: programs.map((p: any) => p.programType)
                    });
                    if (phasePrograms.length === 0) {
                      return (
                        <div className="text-center py-12">
                          <p className="text-gray-500">등록된 Program이 없습니다.</p>
                        </div>
                      );
                    }
                    return phasePrograms.map((program: TransformedProgram) => (
                    <div
                      key={program.id}
                      className="p-6 border border-gray-200 rounded-lg hover:border-emerald-300 hover:shadow-md transition-all duration-200"
                    >
                      {/* 첫 번째 줄: 과정코드, 과정명, PDF 파일 */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                            {program.programCode}
                          </span>
                          <div className="relative group">
                          <h4 
                              className={`text-lg font-semibold transition-colors ${
                                isAuthenticated 
                                  ? 'text-gray-900 cursor-pointer hover:text-emerald-600' 
                                  : 'text-gray-400 cursor-not-allowed'
                              }`}
                            onClick={() => {
                                if (isAuthenticated) {
                              setSelectedProgram(program);
                              setProgramDetailModalOpen(true);
                                }
                            }}
                              title={isAuthenticated ? "클릭하여 상세보기" : "로그인이 필요합니다"}
                          >
                            {program.programName}
                          </h4>
                            
                            {/* 로그인 필요 툴팁 */}
                            {!isAuthenticated && (
                              <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                로그인이 필요합니다
                                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {(program.curriculumFileName || program.curriculumPdf) && (
                            <div className="flex items-center gap-3">
                              <span className="text-gray-600">{program.curriculumFileName || program.curriculumPdf}</span>
                              <div className="relative group">
                                <button
                                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                                    isAuthenticated 
                                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  }`}
                                  onClick={() => {
                                    if (isAuthenticated && (program.curriculumFilePath || program.curriculumFileName)) {
                                      handleViewCurriculumFile(
                                        program.curriculumFileName || program.curriculumPdf || '',
                                        program.curriculumFilePath || null
                                      );
                                    }
                                  }}
                                  title={isAuthenticated ? "파일 보기" : "파일조회에는 로그인이 필요합니다"}
                                  disabled={!isAuthenticated}
                                >
                                  <FiEye className="w-3 h-3" />
                                  <span>파일보기</span>
                                </button>
                                
                                {/* 툴팁 */}
                                {!isAuthenticated && (
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                    파일조회에는 로그인이 필요합니다
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                  </div>
                                )}
                              </div>
                              {/* 문의/요청 건수 표시 */}
                              {programInquiryCounts[program.id] && programInquiryCounts[program.id].inquiryCount > 0 && (
                                <span className="text-sm text-gray-600">
                                  문의/요청 : {programInquiryCounts[program.id].responseCount}/{programInquiryCounts[program.id].inquiryCount}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 두 번째 줄: 과정목표 */}
                      <div className="pl-4 border-l-4 border-emerald-200">
                        <div className="flex items-start gap-2 mb-2">
                          <FiTarget className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm font-semibold text-gray-700">과정목표</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed pl-6 mb-4">
                          {program.programGoal}
                        </p>
                        
                        {/* 관련 Subject 목록 (쉼표로 구분) */}
                        {program.subjects && program.subjects.length > 0 && (
                          <div className="pl-6">
                            <div className="flex items-center gap-2 mb-2">
                              <FiList className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <span className="text-sm font-semibold text-gray-700">관련 Subject</span>
                            </div>
                            <div className="flex flex-wrap items-center text-sm text-gray-700 pl-6">
                              {program.subjects.map((subject: any, index: number) => (
                                <span 
                                  key={subject.id} 
                                  className={`flex items-center ${
                                    subject.curriculumFileName && subject.curriculumFilePath && isAuthenticated
                                      ? 'cursor-pointer hover:text-emerald-600 transition-colors'
                                      : subject.curriculumFileName && subject.curriculumFilePath && !isAuthenticated
                                      ? 'cursor-not-allowed text-gray-400'
                                      : ''
                                  }`}
                                  onClick={() => {
                                    if (!isAuthenticated) {
                                      alert('파일 조회에는 로그인이 필요합니다.');
                                      return;
                                    }
                                    if (subject.curriculumFileName && subject.curriculumFilePath) {
                                      handleViewCurriculumFile(subject.curriculumFileName, subject.curriculumFilePath || null);
                                    } else {
                                      alert('해당 Subject에 등록된 커리큘럼 파일이 없습니다.');
                                    }
                                  }}
                                  title={
                                    !isAuthenticated 
                                      ? '로그인이 필요합니다' 
                                      : subject.curriculumFileName && subject.curriculumFilePath 
                                      ? '클릭하여 PDF 파일 보기' 
                                      : '커리큘럼 파일이 없습니다'
                                  }
                                >
                                  <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                                    {subject.subjectCode}
                                  </span>
                                  <span className="ml-1">{subject.subjectDescription}</span>
                                  {subject.curriculumFileName && subject.curriculumFilePath && (
                                    <FiFileText className="w-3 h-3 ml-1 text-emerald-600" />
                                  )}
                                  {program.subjects && index < program.subjects.length - 1 && (
                                    <>
                                      <span className="text-gray-400">,</span>
                                      <span className="ml-3"></span>
                                    </>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PROGRAM(Topic-based) 탭 내용 */}
        {activeMainTab === 'PROGRAM_ROLE_LEVEL' && (
          <section className="mb-12">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8">
                {/* PROGRAM(Topic-based) 리스트 */}
                <div className="space-y-4">
                  {isLoadingPrograms ? (
                <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Program 목록을 불러오는 중...</p>
                </div>
                  ) : programs.filter((p: any) => p.programType === 'Topic-based').length > 0 ? (
                    programs.filter((p: any) => p.programType === 'Topic-based').map((program) => (
                    <div
                      key={program.id}
                      className="p-6 border border-gray-200 rounded-lg hover:border-emerald-300 hover:shadow-md transition-all duration-200"
                    >
                      {/* 첫 번째 줄: 과정코드, 과정명, PDF 파일 */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                            {program.programCode}
                          </span>
                          <div className="relative group">
                            <h4 
                              className={`text-lg font-semibold transition-colors ${
                                isAuthenticated 
                                  ? 'text-gray-900 cursor-pointer hover:text-emerald-600' 
                                  : 'text-gray-400 cursor-not-allowed'
                              }`}
                              onClick={() => {
                                if (isAuthenticated) {
                                  setSelectedProgram(program);
                                  setProgramDetailModalOpen(true);
                                }
                              }}
                              title={isAuthenticated ? "클릭하여 상세보기" : "로그인이 필요합니다"}
                            >
                              {program.programName}
                            </h4>
                            
                            {/* 로그인 필요 툴팁 */}
                            {!isAuthenticated && (
                              <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                로그인이 필요합니다
                                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {(program.curriculumFileName || program.curriculumPdf) && (
                            <div className="flex items-center gap-3">
                              <span className="text-gray-600">{program.curriculumFileName || program.curriculumPdf}</span>
                              <div className="relative group">
                                <button
                                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                                    isAuthenticated 
                                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  }`}
                                  onClick={() => {
                                    if (isAuthenticated && (program.curriculumFilePath || program.curriculumFileName)) {
                                      handleViewCurriculumFile(
                                        program.curriculumFileName || program.curriculumPdf || '',
                                        program.curriculumFilePath || null
                                      );
                                    }
                                  }}
                                  title={isAuthenticated ? "파일 보기" : "파일조회에는 로그인이 필요합니다"}
                                  disabled={!isAuthenticated}
                                >
                                  <FiEye className="w-3 h-3" />
                                  <span>파일보기</span>
                                </button>
                                
                                {/* 툴팁 */}
                                {!isAuthenticated && (
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                    파일조회에는 로그인이 필요합니다
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                  </div>
                                )}
                              </div>
                              {/* 문의/요청 건수 표시 */}
                              {programInquiryCounts[program.id] && programInquiryCounts[program.id].inquiryCount > 0 && (
                                <span className="text-sm text-gray-600">
                                  문의/요청 : {programInquiryCounts[program.id].responseCount}/{programInquiryCounts[program.id].inquiryCount}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 두 번째 줄: 과정목표 */}
                      <div className="pl-4 border-l-4 border-emerald-200">
                        <div className="flex items-start gap-2 mb-2">
                          <FiTarget className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm font-semibold text-gray-700">과정목표</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed pl-6 mb-4">
                          {program.programGoal}
                        </p>
                        
                        {/* 관련 Subject 목록 (쉼표로 구분) */}
                        {program.subjects && program.subjects.length > 0 && (
                          <div className="pl-6">
                            <div className="flex items-center gap-2 mb-2">
                              <FiList className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <span className="text-sm font-semibold text-gray-700">관련 Subject</span>
                            </div>
                            <div className="flex flex-wrap items-center text-sm text-gray-700 pl-6">
                              {program.subjects.map((subject: any, index: number) => (
                                <span 
                                  key={subject.id} 
                                  className={`flex items-center ${
                                    subject.curriculumFileName && subject.curriculumFilePath && isAuthenticated
                                      ? 'cursor-pointer hover:text-emerald-600 transition-colors'
                                      : subject.curriculumFileName && subject.curriculumFilePath && !isAuthenticated
                                      ? 'cursor-not-allowed text-gray-400'
                                      : ''
                                  }`}
                                  onClick={() => {
                                    if (!isAuthenticated) {
                                      alert('파일 조회에는 로그인이 필요합니다.');
                                      return;
                                    }
                                    if (subject.curriculumFileName && subject.curriculumFilePath) {
                                      handleViewCurriculumFile(subject.curriculumFileName, subject.curriculumFilePath || null);
                                    } else {
                                      alert('해당 Subject에 등록된 커리큘럼 파일이 없습니다.');
                                    }
                                  }}
                                  title={
                                    !isAuthenticated 
                                      ? '로그인이 필요합니다' 
                                      : subject.curriculumFileName && subject.curriculumFilePath 
                                      ? '클릭하여 PDF 파일 보기' 
                                      : '커리큘럼 파일이 없습니다'
                                  }
                                >
                                  <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                                    {subject.subjectCode}
                                  </span>
                                  <span className="ml-1">{subject.subjectDescription}</span>
                                  {subject.curriculumFileName && subject.curriculumFilePath && (
                                    <FiFileText className="w-3 h-3 ml-1 text-emerald-600" />
                                  )}
                                  {program.subjects && index < program.subjects.length - 1 && (
                                    <>
                                      <span className="text-gray-400">,</span>
                                      <span className="ml-3"></span>
                                    </>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">등록된 Program이 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PROGRAM(Custom-tailored) 탭 내용 */}
        {activeMainTab === 'PROGRAM_CUSTOM' && (
          <section className="mb-12">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8">
                {/* 검색 및 등록 버튼 */}
                <div className="mb-6 flex gap-3">
                  <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="고객사, 과정명, 기획자/강사, 과정소개, 비고로 검색..."
                      value={customProgramSearchTerm}
                      onChange={(e) => setCustomProgramSearchTerm(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          // 검색 실행 (실시간 필터링이므로 별도 처리 불필요)
                        }
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                    {customProgramSearchTerm && (
                      <button
                        onClick={() => setCustomProgramSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <span className="text-xl">×</span>
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      // 검색 실행 (실시간 필터링이므로 별도 처리 불필요, 또는 검색 로그 등 추가 기능 가능)
                    }}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
                  >
                    <FiSearch className="w-5 h-5" />
                    검색
                  </button>
                  {isAuthenticated && user && (user.role === 'ADMIN' || user.role === 'EXPERT') && (
                    <button
                      onClick={() => {
                        setSelectedCustomProgram(null);
                        setCustomProgramCreateModalOpen(true);
                      }}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
                    >
                      <FiPlus className="w-5 h-5" />
                      등록
                    </button>
                  )}
                </div>

                {/* Custom Program 리스트 */}
                <div className="space-y-4">
                  {isLoadingCustomPrograms ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Custom Program 목록을 불러오는 중...</p>
                    </div>
                  ) : (() => {
                    // 검색어로 필터링
                    const filteredCustomPrograms = customPrograms.filter((program) => {
                      if (!customProgramSearchTerm.trim()) {
                        return true;
                      }
                      const searchLower = customProgramSearchTerm.toLowerCase();
                      return (
                        program.customerName.toLowerCase().includes(searchLower) ||
                        program.programName.toLowerCase().includes(searchLower) ||
                        (program.plannerInstructor && program.plannerInstructor.toLowerCase().includes(searchLower)) ||
                        (program.programIntroduction && program.programIntroduction.toLowerCase().includes(searchLower)) ||
                        (program.note && program.note.toLowerCase().includes(searchLower)) ||
                        (program.keywords && program.keywords.toLowerCase().includes(searchLower))
                      );
                    });
                    
                    return filteredCustomPrograms.length > 0 ? (
                      <>
                        {customProgramSearchTerm && (
                          <div className="mb-4 text-sm text-gray-600">
                            검색 결과: <span className="font-semibold text-emerald-600">{filteredCustomPrograms.length}</span>개
                          </div>
                        )}
                        {filteredCustomPrograms.map((program) => (
                        <div
                          key={program.id}
                          className={`p-6 border border-gray-200 rounded-lg hover:border-emerald-300 hover:shadow-md transition-all duration-200 ${
                            isAuthenticated && user && (user.role === 'ADMIN' || user.role === 'EXPERT') ? 'cursor-pointer' : ''
                          }`}
                          onClick={() => handleCustomProgramClick(program)}
                        >
                          {/* 첫 번째 줄: 업체명, 과정명, 기획자/강사 */}
                          <div className="flex items-center gap-4 mb-3">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full whitespace-nowrap">
                              {program.customerName}
                            </span>
                            <h4 className={`text-lg font-semibold flex-1 ${
                              isAuthenticated && user && (user.role === 'ADMIN' || user.role === 'EXPERT')
                                ? 'text-gray-900 hover:text-emerald-600'
                                : 'text-gray-900'
                            }`}>
                              {program.programName}
                            </h4>
                            {program.plannerInstructor && (
                              <div className="flex items-center gap-2 text-gray-600 whitespace-nowrap">
                                <FiUsers className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                <span className="text-sm">{program.plannerInstructor}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* 두 번째 줄: 과정소개 */}
                          {program.programIntroduction && (
                            <div className="pl-4 border-l-4 border-emerald-200">
                              <p className="text-gray-700 leading-relaxed pl-4">
                                {program.programIntroduction}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        {customProgramSearchTerm ? (
                          <>
                            <p className="text-gray-500">검색 결과가 없습니다.</p>
                            <p className="text-sm text-gray-400 mt-2">다른 검색어를 입력해보세요.</p>
                          </>
                        ) : (
                          <>
                            <p className="text-gray-500">등록된 Custom Program이 없습니다.</p>
                            <p className="text-sm text-gray-400 mt-2">위의 "등록" 버튼을 클릭하여 추가하세요.</p>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* 파일 보기 모달 */}
      {viewModalOpen && viewingFile && (
        viewingFile.fileName.toLowerCase().endsWith('.pdf') ? (
          <LocalPDFViewer
            fileUrl={viewingFile.fileUrl}
            fileName={viewingFile.fileName}
            onClose={handleCloseViewModal}
          />
        ) : (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">파일 미리보기</h3>
              <p className="text-gray-600 mb-4">
                현재 PDF 파일만 미리보기를 지원합니다.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={handleCloseViewModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )
      )}

             {/* Program Overview 모달 */}
       <CourseOverviewModal
         isOpen={overviewModalOpen}
         onClose={() => setOverviewModalOpen(false)}
       />

       {/* Subject 추가 모달 */}
       <SubjectCreateModal
         isOpen={subjectCreateModalOpen}
         onClose={() => setSubjectCreateModalOpen(false)}
         onSuccess={handleSubjectCreateSuccess}
         categories={categories}
       />

       {/* Subject 수정 모달 */}
       <SubjectEditModal
         isOpen={subjectEditModalOpen}
         onClose={() => setSubjectEditModalOpen(false)}
         onSuccess={handleSubjectEditSuccess}
         onDelete={handleSubjectDeleteSuccess}
        onSubjectUpdate={handleSubjectUpdate}
         subject={selectedSubject}
         categories={categories}
       />

       {/* Program 상세 모달 */}
       <ProgramDetailModal
         isOpen={programDetailModalOpen}
         onClose={() => {
           setProgramDetailModalOpen(false);
           setSelectedProgram(null);
         }}
         program={selectedProgram}
         mode={selectedProgram ? 'view' : 'create'}
         onSave={async (data) => {
           try {
             const curriculumFile = data.curriculumFile;
             // curriculumFile을 제외한 데이터만 추출
             const { curriculumFile: _, ...programData } = data;
             
             if (selectedProgram?.id) {
               // 수정
               const { updateLearningProgram } = await import('@/utils/learningProgramApi');
               await updateLearningProgram(selectedProgram.id, programData, curriculumFile);
               handleProgramUpdateSuccess();
             } else {
               // 생성
               const { createLearningProgram } = await import('@/utils/learningProgramApi');
               await createLearningProgram(programData, curriculumFile);
               handleProgramCreateSuccess();
             }
             setProgramDetailModalOpen(false);
             setSelectedProgram(null);
           } catch (error: any) {
             console.error('Program 저장 실패:', error);
            console.error('에러 상세:', error?.response, error?.stack);
             const errorMessage = error?.message || 'Program 저장에 실패했습니다.';
            alert(`Program 저장에 실패했습니다.\n\n에러 메시지: ${errorMessage}\n\n자세한 내용은 브라우저 콘솔(F12)을 확인하세요.`);
           }
         }}
         onDelete={async () => {
           if (selectedProgram?.id && confirm('정말 삭제하시겠습니까?')) {
             try {
               const { deleteLearningProgram } = await import('@/utils/learningProgramApi');
               await deleteLearningProgram(selectedProgram.id);
               handleProgramDeleteSuccess();
               setProgramDetailModalOpen(false);
               setSelectedProgram(null);
             } catch (error) {
               console.error('Program 삭제 실패:', error);
               alert('Program 삭제에 실패했습니다.');
             }
           }
         }}
       />

       {/* Custom Program 추가 모달 */}
       <CustomProgramCreateModal
         isOpen={customProgramCreateModalOpen}
         onClose={() => {
           setCustomProgramCreateModalOpen(false);
           setSelectedCustomProgram(null);
         }}
         onSuccess={handleCustomProgramCreateSuccess}
       />

       {/* Custom Program 조회 모달 */}
       <CustomProgramViewModal
         isOpen={customProgramEditModalOpen}
         onClose={() => {
           setCustomProgramEditModalOpen(false);
           setSelectedCustomProgram(null);
         }}
         onSuccess={handleCustomProgramUpdateSuccess}
         onDelete={handleCustomProgramDeleteSuccess}
         program={selectedCustomProgram}
       />
       </div>
     </main>
   );
} 