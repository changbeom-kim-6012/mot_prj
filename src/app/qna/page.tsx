'use client';

import { FiSearch, FiPlus, FiLayers, FiBox, FiTarget, FiClipboard, FiDatabase, FiTrello, FiServer, FiGitBranch, FiMessageSquare, FiChevronLeft, FiChevronRight, FiClock, FiUser, FiEye, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Answer {
  id: number;
  content: string;
  author: string;
  date: string;
  isAccepted: boolean;
}

interface QnAItem {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  views: number;
  answers: Answer[];
  category: string;
}

export default function QnAPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const qnaItems: QnAItem[] = [
    {
      id: 1,
      title: "기술경영 전략 수립 시 고려해야 할 핵심 요소는 무엇인가요?",
      content: "스타트업에서 기술경영 전략을 수립하려고 합니다. 시장 분석, 기술 로드맵, 리소스 분배 등 여러 측면에서 고려해야 할 요소들이 많은데, 우선순위를 어떻게 정하는 것이 좋을까요?",
      author: "김기술",
      date: "2024.03.15",
      views: 128,
      answers: [
        {
          id: 1,
          content: "기술경영 전략 수립 시 가장 중요한 것은 시장-기술 연계성입니다. 첫째, 시장의 니즈와 트렌드를 정확히 파악하고, 둘째, 보유 기술의 강점과 약점을 객관적으로 분석하며, 셋째, 이를 바탕으로 실현 가능한 로드맵을 수립하는 것이 핵심입니다. 특히 스타트업의 경우 제한된 리소스를 고려할 때 '선택과 집중'이 매우 중요합니다.",
          author: "박교수",
          date: "2024.03.15",
          isAccepted: true
        },
        {
          id: 2,
          content: "기술 로드맵 작성 시에는 단기/중기/장기 목표를 명확히 구분하고, 각 단계별로 필요한 리소스와 예상되는 위험 요소를 상세히 파악하는 것이 중요합니다.",
          author: "이전문가",
          date: "2024.03.16",
          isAccepted: false
        }
      ],
      category: "전략"
    },
    {
      id: 2,
      title: "R&D 프로젝트 관리에서 가장 중요한 성과 지표는 무엇일까요?",
      content: "현재 R&D 프로젝트의 성과 관리를 위한 KPI를 설정하고 있습니다. 어떤 지표들을 중점적으로 관리해야 할까요?",
      author: "이연구",
      date: "2024.03.14",
      views: 95,
      answers: [
        {
          id: 3,
          content: "R&D 프로젝트의 성과 지표는 크게 정량적 지표와 정성적 지표로 나눌 수 있습니다. 정량적 지표로는 특허 출원 건수, 논문 발표 수, 기술이전 실적 등이 있으며, 정성적 지표로는 기술 완성도(TRL), 시장 적합성, 사업화 가능성 등을 고려할 수 있습니다.",
          author: "김박사",
          date: "2024.03.14",
          isAccepted: true
        }
      ],
      category: "R&D"
    },
    {
      id: 3,
      title: "기술 로드맵 작성 방법에 대해 조언 부탁드립니다.",
      content: "처음으로 기술 로드맵을 작성하게 되었습니다. 효과적인 기술 로드맵 작성을 위한 방법론이나 주의사항에 대해 조언해주시면 감사하겠습니다.",
      author: "박기획",
      date: "2024.03.13",
      views: 156,
      answers: [],
      category: "로드맵"
    },
    {
      id: 4,
      title: "특허 분석을 통한 기술 가치 평가 방법론이 궁금합니다.",
      content: "특허 분석을 통해 기술의 가치를 평가하려고 합니다. 특허 맵 작성부터 기술 가치 산정까지 어떤 방법론을 활용하면 좋을지 조언 부탁드립니다.",
      author: "정특허",
      date: "2024.03.12",
      views: 142,
      answers: [],
      category: "특허"
    },
    {
      id: 5,
      title: "기술사업화 프로세스에서 주의해야 할 점은 무엇인가요?",
      content: "연구소에서 개발한 기술을 사업화하려고 합니다. 기술사업화 프로세스에서 실패하지 않기 위해 특별히 주의해야 할 점들을 알려주시면 감사하겠습니다.",
      author: "최사업",
      date: "2024.03.11",
      views: 178,
      answers: [],
      category: "사업화"
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

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
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
              <FiMessageSquare className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Q&A</h1>
          </div>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            기술경영에 대한 궁금증을 해결해드립니다. 전문가들의 답변을 통해 실질적인 도움을 받아보세요.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Q&A List */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {qnaItems.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                onClick={() => toggleExpand(item.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                        {item.category}
                      </span>
                      <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                        답변 {item.answers.length}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                      {item.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FiUser className="w-4 h-4" />
                        <span>{item.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiEye className="w-4 h-4" />
                        <span>{item.views}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    {expandedId === item.id ? (
                      <FiChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <FiChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                      <div className="text-gray-700 mb-4">
                        {item.content}
                      </div>
                    </div>
                    
                    <div className="px-6 pb-4 space-y-4">
                      {item.answers.map((answer) => (
                        <div 
                          key={answer.id}
                          className={`p-4 rounded-lg ${
                            answer.isAccepted 
                              ? 'bg-green-50 border border-green-100' 
                              : 'bg-gray-50 border border-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <FiUser className="w-4 h-4" />
                              <span>{answer.author}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <FiClock className="w-4 h-4" />
                              <span>{answer.date}</span>
                            </div>
                            {answer.isAccepted && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                채택된 답변
                              </span>
                            )}
                          </div>
                          <div className="text-gray-700">
                            {answer.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200">
              <FiChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  page === 1
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200">
              <FiChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </nav>
        </div>
      </div>
    </main>
  );
} 