'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiUsers, FiEye, FiDownload, FiSearch, FiPlus } from 'react-icons/fi';
import Navigation from '@/components/Navigation';
import FileViewer from '@/components/common/FileViewer';

interface RelatedMaterial {
  id: number;
  title: string;
  description: string;
  fileName: string;
  filePath: string;
  category: string;
}

export default function LearningPage() {
  const [relatedMaterials, setRelatedMaterials] = useState<RelatedMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<RelatedMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<{ fileName: string; fileUrl: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAdmin] = useState(true); // 임시로 true로 설정, 실제로는 AuthContext에서 가져와야 함

  // 관련자료 목록 불러오기
  useEffect(() => {
    fetchRelatedMaterials();
  }, []);

  const fetchRelatedMaterials = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/library');
      if (response.ok) {
        const data = await response.json();
        // MOT 이론 및 방법론 관련 자료만 필터링
        const filteredData = data.filter((item: any) => 
          item.category === 'MOT 이론 및 방법론'
        ).map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          fileName: item.fileNames ? item.fileNames.split(',')[0].trim() : '',
          filePath: item.filePaths ? item.filePaths.split(',')[0].trim() : '',
          category: item.category
        }));
        setRelatedMaterials(filteredData);
      } else {
        console.error('관련자료 목록 조회 실패:', response.status);
      }
    } catch (error) {
      console.error('관련자료 목록 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = (fileName: string, filePath: string) => {
    // Library와 동일한 방식으로 파일보기 처리
    const encodedPath = encodeURIComponent(filePath).replace(/[!'()*]/g, function(c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
    const fileUrl = `http://localhost:8080/api/library/view/${encodedPath}`;
    
    console.log('=== Learning 파일 보기 디버깅 ===');
    console.log('원본 fileName:', fileName);
    console.log('원본 filePath:', filePath);
    console.log('인코딩된 filePath:', encodedPath);
    console.log('생성된 fileUrl:', fileUrl);
    console.log('========================');
    
    setViewingFile({ fileName, fileUrl });
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setViewingFile(null);
  };

  // 검색 및 카테고리 필터링 기능
  useEffect(() => {
    let filtered = relatedMaterials;
    
    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(material => material.category === selectedCategory);
    }
    
    // 검색어 필터링
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredMaterials(filtered);
  }, [searchTerm, selectedCategory, relatedMaterials]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 검색은 이미 useEffect에서 실시간으로 처리됨
  };

  // 디버깅용 useEffect
  useEffect(() => {
    console.log('=== Learning 페이지 디버깅 ===');
    console.log('isAdmin 상태:', isAdmin);
    console.log('관련자료 개수:', relatedMaterials.length);
    console.log('필터링된 자료 개수:', filteredMaterials.length);
    console.log('========================');
  }, [isAdmin, relatedMaterials.length, filteredMaterials.length]);

  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-28">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b981,#059669)] opacity-30">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M0 32V.5H32" fill="none" stroke="rgba(255,255,255,0.1)"></path>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)"></rect>
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-700 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Learning</h1>
          </div>
          <p className="text-lg text-emerald-50 max-w-[1150px]">
            한국산업기술진흥협회에서 제공하는 MOT(기술경영) 실무역량 강화 및 전문가 양성을 위한 교육프로그램으로,<br/>
            변화하는 기업환경을 반영한 최신의 이론 및 방법론과 R&D 조직차원의 MOT 체계에 대한 실무기반의 교육체계를 제공합니다.
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
        {/* MOT 이론 및 방법론 섹션 */}
          <section className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">MOT 이론 및 방법론</h2>
                <Link href="/course/1">
                  <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors">
                    과정 상세보기
                    <FiArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
                <div className="flex flex-col gap-8">
                  {/* 블릿 포인트 */}
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-start justify-start mt-2">
                      <div className="h-2 w-2 bg-emerald-600 rounded-full"></div>
                    </div>
                    <p className="ml-2 text-gray-600">
                      선진 기술경영(MOT) 체계를 기업/연구조직에 적용하기 위한 정보시스템 구축/운영에 필요한 기본지식 및 구축사례 등 교육
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-start justify-start mt-2">
                      <div className="h-2 w-2 bg-emerald-600 rounded-full"></div>
                    </div>
                    <p className="ml-2 text-gray-600">
                      R&D 전략/기획, R&D Project, R&D 자원(Human & Knowledge)의 관리 시스템 구축을 위한 기본지식 및 정보 시스템에 대한 이해
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-start justify-start mt-2">
                      <div className="h-2 w-2 bg-emerald-600 rounded-full"></div>
                    </div>
                    <p className="ml-2 text-gray-600">
                      R&D 관리의 최신 트렌드(4세대 R&D 등)에 대한 시스템 관점에서의 이해
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-start justify-start mt-2">
                      <div className="h-2 w-2 bg-emerald-600 rounded-full"></div>
                    </div>
                    <p className="ml-2 text-gray-600">
                      인공지능 등 정보기술의 R&D시스템 적용에 대한 전반적인 이해
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MOT 시스템 섹션 */}
          <section className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">MOT 운영 시스템</h2>
                <Link href="/course/2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors">
                    과정 상세보기
                    <FiArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
                <div className="flex flex-col gap-8">
                  <div className="space-y-6">
                    <p className="ml-2 text-gray-600">
                      기업의 관리체계 설계 및 구축에 있어 IT기술은 필수사항임을 고려할 때, 관리기술과 정보기술의 통합적 접근에 필요한 지식을 갖추도록 함을 목표로 하는 과정임
                    </p>
                    <ul className="list-disc ml-8 text-gray-600 space-y-2">
                      <li>R&D조직 차원에서 기술경영(MOT) 체계를 갖추기 위한 조직운영 체계와 정보시스템 구축 및 운영에 관한 전반적인 지식</li>
                      <li>분야별로 R&D 기획관리, R&D Project관리, R&D Human & Knowledge Resource관리 및 Intelligence 활동에 대한 Process 및 Data 관리체계에 대한 실무 지식</li>
                      <li>First Mover로서 또는 R&D관리의 최신 트렌드 및 정보기술의 발달 등 대·내외 환경변화가 관리체계에 미치는 영향에 대한 지식 등</li>
                    </ul>
                  </div>
                </div>
            </div>
          </div>
        </section>
        </div>

        {/* 문의처 섹션 */}
        <section>
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">문의처</h2>
            <p className="text-gray-600">
              <a href="mailto:cbkim@erns.co.kr" className="text-emerald-600 hover:text-emerald-800 transition-colors">
                cbkim@erns.co.kr
              </a>
            </p>
          </div>
        </section>
      </div>

      {/* 파일 보기 모달 */}
      {viewModalOpen && viewingFile && (
        <div>
          <FileViewer
            fileName={viewingFile.fileName}
            fileUrl={viewingFile.fileUrl}
            onClose={handleCloseViewModal}
          />
        </div>
      )}
      </div>
    </main>
  );
} 