'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FiX, FiDownload, FiZoomIn, FiZoomOut, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// PDF.js 워커 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ReactPdfViewerProps {
  fileName: string;
  filePath: string;
  onClose: () => void;
  type?: 'library' | 'course-material';
}

export default function ReactPdfViewer({ 
  fileName, 
  filePath, 
  onClose, 
  type = 'library' 
}: ReactPdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // API URL 생성
  const getFileUrl = () => {
    const baseUrl = 'http://127.0.0.1:8082';
    const endpoint = type === 'course-material' 
      ? '/api/course-materials/view' 
      : '/api/library/view';
    
    const encodedFileName = encodeURIComponent(filePath);
    return `${baseUrl}${endpoint}/${encodedFileName}`;
  };

  const fileUrl = getFileUrl();
  const isPdf = fileName.toLowerCase().endsWith('.pdf');
  const isImage = fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
  const isText = fileName.toLowerCase().match(/\.(txt|md|html|css|js|json|xml|csv)$/i);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF 로드 오류:', error);
    setError('PDF 파일을 불러올 수 없습니다. 서버 연결을 확인해주세요.');
    setLoading(false);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages);
    });
  };

  const changeScale = (newScale: number) => {
    const clampedScale = Math.max(0.5, Math.min(3.0, newScale));
    setScale(clampedScale);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft' && isPdf) {
      changePage(-1);
    } else if (e.key === 'ArrowRight' && isPdf) {
      changePage(1);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full h-[90vh] relative flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">파일 보기</h2>
            <p className="text-sm text-gray-600 mt-1">{fileName}</p>
          </div>
          
          {/* PDF 컨트롤 */}
          {isPdf && numPages > 0 && (
            <div className="flex items-center gap-4 mr-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changePage(-1)}
                  disabled={pageNumber <= 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="이전 페이지"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 min-w-[60px] text-center">
                  {pageNumber} / {numPages}
                </span>
                <button
                  onClick={() => changePage(1)}
                  disabled={pageNumber >= numPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="다음 페이지"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeScale(scale - 0.2)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  title="축소"
                >
                  <FiZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 w-12 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={() => changeScale(scale + 0.2)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  title="확대"
                >
                  <FiZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-2 text-blue-600 hover:text-blue-800 transition-colors"
              title="다운로드"
            >
              <FiDownload className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 파일 내용 영역 */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full bg-gray-50 rounded-lg border border-gray-200 overflow-auto">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">파일을 불러오는 중...</p>
                </div>
              </div>
            )}

            {error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-red-500 mb-4">
                    <FiX className="mx-auto h-16 w-16" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">파일 로딩 오류</h3>
                  <p className="text-gray-500 mb-4">{error}</p>
                  <div className="text-sm text-gray-400 mb-4">
                    <p>파일명: {fileName}</p>
                    <p>요청 URL: {fileUrl}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full">
                {isPdf ? (
                  <div className="flex justify-center p-4">
                    <Document
                      file={fileUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="flex items-center justify-center h-64">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      }
                    >
                      <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </Document>
                  </div>
                ) : isImage ? (
                  <div className="flex items-center justify-center h-full p-4">
                    <img
                      src={fileUrl}
                      alt={fileName}
                      className="max-w-full max-h-full object-contain shadow-lg"
                      onLoad={() => setLoading(false)}
                      onError={() => {
                        setError('이미지 파일을 불러올 수 없습니다.');
                        setLoading(false);
                      }}
                    />
                  </div>
                ) : isText ? (
                  <iframe
                    src={fileUrl}
                    className="w-full h-full border-0"
                    title={fileName}
                    onLoad={() => setLoading(false)}
                    onError={() => {
                      setError('텍스트 파일을 불러올 수 없습니다.');
                      setLoading(false);
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FiDownload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">파일 미리보기 불가</h3>
                      <p className="text-gray-500 mb-4">
                        이 파일 형식은 브라우저에서 직접 보기할 수 없습니다.
                      </p>
                      <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        다운로드
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">파일 형식:</span> {fileName.split('.').pop()?.toUpperCase()}
              {isPdf && numPages > 0 && (
                <span className="ml-4">
                  <span className="font-medium">총 페이지:</span> {numPages}페이지
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400">
              ESC 키로 닫기 | {isPdf ? '← → 키로 페이지 이동' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 