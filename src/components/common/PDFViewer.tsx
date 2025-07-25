'use client';

import { useState } from 'react';
import { FiX, FiExternalLink, FiDownload, FiFileText } from 'react-icons/fi';

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

export default function PDFViewer({ fileUrl, fileName, onClose }: PDFViewerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="w-11/12 max-w-2xl bg-white rounded-lg">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-medium">{fileName}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-8 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiFileText className="w-10 h-10 text-blue-600" />
            </div>
            <h4 className="text-2xl font-semibold text-gray-900 mb-4">PDF 파일 보기</h4>
            <p className="text-gray-600 mb-8">
              브라우저 보안 정책으로 인해 PDF를 직접 표시할 수 없습니다.<br />
              아래 옵션 중 하나를 선택하여 PDF를 확인하세요.
            </p>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={() => {
                // PDF.js 뷰어를 사용하여 다운로드/프린트 기능 숨김
                const pdfViewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fileUrl)}#toolbar=0&navpanes=0&scrollbar=0`;
                window.open(pdfViewerUrl, '_blank');
              }}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FiExternalLink className="mr-2" />
              새 탭에서 PDF 보기
            </button>
            
            <button 
              onClick={() => {
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = fileName;
                link.click();
              }}
              className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
            >
              <FiDownload className="mr-2" />
              PDF 파일 다운로드
            </button>
          </div>
          
          <div className="mt-8 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
            <p className="font-medium mb-2">💡 추천 방법:</p>
            <p>• <strong>새 탭에서 PDF 보기</strong>: 브라우저의 PDF 뷰어를 사용하여 바로 확인</p>
            <p>• <strong>PDF 파일 다운로드</strong>: 로컬에 저장하여 PDF 뷰어로 열기</p>
          </div>
        </div>
      </div>
    </div>
  );
} 