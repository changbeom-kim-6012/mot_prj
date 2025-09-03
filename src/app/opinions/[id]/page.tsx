'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from '@/components/Navigation';
import { FiDownload, FiEye, FiArrowLeft, FiX, FiFileText, FiList, FiUser, FiCalendar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import FileViewer from '@/components/common/FileViewer';

interface Article {
  id: number;
  title: string;
  authorName: string;
  abstractText: string;
  keywords: string;
  references: string;
  fullText?: string;
  status: string;
  category: string;
  createdAt: string;
}

interface Attachment {
  id: number;
  fileName: string;
  filePath: string;
  fileSize: number;
}

export default function OpinionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const articleId = params.id;

  const [article, setArticle] = useState<Article | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullTextModal, setShowFullTextModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ url: string; name: string } | null>(null);

  const handleBack = () => {
    router.back();
  };

  const handleViewFile = (fileName: string, filePath: string) => {
    // 파일 경로에서 파일명만 추출 (UUID_originalName 형식)
    const pathParts = filePath.split('\\');
    const storedFileName = pathParts[pathParts.length - 1];
    
    // 한글 파일명을 올바르게 인코딩
    const encodedFileName = encodeURIComponent(storedFileName).replace(/[!'()*]/g, function(c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
    
    console.log('파일 조회 요청:', { fileName, filePath, storedFileName, encodedFileName });
    
    const fileUrl = `http://localhost:8082/api/attachments/view/${encodedFileName}`;
    setSelectedFile({ url: fileUrl, name: fileName.trim() });
  };

  const handleCloseFileViewer = () => {
    setSelectedFile(null);
  };

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:8082/api/opinions/${articleId}`);
        const articleData = res.data;
        
        // 등록승인 또는 등록대기 상태의 기고만 표시
        if (articleData.status !== '등록승인' && articleData.status !== '등록대기') {
          setError('조회할 수 없는 기고입니다.');
          setLoading(false);
          return;
        }
        
        setArticle(articleData);
        // 첨부파일 목록도 불러오기
        const attRes = await axios.get('http://localhost:8082/api/attachments', {
          params: { refTable: 'opinions', refId: articleId }
        });
        setAttachments(attRes.data);
        setError(null);
      } catch (e) {
        setError('상세 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [articleId]);

  if (loading) {
    return <main className="min-h-screen bg-gray-50"><Navigation /><div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">로딩 중...</div></main>;
  }
  if (error || !article) {
    return <main className="min-h-screen bg-gray-50"><Navigation /><div className="max-w-4xl mx-auto px-4 py-16 text-center text-red-500">{error || '상세 정보를 찾을 수 없습니다.'}</div></main>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-32 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white pt-3.5 px-8 pb-6">
            <div className="flex justify-end mb-4">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleBack}
                className="inline-flex items-center text-white hover:text-gray-200 transition-colors duration-200"
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                목록으로 돌아가기
              </motion.button>
            </div>
            <h1 className="text-2xl font-bold leading-relaxed mb-4">
              {article.title}
            </h1>
            <div className="flex items-center text-indigo-100">
              <span className="font-medium">저자:</span>
              <span className="ml-2">{article.authorName}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* References */}
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">참고문헌</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-line">
                  {article.references}
                </p>
              </div>
            </div>

            {/* Abstract */}
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">초록/요약</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  {article.abstractText}
                </p>
              </div>
            </div>

            {/* Full Text Button */}
            {article.fullText && (
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">전문 (Full Text)</h2>
                  {isAuthenticated ? (
                    <button
                      onClick={() => setShowFullTextModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <FiList className="mr-2 h-4 w-4" />
                      전문보기
                    </button>
                  ) : (
                    <div className="relative group">
                      <button
                        disabled
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-400 cursor-not-allowed transition-colors duration-200"
                      >
                        <FiList className="mr-2 h-4 w-4" />
                        전문보기
                      </button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        로그인이 필요합니다
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 첨부파일 목록 */}
            {attachments.length > 0 && (
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">첨부파일</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900">{attachments[0].fileName}</span>
                    <span className="text-xs text-gray-500">({(attachments[0].fileSize/1024).toFixed(1)} KB)</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewFile(attachments[0].fileName, attachments[0].filePath)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        <FiEye className="mr-1" />
                        파일보기
                      </button>
                                             <button
                         onClick={() => {
                           // 파일 경로에서 파일명만 추출 (UUID_originalName 형식)
                           const pathParts = attachments[0].filePath.split('\\');
                           const storedFileName = pathParts[pathParts.length - 1];
                           
                           const encodedFileName = encodeURIComponent(storedFileName);
                           window.open(`http://localhost:8082/api/attachments/download/${encodedFileName}`, '_blank');
                         }}
                         className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                       >
                        <FiDownload className="mr-1" />
                        다운로드
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Keywords */}
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">키워드</h2>
              <div className="flex flex-wrap gap-2">
                {article.keywords.split(',').map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button 
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                닫기
              </button>
            </div>
          </div>
        </motion.div>
      </div>

             {/* File Viewer */}
       {selectedFile && (
         <FileViewer
           fileUrl={selectedFile.url}
           fileName={selectedFile.name}
           onClose={handleCloseFileViewer}
         />
       )}

      {/* Full Text Modal */}
      {showFullTextModal && article && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowFullTextModal(false)}
          />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">전문 (Full Text)</h2>
                  <button
                    onClick={() => setShowFullTextModal(false)}
                    className="text-white hover:text-opacity-80 transition-colors duration-200"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
                <h3 className="text-lg font-medium mt-2 text-opacity-90">
                  {article.title}
                </h3>
                <p className="text-sm text-opacity-80 mt-1">
                  {article.authorName}
                </p>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div 
                    className="text-gray-700 leading-relaxed prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: article.fullText || '' }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setShowFullTextModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </main>
  );
} 