'use client';

import { useState, useEffect } from 'react';
import { FiX, FiSave, FiEdit2, FiTarget, FiFileText, FiList, FiTrash2, FiUpload, FiDownload, FiMessageSquare, FiSearch } from 'react-icons/fi';
import LocalPDFViewer from '@/components/common/LocalPDFViewer';
import InquiryListModal from '@/components/inquiries/InquiryListModal';
import { getApiUrl } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import KeywordSelectorModal from '@/components/common/KeywordSelectorModal';

interface Subject {
  id: number;
  subjectCode: string;
  subjectDescription: string;
  curriculumFileName?: string;
  curriculumFilePath?: string;
}

interface ProgramDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  program?: {
    id?: number;
    programCode: string;
    programName: string;
    programType?: string;
    programGoal: string;
    mainContent: string;
    curriculumPdf?: string;
    curriculumFileName?: string;
    curriculumFilePath?: string;
    subjects?: Subject[];
  } | null;
  mode?: 'view' | 'create' | 'edit';
  onSave?: (data: any) => void;
  onDelete?: () => void;
}

export default function ProgramDetailModal({
  isOpen,
  onClose,
  program,
  mode = 'view',
  onSave,
  onDelete
}: ProgramDetailModalProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  
  const [formData, setFormData] = useState({
    programCode: '',
    programName: '',
    programType: 'Level-based',
    programGoal: '',
    mainContent: '',
    keywords: '',
    curriculumPdf: '',
    selectedSubjects: [] as number[]
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [relatedSubjects, setRelatedSubjects] = useState<Subject[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [viewingPdf, setViewingPdf] = useState<{ fileName: string; filePath: string } | null>(null);
  const [curriculumFile, setCurriculumFile] = useState<File | null>(null);
  const [existingFileName, setExistingFileName] = useState<string>('');
  const [existingFilePath, setExistingFilePath] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 문의/요청 이력 모달 상태
  const [inquiryListModalOpen, setInquiryListModalOpen] = useState(false);
  const [showKeywordModal, setShowKeywordModal] = useState(false);

  // Subject 목록 가져오기
  useEffect(() => {
    if (isOpen && (isEditMode || mode === 'create')) {
      fetchAvailableSubjects();
    }
  }, [isOpen, isEditMode, mode]);

  useEffect(() => {
    // 모달이 열릴 때만 초기화
    if (!isOpen) return;
    
    if (program) {
      setFormData({
        programCode: program.programCode || '',
        programName: program.programName || '',
        programType: program.programType || 'Level-based',
        programGoal: program.programGoal || '',
        mainContent: program.mainContent || '',
        keywords: (program as any).keywords || '',
        curriculumPdf: program.curriculumPdf || '',
        selectedSubjects: program.subjects?.map(s => s.id) || []
      });
      // 기존 파일 정보 설정
      if (program.curriculumFilePath) {
        setExistingFilePath(program.curriculumFilePath);
        setExistingFileName(program.curriculumFileName || program.curriculumFilePath.split('/').pop() || '');
      } else if (program.curriculumPdf) {
        setExistingFilePath(program.curriculumPdf);
        setExistingFileName(program.curriculumPdf.split('/').pop() || '');
      } else {
        setExistingFilePath('');
        setExistingFileName('');
      }
      // 관련 Subject 변환
      const transformedSubjects = program.subjects?.map((s: any) => ({
        id: s.id,
        subjectCode: s.subjectCode || s.code,
        subjectDescription: s.subjectDescription || s.description,
        curriculumFileName: s.curriculumFileName,
        curriculumFilePath: s.curriculumFilePath
      })) || [];
      // subject code 순서로 정렬
      const sortedSubjects = transformedSubjects.sort((a: Subject, b: Subject) => 
        a.subjectCode.localeCompare(b.subjectCode)
      );
      setRelatedSubjects(sortedSubjects);
      setIsEditMode(mode === 'edit');
    } else {
      // 새로 생성하는 경우 - 빈 폼으로 초기화
      setFormData({
        programCode: '',
        programName: '',
        programType: 'Level-based',
        programGoal: '',
        mainContent: '',
        keywords: '',
        curriculumPdf: '',
        selectedSubjects: []
      });
      setRelatedSubjects([]);
      setIsEditMode(mode === 'create');
      setCurriculumFile(null);
      setExistingFileName('');
      setExistingFilePath('');
    }
  }, [isOpen, program, mode]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectToggle = (subjectId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subjectId)
        ? prev.selectedSubjects.filter(id => id !== subjectId)
        : [...prev.selectedSubjects, subjectId]
    }));
  };

  const handleSave = () => {
    // 필수 필드 검증
    if (!formData.programCode || formData.programCode.trim() === '') {
      alert('과정코드는 필수입니다.');
      return;
    }
    if (!formData.programName || formData.programName.trim() === '') {
      alert('과정명은 필수입니다.');
      return;
    }
    
    if (onSave) {
      // API 형식에 맞게 데이터 변환
      const saveData = {
        code: formData.programCode.trim(),
        description: formData.programName.trim(),
        programType: formData.programType,
        programGoal: formData.programGoal,
        mainContent: formData.mainContent,
        keywords: formData.keywords,
        curriculumFileName: existingFileName || (formData.curriculumPdf ? formData.curriculumPdf.split('/').pop() : undefined),
        curriculumFilePath: existingFilePath || formData.curriculumPdf || undefined,
        subjectIds: formData.selectedSubjects,
        curriculumFile: curriculumFile || undefined
      };
      onSave(saveData);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSubjectClick = (subject: Subject) => {
    if (subject.curriculumFileName && subject.curriculumFilePath) {
      // 파일 경로를 URL로 변환 (리스트 박스와 동일한 방식)
      try {
        const encodedPath = encodeURIComponent(subject.curriculumFilePath.trim());
        // getApiUrl 사용하지 않고 상대 경로 사용 (리스트 박스와 동일)
        const fileUrl = `/api/library/view?path=${encodedPath}`;
        
        console.log('=== Subject 파일 보기 디버깅 ===');
        console.log('원본 fileName:', subject.curriculumFileName);
        console.log('원본 filePath:', subject.curriculumFilePath);
        console.log('인코딩된 filePath:', encodedPath);
        console.log('생성된 fileUrl:', fileUrl);
        console.log('========================');
        
        setViewingPdf({
          fileName: subject.curriculumFileName,
          filePath: fileUrl // URL로 변환된 경로 사용
        });
        setPdfViewerOpen(true);
      } catch (error) {
        console.error('파일 경로 처리 중 오류:', error);
        alert('파일 경로 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ curriculumFile: '파일 크기는 10MB 이하여야 합니다.' });
        return;
      }
      
      // 파일 형식 제한 (PDF만) - MIME 타입과 확장자 모두 확인
      const fileName = file.name.toLowerCase();
      const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
      const isValidPdfType = file.type === 'application/pdf' || file.type === '';
      const isValidPdfExtension = fileExtension === '.pdf';
      
      if (!isValidPdfType && !isValidPdfExtension) {
        setErrors({ curriculumFile: 'PDF 파일만 업로드 가능합니다.' });
        return;
      }
      
      // 확장자가 .pdf가 아니면 에러
      if (!isValidPdfExtension) {
        setErrors({ curriculumFile: 'PDF 파일만 업로드 가능합니다.' });
        return;
      }
      
      setCurriculumFile(file);
      setErrors({ ...errors, curriculumFile: '' });
    }
  };

  const handleDeleteFile = () => {
    setCurriculumFile(null);
    setErrors({ ...errors, curriculumFile: '' });
  };

  // 기존 파일 삭제 핸들러
  const handleDeleteExistingFile = () => {
    if (confirm('기존 파일을 삭제하시겠습니까? 새 파일을 선택하지 않으면 파일이 제거됩니다.')) {
      setExistingFilePath('');
      setExistingFileName('');
    }
  };

  const handleViewFile = () => {
    if (existingFilePath) {
      // 파일 경로를 URL로 변환 (리스트 박스와 동일한 방식)
      try {
        const encodedPath = encodeURIComponent(existingFilePath.trim());
        // getApiUrl 사용하지 않고 상대 경로 사용 (리스트 박스와 동일)
        const fileUrl = `/api/library/view?path=${encodedPath}`;
        
        console.log('=== 프로그램 파일 보기 디버깅 ===');
        console.log('원본 fileName:', existingFileName);
        console.log('원본 filePath:', existingFilePath);
        console.log('인코딩된 filePath:', encodedPath);
        console.log('생성된 fileUrl:', fileUrl);
        console.log('========================');
        
        setViewingPdf({
          fileName: existingFileName || '프로그램 파일',
          filePath: fileUrl // URL로 변환된 경로 사용
        });
        setPdfViewerOpen(true);
      } catch (error) {
        console.error('파일 경로 처리 중 오류:', error);
        alert('파일 경로 처리 중 오류가 발생했습니다.');
      }
    }
  };

  // 사용 가능한 Subject 목록 가져오기
  const fetchAvailableSubjects = async () => {
    try {
      setIsLoadingSubjects(true);
      const response = await fetch(getApiUrl('/api/subjects'));
      if (response.ok) {
        const data = await response.json();
        const transformedSubjects = data.map((subject: any) => ({
          id: subject.id,
          subjectCode: subject.subjectCode,
          subjectDescription: subject.subjectDescription,
          curriculumFileName: subject.curriculumFileName,
          curriculumFilePath: subject.curriculumFilePath
        }));
        // subject code 순서로 정렬
        const sortedSubjects = transformedSubjects.sort((a: Subject, b: Subject) => 
          a.subjectCode.localeCompare(b.subjectCode)
        );
        setAvailableSubjects(sortedSubjects);
      }
    } catch (error) {
      console.error('Subject 목록 조회 실패:', error);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  if (!isOpen) return null;

  const isViewMode = !isEditMode && mode === 'view';
  const modalTitle = mode === 'create' ? 'Program 추가' : mode === 'edit' ? 'Program 수정' : 'Program 상세';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-emerald-50">
          <h2 className="text-2xl font-bold text-gray-900">{modalTitle}</h2>
          <div className="flex items-center gap-2">
            {/* Program 관련 문의/요청 버튼 */}
            {isViewMode && program?.id && user && (
              <button
                onClick={() => setInquiryListModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FiMessageSquare className="w-4 h-4 mr-2" />
                Program 관련 문의/요청
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="닫기"
            >
              <FiX className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* 과정명 (과정코드 + 과정명 + Program 종류) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                과정명
              </label>
              {isViewMode ? (
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    {formData.programType && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {formData.programType}
                      </span>
                    )}
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                      {formData.programCode}
                    </span>
                    <span className="text-lg font-semibold text-gray-900">{formData.programName}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <select
                      value={formData.programType}
                      onChange={(e) => handleInputChange('programType', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white flex-shrink-0"
                      style={{ width: '17%' }}
                    >
                      <option value="Level-based">Level-based</option>
                      <option value="Topic-based">Topic-based</option>
                    </select>
                    <input
                      type="text"
                      value={formData.programCode}
                      onChange={(e) => handleInputChange('programCode', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 flex-shrink-0"
                      style={{ width: '12%' }}
                      placeholder="과정코드를 입력하세요 (예: L-10)"
                    />
                    <input
                      type="text"
                      value={formData.programName}
                      onChange={(e) => handleInputChange('programName', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 flex-1"
                      placeholder="과정명을 입력하세요"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 관련 파일 등록 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiFileText className="w-4 h-4 text-emerald-600" />
                관련 파일
              </label>
              {isViewMode ? (
                existingFilePath ? (
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FiFileText className="w-5 h-5 text-emerald-600" />
                      <span className="text-gray-700">{existingFileName || '프로그램 파일'}</span>
                    </div>
                    <button
                      onClick={handleViewFile}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 text-sm rounded-md hover:bg-emerald-200 transition-colors"
                    >
                      <FiDownload className="w-4 h-4" />
                      파일보기
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm">
                    등록된 파일이 없습니다.
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  {/* 기존 파일 표시 */}
                  {existingFilePath && (
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <FiFileText className="w-5 h-5 text-emerald-600" />
                          <span className="text-gray-700 font-medium">기존 파일</span>
                        </div>
                        <button
                          onClick={handleDeleteExistingFile}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="기존 파일 삭제"
                        >
                          <FiTrash2 className="w-3 h-3" />
                          삭제
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{existingFileName || '프로그램 파일'}</span>
                        <button
                          onClick={handleViewFile}
                          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm rounded-md hover:bg-emerald-200 transition-colors"
                        >
                          <FiDownload className="w-4 h-4" />
                          파일보기
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* 새 파일 선택 */}
                  <div className="flex items-center gap-3">
                    <label className={`flex items-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${
                      curriculumFile 
                        ? 'border-emerald-300 bg-emerald-50' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}>
                      <FiUpload className={`w-5 h-5 ${curriculumFile ? 'text-emerald-600' : 'text-gray-500'}`} />
                      <span className={curriculumFile ? 'text-emerald-700 font-medium' : 'text-gray-700'}>
                        {curriculumFile ? '파일 변경' : existingFilePath ? '파일 재등록' : '파일 선택'}
                      </span>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf"
                        className="hidden"
                      />
                    </label>
                    {curriculumFile && (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm text-gray-600">새 파일: {curriculumFile.name}</span>
                        <button
                          onClick={handleDeleteFile}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          취소
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* 에러 메시지 */}
                  {errors.curriculumFile && (
                    <p className="text-sm text-red-600">{errors.curriculumFile}</p>
                  )}
                  
                  {/* 안내 문구 */}
                  <p className="text-xs text-gray-500">
                    PDF 파일만 업로드 가능합니다. (최대 10MB)
                  </p>
                </div>
              )}
            </div>

            {/* 과정목표 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiTarget className="w-4 h-4 text-emerald-600" />
                과정목표
              </label>
              {isViewMode ? (
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{formData.programGoal}</p>
                </div>
              ) : (
                <textarea
                  value={formData.programGoal}
                  onChange={(e) => handleInputChange('programGoal', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  placeholder="과정목표를 입력하세요"
                />
              )}
            </div>

            {/* 주요내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주요내용
              </label>
              {isViewMode ? (
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {formData.mainContent || '주요내용이 없습니다.'}
                  </p>
                </div>
              ) : (
                <textarea
                  value={formData.mainContent}
                  onChange={(e) => handleInputChange('mainContent', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  placeholder="주요내용을 입력하세요"
                />
              )}
            </div>

            {/* 키워드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiFileText className="w-4 h-4 text-emerald-600" />
                키워드
              </label>
              {isViewMode ? (
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                  {formData.keywords || '키워드가 없습니다.'}
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => handleInputChange('keywords', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="쉼표(,)로 구분하여 키워드를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeywordModal(true)}
                    className="inline-flex items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    <FiSearch className="w-4 h-4 mr-2" />
                    키워드 조회
                  </button>
                </div>
              )}
            </div>

            {/* 관련 Subject List */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <FiList className="w-4 h-4 text-emerald-600" />
                관련 Subject 목록
              </label>
              
              {isViewMode ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {relatedSubjects.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-4 p-4" style={{ rowGap: '0.175rem' }}>
                      {relatedSubjects.map((subject) => (
                        <div 
                          key={subject.id} 
                          className={`p-3 transition-colors rounded-lg bg-gray-50 border border-gray-100 ${
                            subject.curriculumFileName && subject.curriculumFilePath
                              ? 'hover:bg-emerald-50 hover:border-emerald-200 cursor-pointer'
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={() => handleSubjectClick(subject)}
                          title={subject.curriculumFileName ? '클릭하여 PDF 파일 보기' : ''}
                        >
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                              {subject.subjectCode}
                            </span>
                            <span className={`font-medium flex-1 ${
                              subject.curriculumFileName && subject.curriculumFilePath
                                ? 'text-emerald-700 hover:text-emerald-800'
                                : 'text-gray-900'
                            }`}>
                              {subject.subjectDescription}
                            </span>
                            {subject.curriculumFileName && (
                              <FiFileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      관련 Subject가 없습니다.
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {isLoadingSubjects ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Subject 목록을 불러오는 중...</p>
                    </div>
                  ) : availableSubjects.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-4" style={{ rowGap: '0.175rem' }}>
                      {availableSubjects.map((subject) => (
                        <label
                          key={subject.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:border-gray-200 rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedSubjects.includes(subject.id)}
                            onChange={() => handleSubjectToggle(subject.id)}
                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                          />
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                            {subject.subjectCode}
                          </span>
                          <span className="text-gray-900 flex-1 truncate">{subject.subjectDescription}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      사용 가능한 Subject가 없습니다.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            {isViewMode && onDelete && isAdmin && (
              <button
                onClick={onDelete}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
                삭제
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isViewMode ? (
              <>
                {isAdmin && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    수정
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  닫기
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <FiSave className="w-4 h-4" />
                  저장
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {pdfViewerOpen && viewingPdf && (
        <LocalPDFViewer
          onClose={() => {
            setPdfViewerOpen(false);
            setViewingPdf(null);
          }}
          fileName={viewingPdf.fileName}
          fileUrl={viewingPdf.filePath}
        />
      )}

      {/* 문의/요청 이력 모달 */}
      {inquiryListModalOpen && program?.id && user && (
        <InquiryListModal
          isOpen={inquiryListModalOpen}
          onClose={() => setInquiryListModalOpen(false)}
          refTable="learning_programs"
          refId={program.id}
          refTitle={program.programName}
          userEmail={user.email}
        />
      )}

      {/* 키워드 선택 모달 */}
      <KeywordSelectorModal
        isOpen={showKeywordModal}
        onClose={() => setShowKeywordModal(false)}
        menuType="Learning"
        currentKeywords={formData.keywords}
        onSelectKeywords={(selectedKeywords) => handleInputChange('keywords', selectedKeywords)}
      />
    </div>
  );
}

