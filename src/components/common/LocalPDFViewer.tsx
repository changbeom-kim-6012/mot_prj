'use client';

import { useState, useEffect, useRef } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut, FiRotateCw, FiMaximize2 } from 'react-icons/fi';

// PDF.js 전역 변수
let pdfjsLib: any = null;

// PDF.js 초기화 함수
const initializePDFJS = async () => {
  if (typeof window === 'undefined') {
    console.log('서버 사이드에서 실행 중, PDF.js 초기화 건너뜀');
    return null;
  }

  try {
    // 이미 초기화된 경우 재사용
    if (pdfjsLib) {
      console.log('PDF.js 이미 초기화됨, 재사용');
      return pdfjsLib;
    }

    // 방법 1: 전역 PDF.js 객체 사용 (CDN에서 로드된 경우)
    if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
      console.log('전역 PDF.js 객체 사용');
      pdfjsLib = (window as any).pdfjsLib;
    } else {
      // 방법 2: CDN에서 직접 로드
      console.log('CDN에서 PDF.js 로드 시도');
      
      // PDF.js 스크립트 로드
      const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
          }
          
          const script = document.createElement('script');
          script.src = src;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
          document.head.appendChild(script);
        });
      };

      // PDF.js 메인 스크립트 로드
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
      
      // 전역 객체 확인
      if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
        pdfjsLib = (window as any).pdfjsLib;
        console.log('CDN에서 PDF.js 로드 성공');
      } else {
        throw new Error('PDF.js 전역 객체를 찾을 수 없습니다');
      }
    }

    // 워커 설정
    if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
      const workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
      console.log('PDF.js 워커 설정 완료:', workerSrc);
    }

    return pdfjsLib;
  } catch (error) {
    console.error('PDF.js 초기화 오류:', error);
    return null;
  }
};

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
  const [autoRotation, setAutoRotation] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [pdfjsInitialized, setPdfjsInitialized] = useState(false);
  
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // PDF.js 초기화
  useEffect(() => {
    const initPDFJS = async () => {
      const initialized = await initializePDFJS();
      if (initialized) {
        setPdfjsInitialized(true);
        console.log('PDF.js 초기화 완료');
      } else {
        console.error('PDF.js 초기화 실패');
        setError('PDF 뷰어를 초기화할 수 없습니다.');
        setIsLoading(false);
      }
    };

    initPDFJS();
  }, []);

  useEffect(() => {
    if (pdfjsInitialized) {
      isMountedRef.current = true;
      loadPDF();
    }
    
    return () => {
      isMountedRef.current = false;
      if (pdfRef.current) {
        pdfRef.current.destroy();
      }
    };
  }, [fileUrl, pdfjsInitialized]);

  // numPages가 설정되면 자동으로 렌더링 실행
  useEffect(() => {
    if (numPages > 0 && pdfRef.current && !isLoading) {
      console.log('numPages 변경으로 인한 재렌더링');
      renderAllPages();
    }
  }, [numPages, scale, rotation]);

  // 초기 스케일 계산 함수
  const calculateInitialScale = (pageWidth: number, pageHeight: number, currentRotation: number = 0) => {
    const isRotated = currentRotation === 90 || currentRotation === 270;
    const actualWidth = isRotated ? pageHeight : pageWidth;
    const actualHeight = isRotated ? pageWidth : pageHeight;
    
    const screenWidth = window.innerWidth;
    const modalWidth = screenWidth * 0.90;
    const availableWidth = modalWidth - 40; // 여백 증가
    
    // 가로 너비에 맞춰 스케일 계산 (세로 스크롤 허용)
    const widthScale = availableWidth / actualWidth;
    const finalScale = Math.max(widthScale, 0.8); // 최소 스케일 0.8로 조정
    
    return finalScale;
  };

  // 자동 회전 계산 함수
  const calculateOptimalRotation = (pageWidth: number, pageHeight: number) => {
    const screenWidth = window.innerWidth * 0.92 - 10;
    const screenHeight = window.innerHeight - 40;
    const screenRatio = screenWidth / screenHeight;
    const pdfRatio = pageWidth / pageHeight;
    
    if (pdfRatio < 1 && screenRatio > 1) {
      return 90;
    }
    return 0;
  };

  const renderAllPages = async () => {
    if (!pdfRef.current || !canvasContainerRef.current || !isMountedRef.current) {
      return;
    }

    try {
      console.log('모든 페이지 렌더링 시작');
      
      const container = canvasContainerRef.current;
      container.innerHTML = '';
      
      // PDF 객체에서 직접 페이지 수 가져오기
      const totalPages = pdfRef.current.numPages;
      console.log(`총 페이지 수: ${totalPages}`);
      
      // 모든 페이지를 순차적으로 렌더링
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        if (!isMountedRef.current) return;
        
        console.log(`페이지 ${pageNum}/${totalPages} 렌더링 중...`);
        
        const page = await pdfRef.current.getPage(pageNum);
        
        const canvas = document.createElement('canvas');
        canvas.className = 'shadow-lg border border-gray-200 mb-4';
        canvas.style.maxWidth = '100%';
        canvas.style.height = 'auto';
        canvas.style.width = 'auto';
        canvas.style.display = 'block';
        container.appendChild(canvas);
        
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Canvas context를 가져올 수 없습니다.');
        }

        const viewport = page.getViewport({ scale, rotation });
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        
        // 페이지 번호 표시 (선택사항)
        const pageLabel = document.createElement('div');
        pageLabel.className = 'text-center text-sm text-gray-500 mb-2 mt-2';
        pageLabel.textContent = `페이지 ${pageNum}`;
        container.appendChild(pageLabel);
      }
      
      if (isMountedRef.current) {
        console.log('모든 페이지 렌더링 완료');
      }
      
    } catch (err) {
      if (!isMountedRef.current) return;
      
      console.error('모든 페이지 렌더링 오류:', err);
      setError(`페이지를 렌더링할 수 없습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    }
  };

  const loadPDF = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('PDF 로딩 시작:', fileUrl);
      
      if (!pdfjsLib || typeof pdfjsLib.getDocument !== 'function') {
        throw new Error('PDF.js 모듈이 제대로 로드되지 않았습니다');
      }

      if (!fileUrl || fileUrl.trim() === '') {
        throw new Error('PDF 파일 URL이 제공되지 않았습니다');
      }

      // PDF 문서 로드
      const loadingTask = pdfjsLib.getDocument({
        url: fileUrl,
        withCredentials: false,
        disableAutoFetch: false,
        disableStream: false,
        isEvalSupported: false,
        useSystemFonts: false,
        standardFontDataUrl: undefined,
        maxImageSize: -1,
        cMapUrl: undefined,
        cMapPacked: false,
        enableXfa: false,
        enableRange: false
      });

      // 로딩 타임아웃 설정 (30초)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('PDF 로딩 시간 초과')), 30000);
      });

      const pdf = await Promise.race([loadingTask.promise, timeoutPromise]);
      
      if (!isMountedRef.current) return;
      
      pdfRef.current = pdf;

      console.log('PDF 로드 성공, 페이지 수:', pdf.numPages);

      // 첫 페이지를 가져와서 초기 스케일 계산
      const firstPage = await pdf.getPage(1);
      const originalViewport = firstPage.getViewport({ scale: 1.0 });
      
      // 회전 없이 표시
      setRotation(0);
      
      const initialScale = calculateInitialScale(originalViewport.width, originalViewport.height, 0);
      setScale(initialScale);
      
      // 상태 업데이트 (이것이 useEffect를 트리거하여 자동으로 렌더링됨)
      setNumPages(pdf.numPages);
      setPageNumber(1);
      
      // 로딩 상태를 false로 설정
      setIsLoading(false);
      
      console.log('PDF 로드 및 상태 설정 완료');
      
    } catch (err) {
      if (!isMountedRef.current) return;
      
      console.error('PDF 로드 오류:', err);
      
      if (retryCount < 3) {
        console.log(`PDF 로드 재시도 ${retryCount + 1}/3`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          if (isMountedRef.current) {
            loadPDF();
          }
        }, 2000);
      } else {
        let errorMessage = 'PDF를 불러올 수 없습니다.';
        if (err instanceof Error) {
          if (err.message.includes('시간 초과')) {
            errorMessage = 'PDF 로딩 시간이 초과되었습니다. 파일 크기를 확인해주세요.';
          } else if (err.message.includes('URL')) {
            errorMessage = 'PDF 파일 경로를 확인해주세요.';
          } else if (err.message.includes('CORS')) {
            errorMessage = '파일 접근 권한이 없습니다.';
          } else {
            errorMessage = `PDF 로딩 오류: ${err.message}`;
          }
        }
        setError(errorMessage);
        setIsLoading(false);
      }
    }
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfRef.current || !canvasContainerRef.current || !isMountedRef.current) {
      return;
    }

    try {
      console.log(`페이지 ${pageNum} 렌더링 시작`);
      
      const page = await pdfRef.current.getPage(pageNum);
      
      const container = canvasContainerRef.current;
      container.innerHTML = '';
      
      const canvas = document.createElement('canvas');
      canvas.className = 'shadow-lg border border-gray-200 mb-4';
      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';
      canvas.style.width = 'auto';
      canvas.style.display = 'block';
      container.appendChild(canvas);
      
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas context를 가져올 수 없습니다.');
      }

      const viewport = page.getViewport({ scale, rotation });
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      
      if (isMountedRef.current) {
        console.log(`페이지 ${pageNum} 렌더링 완료`);
      }
      
    } catch (err) {
      if (!isMountedRef.current) return;
      
      console.error('페이지 렌더링 오류:', err);
      setError(`페이지를 렌더링할 수 없습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    }
  };

  // 페이지 네비게이션 기능 제거 (모든 페이지가 연속으로 표시됨)

  const zoomIn = () => {
    const newScale = Math.min(scale + 0.2, 5);
    setScale(newScale);
    renderAllPages();
  };

  const zoomOut = () => {
    const newScale = Math.max(scale - 0.2, 0.5);
    setScale(newScale);
    renderAllPages();
  };

  const rotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    renderAllPages();
  };

  const toggleAutoRotation = () => {
    setAutoRotation(!autoRotation);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case '+':
      case '=':
        zoomIn();
        break;
      case '-':
        zoomOut();
        break;
      case 'r':
        rotate();
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center" 
      style={{ zIndex: 9999 }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="w-11/12 h-[95vh] bg-white rounded-lg flex flex-col">
        <div className="flex justify-between items-center p-1 border-b">
          <h3 className="text-lg font-medium">{fileName}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 min-w-[80px] text-center">
              전체 {numPages}페이지
            </span>
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
        
        <div className="flex-1 p-2 relative overflow-auto">
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
                    setError(null);
                    setIsLoading(true);
                    const retryLoad = async () => {
                      try {
                        const initialized = await initializePDFJS();
                        if (initialized) {
                          setPdfjsInitialized(true);
                          loadPDF();
                        } else {
                          setError('PDF 뷰어를 초기화할 수 없습니다.');
                          setIsLoading(false);
                        }
                      } catch (error) {
                        console.error('재시도 중 초기화 오류:', error);
                        setError('PDF 뷰어 재초기화에 실패했습니다.');
                        setIsLoading(false);
                      }
                    };
                    retryLoad();
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}
          
          <div className="w-full h-full flex justify-center">
            <div ref={canvasContainerRef} className="w-full flex flex-col items-center">
              {/* Canvas가 여기에 동적으로 생성됩니다 */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 