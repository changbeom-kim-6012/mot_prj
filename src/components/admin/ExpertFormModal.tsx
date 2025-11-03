'use client';

import { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiFileText } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Expert, ExpertCreate, ExpertUpdate } from '@/types/expert';

interface ExpertFormModalProps {
  expert?: Expert | null;
  onClose: () => void;
}

export default function ExpertFormModal({ expert, onClose }: ExpertFormModalProps) {
  const [formData, setFormData] = useState<ExpertCreate>({
    name: '',
    email: '',
    phone: '',
    organization: '',
    position: '',
    education: '',
    career: '',
    keyPerformanceHistory: '',
    field: '',
    status: 'ACTIVE'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!expert;

  useEffect(() => {
    if (expert) {
      setFormData({
        name: expert.name,
        email: expert.email,
        phone: expert.phone || '',
        organization: expert.organization || '',
        position: expert.position || '',
        education: expert.education || '',
        career: expert.career || '',
        keyPerformanceHistory: expert.keyPerformanceHistory || '',
        field: expert.field || '',
        status: expert.status
      });
    }
  }, [expert]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditMode && expert) {
        const updateData: ExpertUpdate = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          organization: formData.organization,
          position: formData.position,
          education: formData.education,
          career: formData.career,
          keyPerformanceHistory: formData.keyPerformanceHistory,
          field: formData.field,
          status: formData.status as 'ACTIVE' | 'INACTIVE' | 'PENDING'
        };
        await axios.put(`/api/experts/${expert.id}`, updateData);
      } else {
        await axios.post('/api/experts', formData);
      }
      
      alert(isEditMode ? '전문가 정보가 성공적으로 수정되었습니다.' : '전문가가 성공적으로 등록되었습니다.');
      onClose();
    } catch (error: any) {
      console.error('전문가 저장 실패:', error);
      setError(error.response?.data?.message || '저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={onClose}
          />

          {/* 모달 패널 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit}>
              {/* 헤더 */}
              <div className="bg-blue-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiUser className="w-6 h-6 text-white mr-3" />
                    <h3 className="text-lg font-medium text-white">
                      {isEditMode ? '전문가 수정' : '전문가 등록'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-white hover:text-gray-200 transition-colors duration-200"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* 폼 내용 */}
              <div className="px-6 py-6">
                <div className="space-y-6">
                  {/* 기본 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 이름 */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        이름 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="전문가 이름을 입력하세요"
                      />
                    </div>

                    {/* 이메일 */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        이메일 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="이메일을 입력하세요"
                      />
                    </div>

                    {/* 전화번호 */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        전화번호
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="010-0000-0000"
                      />
                    </div>
                  </div>

                  {/* 소속 및 직책 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 소속기관 */}
                    <div>
                      <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                        현 소속기관
                      </label>
                      <input
                        type="text"
                        id="organization"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="현 소속기관을 입력하세요"
                      />
                    </div>

                    {/* 직책/직급 */}
                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                        직책/직급
                      </label>
                      <input
                        type="text"
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="직책/직급을 입력하세요"
                      />
                    </div>
                  </div>

                  {/* 학력/경력 */}
                  <div>
                    <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">
                      학력
                    </label>
                    <textarea
                      id="education"
                      name="education"
                      rows={2}
                      value={formData.education}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="학력을 입력하세요"
                    />
                  </div>

                  <div>
                    <label htmlFor="career" className="block text-sm font-medium text-gray-700 mb-2">
                      전 소속/수행업무
                    </label>
                    <textarea
                      id="career"
                      name="career"
                      rows={5}
                      value={formData.career}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none overflow-y-auto"
                      placeholder="전 소속/수행업무를 입력하세요"
                    />
                  </div>

                  <div>
                    <label htmlFor="keyPerformanceHistory" className="block text-sm font-medium text-gray-700 mb-2">
                      주요 수행 이력
                    </label>
                    <textarea
                      id="keyPerformanceHistory"
                      name="keyPerformanceHistory"
                      rows={5}
                      value={formData.keyPerformanceHistory}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none overflow-y-auto"
                      placeholder="주요 수행 이력을 입력하세요"
                    />
                  </div>

                  {/* 전문분야 */}
                  <div>
                    <label htmlFor="field" className="block text-sm font-medium text-gray-700 mb-2">
                      전문분야
                    </label>
                    <textarea
                      id="field"
                      name="field"
                      rows={2}
                      value={formData.field}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="전문분야를 입력하세요"
                    />
                  </div>

                  {/* 상태 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      상태 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="ACTIVE"
                          checked={formData.status === "ACTIVE"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">활성</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="INACTIVE"
                          checked={formData.status === "INACTIVE"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">비활성</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="status"
                          value="PENDING"
                          checked={formData.status === "PENDING"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">승인대기</span>
                      </label>
                    </div>
                  </div>

                  {/* 에러 메시지 */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 푸터 */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <FiSave className="mr-2 h-4 w-4" />
                  {isSubmitting ? (isEditMode ? '수정 중...' : '등록 중...') : (isEditMode ? '전문가 수정' : '전문가 등록')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
} 