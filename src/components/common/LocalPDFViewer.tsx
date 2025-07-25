'use client';

import { useState, useEffect, useRef } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut, FiRotateCw, FiMaximize2 } from 'react-icons/fi';
import * as pdfjsLib from 'pdfjs-dist';

// PDF.js 워커 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface LocalPDFViewerProps {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

export default function LocalPDFViewer({ fileUrl, fileName, onClose }: LocalPDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [autoRotation, setAutoRotation] = useState<boolean>(true); // 자동 회전 활성화 상태
  
  // 화면 캡처처럼 보이도록 초기 스케일 계산 함수
  const calculateInitialScale = (pageWidth: number, pageHeight: number, currentRotation: number = 0) => {
    // 회전에 따른 실제 페이지 크기 계산
    const isRotated = currentRotation === 90 || currentRotation === 270;
    const actualWidth = isRotated ? pageHeight : pageWidth;
    const actualHeight = isRotated ? pageWidth : pageHeight;
    
    // 화면 전체 크기 활용 (View창을 최대한 활용)
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // 모달 크기 (실제 View창 크기)
    const modalWidth = screenWidth * 0.92; // w-11/12 (92%)
    const modalHeight = screenHeight; // h-full (100%)
    
    // 헤더와 패딩을 제외한 실제 사용 가능한 영역 (콘텐츠 박스 크기)
    const availableWidth = modalWidth - 20; // 좌우 패딩 (p-1 = 4px * 2) + 여유 공간
    const availableHeight = modalHeight - 80; // 헤더와 상하 패딩 + 여유 공간
    
    // 캔버스 크기를 콘텐츠 크기와 동일하게 맞추기
    const widthScale = availableWidth / actualWidth;
    const heightScale = availableHeight / actualHeight;
    
    // 콘텐츠 크기에 정확히 맞추기 위해 더 작은 스케일 선택
    const optimalScale = Math.min(widthScale, heightScale);
    
    // 최소 스케일 제한 (너무 작아지지 않도록)
    const finalScale = Math.max(optimalScale, 0.3);
    
    console.log('캔버스 크기 콘텐츠 크기 동일화 계산:', {
      screenWidth,
      screenHeight,
      modalWidth,
      modalHeight,
      availableWidth,
      availableHeight,
      pageWidth,
      pageHeight,
      actualWidth,
      actualHeight,
      currentRotation,
      widthScale,
      heightScale,
      optimalScale,
      finalScale
    });
    
    return finalScale;
  };

  // 자동 회전 계산 함수
  const calculateOptimalRotation = (pageWidth: number, pageHeight: number) => {
    // 화면 비율 (가로가 더 긴 경우)
    const screenWidth = window.innerWidth * 0.92 - 10; // 모달 가로 크기
    const screenHeight = window.innerHeight - 40; // 모달 세로 크기
    const screenRatio = screenWidth / screenHeight;
    
    // PDF 비율 (세로가 더 긴 경우)
    const pdfRatio = pageWidth / pageHeight;
    
    console.log('자동 회전 계산:', {
      screenWidth,
      screenHeight,
      screenRatio,
      pageWidth,
      pageHeight,
      pdfRatio
    });
    
    // PDF가 세로형이고, 화면이 가로형이면 회전
    if (pdfRatio < 1 && screenRatio > 1) {
      console.log('자동 회전 적용: 90도');
      return 90; // 90도 회전
    }
    
    console.log('자동 회전 없음: 0도');
    return 0; // 회전 없음
  };

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    loadPDF();
    return () => {
      isMountedRef.current = false;
      if (pdfRef.current) {
        pdfRef.current.destroy();
      }
    };
  }, [fileUrl]);

  const loadPDF = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('PDF 로딩 시작:', fileUrl);

      // PDF 문서 로드
      const loadingTask = pdfjsLib.getDocument({
        url: fileUrl,
        withCredentials: false,
        disableAutoFetch: false,
        disableStream: false
      });

      const pdf = await loadingTask.promise;
      
      if (!isMountedRef.current) return;
      
      pdfRef.current = pdf;

      console.log('PDF 로드 성공, 페이지 수:', pdf.numPages);

      setNumPages(pdf.numPages);
      setPageNumber(1);
      
      // 첫 페이지를 가져와서 자동 회전 및 초기 스케일 계산
      const firstPage = await pdf.getPage(1);
      const originalViewport = firstPage.getViewport({ scale: 1.0 });
      
      // 자동 회전 계산
      const optimalRotation = autoRotation ? calculateOptimalRotation(originalViewport.width, originalViewport.height) : 0;
      setRotation(optimalRotation);
      
      // 회전을 고려한 초기 스케일 계산
      const initialScale = calculateInitialScale(originalViewport.width, originalViewport.height, optimalRotation);
      
      console.log('초기 설정:', { 
        pageWidth: originalViewport.width, 
        pageHeight: originalViewport.height, 
        optimalRotation,
        initialScale 
      });
      
      setScale(initialScale);
      setIsLoading(false);

      // 첫 페이지 렌더링
      await renderPage(1);
    } catch (err) {
      if (!isMountedRef.current) return;
      
      console.error('PDF 로드 오류:', err);
      
      // 자동 재시도 (최대 3회)
      if (retryCount < 3) {
        console.log(`PDF 로드 재시도 ${retryCount + 1}/3`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          if (isMountedRef.current) {
            loadPDF();
          }
        }, 1000); // 1초 후 재시도
      } else {
        setError('PDF를 불러올 수 없습니다. 파일을 확인해주세요.');
        setIsLoading(false);
      }
    }
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfRef.current || !canvasContainerRef.current || !isMountedRef.current) {
      console.error('렌더링 조건 불충족:', { 
        pdf: !!pdfRef.current, 
        container: !!canvasContainerRef.current, 
        mounted: isMountedRef.current 
      });
      return;
    }

    try {
      console.log(`페이지 ${pageNum} 렌더링 시작`);
      
      const page = await pdfRef.current.getPage(pageNum);
      console.log('페이지 객체 가져오기 성공:', page);
      
      // 기존 Canvas 제거
      const container = canvasContainerRef.current;
      container.innerHTML = '';
      
      // 새로운 Canvas 생성
      const canvas = document.createElement('canvas');
      canvas.className = 'shadow-lg border border-gray-200';
      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';
      container.appendChild(canvas);
      
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas context를 가져올 수 없습니다.');
      }

      console.log('새 Canvas 생성 및 context 가져오기 성공');

      // 캔버스 크기 설정 (회전 적용)
      const viewport = page.getViewport({ scale, rotation });
      console.log('Viewport 설정:', { width: viewport.width, height: viewport.height, scale, rotation });
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      console.log('Canvas 크기 설정 완료:', { width: canvas.width, height: canvas.height });

      // 페이지 렌더링
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      console.log('렌더링 시작...');
      
      await page.render(renderContext).promise;
      
      if (isMountedRef.current) {
        console.log(`페이지 ${pageNum} 렌더링 완료`);
      } else {
        console.log('컴포넌트가 언마운트되어 렌더링 중단');
      }
      
    } catch (err) {
      if (!isMountedRef.current) return;
      
      console.error('페이지 렌더링 오류 상세:', err);
      console.error('오류 스택:', err instanceof Error ? err.stack : '스택 정보 없음');
      setError(`페이지를 렌더링할 수 없습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    }
  };

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      setPageNumber(newPage);
      renderPage(newPage);
    }
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      const newPage = pageNumber + 1;
      setPageNumber(newPage);
      renderPage(newPage);
    }
  };

  const zoomIn = () => {
    const newScale = Math.min(scale + 0.2, 5); // 최대 500%까지 확대 가능
    setScale(newScale);
    renderPage(pageNumber);
  };

  const zoomOut = () => {
    const newScale = Math.max(scale - 0.2, 0.1); // 최소 10%까지 축소 가능
    setScale(newScale);
    renderPage(pageNumber);
  };

  const rotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    renderPage(pageNumber);
  };

  // 자동 회전 토글 함수
  const toggleAutoRotation = async () => {
    const newAutoRotation = !autoRotation;
    setAutoRotation(newAutoRotation);
    
    if (newAutoRotation && pdfRef.current) {
      // 자동 회전이 활성화되면 최적 회전 계산
      const page = await pdfRef.current.getPage(pageNumber);
      const originalViewport = page.getViewport({ scale: 1.0 });
      const optimalRotation = calculateOptimalRotation(originalViewport.width, originalViewport.height);
      setRotation(optimalRotation);
      
      // 새로운 회전에 맞는 스케일 재계산
      const newScale = calculateInitialScale(originalViewport.width, originalViewport.height, optimalRotation);
      setScale(newScale);
      
      renderPage(pageNumber);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      goToPrevPage();
    } else if (e.key === 'ArrowRight') {
      goToNextPage();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center" 
      style={{ zIndex: 9999 }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="w-11/12 h-full bg-white rounded-lg flex flex-col">
        <div className="flex justify-between items-center p-1 border-b">
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
              title="수동 회전"
            >
              <FiRotateCw className="h-5 w-5" />
            </button>
            <button 
              onClick={toggleAutoRotation}
              className={`p-2 transition-colors ${
                autoRotation 
                  ? 'text-blue-600 hover:text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title={autoRotation ? "자동 회전 비활성화" : "자동 회전 활성화"}
            >
              <FiMaximize2 className="h-5 w-5" />
            </button>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 p-1 relative overflow-auto">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  PDF를 불러오는 중...
                  {retryCount > 0 && <span className="block text-sm text-gray-500">재시도 {retryCount}/3</span>}
                </p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div className="text-center">
                <div className="text-red-600 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium">{error}</p>
                <button 
                  onClick={() => {
                    setRetryCount(0);
                    loadPDF();
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}
          
          <div className="flex justify-center">
            <div ref={canvasContainerRef} className="flex justify-center">
              {/* Canvas가 여기에 동적으로 생성됩니다 */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 