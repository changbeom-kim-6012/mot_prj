'use client';

import { useState } from 'react';
import { FiX, FiExternalLink, FiDownload } from 'react-icons/fi';

interface SimplePDFViewerProps {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

export default function SimplePDFViewer({ fileUrl, fileName, onClose }: SimplePDFViewerProps) {
  // 로딩 상태 제거 - 바로 PDF 정보 표시

  const openInNewTab = () => {
    // 새 탭에서 열기 (다운로드 없이)
    window.open(fileUrl, '_blank');
  };

  const downloadFile = () => {
    // 다운로드 링크 생성
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="w-11/12 h-5/6 bg-white rounded-lg flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">{fileName}</h3>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 p-4 relative">
          
          <div className="w-full h-full flex flex-col">
            <div className="mb-4 flex space-x-3">
              <button 
                onClick={openInNewTab}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
              >
                <FiExternalLink className="mr-2" />
                새 탭에서 보기
              </button>
              <button 
                onClick={downloadFile}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center"
              >
                <FiDownload className="mr-2" />
                다운로드
              </button>
            </div>
            
            <div className="flex-1 bg-gray-100 rounded-lg p-4">
              <div className="text-center text-gray-600">
                <div className="mb-4">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">PDF 파일</h3>
                <p className="mb-4">이 파일은 PDF 형식입니다.</p>
                <div className="space-y-2 text-sm">
                  <p>• <strong>새 탭에서 보기:</strong> 브라우저에서 PDF를 직접 확인</p>
                  <p>• <strong>다운로드:</strong> 파일을 컴퓨터에 저장</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 