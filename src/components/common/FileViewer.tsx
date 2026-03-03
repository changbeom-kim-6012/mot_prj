'use client';

import { useState, useEffect } from 'react';
import { FiX, FiDownload } from 'react-icons/fi';
import dynamic from 'next/dynamic';

const LocalPDFViewer = dynamic(() => import('./LocalPDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="w-11/12 h-full bg-white rounded-lg flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">PDF 로딩 중...</h3>
          <button
            onClick={() => {}}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">PDF를 불러오는 중...</p>
          </div>
        </div>
      </div>
    </div>
  )
});

interface FileViewerProps {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

// 상대경로를 공개 URL로 변환 (Google Docs Viewer용)
const getPublicUrl = (url: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // 브라우저 환경에서 현재 호스트 기반으로 절대 URL 생성
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${url}`;
  }
  return url;
};

export default function FileViewer({ fileUrl, fileName, onClose }: FileViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [viewerError, setViewerError] = useState(false);

  // 디버깅 로그
  console.log('FileViewer 컴포넌트 - 받은 props:', { fileUrl, fileName });

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const extension = getFileExtension(fileName);

  // Google Docs Viewer 로딩 타임아웃 (15초 후 자동으로 로딩 스피너 제거)
  useEffect(() => {
    if (!['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'pdf'].includes(extension)) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [extension]);

  // 다운로드 핸들러
  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('파일 다운로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  // 이미지 파일 처리
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center" style={{ zIndex: 9999 }}>
        <div className="w-11/12 h-full bg-white rounded-lg flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-medium">{fileName}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 p-4 flex items-center justify-center overflow-auto">
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain"
              style={{
                pointerEvents: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>
      </div>
    );
  }

  // PDF 파일 처리
  if (extension === 'pdf') {
    return (
      <LocalPDFViewer
        fileUrl={fileUrl}
        fileName={fileName}
        onClose={onClose}
      />
    );
  }

  // Office 파일 (docx, xlsx, pptx 등) - Google Docs Viewer + 다운로드 안내
  const publicUrl = getPublicUrl(fileUrl);
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(publicUrl)}&embedded=true`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="w-11/12 h-full bg-white rounded-lg flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">{fileName}</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm flex items-center gap-1"
            >
              <FiDownload className="w-4 h-4" />
              다운로드
            </button>
            <button
              onClick={() => window.open(fileUrl, '_blank')}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              새 탭에서 열기
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="flex-1 p-4 relative">
          {!viewerError ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">문서를 불러오는 중...</p>
                    <p className="mt-1 text-xs text-gray-400">미리보기가 로드되지 않으면 다운로드 버튼을 이용해주세요.</p>
                  </div>
                </div>
              )}
              <iframe
                src={googleViewerUrl}
                className="w-full h-full border-0"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setViewerError(true);
                  console.error('Google Docs Viewer 로드 실패');
                }}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-600 mb-4">문서 미리보기를 로드할 수 없습니다.</p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
              >
                <FiDownload className="w-4 h-4" />
                파일 다운로드
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
