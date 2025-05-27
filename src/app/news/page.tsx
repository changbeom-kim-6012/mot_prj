'use client';

import Navigation from '@/components/Navigation';
import { FiSearch, FiFileText, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface NewsItem {
  id: number;
  category: string;
  title: string;
  date: string;
}

export default function NewsPage() {
  const categories = [
    { id: 'notice', name: '공지사항', count: 12 },
    { id: 'trends', name: '최신동향', count: 28 },
    { id: 'seminar', name: '세미나', count: 15 },
    { id: 'research', name: '연구소식', count: 23 },
    { id: 'tech', name: '기술뉴스', count: 31 }
  ];

  const news: NewsItem[] = [
    {
      id: 1,
      category: '공지사항',
      title: '2024년 MOT 플랫폼 서비스 개선 안내',
      date: '2024.03.15'
    },
    {
      id: 2,
      category: '최신동향',
      title: '국내 기업의 기술경영 트렌드 분석 보고서',
      date: '2024.03.14'
    },
    {
      id: 3,
      category: '세미나',
      title: '2024 기술경영 혁신 컨퍼런스 개최 안내',
      date: '2024.03.13'
    },
    {
      id: 4,
      category: '연구소식',
      title: '기술경영 연구센터 신규 프로젝트 착수',
      date: '2024.03.12'
    },
    {
      id: 5,
      category: '기술뉴스',
      title: 'AI 기반 기술경영 의사결정 시스템 도입 사례',
      date: '2024.03.11'
    }
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
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
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
              <FiFileText className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">뉴스</h1>
          </div>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            MOT 플랫폼의 최신 소식과 기술경영 관련 뉴스를 확인하세요. 주요 공지사항부터 최신 동향, 세미나 정보까지 다양한 소식을 전해드립니다.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Categories Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-64 flex-shrink-0"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-gray-700">{category.name}</span>
                  <span className="text-sm text-gray-400">{category.count}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6"
            >
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
            </motion.div>

            {/* News List */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200">
                <div className="col-span-2 text-sm font-medium text-gray-500">카테고리</div>
                <div className="col-span-7 text-sm font-medium text-gray-500">제목</div>
                <div className="col-span-3 text-sm font-medium text-gray-500">작성일</div>
              </div>
              {news.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {item.category}
                    </span>
                  </div>
                  <div className="col-span-7 text-gray-900 font-medium hover:text-indigo-600 transition-colors duration-150">
                    {item.title}
                  </div>
                  <div className="col-span-3 text-sm text-gray-500">
                    {item.date}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
} 