'use client';

import React, { useState } from 'react';
import { FiX, FiEye, FiDownload } from 'react-icons/fi';

interface SimpleFileViewerProps {
  fileName: string;
  filePath: string;
  onClose: () => void;
  type?: 'library' | 'course-material';
}

export default function SimpleFileViewer({ 
  fileName, 
  filePath, 
  onClose, 
  type = 'library' 
}: SimpleFileViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API URL 생성
  const getFileUrl = () => {
    const baseUrl = 'http://127.0.0.1:8082';
    const endpoint = type === 'course-material' 
      ? '/api/course-materials/view' 
      : '/api/library/view';
    
    // 파일명에서 특수문자 처리
    const encodedFileName = encodeURIComponent(filePath);
    return `${baseUrl}${endpoint}/${encodedFileName}`;
  };

  const fileUrl = getFileUrl();
  const isPdf = fileName.toLowerCase().endsWith('.pdf');
  const isImage = fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
  const isText = fileName.toLowerCase().match(/\.(txt|md|html|css|js|json|xml|csv)$/i);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setError('파일을 불러올 수 없습니다. 서버 연결을 확인해주세요.');
    setLoading(false);
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

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full h-[90vh] relative flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">파일 보기</h2>
            <p className="text-sm text-gray-600 mt-1">{fileName}</p>
          </div>
          
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
          <div className="h-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
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
                  <iframe
                    src={fileUrl}
                    className="w-full h-full border-0"
                    title={fileName}
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                  />
                ) : isImage ? (
                  <div className="flex items-center justify-center h-full p-4">
                    <img
                      src={fileUrl}
                      alt={fileName}
                      className="max-w-full max-h-full object-contain shadow-lg"
                      onLoad={handleIframeLoad}
                      onError={handleIframeError}
                    />
                  </div>
                ) : isText ? (
                  <iframe
                    src={fileUrl}
                    className="w-full h-full border-0"
                    title={fileName}
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FiEye className="mx-auto h-16 w-16 text-gray-400 mb-4" />
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
            </div>
            <div className="text-xs text-gray-400">
              ESC 키로 닫기
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 