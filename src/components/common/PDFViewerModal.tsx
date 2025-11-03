'use client';

import { useState } from 'react';
import { FiX, FiDownload, FiZoomIn, FiZoomOut, FiRotateCw } from 'react-icons/fi';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title?: string;
}

export default function PDFViewerModal({ isOpen, onClose, pdfUrl, title = "과정 Overview" }: PDFViewerModalProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title + '.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            </div>
            
            {/* 컨트롤 버튼들 */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="축소"
              >
                <FiZoomOut className="w-5 h-5 text-gray-600" />
              </button>
              
              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="확대"
              >
                <FiZoomIn className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                onClick={() => setRotation(prev => prev + 90)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="회전"
              >
                <FiRotateCw className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                onClick={handleReset}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                초기화
              </button>
              
              <button
                onClick={handleDownload}
                className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <FiDownload className="w-4 h-4 inline mr-1" />
                다운로드
              </button>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="닫기"
              >
                <FiX className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* PDF 뷰어 */}
          <div className="flex-1 overflow-auto bg-gray-100 p-4">
            <div className="flex justify-center">
              <div 
                className="bg-white shadow-lg rounded-lg overflow-hidden"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-in-out'
                }}
              >
                <iframe
                  src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-[70vh] min-w-[800px]"
                  title={title}
                  style={{
                    border: 'none',
                    width: '800px',
                    height: '70vh'
                  }}
                />
              </div>
            </div>
          </div>

          {/* 하단 정보 */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-center text-sm text-gray-600">
              <p>PDF 파일을 확대/축소하거나 회전할 수 있습니다.</p>
              <p>마우스 휠을 사용하여 더 세밀한 확대/축소가 가능합니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



















