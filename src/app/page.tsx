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
      <div className="pt-28">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-fuchsia-800 to-purple-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#d946ef,#c026d3)] opacity-30">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M0 32V.5H32" fill="none" stroke="rgba(255,255,255,0.1)"></path>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)"></rect>
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-end gap-4 mb-6">
            <div className="w-12 h-12 bg-fuchsia-500/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <FiGlobe className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">MOT Club</h1>
            <span className="flex-1" />
            <span className="text-xl font-bold text-white pb-1 self-end whitespace-nowrap shadow-lg" style={{minWidth: '320px', textAlign: 'right'}}>
              MOT Initiative Platform
            </span>
          </div>
          <div className="flex justify-end">
            <div style={{ maxWidth: 'calc(100% - 320px - 20px)', width: '100%' }}>
              <p className="text-lg text-fuchsia-200 leading-relaxed text-right" style={{wordBreak: 'keep-all'}}>
                MOT Club은 한국산업기술진흥협회와 함께하는 기술경영 지식공유 커뮤니티입니다.<br/>
                교육참가자 및 기술경영에 관심을 가진 모든 분들이 함께 만들어가는 공유마당입니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="py-20 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Library Card */}
            <Link href="/library" className="group">
              <div className="relative bg-white rounded-3xl p-8 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-slate-100 overflow-hidden h-72 min-w-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
                <div className="relative h-full flex flex-col">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 transition-all duration-500">
                    <FiBook className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-4">Library</h3>
                  <p className="text-base text-slate-600 group-hover:text-slate-900 transition-colors leading-relaxed flex-grow">MOT 교육, 기술과혁신 웹진 등 MOT 관련 자료 Repository</p>
                </div>
              </div>
            </Link>

            {/* Learning Card */}
            <Link href="/learning" className="group">
              <div className="relative bg-white rounded-3xl p-8 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-slate-100 overflow-hidden h-72 min-w-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
                <div className="relative h-full flex flex-col">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 group-hover:bg-green-500 transition-all duration-500">
                    <FiUsers className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-green-600 transition-colors mb-4">Learning</h3>
                  <p className="text-base text-slate-600 group-hover:text-slate-900 transition-colors leading-relaxed flex-grow">기술경영(MOT) 교육과목 구성에 대한 전반적인 소개와 개설된 교육프로그램 소개</p>
                </div>
              </div>
            </Link>

            {/* Q&A Card */}
            <Link href="/qna" className="group">
              <div className="relative bg-white rounded-3xl p-8 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-slate-100 overflow-hidden h-72 min-w-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
                <div className="relative h-full flex flex-col">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500 transition-all duration-500">
                    <FiMessageSquare className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors mb-4">Q&A</h3>
                  <p className="text-base text-slate-600 group-hover:text-slate-900 transition-colors leading-relaxed flex-grow">기술경영, R&D 시스템 관련한 다양한 이슈, 타사 사례 등에 대한 정보공유 장터</p>
                </div>
              </div>
            </Link>

            {/* Dialogue Card */}
            <Link href="/dialogue" className="group">
              <div className="relative bg-white rounded-3xl p-8 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-slate-100 overflow-hidden h-72 min-w-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
                <div className="relative h-full flex flex-col">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 transition-all duration-500">
                    <FiMessageSquare className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-4">Dialogue</h3>
                  <p className="text-base text-slate-600 group-hover:text-slate-900 transition-colors leading-relaxed flex-grow">질문과 대답을 대화식으로 하는 공간으로 전문가들과 실시간 소통</p>
                </div>
              </div>
            </Link>

            {/* Agora Card (was Opinions) */}
            <Link href="/opinions" className="group">
              <div className="relative bg-white rounded-3xl p-8 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-slate-100 overflow-hidden h-72 min-w-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
                <div className="relative h-full flex flex-col">
                  <div className="w-16 h-16 bg-amber-100 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 transition-all duration-500">
                    <FiEdit3 className="w-8 h-8 text-amber-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors mb-4">Agora</h3>
                  <p className="text-base text-slate-600 group-hover:text-slate-900 transition-colors leading-relaxed flex-grow">MOT/R&D 관련한 다양한 의견교환 및 Initiative 활동을 위한 토론마당</p>
                </div>
              </div>
            </Link>

            {/* Community Card (was News) */}
            <Link href="/news" className="group">
              <div className="relative bg-white rounded-3xl p-8 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-slate-100 overflow-hidden h-72 min-w-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/10 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
                <div className="relative h-full flex flex-col">
                  <div className="w-16 h-16 bg-rose-100 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-500 transition-all duration-500">
                    <FiGlobe className="w-8 h-8 text-rose-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors mb-4">Community</h3>
                  <p className="text-base text-slate-600 group-hover:text-slate-900 transition-colors leading-relaxed flex-grow">공지사항, Library, Learning, Q&A, Agora 메뉴의 등록 정보 등 각종 새소식 공유 창</p>
                </div>
              </div>
            </Link>

            {/* Expert Card */}
            <Link href="/expert" className="group">
              <div className="relative bg-white rounded-3xl p-8 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-slate-100 overflow-hidden h-72 min-w-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />
                <div className="relative h-full flex flex-col">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500 transition-all duration-500">
                    <FiAward className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-4">Expert</h3>
                  <p className="text-base text-slate-600 group-hover:text-slate-900 transition-colors leading-relaxed flex-grow">MOT Club에 동참하여 실무적 경험과 지식을 나누며 함께 성장하는 전문가</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* News & Announcements Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <FiBell className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">새소식</h2>
            </div>
            <Link 
              href="/news/all" 
              className="group inline-flex items-center gap-2 text-base font-medium text-blue-600 hover:text-blue-700"
            >
              전체보기
              <FiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((item) => (
              <Link key={item.id} href={`/news/${item.id}`} className="group">
                <div className="bg-white rounded-2xl p-8 shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border border-slate-100 relative overflow-hidden">
                  {/* Background Decoration */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full -mr-20 -mt-20 transition-transform group-hover:scale-150" />
                  
                  {/* Content */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                        item.category === '공지사항' 
                          ? 'bg-indigo-100 text-indigo-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.category}
                      </span>
                      <span className="text-sm text-slate-500 flex items-center gap-2">
                        <FiClock className="w-4 h-4" />
                        {item.date}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    {item.isNew && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        NEW
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      </div>
    </main>
  );
}
