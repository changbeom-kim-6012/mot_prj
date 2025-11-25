'use client';

import { useState, useEffect, useRef } from 'react';
import { FiArrowRight } from 'react-icons/fi';

interface CourseOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CourseOverviewModal({ isOpen, onClose }: CourseOverviewModalProps) {
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isOpen && imgRef.current) {
      const img = imgRef.current;
      const updateDimensions = () => {
        if (img.naturalWidth && img.naturalHeight) {
          setImageDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight
          });
        }
      };

      if (img.complete) {
        updateDimensions();
      } else {
        img.onload = updateDimensions;
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 모니터 높이에 따라 이미지 높이를 먼저 결정하고, 그에 맞춰 모달 너비 조절
  const calculateModalDimensions = () => {
    if (!imageDimensions || typeof window === 'undefined') {
      return { width: '98vw', imageHeight: 'auto' };
    }

    // 모달의 사용 가능한 높이 계산 (95vh - 헤더 높이 약 80px - 패딩 32px)
    const availableHeight = window.innerHeight * 0.95 - 80 - 32;
    
    // 이미지의 가로세로 비율
    const aspectRatio = imageDimensions.width / imageDimensions.height;
    
    // 이미지 높이를 사용 가능한 높이에 맞춤 (최대한 활용)
    const imageHeight = availableHeight;
    
    // 그 높이에 맞춰 이미지 너비 계산
    const calculatedImageWidth = imageHeight * aspectRatio;
    
    // 모달 너비 = 이미지 너비 + 좌우 패딩 (각각 50px씩)
    const modalWidth = calculatedImageWidth + 100;
    
    // 최소 너비 600px, 최대 너비는 화면 너비의 98%
    const minWidth = 600;
    const maxWidth = window.innerWidth * 0.98;
    
    const finalWidth = Math.min(Math.max(modalWidth, minWidth), maxWidth);
    
    // 최대 너비에 제한된 경우, 이미지 높이를 다시 조정
    let finalImageHeight = imageHeight;
    if (finalWidth < modalWidth) {
      // 너비 제한으로 인해 높이를 줄여야 함
      const availableWidth = finalWidth - 100; // 패딩 제외
      finalImageHeight = availableWidth / aspectRatio;
    }
    
    return { 
      width: `${finalWidth}px`, 
      imageHeight: `${finalImageHeight}px` 
    };
  };

  const { width: modalWidth, imageHeight } = calculateModalDimensions();

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        <div className="flex min-h-full items-center justify-center p-2">
          <div 
            className="relative bg-white rounded-2xl shadow-xl h-[95vh] flex flex-col transition-all duration-300"
            style={{ width: modalWidth }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-bold text-gray-900">기술경영(MOT) 핵심 프로세스</h2>
              </div>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FiArrowRight className="w-4 h-4" />
                목록으로 돌아가기
              </button>
            </div>

            {/* 메인 콘텐츠 영역 - 캡처 화면 이미지 표시 */}
            <div className="flex-1 p-4 overflow-y-auto flex items-center justify-center bg-gray-50">
              <div className="w-full h-full flex items-center justify-center">
                <img
                  ref={imgRef}
                  src="/MOT_Overview.png"
                  alt="기술경영(MOT) 핵심 프로세스"
                  className="object-contain"
                  style={{ 
                    height: imageHeight,
                    width: 'auto',
                    maxWidth: '100%'
                  }}
                  onError={(e) => {
                    // 이미지가 없을 경우 대체 텍스트 표시
                    const target = e.target as HTMLImageElement;
                    const imgSrc = target.src;
                    console.error('이미지 로딩 실패:', imgSrc);
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="text-center p-8">
                          <p class="text-gray-500 text-lg mb-4">MOT Overview 이미지 파일을 찾을 수 없습니다.</p>
                          <p class="text-gray-400 text-sm mb-2">요청한 경로: ${imgSrc}</p>
                          <p class="text-gray-400 text-sm mb-2">프로덕션 환경에서는 /public/MOT_Overview.png 파일이 서버에 배포되어야 합니다.</p>
                          <p class="text-gray-400 text-sm">빌드 시 public 폴더의 파일이 제대로 복사되었는지 확인해주세요.</p>
                          <p class="text-gray-400 text-xs mt-4">브라우저 개발자 도구의 Network 탭에서 실제 요청 URL을 확인하세요.</p>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 