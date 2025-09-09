'use client';

import { useState, useEffect } from 'react';
import { FiX, FiUpload, FiSave, FiAlertCircle, FiEye, FiFileText, FiArrowRight, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import LocalPDFViewer from '@/components/common/LocalPDFViewer';

interface SubjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDelete?: () => void;
  subject: {
    id: number;
    subjectCode: string;
    subjectDescription: string;
    subjectContent: string;
    categoryId: number;
    curriculumFilePath?: string;
    curriculumFileName?: string;
  };
  categories: Array<{
    id: number;
    codeName: string;
    codeValue: string;
    description: string;
  }>;
}

interface SubjectFormData {
  subjectCode: string;
  subjectDescription: string;
  subjectContent: string;
  categoryId: number;
  curriculumFile?: File;
  selectedPrograms: string[];
}

interface Program {
  id: string;
  name: string;
  description: string;
}

export default function SubjectEditModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  onDelete,
  subject,
  categories 
}: SubjectEditModalProps) {
  const { user, isAuthenticated } = useAuth();
  
  // 관리자 권한 확인 (ADMIN만)
  const isAdmin = isAuthenticated && user && user.role === 'ADMIN';
  const [formData, setFormData] = useState<SubjectFormData>({
    subjectCode: '',
    subjectDescription: '',
    subjectContent: '',
    categoryId: 0,
    selectedPrograms: []
  });
  
  const [curriculumFile, setCurriculumFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 파일보기 관련 상태
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<{ fileName: string; fileUrl: string } | null>(null);

  // 프로그램 목록 (예시 데이터)
  const [programs] = useState<Program[]>([
    { id: '1', name: 'MOT 기초 과정', description: '기술경영의 기초를 다지는 과정' },
    { id: '2', name: 'MOT 중급 과정', description: '기술경영의 심화 과정' },
    { id: '3', name: 'MOT 고급 과정', description: '기술경영의 전문가 과정' },
    { id: '4', name: 'R&D 관리 과정', description: 'R&D 조직 관리 전문 과정' },
    { id: '5', name: '기술사업화 과정', description: '기술을 사업화하는 과정' },
    { id: '6', name: '혁신경영 과정', description: '혁신적인 경영 방법론 과정' }
  ]);

  // subject 데이터가 변경될 때 폼 데이터 초기화
  useEffect(() => {
    if (subject) {
      console.log('=== SubjectEditModal Subject 데이터 ===');
      console.log('subject:', subject);
      console.log('curriculumFileName:', subject.curriculumFileName);
      console.log('curriculumFilePath:', subject.curriculumFilePath);
      console.log('hasFileName:', !!subject.curriculumFileName);
      console.log('hasFilePath:', !!subject.curriculumFilePath);
      console.log('isAuthenticated:', isAuthenticated);
      console.log('user:', user);
      console.log('user.role:', user?.role);
      console.log('isAdmin:', isAdmin);
      console.log('curriculumFile 상태:', curriculumFile);
      console.log('========================');
      
      setFormData({
        subjectCode: subject.subjectCode || '',
        subjectDescription: subject.subjectDescription || '',
        subjectContent: subject.subjectContent || '',
        categoryId: subject.categoryId || 0,
        selectedPrograms: []
      });
      
      // curriculumFile 상태 초기화 (새 파일 선택 취소)
      setCurriculumFile(null);
    }
  }, [subject]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.subjectCode.trim()) {
      newErrors.subjectCode = 'Subject 코드를 입력해주세요.';
    } else if (formData.subjectCode.length < 2) {
      newErrors.subjectCode = 'Subject 코드는 2자 이상이어야 합니다.';
    }

    if (!formData.subjectDescription.trim()) {
      newErrors.subjectDescription = 'Subject 설명을 입력해주세요.';
    } else if (formData.subjectDescription.length < 5) {
      newErrors.subjectDescription = 'Subject 설명은 5자 이상이어야 합니다.';
    }

    if (!formData.subjectContent.trim()) {
      newErrors.subjectContent = '주요 내용을 입력해주세요.';
    } else if (formData.subjectContent.length < 10) {
      newErrors.subjectContent = '주요 내용은 10자 이상이어야 합니다.';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = '카테고리를 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 관리자 권한 확인
    if (!isAdmin) {
      alert('관리자 권한이 필요합니다.');
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('subject', JSON.stringify({
        subjectCode: formData.subjectCode,
        subjectDescription: formData.subjectDescription,
        subjectContent: formData.subjectContent,
        categoryId: formData.categoryId
      }));

      if (curriculumFile) {
        formDataToSend.append('curriculumFile', curriculumFile);
      }

      const response = await fetch(`http://192.168.0.101:8082/api/subjects/${subject.id}/with-file`, {
        method: 'PUT',
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Subject 수정 성공:', result);
        
        // 수정 성공 alert 표시
        alert('Subject가 성공적으로 수정되었습니다.');
        
        // 성공 콜백 호출
        onSuccess();
        onClose();
      } else {
        const errorData = await response.text();
        console.error('Subject 수정 실패:', response.status, errorData);
        setErrors({ submit: `Subject 수정에 실패했습니다: ${errorData}` });
      }
    } catch (error) {
      console.error('Subject 수정 중 오류:', error);
      setErrors({ submit: 'Subject 수정 중 오류가 발생했습니다.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    // 관리자 권한 확인
    if (!isAdmin) {
      alert('관리자 권한이 필요합니다.');
      return;
    }
    
    if (!confirm(`"${subject.subjectDescription}" Subject를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      const response = await fetch(`http://192.168.0.101:8082/api/subjects/${subject.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Subject가 성공적으로 삭제되었습니다.');
        onDelete?.();
        onClose();
      } else {
        const errorData = await response.text();
        console.error('Subject 삭제 실패:', response.status, errorData);
        alert(`Subject 삭제에 실패했습니다: ${errorData}`);
      }
    } catch (error) {
      console.error('Subject 삭제 중 오류:', error);
      alert('Subject 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 관리자 권한 확인
    if (!isAdmin) {
      alert('관리자 권한이 필요합니다.');
      return;
    }
    
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ curriculumFile: '파일 크기는 10MB 이하여야 합니다.' });
        return;
      }
      
      // 파일 형식 제한 (PDF, DOC, DOCX, PPT, PPTX)
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setErrors({ curriculumFile: 'PDF, DOC, DOCX, PPT, PPTX 파일만 업로드 가능합니다.' });
        return;
      }
      
      setCurriculumFile(file);
      setErrors({ ...errors, curriculumFile: '' });
    }
  };

  // 파일보기 처리
  const handleViewCurriculumFile = async (fileName: string, filePath: string | null) => {
    if (!isAuthenticated) {
      alert('파일 조회에는 로그인이 필요합니다.');
      return;
    }
    
    if (!filePath) {
      alert('파일 경로 정보가 없습니다.');
      return;
    }
    
    try {
      const encodedPath = encodeURIComponent(filePath.trim()).replace(/[!'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16);
      });
      
      const fileUrl = `http://192.168.0.101:8082/api/library/view/${encodedPath}`;
      
      setViewingFile({ fileName, fileUrl });
      setViewModalOpen(true);
    } catch (error) {
      console.error('파일 경로 처리 중 오류:', error);
      alert('파일 경로 처리 중 오류가 발생했습니다.');
    }
  };

  // 파일보기 모달 닫기
  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setViewingFile(null);
  };

  const handleInputChange = (field: keyof SubjectFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 프로그램 선택/해제
  const handleProgramToggle = (programId: string) => {
    // 관리자 권한 확인
    if (!isAdmin) {
      alert('관리자 권한이 필요합니다.');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      selectedPrograms: prev.selectedPrograms.includes(programId)
        ? prev.selectedPrograms.filter(id => id !== programId)
        : [...prev.selectedPrograms, programId]
    }));
  };

  console.log('=== SubjectEditModal 렌더링 ===');
  console.log('isOpen:', isOpen);
  console.log('subject:', subject);
  console.log('subjectEditModalOpen 상태:', isOpen);
  console.log('========================');
  
  if (!isOpen) {
    console.log('SubjectEditModal이 닫혀있음 - 렌더링하지 않음');
    return null;
  }
  
  console.log('SubjectEditModal이 열림 - 렌더링 시작');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Subject {isAdmin ? '수정' : '조회'}
            </h2>
            {!isAdmin && (
              <p className="text-sm text-red-500 mt-1">
                관리자 권한이 필요합니다. 수정 및 삭제는 관리자만 가능합니다.
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FiArrowRight className="w-4 h-4" />
            목록으로 돌아가기
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 카테고리와 Subject 코드 (한 라인) */}
          <div className="grid grid-cols-2 gap-4">
            {/* 카테고리 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', Number(e.target.value))}
                disabled={!isAdmin}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.categoryId ? 'border-red-500' : 'border-gray-300'
                } ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">카테고리를 선택하세요</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.codeName}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  {errors.categoryId}
                </p>
              )}
            </div>

            {/* Subject 코드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject 코드 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subjectCode}
                onChange={(e) => handleInputChange('subjectCode', e.target.value)}
                disabled={!isAdmin}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.subjectCode ? 'border-red-500' : 'border-gray-300'
                } ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="예: A-10, B-20"
              />
              {errors.subjectCode && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  {errors.subjectCode}
                </p>
              )}
            </div>
          </div>

          {/* Subject 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject 설명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subjectDescription}
              onChange={(e) => handleInputChange('subjectDescription', e.target.value)}
              disabled={!isAdmin}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                errors.subjectDescription ? 'border-red-500' : 'border-gray-300'
              } ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Subject에 대한 간단한 설명을 입력하세요"
            />
            {errors.subjectDescription && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <FiAlertCircle className="w-4 h-4" />
                {errors.subjectDescription}
              </p>
            )}
          </div>

          {/* 주요 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주요 내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.subjectContent}
              onChange={(e) => handleInputChange('subjectContent', e.target.value)}
              disabled={!isAdmin}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                errors.subjectContent ? 'border-red-500' : 'border-gray-300'
              } ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Subject의 주요 내용을 상세히 입력하세요"
            />
            {errors.subjectContent && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <FiAlertCircle className="w-4 h-4" />
                {errors.subjectContent}
              </p>
            )}
          </div>

          {/* 커리큘럼 파일 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              커리큘럼 파일
            </label>
            <div className="flex items-center gap-4">
              <label className={`flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg transition-colors ${
                isAdmin ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed bg-gray-100'
              }`}>
                <FiUpload className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">파일 선택</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  disabled={!isAdmin}
                  className="hidden"
                />
              </label>
              
              {/* 새로 선택된 파일 */}
              {curriculumFile && (
                <span className="text-sm text-gray-600">
                  새 파일: {curriculumFile.name}
                </span>
              )}
              
              {/* 기존 파일 */}
              {!curriculumFile && subject.curriculumFileName && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    현재: {subject.curriculumFileName}
                  </span>
                  {subject.curriculumFilePath ? (
                    isAuthenticated ? (
                      <button
                        type="button"
                        onClick={() => handleViewCurriculumFile(subject.curriculumFileName || '', subject.curriculumFilePath)}
                        className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors border border-emerald-200"
                        title="파일 보기"
                      >
                        {subject.curriculumFileName?.toLowerCase().endsWith('.pdf') ? (
                          <FiEye className="w-3 h-3" />
                        ) : (
                          <FiFileText className="w-3 h-3" />
                        )}
                        <span>파일보기</span>
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">(로그인 필요)</span>
                    )
                  ) : (
                    <span className="text-xs text-gray-400">(파일 경로 없음)</span>
                  )}
                </div>
              )}
              
              {/* 파일이 없는 경우 */}
              {!curriculumFile && !subject.curriculumFileName && (
                <span className="text-sm text-gray-400">파일 없음</span>
              )}
            </div>
            {errors.curriculumFile && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <FiAlertCircle className="w-4 h-4" />
                {errors.curriculumFile}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              PDF, DOC, DOCX, PPT, PPTX 파일만 업로드 가능합니다. (최대 10MB)
            </p>
          </div>

          {/* 프로그램 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관련 프로그램 (2개 이상 선택 권장)
            </label>
            
            {/* 프로그램 선택 드롭다운 */}
            <div className="flex gap-3 mb-3">
              <select
                onChange={(e) => {
                  const selectedId = e.target.value;
                  if (selectedId && !formData.selectedPrograms.includes(selectedId)) {
                    handleProgramToggle(selectedId);
                    e.target.value = ''; // 선택 후 드롭다운 초기화
                  }
                }}
                disabled={!isAdmin}
                className={`flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  !isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="">프로그램을 선택하세요</option>
                {programs
                  .filter(program => !formData.selectedPrograms.includes(program.id))
                  .map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const select = document.querySelector('select') as HTMLSelectElement;
                  if (select && select.value) {
                    handleProgramToggle(select.value);
                    select.value = '';
                  }
                }}
                disabled={!isAdmin}
                className={`px-4 py-3 text-white rounded-lg font-medium transition-colors whitespace-nowrap ${
                  isAdmin ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                추가
              </button>
            </div>

            {/* 선택된 프로그램 리스트 */}
            {formData.selectedPrograms.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50 min-h-[60px]">
                {formData.selectedPrograms.map((programId) => {
                  const program = programs.find(p => p.id === programId);
                  if (!program) return null;
                  
                  return (
                    <div
                      key={program.id}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                    >
                      <span className="font-medium text-gray-900">
                        {program.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleProgramToggle(program.id)}
                        disabled={!isAdmin}
                        className={`rounded-full p-1 transition-colors ${
                          isAdmin ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : 'text-gray-400 cursor-not-allowed'
                        }`}
                        title={isAdmin ? "제거" : "관리자만 제거 가능"}
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50 min-h-[60px] flex items-center justify-center">
                <p className="text-sm">위의 드롭다운에서 프로그램을 선택하고 추가해주세요.</p>
              </div>
            )}
            
            <p className="mt-2 text-sm text-gray-500">
              현재 {formData.selectedPrograms.length}개 프로그램이 선택되었습니다.
            </p>
          </div>

          {/* 전체 에러 메시지 */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <FiAlertCircle className="w-5 h-5" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex items-center justify-between pt-4">
            {/* 삭제 버튼 (관리자만) */}
            {isAdmin && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <FiTrash2 className="w-4 h-4" />
                Subject 삭제
              </button>
            )}
            
            {/* 오른쪽 버튼들 */}
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                {isAdmin ? '취소' : '닫기'}
              </button>
              {isAdmin && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      수정 중...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      Subject 수정
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
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
    </div>
  );
}
