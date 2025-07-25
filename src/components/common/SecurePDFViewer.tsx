'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FiX, FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut, FiRotateCw } from 'react-icons/fi';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// PDF.js 워커 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface SecurePDFViewerProps {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

export default function SecurePDFViewer({ fileUrl, fileName, onClose }: SecurePDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF 로드 오류:', error);
    setIsLoading(false);
    alert('PDF를 불러올 수 없습니다.');
  }

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
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
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="이전 페이지"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-600 min-w-[80px] text-center">
              {pageNumber} / {numPages}
            </span>
            <button 
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="다음 페이지"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
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
        
        <div className="flex-1 p-4 relative overflow-auto">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">PDF를 불러오는 중...</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-center">
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">PDF를 불러오는 중...</p>
                </div>
              }
              error={
                <div className="text-center text-red-600">
                  <p>PDF를 불러올 수 없습니다.</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-lg"
              />
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
} 