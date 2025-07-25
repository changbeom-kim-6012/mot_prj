'use client';

import { useState, useEffect } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut, FiRotateCw } from 'react-icons/fi';

interface CustomPDFViewerProps {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

export default function CustomPDFViewer({ fileUrl, fileName, onClose }: CustomPDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleIframeLoad = () => {
    setIsLoading(false);
    
    // iframe 로드 후 CSS 주입으로 다운로드/프린트 버튼 숨기기
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentDocument) {
      const style = iframe.contentDocument.createElement('style');
      style.textContent = `
        #toolbarViewerLeft, #toolbarViewerRight, #toolbarViewerMiddle {
          display: none !important;
        }
        #download, #print, #secondaryToolbarButton {
          display: none !important;
        }
        .toolbarButton#download, .toolbarButton#print {
          display: none !important;
        }
        #toolbarContainer {
          display: none !important;
        }
        #toolbar {
          display: none !important;
        }
        #toolbarViewer {
          display: none !important;
        }
        #secondaryToolbar {
          display: none !important;
        }
        #sidebarContainer {
          display: none !important;
        }
        #outerContainer {
          margin: 0 !important;
          padding: 0 !important;
        }
        #mainContainer {
          margin: 0 !important;
          padding: 0 !important;
        }
        #viewerContainer {
          margin: 0 !important;
          padding: 0 !important;
        }
        #viewer {
          margin: 0 !important;
          padding: 0 !important;
        }
      `;
      iframe.contentDocument.head.appendChild(style);
    }
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="w-11/12 h-5/6 bg-white rounded-lg flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">{fileName}</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={zoomOut}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="축소"
            >
              <FiZoomOut className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button 
              onClick={zoomIn}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="확대"
            >
              <FiZoomIn className="h-5 w-5" />
            </button>
            <button 
              onClick={rotate}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="회전"
            >
              <FiRotateCw className="h-5 w-5" />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 p-4 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">PDF를 불러오는 중...</p>
              </div>
            </div>
          )}
          
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ 
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease-in-out'
            }}
          >
            <iframe
              src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fileUrl)}#toolbar=0&navpanes=0&scrollbar=0&download=0&print=0&secondaryToolbar=0&sidebar=0`}
              className="w-full h-full border-0"
              title={fileName}
              onLoad={handleIframeLoad}
              style={{ minHeight: '500px' }}
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 