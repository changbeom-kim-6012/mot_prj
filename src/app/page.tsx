'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { getApiUrl } from '@/config/api';
import { 
  FiBook, 
  FiUsers, 
  FiMessageSquare, 
  FiAward,
  FiGlobe,
  FiEdit3,
  FiX,
  FiBell,
  FiEye,
  FiDownload,
  FiFileText,
  FiArrowRight,
  FiClock
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import FileViewer from '@/components/common/FileViewer';

interface LibraryItem {
  id: number;
  title: string;
  category: string;
  author: string;
  createdAt: string;
}

interface QuestionItem {
  id: number;
  title: string;
  categoryId: number;
  authorName: string;
  createdAt: string;
}

interface OpinionItem {
  id: number;
  title: string;
  category: string;
  authorName: string;
  createdAt: string;
  status: string;
}

interface ProgramItem {
  id: number;
  code: string;
  description: string;
  createdAt: string;
}

export default function Home() {
  const [activeNotices, setActiveNotices] = useState<any[]>([]);
  const [showNoticePopup, setShowNoticePopup] = useState(false);
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
  const [selectedFile, setSelectedFile] = useState<{ url: string; name: string } | null>(null);
  
  // 최신 자료 상태
  const [latestLibrary, setLatestLibrary] = useState<LibraryItem[]>([]);
  const [latestQuestions, setLatestQuestions] = useState<QuestionItem[]>([]);
  const [latestOpinions, setLatestOpinions] = useState<OpinionItem[]>([]);
  const [latestPrograms, setLatestPrograms] = useState<ProgramItem[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(true);

  // 오늘 그만 보기 확인 함수
  const isNoticeDismissedToday = () => {
    const today = new Date().toDateString();
    const dismissedDate = localStorage.getItem('noticeDismissedDate');
    return dismissedDate === today;
  };

  // 오늘 그만 보기 설정 함수
  const setNoticeDismissedToday = () => {
    const today = new Date().toDateString();
    localStorage.setItem('noticeDismissedDate', today);
  };

  // 활성화된 공지사항 조회
  useEffect(() => {
    const fetchActiveNotices = async () => {
      try {
        const response = await fetch(getApiUrl('/api/notices/active'));
        if (response.ok) {
          const notices = await response.json();
          setActiveNotices(notices);
          // 공지사항이 있고 오늘 그만 보기가 설정되지 않았으면 팝업 표시
          if (notices.length > 0 && !isNoticeDismissedToday()) {
            setShowNoticePopup(true);
          }
        }
      } catch (error) {
        console.error('공지사항 조회 실패:', error);
      }
    };

    fetchActiveNotices();
  }, []);

  // 최신 자료 조회
  useEffect(() => {
    const fetchLatestItems = async () => {
      setLoadingLatest(true);
      try {
        // Library 최신 5개
        const libraryRes = await fetch(getApiUrl('/api/library?page=0&size=5'));
        if (libraryRes.ok) {
          const libraryData = await libraryRes.json();
          setLatestLibrary(libraryData.content || []);
        }

        // Q&A 최신 5개
        const questionsRes = await fetch(getApiUrl('/api/questions?page=0&size=5'));
        if (questionsRes.ok) {
          const questionsData = await questionsRes.json();
          setLatestQuestions(questionsData.content || []);
        }

        // Research (Opinions) 최신 5개
        const opinionsRes = await fetch(getApiUrl('/api/opinions'));
        if (opinionsRes.ok) {
          const opinionsData = await opinionsRes.json();
          // 임시저장 제외하고 최신 5개만
          const filtered = opinionsData
            .filter((item: OpinionItem) => item.status !== '임시저장')
            .sort((a: OpinionItem, b: OpinionItem) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .slice(0, 5);
          setLatestOpinions(filtered);
        }

        // Learning - Program 최신 5개 (서버에서 정렬된 데이터 가져오기)
        const programsRes = await fetch(getApiUrl('/api/learning-programs/latest?limit=5'));
        if (programsRes.ok) {
          const programsData = await programsRes.json();
          setLatestPrograms(programsData || []);
        }
      } catch (error) {
        console.error('최신 자료 조회 실패:', error);
      } finally {
        setLoadingLatest(false);
      }
    };

    fetchLatestItems();
  }, []);

  const handleCloseNoticePopup = () => {
    setShowNoticePopup(false);
  };

  const handleDismissToday = () => {
    setNoticeDismissedToday();
    setShowNoticePopup(false);
  };

  const handleNextNotice = () => {
    setCurrentNoticeIndex((prev) => (prev + 1) % activeNotices.length);
  };

  const handlePrevNotice = () => {
    setCurrentNoticeIndex((prev) => (prev - 1 + activeNotices.length) % activeNotices.length);
  };

  const handleFileDownload = async (attachmentPath: string, attachmentName: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/notices/download/${attachmentPath}`));
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachmentName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('파일 다운로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  const handleFileView = (attachmentPath: string, attachmentName: string) => {
    const fileUrl = getApiUrl(`/api/notices/download/${attachmentPath}`);
    setSelectedFile({ url: fileUrl, name: attachmentName });
  };

  const handleCloseFileViewer = () => {
    setSelectedFile(null);
  };
  // 새소식 데이터 - 숨김 처리로 인해 사용하지 않음
  // const newsItems = [
  //   {
  //     id: 1,
  //     category: '공지사항',
  //     title: '2024년 MOT 플랫폼 서비스 개편 안내',
  //     date: '2024.03.20',
  //     isNew: true,
  //   },
  //   {
  //     id: 2,
  //     category: '뉴스',
  //     title: '기술경영 전문가 초청 세미나 개최',
  //     date: '2024.03.19',
  //     isNew: true,
  //   },
  //   {
  //     id: 3,
  //     category: '공지사항',
  //     title: '연구기획 관련 자료 업데이트 안내',
  //     date: '2024.03.18',
  //     isNew: false,
  //   },
  //   {
  //     id: 4,
  //     category: '뉴스',
  //     title: '2024 기술경영 트렌드 리포트 발간',
  //     date: '2024.03.17',
  //     isNew: false,
  //   },
  //   {
  //     id: 5,
  //     category: '공지사항',
  //     title: 'MOT 플랫폼 이용자 설문조사 실시',
  //     date: '2024.03.16',
  //     isNew: false,
  //   },
  // ];

  return (
    <>
      <main className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-28">
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-600 via-fuchsia-500 to-purple-600 text-white rounded-2xl">
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
          <div className="relative px-4 sm:px-6 lg:px-8 py-[19px]">
          <div className="flex items-end gap-4 mb-4">
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
                MOT Club은 한국산업기술진흥협회와 함께하는 기술경영 지식 공유 플랫폼으로<br/>
                교육 수료생뿐만 아니라, 기술경영에 열정을 가진 모든 분들을 위한 역동적인 지식 교류와 성장의 허브입니다.
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Latest Items Section */}
      <div className="py-20 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Library 최신 5개 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiBook className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Library</h3>
                </div>
                <Link href="/library" className="text-blue-600 hover:text-blue-700 transition-colors">
                  <FiArrowRight className="w-5 h-5" />
                </Link>
              </div>
              {loadingLatest ? (
                <div className="text-center text-gray-400 py-8">로딩 중...</div>
              ) : latestLibrary.length === 0 ? (
                <div className="text-center text-gray-400 py-8">등록된 자료가 없습니다.</div>
              ) : (
                <ul className="space-y-3">
                  {latestLibrary.map((item) => (
                    <li key={item.id} className="border-b border-gray-100 pb-3 last:border-0">
                      <Link href={`/library/${item.id}`} className="block group">
                        <h4 className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{item.category}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Learning - Program 최신 5개 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FiUsers className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Learning</h3>
                </div>
                <Link href="/learning" className="text-green-600 hover:text-green-700 transition-colors">
                  <FiArrowRight className="w-5 h-5" />
                </Link>
              </div>
              {loadingLatest ? (
                <div className="text-center text-gray-400 py-8">로딩 중...</div>
              ) : latestPrograms.length === 0 ? (
                <div className="text-center text-gray-400 py-8">등록된 Program이 없습니다.</div>
              ) : (
                <ul className="space-y-3">
                  {latestPrograms.map((item) => (
                    <li key={item.id} className="border-b border-gray-100 pb-3 last:border-0">
                      <Link href="/learning" className="block group">
                        <h4 className="text-sm font-medium text-slate-900 group-hover:text-green-600 transition-colors line-clamp-2">
                          {item.code}: {item.description}
                        </h4>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Research 최신 5개 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <FiEdit3 className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Research</h3>
                </div>
                <Link href="/opinions" className="text-amber-600 hover:text-amber-700 transition-colors">
                  <FiArrowRight className="w-5 h-5" />
                </Link>
              </div>
              {loadingLatest ? (
                <div className="text-center text-gray-400 py-8">로딩 중...</div>
              ) : latestOpinions.length === 0 ? (
                <div className="text-center text-gray-400 py-8">등록된 기고가 없습니다.</div>
              ) : (
                <ul className="space-y-3">
                  {latestOpinions.map((item) => (
                    <li key={item.id} className="border-b border-gray-100 pb-3 last:border-0">
                      <Link href={`/opinions/${item.id}`} className="block group">
                        <h4 className="text-sm font-medium text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 mb-1">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{item.category}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Q&A 최신 5개 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FiMessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Q&A</h3>
                </div>
                <Link href="/qna" className="text-purple-600 hover:text-purple-700 transition-colors">
                  <FiArrowRight className="w-5 h-5" />
                </Link>
              </div>
              {loadingLatest ? (
                <div className="text-center text-gray-400 py-8">로딩 중...</div>
              ) : latestQuestions.length === 0 ? (
                <div className="text-center text-gray-400 py-8">등록된 질문이 없습니다.</div>
              ) : (
                <ul className="space-y-3">
                  {latestQuestions.map((item) => (
                    <li key={item.id} className="border-b border-gray-100 pb-3 last:border-0">
                      <Link href={`/qna/${item.id}`} className="block group">
                        <h4 className="text-sm font-medium text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-2 mb-1">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{item.authorName}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* News & Announcements Section - 숨김 처리 */}
      {/* <section className="py-24 bg-slate-50">
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
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full -mr-20 -mt-20 transition-transform group-hover:scale-150" />
                  
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
      </section> */}
      </div>
    </main>

    {/* 공지사항 팝업 */}
    {showNoticePopup && activeNotices.length > 0 && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiBell className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">공지사항</h2>
            </div>
            <button
              onClick={handleCloseNoticePopup}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeNotices[currentNoticeIndex] && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {activeNotices[currentNoticeIndex].title}
                </h3>
                <div className="text-gray-700 whitespace-pre-wrap mb-4">
                  {activeNotices[currentNoticeIndex].content}
                </div>
                {activeNotices[currentNoticeIndex].attachmentName && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiFileText className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          첨부파일: {activeNotices[currentNoticeIndex].attachmentName}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleFileView(
                            activeNotices[currentNoticeIndex].attachmentPath,
                            activeNotices[currentNoticeIndex].attachmentName
                          )}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <FiEye className="w-4 h-4" />
                          보기
                        </button>
                        <button
                          onClick={() => handleFileDownload(
                            activeNotices[currentNoticeIndex].attachmentPath,
                            activeNotices[currentNoticeIndex].attachmentName
                          )}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          <FiDownload className="w-4 h-4" />
                          다운로드
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {activeNotices.length > 1 && (
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <button
                onClick={handlePrevNotice}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                이전
              </button>
              <span className="text-sm text-gray-500">
                {currentNoticeIndex + 1} / {activeNotices.length}
              </span>
              <button
                onClick={handleNextNotice}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                다음
              </button>
            </div>
          )}

          <div className="p-6 border-t border-gray-200 flex justify-between items-center">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                onChange={handleDismissToday}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span>오늘 그만 보기</span>
            </label>
            <button
              onClick={handleCloseNoticePopup}
              className="px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    )}
    
    {/* 파일 뷰어 */}
    {selectedFile && (
      <FileViewer
        fileUrl={selectedFile.url}
        fileName={selectedFile.name}
        onClose={handleCloseFileViewer}
      />
    )}
    </>
  );
}
