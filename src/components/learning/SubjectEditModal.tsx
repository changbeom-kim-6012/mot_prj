'use client';

import { useState, useEffect } from 'react';
import { FiX, FiUpload, FiSave, FiAlertCircle, FiEye, FiFileText, FiArrowRight, FiTrash2, FiMessageSquare, FiSearch } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import LocalPDFViewer from '@/components/common/LocalPDFViewer';
import InquiryListModal from '@/components/inquiries/InquiryListModal';
import { getApiUrl } from '@/config/api';
import KeywordSelectorModal from '@/components/common/KeywordSelectorModal';

interface SubjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDelete?: () => void;
  onSubjectUpdate?: (updatedSubject: any) => void;
  subject: {
    id: number;
    subjectCode: string;
    subjectDescription: string;
    subjectContent: string;
    categoryId: number;
    curriculumFilePath?: string;
    curriculumFileName?: string;
    createdBy?: string;
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
  keywords: string;
  curriculumFile?: File;
}

export default function SubjectEditModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  onDelete,
  onSubjectUpdate,
  subject,
  categories 
}: SubjectEditModalProps) {
  const { user, isAuthenticated } = useAuth();
  
  // 관리자 권한 확인 (ADMIN만)
  const isAdmin = isAuthenticated && user && user.role === 'ADMIN';
  
  // 파일 선택 권한 확인 (관리자, 전문가, 또는 파일 등록자)
  const canEditFile = isAuthenticated && user && (
    user.role === 'ADMIN' || 
    user.role === 'EXPERT' || 
    (subject && subject.createdBy && user.email === subject.createdBy)
  );
  const [formData, setFormData] = useState<SubjectFormData>({
    subjectCode: '',
    subjectDescription: '',
    subjectContent: '',
    categoryId: 0,
    keywords: ''
  });
  
  const [curriculumFile, setCurriculumFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // 파일보기 관련 상태
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<{ fileName: string; fileUrl: string } | null>(null);

  // 문의/요청 이력 모달 상태
  const [inquiryListModalOpen, setInquiryListModalOpen] = useState(false);
  const [showKeywordModal, setShowKeywordModal] = useState(false);

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
      console.log('Subject.relatedProgramList:', (subject as any).relatedProgramList);
      console.log('user.role:', user?.role);
      console.log('isAdmin:', isAdmin);
      console.log('canEditFile:', canEditFile);
      console.log('subject.createdBy:', subject.createdBy);
      console.log('user.email:', user?.email);
      console.log('curriculumFile 상태:', curriculumFile);
      console.log('========================');
      
      setFormData({
        subjectCode: subject.subjectCode || '',
        subjectDescription: subject.subjectDescription || '',
        subjectContent: subject.subjectContent || '',
        categoryId: subject.categoryId || 0,
        keywords: (subject as any).keywords || ''
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
      console.log('=== Subject 수정 데이터 ===');
      console.log('전체 formData:', formData);
      
      const formDataToSend = new FormData();
      
      // 서버로 전송할 subject 데이터 구성
      const subjectData = {
        subjectCode: formData.subjectCode,
        subjectDescription: formData.subjectDescription,
        subjectContent: formData.subjectContent,
        categoryId: formData.categoryId,
        keywords: formData.keywords
      };
      
      formDataToSend.append('subject', JSON.stringify(subjectData));
      
      console.log('전송할 subject 데이터:', JSON.stringify(subjectData));
      console.log('subjectData 객체:', subjectData);

      if (curriculumFile) {
        formDataToSend.append('curriculumFile', curriculumFile);
      }

      const response = await fetch(getApiUrl(`/api/subjects/${subject.id}/with-file`), {
        method: 'PUT',
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Subject 수정 성공:', result);
        console.log('반환된 파일 정보:', {
          curriculumFileName: result.curriculumFileName,
          curriculumFilePath: result.curriculumFilePath
        });
        
        // 수정 성공 alert 표시
        alert('Subject가 성공적으로 수정되었습니다.');
        
        // 업데이트된 Subject 데이터를 부모 컴포넌트에 전달
        if (onSubjectUpdate) {
          onSubjectUpdate(result);
        }
        
        // 목록 새로고침 (선택적)
        onSuccess();
        
        // 모달은 열어둠 (onClose 호출하지 않음)
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
      const response = await fetch(getApiUrl(`/api/subjects/${subject.id}`), {
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

  // 기존 파일 삭제 핸들러
  const handleDeleteExistingFile = async () => {
    // 관리자 권한 확인
    if (!isAdmin) {
      alert('관리자 권한이 필요합니다.');
      return;
    }
    
    if (!subject.curriculumFileName || subject.curriculumFileName === '[NULL]') {
      alert('삭제할 파일이 없습니다.');
      return;
    }
    
    if (!confirm(`"${subject.curriculumFileName}" 파일을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/subjects/${subject.id}/curriculum-file`), {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('커리큘럼 파일이 성공적으로 삭제되었습니다.');
        
        // Subject 데이터를 다시 불러와서 업데이트
        try {
          const subjectResponse = await fetch(getApiUrl(`/api/subjects/${subject.id}`));
          if (subjectResponse.ok) {
            const updatedSubject = await subjectResponse.json();
            // 부모 컴포넌트에 업데이트된 subject 전달
            if (onSubjectUpdate) {
              onSubjectUpdate(updatedSubject);
            }
            // 목록 새로고침 (선택적)
            onSuccess();
          } else {
            console.error('Subject 데이터 재조회 실패:', subjectResponse.status);
            // 재조회 실패해도 목록은 새로고침
            onSuccess();
          }
        } catch (error) {
          console.error('Subject 데이터 재조회 중 오류:', error);
          // 재조회 실패해도 목록은 새로고침
          onSuccess();
        }
      } else {
        const errorData = await response.text();
        console.error('파일 삭제 실패:', response.status, errorData);
        alert(`파일 삭제에 실패했습니다: ${errorData}`);
      }
    } catch (error) {
      console.error('파일 삭제 중 오류:', error);
      alert('파일 삭제 중 오류가 발생했습니다.');
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
      // 쿼리 파라미터 방식으로 파일 경로 처리 (긴 경로나 특수문자 처리에 유리)
      const encodedPath = encodeURIComponent(filePath.trim());
      const fileUrl = getApiUrl(`/api/library/view?path=${encodedPath}`);
      
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

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Subject 상세
            </h2>
            {/* {!isAdmin && (
              <p className="text-sm text-red-500 mt-1">
                관리자 권한이 필요합니다. 수정 및 삭제는 관리자만 가능합니다.
              </p>
            )} */}
          </div>
          <div className="flex items-center gap-2">
            {/* Subject 관련 문의/요청 버튼 */}
            {isAuthenticated && user && (
              <button
                onClick={() => setInquiryListModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FiMessageSquare className="w-4 h-4 mr-2" />
                Subject 관련 문의/요청
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
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

          {/* 키워드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              키워드
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                disabled={!isAdmin}
                className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.keywords ? 'border-red-500' : 'border-gray-300'
                } ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="쉼표(,)로 구분하여 키워드를 입력하세요"
              />
              <button
                type="button"
                onClick={() => setShowKeywordModal(true)}
                disabled={!isAdmin}
                className={`inline-flex items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg ${
                  isAdmin
                    ? 'text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
              >
                <FiSearch className="w-4 h-4 mr-2" />
                키워드 조회
              </button>
            </div>
            {errors.keywords && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <FiAlertCircle className="w-4 h-4" />
                {errors.keywords}
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
                canEditFile ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed bg-gray-100'
              }`}>
                <FiUpload className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">파일 선택</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf"
                  disabled={!canEditFile}
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
              {!curriculumFile && subject.curriculumFileName && subject.curriculumFileName !== '[NULL]' && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    현재: {subject.curriculumFileName}
                  </span>
                  {subject.curriculumFilePath ? (
                    isAuthenticated ? (
                      <button
                        type="button"
                        onClick={() => handleViewCurriculumFile(subject.curriculumFileName || '', subject.curriculumFilePath || null)}
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
                  {canEditFile && (
                    <button
                      type="button"
                      onClick={handleDeleteExistingFile}
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors border border-red-200"
                      title="파일 삭제"
                    >
                      <FiTrash2 className="w-3 h-3" />
                      <span>파일 삭제</span>
                    </button>
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
              PDF 파일만 업로드 가능합니다. (최대 10MB)
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

      {/* 문의/요청 이력 모달 */}
      {inquiryListModalOpen && subject && user && (
        <InquiryListModal
          isOpen={inquiryListModalOpen}
          onClose={() => setInquiryListModalOpen(false)}
          refTable="learning_subjects"
          refId={subject.id}
          refTitle={subject.subjectDescription}
          userEmail={user.email}
        />
      )}

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
