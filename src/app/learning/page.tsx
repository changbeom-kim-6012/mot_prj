import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { FiArrowRight, FiUsers } from 'react-icons/fi';

export default function LearningPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Learning</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl">
            MOT(Management of Technology) 전문가를 위한 체계적인 교육 프로그램을 제공합니다.
            기술경영 이론과 실무, 최신 트렌드까지 전문가들의 강의를 통해 학습하실 수 있습니다.
            맞춤형 교육과정으로 여러분의 전문성 향상을 지원합니다.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* MOT 이론 및 방법론 섹션 */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">MOT 이론 및 방법론</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 왼쪽 열: 블릿 포인트 */}
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-start justify-start mt-2">
                      <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="ml-2 text-gray-600">
                      선진 기술경영(MOT) 체계를 기업/연구조직에 적용하기 위한 정보시스템 구축/운영에 필요한 기본지식 및 구축사례 등 교육
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-start justify-start mt-2">
                      <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="ml-2 text-gray-600">
                      R&D 전략/기획, R&D Project, R&D 자원(Human & Knowledge)의 관리 시스템 구축을 위한 기본지식 및 정보 시스템에 대한 이해
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-start justify-start mt-2">
                      <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="ml-2 text-gray-600">
                      R&D 관리의 최신 트렌드(4세대 R&D 등)에 대한 시스템 관점에서의 이해
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-start justify-start mt-2">
                      <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <p className="ml-2 text-gray-600">
                      인공지능 등 정보기술의 R&D시스템 적용에 대한 전반적인 이해
                    </p>
                  </div>
                </div>
                
                {/* 오른쪽 열: 과정소개 버튼 */}
                <div className="flex items-center justify-center">
                  <Link href="/course/1" className="group w-full max-w-[280px]">
                    <div className="bg-white rounded-2xl border-2 border-blue-100 p-6 transition-all duration-300 hover:border-blue-400 hover:shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-blue-900 mb-2">과정 상세보기</h3>
                          <p className="text-blue-600">MOT 이론 및 방법론 과정</p>
                        </div>
                        <div className="ml-4 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <FiArrowRight className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MOT 시스템 섹션 */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">MOT 시스템</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 왼쪽 열: 블릿 포인트 */}
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-start justify-start mt-2">
                      <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                    </div>
                    <p className="ml-2 text-gray-600">
                      선진 기술경영(MOT) 체계를 기업/연구조직에 적용하기 위한 정보시스템 구축/운영에 필요한 기본지식 및 구축사례 등 교육
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-start justify-start mt-2">
                      <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                    </div>
                    <p className="ml-2 text-gray-600">
                      R&D 전략/기획, R&D Project, R&D 자원(Human & Knowledge)의 관리 시스템 구축을 위한 기본지식 및 정보 시스템에 대한 이해
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-start justify-start mt-2">
                      <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                    </div>
                    <p className="ml-2 text-gray-600">
                      R&D 관리의 최신 트렌드(4세대 R&D 등)에 대한 시스템 관점에서의 이해
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 flex items-start justify-start mt-2">
                      <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                    </div>
                    <p className="ml-2 text-gray-600">
                      인공지능 등 정보기술의 R&D시스템 적용에 대한 전반적인 이해
                    </p>
                  </div>
                </div>
                
                {/* 오른쪽 열: 과정소개 버튼 */}
                <div className="flex items-center justify-center">
                  <Link href="/course/2" className="group w-full max-w-[280px]">
                    <div className="bg-white rounded-2xl border-2 border-green-100 p-6 transition-all duration-300 hover:border-green-400 hover:shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-green-900 mb-2">과정 상세보기</h3>
                          <p className="text-green-600">MOT 시스템 과정</p>
                        </div>
                        <div className="ml-4 w-10 h-10 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                          <FiArrowRight className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 문의처 섹션 */}
        <section>
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">문의처</h2>
            <p className="text-gray-600">
              <a href="mailto:cbkim@erns.co.kr" className="text-blue-600 hover:text-blue-800 transition-colors">
                cbkim@erns.co.kr
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
} 