'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { FiUpload, FiFile, FiX, FiArrowLeft, FiFileText } from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function NewsRegisterPage() {
  const router = useRouter();
  
  const categories = [
    { id: 'notice', name: '공지사항' },
    { id: 'trends', name: '최신동향' },
    { id: 'seminar', name: '세미나' },
    { id: 'research', name: '연구소식' },
    { id: 'tech', name: '기술뉴스' }
  ];

  const [formData, setFormData] = useState({
    category: 'notice',
    title: '',
    content: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. 게시글 등록
      const res = await axios.post('/api/community', {
        category: { id: formData.category },
        title: formData.title,
        content: formData.content,
        author: '관리자', // 실제 로그인 사용자명으로 대체
      });
      const communityId = res.data.id;
      // 2. 첨부파일 업로드
      for (const file of files) {
        const form = new FormData();
        form.append('refTable', 'community');
        form.append('refId', communityId);
        form.append('file', file);
        form.append('uploadedBy', '관리자'); // 실제 로그인 사용자명으로 대체
        await axios.post('/api/attachments', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      alert('뉴스가 성공적으로 등록되었습니다.');
      router.push('/news');
    } catch (err) {
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-32 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center">
                <FiFileText className="w-6 h-6 text-rose-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">뉴스 등록</h1>
            </div>
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleBack}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </motion.button>
          </div>
          <p className="text-gray-600">
            플랫폼의 새로운 소식이나 관련 뉴스를 등록합니다.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <div className="space-y-6">
            
            {/* Category and Title */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-1">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        카테고리 <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="category"
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        제목 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="뉴스 제목을 입력하세요"
                    />
                </div>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={10}
                value={formData.content}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                placeholder="뉴스 내용을 입력하세요"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                첨부파일
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-rose-400 transition-colors duration-200">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.pptx,.txt,.jpg,.jpeg,.png,.zip"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-rose-600">파일 선택</span> 또는 파일을 드래그 앤 드롭하세요.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    다양한 형식의 파일을 첨부할 수 있습니다.
                  </p>
                </label>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">업로드된 파일</h3>
                <div className="space-y-2">
                  {files.map((file) => (
                    <div key={file.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FiFile className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file.name)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors duration-200"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? '등록 중...' : '뉴스 등록'}
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </main>
  );
} 