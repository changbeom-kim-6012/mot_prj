'use client';

import { useState } from 'react';
import { FiX } from 'react-icons/fi';
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

export default function FileViewer({ fileUrl, fileName, onClose }: FileViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // 디버깅 로그 추가
  console.log('FileViewer 컴포넌트 - 받은 props:', { fileUrl, fileName });
  
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const extension = getFileExtension(fileName);
  
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
  
  // 기타 파일은 Google Docs Viewer 사용
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="w-11/12 h-full bg-white rounded-lg flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">{fileName}</h3>
          <div className="flex space-x-2">
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
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">문서를 불러오는 중...</p>
              </div>
            </div>
          )}
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              console.error('Google Docs Viewer 로드 실패');
            }}
          />
        </div>
      </div>
    </div>
  );
} 