import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { 
  FiBook, 
  FiUsers, 
  FiMessageSquare, 
  FiAward,
  FiGlobe,
  FiEdit3,
  FiBell,
  FiClock,
  FiArrowRight
} from 'react-icons/fi';

export default function Home() {
  const newsItems = [
    {
      id: 1,
      category: '공지사항',
      title: '2024년 MOT 플랫폼 서비스 개편 안내',
      date: '2024.03.20',
      isNew: true,
    },
    {
      id: 2,
      category: '뉴스',
      title: '기술경영 전문가 초청 세미나 개최',
      date: '2024.03.19',
      isNew: true,
    },
    {
      id: 3,
      category: '공지사항',
      title: '연구기획 관련 자료 업데이트 안내',
      date: '2024.03.18',
      isNew: false,
    },
    {
      id: 4,
      category: '뉴스',
      title: '2024 기술경영 트렌드 리포트 발간',
      date: '2024.03.17',
      isNew: false,
    },
    {
      id: 5,
      category: '공지사항',
      title: 'MOT 플랫폼 이용자 설문조사 실시',
      date: '2024.03.16',
      isNew: false,
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Modern Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50" />
        
        {/* Background Illustration */}
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute w-full h-full opacity-[0.07]" viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Abstract Circuit Lines */}
            <path d="M-100 300 C 200 300, 300 100, 600 100 S 1000 300, 1300 300" 
              className="text-blue-600" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M-100 350 C 200 350, 300 150, 600 150 S 1000 350, 1300 350" 
              className="text-indigo-600" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            
            {/* Connection Points */}
            <circle cx="600" cy="100" r="4" className="text-blue-600" fill="currentColor"/>
            <circle cx="600" cy="150" r="4" className="text-indigo-600" fill="currentColor"/>
            
            {/* Tech Grid Pattern */}
            <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" className="text-gray-200" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)"/>
            
            {/* Abstract Shapes */}
            <path d="M800 50 L850 100 L800 150 L750 100Z" className="text-blue-500" fill="currentColor" fillOpacity="0.1"/>
            <path d="M900 200 L950 250 L900 300 L850 250Z" className="text-indigo-500" fill="currentColor" fillOpacity="0.1"/>
            <path d="M100 400 L150 450 L100 500 L50 450Z" className="text-blue-500" fill="currentColor" fillOpacity="0.1"/>
            
            {/* Data Flow Lines */}
            <g className="text-gray-400" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6">
              <line x1="0" y1="200" x2="1200" y2="200"/>
              <line x1="0" y1="400" x2="1200" y2="400"/>
            </g>
            
            {/* Tech Nodes */}
            <g className="text-blue-600" fill="currentColor" fillOpacity="0.2">
              <circle cx="200" cy="200" r="20"/>
              <circle cx="400" cy="400" r="20"/>
              <circle cx="800" cy="300" r="20"/>
              <circle cx="1000" cy="200" r="20"/>
            </g>
            
            {/* Connecting Lines */}
            <g className="text-indigo-500" stroke="currentColor" strokeWidth="1">
              <path d="M200 200 L400 400" strokeDasharray="4 6"/>
              <path d="M400 400 L800 300" strokeDasharray="4 6"/>
              <path d="M800 300 L1000 200" strokeDasharray="4 6"/>
            </g>
          </svg>
        </div>
        
        {/* Content */}
        <div className="relative mx-auto max-w-7xl px-6 py-8 sm:py-12 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-2">
              MOT Platform
            </h1>
            <h2 className="text-lg text-gray-800 mb-2">
              Management of Technology 관련 지식 공유 플랫폼
            </h2>
            <p className="text-base text-gray-600">
              기술경영, 연구기획 및 관리업무에 대한 전문성을 함께 연구하고 공유하는 공간
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Library Card */}
            <Link href="/library" className="group">
              <div className="relative bg-white rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-blue-100 overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg mb-3 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                    <FiBook className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Library</h2>
                  <p className="mt-1 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">기술전략, 연구기획, 자원관리 등 전문 자료실</p>
                </div>
              </div>
            </Link>

            {/* Learning Card */}
            <Link href="/learning" className="group">
              <div className="relative bg-white rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-green-100 overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-50 to-transparent rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                <div className="relative">
                  <div className="w-10 h-10 bg-green-50 rounded-lg mb-3 flex items-center justify-center group-hover:scale-110 group-hover:bg-green-100 transition-all duration-300">
                    <FiUsers className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Learning</h2>
                  <p className="mt-1 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">맞춤형 교육과정 및 전문가 강의</p>
                </div>
              </div>
            </Link>

            {/* Q&A Card */}
            <Link href="/qna" className="group">
              <div className="relative bg-white rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-purple-100 overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-50 to-transparent rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                <div className="relative">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg mb-3 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-100 transition-all duration-300">
                    <FiMessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Q&A</h2>
                  <p className="mt-1 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">MOT 관련 궁금한 점을 전문가에게 물어보세요</p>
                </div>
              </div>
            </Link>

            {/* Expert Card */}
            <Link href="/expert" className="group">
              <div className="relative bg-white rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-indigo-100 overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-transparent rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                <div className="relative">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg mb-3 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                    <FiAward className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Expert</h2>
                  <p className="mt-1 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">분야별 전문가 프로필 및 상담</p>
                </div>
              </div>
            </Link>

            {/* News Card */}
            <Link href="/news" className="group">
              <div className="relative bg-white rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-rose-100 overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-50 to-transparent rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                <div className="relative">
                  <div className="w-10 h-10 bg-rose-50 rounded-lg mb-3 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-100 transition-all duration-300">
                    <FiGlobe className="w-5 h-5 text-rose-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">News</h2>
                  <p className="mt-1 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">기술정책 변화 및 최신 동향</p>
                </div>
              </div>
            </Link>

            {/* Opinions Card */}
            <Link href="/opinions" className="group">
              <div className="relative bg-white rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-amber-100 overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-50 to-transparent rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                <div className="relative">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg mb-3 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-300">
                    <FiEdit3 className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">Opinions</h2>
                  <p className="mt-1 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">전문가 칼럼 및 의견</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* News & Announcements Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FiBell className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">새소식</h2>
            </div>
            <Link 
              href="/news/all" 
              className="group inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              전체보기
              <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsItems.map((item) => (
              <Link key={item.id} href={`/news/${item.id}`} className="group">
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-blue-100 relative overflow-hidden">
                  {/* Background Decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/30 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                  
                  {/* Content */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        item.category === '공지사항' 
                          ? 'bg-indigo-50 text-indigo-600' 
                          : 'bg-blue-50 text-blue-600'
                      }`}>
                        {item.category}
                      </span>
                      {item.isNew && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 animate-pulse">
                          New
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <FiClock className="w-4 h-4 mr-2" />
                      {item.date}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      </main>
  );
}
