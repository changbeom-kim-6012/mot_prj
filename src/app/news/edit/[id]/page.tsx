'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { FiUpload, FiFile, FiX, FiArrowLeft, FiFileText } from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from 'axios';

interface CommonCode {
  id: number;
  codeName: string;
  codeValue: string;
}

interface CommunityItem {
  id: number;
  category: {
    id: number;
    codeName: string;
  };
  title: string;
  content: string;
  author: string;
}

interface Attachment {
  id: number;
  fileName: string;
  filePath: string;
  fileSize: number;
}

export default function NewsEditPage() {
  const router = useRouter();
  const params = useParams();
  const newsId = params.id as string;
  
  const [categories, setCategories] = useState<CommonCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);

  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Community 카테고리 가져오기
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/codes/menu/Community/details');
      setCategories(response.data);
    } catch (error) {
      console.error('카테고리 가져오기 실패:', error);
    }
  };

  // 기존 게시글 데이터 가져오기
  const fetchCommunity = async () => {
    try {
      const response = await axios.get(`/api/community/${newsId}`);
      const data = response.data;
      setFormData({
        category: data.category.id.toString(),
        title: data.title,
        content: data.content,
      });
    } catch (error) {
      console.error('게시글 가져오기 실패:', error);
      alert('게시글을 불러올 수 없습니다.');
      router.push('/news');
    }
  };

  // 기존 첨부파일 가져오기
  const fetchAttachments = async () => {
    try {
      const response = await axios.get('/api/attachments', {
        params: { refTable: 'community', refId: newsId }
      });
      setExistingAttachments(response.data);
    } catch (error) {
      console.error('첨부파일 가져오기 실패:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchCommunity(),
        fetchAttachments()
      ]);
      setLoading(false);
    };
    initializeData();
  }, [newsId]);

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

  const removeExistingFile = async (attachmentId: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/attachments/${attachmentId}`);
      setExistingAttachments(prev => prev.filter(att => att.id !== attachmentId));
    } catch (error) {
      alert('파일 삭제 중 오류가 발생했습니다.');
    }
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
      // 1. 게시글 수정
      await axios.put(`/api/community/${newsId}`, {
        category: { id: parseInt(formData.category) },
        title: formData.title,
        content: formData.content,
        author: '관리자', // 실제 로그인 사용자명으로 대체
      });

      // 2. 새로운 첨부파일 업로드
      for (const file of files) {
        const form = new FormData();
        form.append('refTable', 'community');
        form.append('refId', newsId);
        form.append('file', file);
        form.append('uploadedBy', '관리자'); // 실제 로그인 사용자명으로 대체
        await axios.post('/api/attachments', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      alert('뉴스가 성공적으로 수정되었습니다.');
      router.push(`/news/${newsId}`);
    } catch (err) {
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">데이터를 불러오는 중...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBack}
          className="inline-flex items-center mb-6 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          목록으로 돌아가기
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center">
              <FiFileText className="w-6 h-6 text-rose-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">뉴스 수정</h1>
          </div>
          <p className="text-gray-600">
            기존 뉴스 내용을 수정합니다.
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
                            <option key={cat.id} value={cat.id}>{cat.codeName}</option>
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

            {/* Existing Files */}
            {existingAttachments.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">기존 첨부파일</h3>
                <div className="space-y-2">
                  {existingAttachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FiFile className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{att.fileName}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(att.fileSize)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingFile(att.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                새 첨부파일 추가
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

            {/* New File List */}
            {files.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">추가할 파일</h3>
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
                {isSubmitting ? '수정 중...' : '뉴스 수정'}
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </main>
  );
} 