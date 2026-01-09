'use client';

import { useState, useEffect } from 'react';
import { FiX, FiUser, FiCalendar, FiFileText, FiEye, FiDownload, FiMessageSquare, FiBookOpen } from 'react-icons/fi';
import { getApiUrl } from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/dateUtils';
import FileViewer from '@/components/common/FileViewer';

interface SearchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: 'Library' | 'Learning' | 'Research' | 'Q&A';
  itemId: number;
}

interface LibraryDetail {
  id: number;
  category: string;
  title: string;
  author: string;
  description: string;
  keywords: string;
  fileNames?: string;
  filePaths?: string;
  fileTypes?: string;
  createdAt: string;
}

interface SubjectDetail {
  id: number;
  subjectCode: string;
  subjectDescription: string;
  subjectContent: string;
  categoryName: string;
  curriculumFileName?: string;
  curriculumFilePath?: string;
  createdAt: string;
}

interface OpinionDetail {
  id: number;
  title: string;
  authorName: string;
  abstractText?: string;
  fullText?: string;
  references?: string;
  category: string;
  createdAt: string;
}

interface QuestionDetail {
  id: number;
  title: string;
  content: string;
  authorEmail: string;
  category1: string;
  viewCount: number;
  answerCount: number;
  createdAt: string;
  filePath?: string;
}

export default function SearchDetailModal({
  isOpen,
  onClose,
  category,
  itemId
}: SearchDetailModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [viewingFile, setViewingFile] = useState<{ fileName: string; fileUrl: string } | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && itemId) {
      fetchDetail();
    } else {
      setDetail(null);
      setError(null);
      setLoading(true);
    }
  }, [isOpen, itemId, category]);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let apiUrl = '';
      switch (category) {
        case 'Library':
          apiUrl = getApiUrl(`/api/library/${itemId}`);
          break;
        case 'Learning':
          apiUrl = getApiUrl(`/api/subjects/${itemId}`);
          break;
        case 'Research':
          apiUrl = getApiUrl(`/api/opinions/${itemId}`);
          break;
        case 'Q&A':
          apiUrl = getApiUrl(`/api/questions/${itemId}`);
          break;
      }

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('상세 정보를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setDetail(data);

      // 첨부파일 가져오기 (Library, Research, Q&A)
      if (category === 'Library' || category === 'Research' || category === 'Q&A') {
        const refTable = category === 'Library' ? 'library' : category === 'Research' ? 'opinions' : 'questions';
        try {
          const attResponse = await fetch(getApiUrl(`/api/attachments?refTable=${refTable}&refId=${itemId}`));
          if (attResponse.ok) {
            const attData = await attResponse.json();
            setAttachments(attData || []);
          }
        } catch (err) {
          console.error('첨부파일 조회 실패:', err);
        }
      }
    } catch (err: any) {
      console.error('상세 정보 조회 실패:', err);
      setError(err.message || '상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleViewFile = (fileName: string, filePath: string) => {
    const encodedPath = encodeURIComponent(filePath.trim());
    let fileUrl = '';
    
    if (category === 'Library') {
      fileUrl = getApiUrl(`/api/library/view?path=${encodedPath}`);
    } else {
      const storedFileName = filePath.split('\\').pop() || filePath.split('/').pop() || filePath;
      const encodedFileName = encodeURIComponent(storedFileName).replace(/[!'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16);
      });
      fileUrl = getApiUrl(`/api/attachments/view/${encodedFileName}`);
    }
    
    setViewingFile({ fileName: fileName.trim(), fileUrl });
    setViewModalOpen(true);
  };

  const handleDownloadFile = (fileName: string, filePath: string) => {
    const encodedPath = encodeURIComponent(filePath.trim()).replace(/[!'()*]/g, function(c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
    
    if (category === 'Library') {
      window.open(getApiUrl(`/api/library/download/${encodedPath}`), '_blank');
    } else {
      const storedFileName = filePath.split('\\').pop() || filePath.split('/').pop() || filePath;
      const encodedFileName = encodeURIComponent(storedFileName).replace(/[!'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16);
      });
      window.open(getApiUrl(`/api/attachments/download/${encodedFileName}`), '_blank');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2 break-all overflow-wrap-break-word">
                  {loading ? '로딩 중...' : error ? '오류' : detail?.title || detail?.subjectDescription || '상세 정보'}
                </h2>
                {detail && (
                  <div className="flex items-center gap-4 text-sm mt-2">
                    {detail.author && (
                      <span className="flex items-center gap-1">
                        <FiUser className="h-4 w-4" />
                        {detail.author}
                      </span>
                    )}
                    {detail.authorName && (
                      <span className="flex items-center gap-1">
                        <FiUser className="h-4 w-4" />
                        {detail.authorName}
                      </span>
                    )}
                    {detail.authorEmail && (
                      <span className="flex items-center gap-1">
                        <FiUser className="h-4 w-4" />
                        {detail.authorEmail}
                      </span>
                    )}
                    {detail.createdAt && (
                      <span className="flex items-center gap-1">
                        <FiCalendar className="h-4 w-4" />
                        {formatDate(detail.createdAt)}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors duration-200 ml-4"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* 내용 */}
          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">상세 정보를 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiX className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-red-500 text-lg">{error}</p>
              </div>
            ) : detail ? (
              <div className="space-y-6">
                {/* Library */}
                {category === 'Library' && detail && (
                  <>
                    {detail.category && (
                      <div>
                        <label className="block text-base font-bold text-gray-700 mb-2">카테고리</label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {detail.category}
                        </span>
                      </div>
                    )}
                    {detail.description && (
                      <div>
                        <label className="block text-base font-bold text-gray-700 mb-2">설명</label>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-base text-gray-900 whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere">
                            {detail.description}
                          </p>
                        </div>
                      </div>
                    )}
                    {detail.keywords && (
                      <div>
                        <label className="block text-base font-bold text-gray-700 mb-2">키워드</label>
                        <p className="text-base text-gray-900">{detail.keywords}</p>
                      </div>
                    )}
                    {(detail.fileNames || attachments.length > 0) && (
                      <div>
                        <label className="block text-base font-bold text-gray-700 mb-2">첨부파일</label>
                        <div className="space-y-2">
                          {detail.fileNames && detail.filePaths && detail.fileNames.split(',').map((fileName: string, index: number) => {
                            const filePath = detail.filePaths.split(',')[index];
                            const fileType = detail.fileTypes ? detail.fileTypes.split(',')[index]?.trim() : 'downloadable';
                            const isViewOnly = fileType === 'view-only';
                            
                            return (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-base text-gray-900">{fileName.trim()}</span>
                                <div className="flex space-x-2">
                                  {isAuthenticated && user && (
                                    <>
                                      <button
                                        onClick={() => handleViewFile(fileName.trim(), filePath.trim())}
                                        className="inline-flex items-center px-2 py-1 border text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 border-transparent cursor-pointer"
                                      >
                                        <FiEye className="mr-1" />
                                        파일보기
                                      </button>
                                      {!isViewOnly && (
                                        <button
                                          onClick={() => handleDownloadFile(fileName.trim(), filePath.trim())}
                                          className="inline-flex items-center px-2 py-1 border text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 border-transparent cursor-pointer"
                                        >
                                          <FiDownload className="mr-1" />
                                          다운로드
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Learning */}
                {category === 'Learning' && detail && (
                  <>
                    {detail.categoryName && (
                      <div>
                        <label className="block text-base font-bold text-gray-700 mb-2">카테고리</label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {detail.categoryName}
                        </span>
                      </div>
                    )}
                    {detail.subjectCode && (
                      <div>
                        <label className="block text-base font-bold text-gray-700 mb-2">Subject 코드</label>
                        <p className="text-base text-gray-900">{detail.subjectCode}</p>
                      </div>
                    )}
                    {detail.subjectContent && (
                      <div>
                        <label className="block text-base font-bold text-gray-700 mb-2">내용</label>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-base text-gray-900 whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere">
                            {detail.subjectContent}
                          </p>
                        </div>
                      </div>
                    )}
                    {detail.curriculumFileName && detail.curriculumFilePath && (
                      <div>
                        <label className="block text-base font-bold text-gray-700 mb-2">커리큘럼 파일</label>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-base text-gray-900">{detail.curriculumFileName}</span>
                          {isAuthenticated && user && (
                            <button
                              onClick={() => handleViewFile(detail.curriculumFileName, detail.curriculumFilePath)}
                              className="inline-flex items-center px-2 py-1 border text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 border-transparent cursor-pointer"
                            >
                              <FiEye className="mr-1" />
                              파일보기
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Research */}
                {category === 'Research' && detail && (
                  <>
                    {detail.abstractText && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FiFileText className="h-5 w-5 text-indigo-600" />
                          초록
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700 break-all overflow-wrap-break-word whitespace-pre-line">
                            {detail.abstractText}
                          </p>
                        </div>
                      </div>
                    )}
                    {detail.fullText && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FiFileText className="h-5 w-5 text-indigo-600" />
                          전문
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700 break-all overflow-wrap-break-word whitespace-pre-line">
                            {detail.fullText}
                          </p>
                        </div>
                      </div>
                    )}
                    {detail.references && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FiBookOpen className="h-5 w-5 text-indigo-600" />
                          참고문헌
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700 break-all overflow-wrap-break-word whitespace-pre-line">
                            {detail.references}
                          </p>
                        </div>
                      </div>
                    )}
                    {attachments.length > 0 && (
                      <div>
                        <label className="block text-base font-bold text-gray-700 mb-2">첨부파일</label>
                        <div className="space-y-2">
                          {attachments.map((att, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-base text-gray-900">{att.fileName}</span>
                              {isAuthenticated && user && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleViewFile(att.fileName, att.filePath)}
                                    className="inline-flex items-center px-2 py-1 border text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 border-transparent cursor-pointer"
                                  >
                                    <FiEye className="mr-1" />
                                    파일보기
                                  </button>
                                  <button
                                    onClick={() => handleDownloadFile(att.fileName, att.filePath)}
                                    className="inline-flex items-center px-2 py-1 border text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 border-transparent cursor-pointer"
                                  >
                                    <FiDownload className="mr-1" />
                                    다운로드
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Q&A */}
                {category === 'Q&A' && detail && (
                  <>
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {detail.category1}
                      </span>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiEye className="w-4 h-4 mr-1" />
                          <span>조회 {detail.viewCount || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <FiMessageSquare className="w-4 h-4 mr-1" />
                          <span>답변 {detail.answerCount || 0}개</span>
                        </div>
                      </div>
                    </div>
                    <div className="prose max-w-none mb-4">
                      <div className="whitespace-pre-wrap text-gray-700 break-all overflow-wrap-break-word">
                        {detail.content}
                      </div>
                    </div>
                    {detail.filePath && detail.filePath !== '[NULL]' && (
                      <div>
                        <label className="block text-base font-bold text-gray-700 mb-2">첨부파일</label>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-base text-gray-900">{detail.filePath.split('\\').pop() || detail.filePath.split('/').pop()}</span>
                          {isAuthenticated && user && (
                            <button
                              onClick={() => {
                                const storedFileName = detail.filePath.split('\\').pop() || detail.filePath.split('/').pop() || detail.filePath;
                                const encodedFileName = encodeURIComponent(storedFileName).replace(/[!'()*]/g, function(c) {
                                  return '%' + c.charCodeAt(0).toString(16);
                                });
                                const fileUrl = getApiUrl(`/api/attachments/view/${encodedFileName}`);
                                setViewingFile({ fileName: storedFileName, fileUrl });
                                setViewModalOpen(true);
                              }}
                              className="inline-flex items-center px-2 py-1 border text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 border-transparent cursor-pointer"
                            >
                              <FiEye className="mr-1" />
                              파일보기
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* 파일 뷰어 */}
      {viewModalOpen && viewingFile && (
        <FileViewer
          fileUrl={viewingFile.fileUrl}
          fileName={viewingFile.fileName}
          onClose={() => {
            setViewModalOpen(false);
            setViewingFile(null);
          }}
        />
      )}
    </>
  );
}
