'use client';

import { useState } from 'react';
import { FiX, FiArrowRight, FiBookOpen, FiSettings, FiUsers, FiTrendingUp, FiTarget, FiZap, FiDollarSign, FiDatabase } from 'react-icons/fi';
import PDFViewerModal from './PDFViewerModal';

interface CourseOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CourseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    title: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    image: string;
  } | null;
}

// 개별 과정 상세 모달 (빈 화면)
function CourseDetailModal({ isOpen, onClose, course }: CourseDetailModalProps) {
  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${course.bgColor} rounded-xl flex items-center justify-center`}>
                {course.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FiArrowRight className="w-4 h-4" />
              목록으로 돌아가기
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 text-lg">상세 내용이 준비 중입니다...</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CourseOverviewModal({ isOpen, onClose }: CourseOverviewModalProps) {
  const [selectedCourse, setSelectedCourse] = useState<CourseDetailModalProps['course']>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string>('');
  const [selectedPdfTitle, setSelectedPdfTitle] = useState<string>('');

  const courses = [
    {
      title: "MOT 이론 및 방법론",
      icon: <FiBookOpen className="w-6 h-6 text-emerald-600" />,
      color: "text-emerald-900",
      bgColor: "bg-emerald-50",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2310b981;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23059669;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23grad1)'/%3E%3Ccircle cx='120' cy='100' r='40' fill='white' opacity='0.2'/%3E%3Ccircle cx='280' cy='80' r='30' fill='white' opacity='0.2'/%3E%3Ccircle cx='200' cy='200' r='25' fill='white' opacity='0.2'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='16' fill='white' text-anchor='middle'%3EMOT 이론%3C/text%3E%3Ctext x='200' y='170' font-family='Arial' font-size='12' fill='white' text-anchor='middle'%3E방법론%3C/text%3E%3C/svg%3E"
    },
    {
      title: "MOT 운영 시스템",
      icon: <FiSettings className="w-6 h-6 text-blue-600" />,
      color: "text-blue-900",
      bgColor: "bg-blue-50",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='grad2' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%233b82f6;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%231d4ed8;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23grad2)'/%3E%3Crect x='100' y='80' width='200' height='140' fill='white' opacity='0.1' rx='10'/%3E%3Ccircle cx='150' cy='120' r='15' fill='white' opacity='0.3'/%3E%3Ccircle cx='250' cy='120' r='15' fill='white' opacity='0.3'/%3E%3Ccircle cx='200' cy='180' r='15' fill='white' opacity='0.3'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='16' fill='white' text-anchor='middle'%3E운영 시스템%3C/text%3E%3C/svg%3E"
    },
    {
      title: "실무 중심 교육",
      icon: <FiUsers className="w-6 h-6 text-purple-600" />,
      color: "text-purple-900",
      bgColor: "bg-purple-50",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='grad3' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%238b5cf6;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%236d28d9;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23grad3)'/%3E%3Ccircle cx='150' cy='120' r='25' fill='white' opacity='0.2'/%3E%3Ccircle cx='250' cy='120' r='25' fill='white' opacity='0.2'/%3E%3Ccircle cx='200' cy='180' r='25' fill='white' opacity='0.2'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='16' fill='white' text-anchor='middle'%3E실무 교육%3C/text%3E%3C/svg%3E"
    },
    {
      title: "최신 트렌드 반영",
      icon: <FiTrendingUp className="w-6 h-6 text-orange-600" />,
      color: "text-orange-900",
      bgColor: "bg-orange-50",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='grad4' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f97316;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23ea580c;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='300' fill='url(%23grad4)'/%3E%3Cpolyline points='100,200 150,150 200,180 250,120 300,140' stroke='white' stroke-width='3' fill='none' opacity='0.8'/%3E%3Ccircle cx='100' cy='200' r='4' fill='white'/%3E%3Ccircle cx='150' cy='150' r='4' fill='white'/%3E%3Ccircle cx='200' cy='180' r='4' fill='white'/%3E%3Ccircle cx='250' cy='120' r='4' fill='white'/%3E%3Ccircle cx='300' cy='140' r='4' fill='white'/%3E%3Ctext x='200' y='80' font-family='Arial' font-size='16' fill='white' text-anchor='middle'%3E최신 트렌드%3C/text%3E%3C/svg%3E"
    }
  ];

  const handleCourseClick = (course: typeof courses[0]) => {
    setSelectedCourse(course);
    setDetailModalOpen(true);
  };

  const handleDetailModalClose = () => {
    setDetailModalOpen(false);
    setSelectedCourse(null);
  };

  const handlePdfViewerOpen = (pdfUrl: string, title: string) => {
    setSelectedPdfUrl(pdfUrl);
    setSelectedPdfTitle(title);
    setPdfViewerOpen(true);
  };

  const handlePdfViewerClose = () => {
    setPdfViewerOpen(false);
    setSelectedPdfUrl('');
    setSelectedPdfTitle('');
  };

  const handleAreaClick = (area: string) => {
    setSelectedArea(selectedArea === area ? null : area);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
                 <div className="flex min-h-full items-center justify-center p-4">
           <div className="relative bg-white rounded-2xl shadow-xl max-w-7xl w-full h-[90vh] flex flex-col">
             <div className="flex items-center justify-between p-6 border-b border-gray-200">
               <div className="flex items-center gap-4">
                 <h2 className="text-2xl font-bold text-gray-900">기술경영(MOT) 핵심 프로세스</h2>
                 <button
                   onClick={() => handlePdfViewerOpen(
                     'http://mot.erns.co.kr/api/library/view/MOT%20교육과정%20Overview.pdf',
                     'MOT 교육과정 Overview'
                   )}
                   className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                 >
                   <FiBookOpen className="w-4 h-4" />
                   PDF 보기
                 </button>
               </div>
               <button
                 onClick={onClose}
                 className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
               >
                 <FiArrowRight className="w-4 h-4" />
                 목록으로 돌아가기
               </button>
             </div>

             <div className="flex flex-1 overflow-hidden">
               {/* 왼쪽 슬라이드 영역 */}
               {selectedArea && (
                 <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
                   <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-semibold text-gray-900">
                       {selectedArea === 'strategy' && 'I. 기술전략'}
                       {selectedArea === 'development' && 'II. 기술개발'}
                       {selectedArea === 'commercialization' && 'III. 기술사업화'}
                       {selectedArea === 'infrastructure' && 'IV. 기술인프라'}
                     </h3>
                     <button
                       onClick={() => setSelectedArea(null)}
                       className="p-1 hover:bg-gray-200 rounded"
                     >
                       <FiX className="w-4 h-4 text-gray-500" />
                     </button>
                   </div>
                   
                   {/* 교육과정 섹션 */}
                   <div className="mb-6">
                     <h4 className="font-medium text-gray-900 mb-3">교육과정</h4>
                     <div className="bg-white rounded-lg p-4 border border-gray-200 min-h-32">
                       <p className="text-gray-500 text-sm">교육과정 내용이 준비 중입니다...</p>
                     </div>
                   </div>
                   
                   {/* 교육과목 섹션 */}
                   <div>
                     <h4 className="font-medium text-gray-900 mb-3">교육과목</h4>
                     <div className="bg-white rounded-lg p-4 border border-gray-200 min-h-32">
                       <p className="text-gray-500 text-sm">교육과목 내용이 준비 중입니다...</p>
                     </div>
                   </div>
                 </div>
               )}

               {/* 메인 콘텐츠 영역 */}
               <div className={`flex-1 p-6 overflow-y-auto ${selectedArea ? '' : 'w-full'}`}>
                 {/* 상단 4개 영역 */}
                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                   {/* I. 기술전략 */}
                   <div 
                     className={`relative bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200 cursor-pointer transition-all duration-200 hover:scale-105 overflow-hidden ${selectedArea === 'strategy' ? 'ring-2 ring-emerald-400 shadow-lg' : ''}`}
                     onClick={() => handleAreaClick('strategy')}
                   >
                     {/* 배경 레이어 - 기술전략 관련 그림 */}
                     <div className="absolute inset-0 opacity-70">
                       <svg width="100%" height="100%" viewBox="0 0 300 200" className="text-emerald-600">
                         <defs>
                           <linearGradient id="strategyBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                             <stop offset="0%" stopColor="currentColor" stopOpacity="0.8"/>
                             <stop offset="100%" stopColor="currentColor" stopOpacity="0.4"/>
                           </linearGradient>
                         </defs>
                         
                         {/* 전략 네트워크 패턴 */}
                         <g fill="none" stroke="currentColor" strokeWidth="3">
                           {/* 중앙 허브 */}
                           <circle cx="150" cy="100" r="20" fill="url(#strategyBgGradient)" stroke="currentColor" strokeWidth="3"/>
                           
                           {/* 연결 라인들 */}
                           <path d="M50 50 L130 80" opacity="0.9"/>
                           <path d="M250 50 L170 80" opacity="0.9"/>
                           <path d="M50 150 L130 120" opacity="0.9"/>
                           <path d="M250 150 L170 120" opacity="0.9"/>
                           <path d="M150 30 L150 80" opacity="0.9"/>
                           <path d="M150 120 L150 170" opacity="0.9"/>
                           
                           {/* 전략 노드들 */}
                           <circle cx="50" cy="50" r="12" fill="currentColor" opacity="0.85"/>
                           <circle cx="250" cy="50" r="12" fill="currentColor" opacity="0.85"/>
                           <circle cx="50" cy="150" r="12" fill="currentColor" opacity="0.85"/>
                           <circle cx="250" cy="150" r="12" fill="currentColor" opacity="0.85"/>
                           <circle cx="150" cy="30" r="12" fill="currentColor" opacity="0.85"/>
                           <circle cx="150" cy="170" r="12" fill="currentColor" opacity="0.85"/>
                           
                           {/* 추가 연결망 */}
                           <path d="M100 30 L200 30" strokeDasharray="5,5" opacity="0.7" strokeWidth="2"/>
                           <path d="M100 170 L200 170" strokeDasharray="5,5" opacity="0.7" strokeWidth="2"/>
                           <path d="M30 100 L120 100" strokeDasharray="5,5" opacity="0.7" strokeWidth="2"/>
                           <path d="M180 100 L270 100" strokeDasharray="5,5" opacity="0.7" strokeWidth="2"/>
                           
                           {/* 방향성 화살표들 */}
                           <defs>
                             <marker id="arrowheadBg" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto">
                               <polygon points="0 0, 10 4, 0 8" fill="currentColor" opacity="0.9"/>
                             </marker>
                           </defs>
                           <path d="M80 80 L120 100" markerEnd="url(#arrowheadBg)" opacity="0.9" strokeWidth="2"/>
                           <path d="M220 80 L180 100" markerEnd="url(#arrowheadBg)" opacity="0.9" strokeWidth="2"/>
                           <path d="M80 120 L120 100" markerEnd="url(#arrowheadBg)" opacity="0.9" strokeWidth="2"/>
                           <path d="M220 120 L180 100" markerEnd="url(#arrowheadBg)" opacity="0.9" strokeWidth="2"/>
                         </g>
                       </svg>
                     </div>
                     
                     {/* 상단 레이어 - 반투명 콘텐츠 */}
                     <div className="relative z-10 bg-white bg-opacity-60 rounded-lg p-2">
                       <div className="flex items-center gap-2 mb-3">
                         <FiTarget className="w-5 h-5 text-emerald-700" />
                         <h3 className="font-bold text-emerald-900">I. 기술전략</h3>
                       </div>
                       <div className="space-y-2 text-sm text-emerald-900 font-medium">
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-700 rounded-full"></div>
                           <span>신사업/신제품 구상</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-700 rounded-full"></div>
                           <span>사업전략과 R&D 전략 연계</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-700 rounded-full"></div>
                           <span>MOT 환경분석</span>
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* II. 기술개발 */}
                   <div 
                     className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 cursor-pointer transition-all duration-200 hover:scale-105 ${selectedArea === 'development' ? 'ring-2 ring-blue-400 shadow-lg' : ''}`}
                     onClick={() => handleAreaClick('development')}
                   >
                     <div className="flex items-center gap-2 mb-3">
                       <FiZap className="w-5 h-5 text-blue-600" />
                       <h3 className="font-semibold text-blue-900">II. 기술개발</h3>
                     </div>
                     <div className="space-y-2 text-sm text-blue-800">
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                         <span>기술전략의 실행</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                         <span>R&D 과제 기획/수행</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                         <span>R&D 평가/이전</span>
                       </div>
                     </div>
                   </div>

                   {/* III. 기술사업화 */}
                   <div 
                     className={`bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 cursor-pointer transition-all duration-200 hover:scale-105 ${selectedArea === 'commercialization' ? 'ring-2 ring-purple-400 shadow-lg' : ''}`}
                     onClick={() => handleAreaClick('commercialization')}
                   >
                     <div className="flex items-center gap-2 mb-3">
                       <FiDollarSign className="w-5 h-5 text-purple-600" />
                       <h3 className="font-semibold text-purple-900">III. 기술사업화</h3>
                     </div>
                     <div className="space-y-2 text-sm text-purple-800">
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                         <span>기술사업화 전략</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                         <span>기술거래 및 협상</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                         <span>지적자산 전략</span>
                       </div>
                     </div>
                   </div>

                   {/* IV. 기술인프라 */}
                   <div 
                     className={`bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 cursor-pointer transition-all duration-200 hover:scale-105 ${selectedArea === 'infrastructure' ? 'ring-2 ring-orange-400 shadow-lg' : ''}`}
                     onClick={() => handleAreaClick('infrastructure')}
                   >
                     <div className="flex items-center gap-2 mb-3">
                       <FiDatabase className="w-5 h-5 text-orange-600" />
                       <h3 className="font-semibold text-orange-900">IV. 기술인프라</h3>
                     </div>
                     <div className="space-y-2 text-sm text-orange-800">
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                         <span>R&D 예산 및 회계처리</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                         <span>기술정보 관리</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                         <span>R&D 관리 시스템</span>
                       </div>
                     </div>
                   </div>
                 </div>

                                                                    {/* 중앙 프로세스 흐름도 */}
                   <div className="bg-gray-50 rounded-xl p-4 mb-4 mx-auto" style={{ width: '80%' }}>
                     <h3 className="text-base font-semibold text-gray-900 mb-3 text-center">MOT 핵심 프로세스 흐름</h3>
                     <div className="flex items-center justify-between">
                       <div className="flex-1 text-center">
                         <div className="bg-emerald-100 rounded-lg p-2 mb-1">
                           <h4 className="font-medium text-emerald-900 text-sm">기술전략</h4>
                         </div>
                         <div className="text-xs text-gray-600 space-y-0.5">
                           <div>• 신사업/신제품 구상</div>
                           <div>• 사업전략과 R&D 전략 연계</div>
                           <div>• MOT 환경분석</div>
                         </div>
                       </div>
                       <FiArrowRight className="w-5 h-5 text-gray-400 mx-3" />
                       <div className="flex-1 text-center">
                         <div className="bg-blue-100 rounded-lg p-2 mb-1">
                           <h4 className="font-medium text-blue-900 text-sm">기술개발</h4>
                         </div>
                         <div className="text-xs text-gray-600 space-y-0.5">
                           <div>• 기술전략의 실행</div>
                           <div>• R&D 과제 기획/수행</div>
                           <div>• R&D 평가/이전</div>
                         </div>
                       </div>
                       <FiArrowRight className="w-5 h-5 text-gray-400 mx-3" />
                       <div className="flex-1 text-center">
                         <div className="bg-purple-100 rounded-lg p-2 mb-1">
                           <h4 className="font-medium text-purple-900 text-sm">기술사업화</h4>
                         </div>
                         <div className="text-xs text-gray-600 space-y-0.5">
                           <div>• 기술사업화 전략</div>
                           <div>• 기술거래 및 협상</div>
                           <div>• 지적자산 전략</div>
                         </div>
                       </div>
                     </div>
                     <div className="mt-4 text-center">
                       <div className="bg-orange-100 rounded-lg p-2 inline-block">
                         <h4 className="font-medium text-orange-900 text-sm">
                           <span className="font-bold">기술인프라</span> <span className="text-xs font-normal">(R&D 예산 및 회계관리, 기술정보관리, R&D 관리시스템)</span>
                         </h4>
                       </div>
                     </div>
                   </div>

                 {/* 하단 도구/시스템 예시 */}
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                   <div className="bg-white border border-gray-200 rounded-xl p-3">
                     <h4 className="font-semibold text-gray-900 mb-2 text-sm">기술기획 (Roadmap & Tree)</h4>
                     <div className="flex items-center gap-3">
                       <div className="w-12 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                         <FiBookOpen className="w-5 h-5 text-emerald-600" />
                       </div>
                       <div className="text-xs text-gray-600">
                         <div>• 프로젝트 로드맵</div>
                         <div>• 계층적 구조 트리</div>
                       </div>
                     </div>
                   </div>

                   <div className="bg-white border border-gray-200 rounded-xl p-3">
                     <h4 className="font-semibold text-gray-900 mb-2 text-sm">R&D 과제기획/수행</h4>
                     <div className="flex items-center gap-3">
                       <div className="w-12 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                         <FiZap className="w-5 h-5 text-blue-600" />
                       </div>
                       <div className="text-xs text-gray-600">
                         <div>• Stage-Gate Process</div>
                         <div>• 프로젝트 진행 단계별 관리</div>
                       </div>
                     </div>
                   </div>

                   <div className="bg-white border border-gray-200 rounded-xl p-3">
                     <h4 className="font-semibold text-gray-900 mb-2 text-sm">R&D 관리 시스템</h4>
                     <div className="flex items-center gap-3">
                       <div className="w-12 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                         <FiDatabase className="w-5 h-5 text-orange-600" />
                       </div>
                       <div className="text-xs text-gray-600">
                         <div>• Project KMS</div>
                         <div>• 일정, 인력, 비용 관리</div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
      </div>

      {/* 개별 과정 상세 모달 */}
      <CourseDetailModal
        isOpen={detailModalOpen}
        onClose={handleDetailModalClose}
        course={selectedCourse}
      />

      {/* PDF 뷰어 모달 */}
      <PDFViewerModal
        isOpen={pdfViewerOpen}
        onClose={handlePdfViewerClose}
        pdfUrl={selectedPdfUrl}
        title={selectedPdfTitle}
      />
    </>
  );
} 