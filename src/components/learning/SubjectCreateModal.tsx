'use client';

import { useState, useEffect } from 'react';
import { FiX, FiUpload, FiSave, FiAlertCircle } from 'react-icons/fi';
import { getApiUrl } from '@/config/api';

interface SubjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
}

export default function SubjectCreateModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  categories 
}: SubjectCreateModalProps) {
  const [formData, setFormData] = useState<SubjectFormData>({
    subjectCode: '',
    subjectDescription: '',
    subjectContent: '',
    categoryId: categories.length > 0 ? categories[0].id : 0
  });
  
  const [curriculumFile, setCurriculumFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 카테고리가 변경될 때 기본값 설정
  useEffect(() => {
    if (categories.length > 0 && !formData.categoryId) {
      setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories, formData.categoryId]);

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
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const formDataToSend = new FormData();
      const subjectData = {
        subjectCode: formData.subjectCode,
        subjectDescription: formData.subjectDescription,
        subjectContent: formData.subjectContent,
        categoryId: formData.categoryId
      };
      
      formDataToSend.append('subject', JSON.stringify(subjectData));
      console.log('전송할 Subject 데이터:', subjectData);

      if (curriculumFile) {
        formDataToSend.append('curriculumFile', curriculumFile);
        console.log('전송할 파일:', curriculumFile.name, '크기:', curriculumFile.size);
      } else {
        console.log('전송할 파일 없음');
      }

      // FormData 내용 확인
      console.log('FormData 내용:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, ':', value);
      }

      const response = await fetch(getApiUrl('/api/subjects'), {
        method: 'POST',
        // Content-Type 헤더를 명시하지 않아 브라우저가 자동으로 multipart/form-data 설정
        body: formDataToSend
      });

      console.log('응답 상태:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('Subject 생성 성공:', result);
        console.log('반환된 파일 정보:', {
          curriculumFileName: result.curriculumFileName,
          curriculumFilePath: result.curriculumFilePath
        });
        
        // 성공 메시지 표시
        alert('Subject가 성공적으로 생성되었습니다.');
        
        // 폼 초기화
        setFormData({
          subjectCode: '',
          subjectDescription: '',
          subjectContent: '',
          categoryId: categories.length > 0 ? categories[0].id : 0
        });
        setCurriculumFile(null);
        
        // 목록 새로고침
        onSuccess();
        
        // 모달은 열어둠 (onClose 호출하지 않음)
        // 생성 모달의 경우는 닫는 것이 맞을 수 있지만, 사용자 요청에 따라 열어둠
      } else {
        const errorData = await response.text();
        console.error('Subject 생성 실패:', response.status, errorData);
        
        let errorMessage = 'Subject 생성에 실패했습니다.';
        if (response.status === 400) {
          errorMessage = '잘못된 요청입니다. 입력 데이터를 확인해주세요.';
        } else if (response.status === 500) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
        
        if (errorData) {
          errorMessage += `\n\n상세 오류: ${errorData}`;
        }
        
        setErrors({ submit: errorMessage });
      }
    } catch (error) {
      console.error('Subject 생성 중 오류:', error);
      setErrors({ submit: 'Subject 생성 중 오류가 발생했습니다.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('파일 선택됨:', file.name, '크기:', file.size, '타입:', file.type);
      
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
      console.log('파일이 성공적으로 설정됨:', file.name);
    }
  };

  const handleDeleteFile = () => {
    setCurriculumFile(null);
    setErrors({ ...errors, curriculumFile: '' });
    console.log('파일이 성공적으로 삭제되었습니다.');
  };

  const handleInputChange = (field: keyof SubjectFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Subject 추가</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-500" />
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
                 className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                   errors.categoryId ? 'border-red-500' : 'border-gray-300'
                 }`}
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
                 className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                   errors.subjectCode ? 'border-red-500' : 'border-gray-300'
                 }`}
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
               className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                 errors.subjectDescription ? 'border-red-500' : 'border-gray-300'
               }`}
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
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                errors.subjectContent ? 'border-red-500' : 'border-gray-300'
              }`}
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
             <div className="space-y-3">
               {/* 파일 선택 버튼 */}
               <div className="flex items-center gap-4">
                 <label className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                   <FiUpload className="w-5 h-5 text-gray-500" />
                   <span className="text-gray-700">파일 선택</span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="hidden"
                  />
                 </label>
                 
                 {/* 파일 제거 버튼 */}
                 {curriculumFile && (
                   <button
                     type="button"
                     onClick={() => {
                       setCurriculumFile(null);
                       setErrors({ ...errors, curriculumFile: '' });
                     }}
                     className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                   >
                     파일 제거
                   </button>
                 )}
                 
                 {/* 파일 삭제 버튼 (기존 파일이 있는 경우) */}
                 {!curriculumFile && (
                   <button
                     type="button"
                     onClick={handleDeleteFile}
                     className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                   >
                     파일 삭제
                   </button>
                 )}
               </div>
               
               {/* 선택된 파일 정보 */}
               {curriculumFile && (
                 <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                   <div className="flex items-center gap-2 text-green-800">
                     <FiUpload className="w-4 h-4" />
                     <span className="font-medium">선택된 파일:</span>
                     <span className="text-sm">{curriculumFile.name}</span>
                   </div>
                   <div className="mt-1 text-xs text-green-600">
                     크기: {(curriculumFile.size / 1024 / 1024).toFixed(2)} MB
                   </div>
                   {isSubmitting && (
                     <div className="mt-2 text-xs text-blue-600">
                       파일 업로드 중...
                     </div>
                   )}
                 </div>
               )}
               
               {/* 파일 제한 정보 */}
               <p className="text-sm text-gray-500">
                 PDF 파일만 업로드 가능합니다. (최대 10MB)
               </p>
             </div>
             
             {errors.curriculumFile && (
               <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                 <FiAlertCircle className="w-4 h-4" />
                 {errors.curriculumFile}
               </p>
             )}
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
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  생성 중...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Subject 생성
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
