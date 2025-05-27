'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { FiSearch, FiFilter, FiDownload, FiCalendar, FiChevronDown, FiBook } from 'react-icons/fi';
import { Category, Resource } from '@/types/library';

interface LibraryPageProps {
  categories: Category[];
  resources: Resource[];
}

export default function LibraryPage({ categories, resources }: LibraryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [visibleItems, setVisibleItems] = useState(4);
  const itemsPerPage = 4;

  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchTerm === '' || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || resource.category === selectedCategory;
    
    const resourceDate = new Date(resource.date);
    const matchesDateFrom = !dateFrom || resourceDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || resourceDate <= new Date(dateTo);
    
    return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo;
  });

  const visibleResources = filteredResources.slice(0, visibleItems);
  const hasMore = visibleItems < filteredResources.length;

  const handleLoadMore = () => {
    setVisibleItems(prev => Math.min(prev + itemsPerPage, filteredResources.length));
  };

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-800 to-blue-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#2563eb,#3b82f6)] opacity-30">
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <FiBook className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Library</h1>
          </div>
          <p className="text-lg text-blue-50 max-w-3xl">
            MOT(Management of Technology)와 관련된 전문 자료를 제공하는 공간입니다.
            기술전략, 연구기획, 자원관리 등 다양한 분야의 자료를 찾아보고 다운로드할 수 있습니다.
            전문가들이 검증한 양질의 콘텐츠로 여러분의 업무와 연구를 지원합니다.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-4 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">카테고리</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(
                        category.name === selectedCategory ? null : category.name
                      )}
                      className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors ${
                        category.name === selectedCategory
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-9">
            {/* Search and filter */}
            <div className="mb-8 space-y-4">
              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="자료 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              
              {/* Date range filters */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="시작일"
                  />
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <div className="flex-1 relative">
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="종료일"
                  />
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Mobile filters */}
            <div className="lg:hidden mb-4">
              <button className="flex items-center space-x-2 text-sm text-gray-600">
                <FiFilter className="h-4 w-4" />
                <span>필터</span>
              </button>
            </div>

            {/* Resources grid */}
            <div className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                {visibleResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-blue-600">
                        {resource.category}
                      </span>
                      <span className="text-sm text-gray-500">{resource.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {resource.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{resource.author}</span>
                        <div className="flex flex-wrap gap-2">
                          {resource.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                        <FiDownload className="h-4 w-4" />
                        <span className="text-sm">다운로드</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex flex-col items-center justify-center w-full pt-8 border-t border-gray-200">
                  <button
                    onClick={handleLoadMore}
                    className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <span>더보기</span>
                    <FiChevronDown className="ml-2 h-5 w-5" />
                  </button>
                  <p className="mt-2 text-sm text-gray-500">
                    총 {filteredResources.length}개 중 {visibleResources.length}개 표시
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 