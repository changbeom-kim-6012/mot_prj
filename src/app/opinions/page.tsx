'use client';

import Navigation from '@/components/Navigation';
import { FiDownload, FiSearch, FiBookOpen } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface Article {
  id: number;
  title: string;
  authors: string[];
  journal: string;
  volume: string;
  issue: string;
  date: string;
  pages: string;
}

export default function OpinionsPage() {
  const articles: Article[] = [
    {
      id: 1,
      title: "중소기업 경영자의 윤리적 리더십이 조직문화에 미치는 영향 : 조직공정성을 중심으로",
      authors: ["김미림", "조임숙"],
      journal: "프로젝트경영연구",
      volume: "4",
      issue: "3",
      date: "2024년11월",
      pages: "1-15"
    },
    {
      id: 2,
      title: "해외직구에서 소비자 가치 요인이 소비자 공존성을 통해 지속 이용 의도에 미치는 영향",
      authors: ["노혜영", "이신복"],
      journal: "프로젝트경영연구",
      volume: "4",
      issue: "3",
      date: "2024년11월",
      pages: "16-24"
    },
    {
      id: 3,
      title: "글로벌 반도체 장비 산업에서 프로젝트 관리자 역량이 프로젝트 성과에 미치는 영향",
      authors: ["최명선", "홍시은", "황승준"],
      journal: "프로젝트경영연구",
      volume: "4",
      issue: "3",
      date: "2024년11월",
      pages: "25-39"
    }
  ];

  const years = ["2024", "2023", "2022", "2021"];
  const volumes = ["vol.4 no.3", "vol.4 no.2", "vol.4 no.1", "vol.3 no.4"];
  const searchTypes = [
    { value: "title", label: "제목" },
    { value: "keyword", label: "키워드" },
    { value: "abstract", label: "초록" },
    { value: "author", label: "저자" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-slate-50">
        <div className="absolute inset-0">
          <svg className="absolute w-full h-full opacity-[0.07]" viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 300 C 200 300, 300 100, 600 100 S 1000 300, 1300 300" 
              className="text-indigo-600" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M-100 350 C 200 350, 300 150, 600 150 S 1000 350, 1300 350" 
              className="text-purple-600" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" className="text-gray-200" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FiBookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">기고 안내</h1>
          </div>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            R&D 및 MOT 관련 주제에 대한 여러분의 기고를 환영합니다. 다양한 관점과 혁신적인 아이디어를 자유롭게 공유해 주세요.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            * 누구나 기고 가능하지만, 콘텐츠의 질과 적합성을 위해 관리자 검토 후 등록이 거부될 수 있습니다.
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
        >
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-2">
              <select 
                className="w-full h-10 pl-3 pr-6 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                defaultValue="2024"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <select 
                className="w-full h-10 pl-3 pr-6 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                defaultValue="vol.4 no.3"
              >
                {volumes.map(volume => (
                  <option key={volume} value={volume}>{volume}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <select 
                className="w-full h-10 pl-3 pr-6 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                defaultValue="title"
              >
                {searchTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="col-span-6">
              <div className="relative">
                <input
                  type="text"
                  className="w-full h-10 pl-10 pr-4 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="검색어를 입력하세요"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Articles List */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-8 space-y-4"
        >
          {articles.map((article) => (
            <motion.div
              key={article.id}
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 hover:text-indigo-600 transition-colors duration-200">
                    {article.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {article.authors.join(', ')}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {article.journal}, {article.volume}권{article.issue}호 ({article.date}) pp.{article.pages}
                  </div>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
                    <FiDownload className="mr-2 h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
} 