'use client';

import Navigation from '@/components/Navigation';
import { FiClock, FiBook, FiAward, FiCheckCircle, FiPackage } from 'react-icons/fi';

interface Topic {
  id: number;
  title: string;
  items: string[];
}

interface Instructor {
  name: string;
  title: string;
  description: string;
}

interface CourseData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  topics: Topic[];
  instructor: Instructor;
  duration: string;
  format: string;
  level: string;
  prerequisites: string[];
  materials: string[];
}

interface CourseDetailPageProps {
  course: CourseData;
}

export default function CourseDetailPage({ course }: CourseDetailPageProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              {course.title}
            </h1>
            <h2 className="text-xl text-gray-600 mb-6">
              {course.subtitle}
            </h2>
            <p className="text-lg text-gray-500">
              {course.description}
            </p>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {course.topics.map((topic) => (
                <div key={topic.id} className="bg-white shadow-sm rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {topic.title}
                  </h3>
                  <ul className="space-y-4">
                    {topic.items.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <FiCheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="mt-10 lg:mt-0">
            <div className="sticky top-6">
              <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
                {/* Instructor */}
                <div className="p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">강사 정보</h4>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">{course.instructor.name}</p>
                    <p className="text-sm text-gray-500">{course.instructor.title}</p>
                    <p className="text-sm text-gray-500">{course.instructor.description}</p>
                  </div>
                </div>

                {/* Course Details */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center">
                    <FiClock className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">{course.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <FiBook className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">{course.format}</span>
                  </div>
                  <div className="flex items-center">
                    <FiAward className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">{course.level}</span>
                  </div>
                </div>

                {/* Prerequisites */}
                <div className="p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">수강 전 필요지식</h4>
                  <ul className="space-y-3">
                    {course.prerequisites.map((prerequisite, index) => (
                      <li key={index} className="flex items-center">
                        <FiCheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-600">{prerequisite}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Materials */}
                <div className="p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">교육 자료</h4>
                  <ul className="space-y-3">
                    {course.materials.map((material, index) => (
                      <li key={index} className="flex items-center">
                        <FiPackage className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-600">{material}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Apply Button */}
                <div className="p-6">
                  <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                    수강 신청하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 