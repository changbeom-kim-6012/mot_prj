'use client';

import { useState, useEffect } from 'react';
import { FiX, FiSave, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { updateCustomProgram, deleteCustomProgram, CustomProgram, CustomProgramUpdate } from '@/utils/customProgramApi';

interface CustomProgramEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDelete: () => void;
  program: CustomProgram | null;
}

export default function CustomProgramEditModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  onDelete,
  program
}: CustomProgramEditModalProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    programName: '',
    plannerInstructor: '',
    programIntroduction: '',
    note: '',
    keywords: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // program이 변경될 때 폼 데이터 업데이트
  useEffect(() => {
    if (program) {
      setFormData({
        customerName: program.customerName || '',
        programName: program.programName || '',
        plannerInstructor: program.plannerInstructor || '',
        programIntroduction: program.programIntroduction || '',
        note: program.note || '',
        keywords: program.keywords || ''
      });
    }
  }, [program]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = '고객사명을 입력해주세요.';
    }

    if (!formData.programName.trim()) {
      newErrors.programName = '과정명을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!program) return;
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const updateData: CustomProgramUpdate = {
        customerName: formData.customerName.trim(),
        programName: formData.programName.trim(),
        plannerInstructor: formData.plannerInstructor.trim() || undefined,
        programIntroduction: formData.programIntroduction.trim() || undefined,
        note: formData.note.trim() || undefined,
        keywords: formData.keywords.trim() || undefined
      };

      await updateCustomProgram(program.id, updateData);
      
      alert('Custom Program이 성공적으로 수정되었습니다.');
      
      // 목록 새로고침
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Custom Program 수정 중 오류:', error);
      setErrors({ submit: error.message || 'Custom Program 수정 중 오류가 발생했습니다.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!program) return;
    
    if (!confirm('정말 이 Custom Program을 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteCustomProgram(program.id);
      alert('Custom Program이 성공적으로 삭제되었습니다.');
      
      // 목록 새로고침
      onDelete();
      onClose();
    } catch (error: any) {
      console.error('Custom Program 삭제 중 오류:', error);
      alert('Custom Program 삭제 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen || !program) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Custom Program 수정</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 고객사명과 과정명 (한 라인) */}
          <div className="grid grid-cols-2 gap-4">
            {/* 고객사명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                고객사명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.customerName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="예: 삼성전자"
              />
              {errors.customerName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  {errors.customerName}
                </p>
              )}
            </div>

            {/* 과정명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                과정명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.programName}
                onChange={(e) => handleInputChange('programName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  errors.programName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="예: MOT 기초과정 - 신사업 발굴 및 기획"
              />
              {errors.programName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  {errors.programName}
                </p>
              )}
            </div>
          </div>

          {/* 기획자/강사 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              기획자/강사
            </label>
            <input
              type="text"
              value={formData.plannerInstructor}
              onChange={(e) => handleInputChange('plannerInstructor', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="예: 김교수, 이강사"
            />
          </div>

          {/* 과정소개 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              과정소개
            </label>
            <textarea
              value={formData.programIntroduction}
              onChange={(e) => handleInputChange('programIntroduction', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="과정에 대한 상세한 소개를 입력하세요"
            />
          </div>

          {/* 비고 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비고
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="추가 정보나 참고사항을 입력하세요"
            />
          </div>

          {/* 키워드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              키워드
            </label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => handleInputChange('keywords', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="예: 신사업, 기획, 기술트렌드 (쉼표로 구분)"
            />
            <p className="mt-1 text-sm text-gray-500">
              검색에 사용될 키워드를 쉼표로 구분하여 입력하세요
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
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  삭제 중...
                </>
              ) : (
                <>
                  <FiTrash2 className="w-4 h-4" />
                  삭제
                </>
              )}
            </button>
            
            <div className="flex items-center gap-3">
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
                    수정 중...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    수정
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


