'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { FiArrowLeft, FiFileText, FiDownload, FiEye, FiCalendar, FiUser, FiTag, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface NewsDetail {
  id: string;
  title: string;
  content: string;
  categoryId?: number;
  categoryName?: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

interface Attachment {
  id: number;
  fileName: string;
  filePath: string;
  fileSize: number;
}

// 정적 내보내기를 위한 generateStaticParams 함수
export async function generateStaticParams() {
  // 빌드 시점에 생성할 뉴스 ID들을 정의
  // 실제로는 API에서 가져오거나 미리 정의된 ID들을 사용
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    // 필요한 만큼 ID를 추가
  ];
}

export default function NewsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const newsId = params.id as string;
  
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await axios.get(`/api/community/${newsId}`);
        setNews(res.data);
        const attRes = await axios.get('/api/attachments', {
          params: { refTable: 'community', refId: newsId }
        });
        setAttachments(attRes.data);
      } catch (err) {
        setNews(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [newsId]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/news/edit/${newsId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await axios.delete(`/api/community/${newsId}`);
      alert('게시글이 삭제되었습니다.');
      router.push('/news');
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\./g, '.').replace(/\s/g, ' ');
  };

  const handleFileDownload = (fileId: string, fileName: string) => {
    // 실제로는 파일 다운로드 API 호출
    console.log('Downloading file:', fileName);
    alert(`${fileName} 다운로드를 시작합니다.`);
  };

  const handleFileView = (fileId: string, fileName: string) => {
    // 실제로는 파일 미리보기 API 호출
    console.log('Viewing file:', fileName);
    alert(`${fileName} 미리보기를 시작합니다.`);
  };

  const handleFileDelete = async (attachmentId: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    await axios.delete(`/api/attachments/${attachmentId}`);
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!news) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">뉴스를 찾을 수 없습니다</h1>
            <p className="text-gray-600 mb-6">요청하신 뉴스가 존재하지 않거나 삭제되었습니다.</p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors duration-200"
            >
              목록으로 돌아가기
            </button>
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

        {/* News Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-8 py-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FiFileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white mb-2">
                  <FiTag className="mr-1 h-3 w-3" />
                  {news.categoryName || '기타'}
                </span>
                <h1 className="text-2xl font-bold text-white">{news.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-white/20 border border-white/30 rounded-md hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-200"
                >
                  <FiEdit2 className="mr-1 h-3 w-3" />
                  수정
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-500/80 border border-red-400/50 rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 transition-colors duration-200"
                >
                  <FiTrash2 className="mr-1 h-3 w-3" />
                  삭제
                </button>
              </div>
            </div>
            
            {/* Meta Information */}
            <div className="flex items-center gap-6 text-white/90 text-sm">
              <div className="flex items-center">
                <FiUser className="mr-2 h-4 w-4" />
                {news.author}
              </div>
              <div className="flex items-center">
                <FiCalendar className="mr-2 h-4 w-4" />
                {formatDate(news.createdAt)}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {news.content}
              </div>
            </div>

            {/* 참고문헌 */}
            {attachments.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiFileText className="mr-2 h-5 w-5 text-rose-600" />
                  참고문헌 ({attachments.length})
                </h3>
                <div className="space-y-3">
                  {attachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FiFileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{att.fileName}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(att.fileSize)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAuthenticated ? (
                          <button
                            onClick={() => handleFileView(att.id.toString(), att.fileName)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors duration-200"
                          >
                            <FiEye className="mr-1 h-3 w-3" />
                            파일보기
                          </button>
                        ) : (
                          <div className="relative group">
                            <button
                              disabled
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed transition-colors duration-200"
                            >
                              <FiEye className="mr-1 h-3 w-3" />
                              파일보기
                            </button>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              로그인이 필요합니다
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => handleFileDownload(att.id.toString(), att.fileName)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-rose-600 border border-transparent rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors duration-200"
                        >
                          <FiDownload className="mr-1 h-3 w-3" />
                          다운로드
                        </button>
                        <button
                          onClick={() => handleFileDelete(att.id)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-gray-400 border border-transparent rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-200"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-end mt-8"
        >
          <button
            onClick={handleBack}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors duration-200"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </button>
        </motion.div>
      </div>
    </main>
  );
} 