import Navigation from '@/components/Navigation';
import { FiMail, FiPhone, FiLinkedin, FiAward, FiUser } from 'react-icons/fi';

export default function ExpertPage() {
  const experts = [
    {
      id: 1,
      name: '김기술',
      title: '기술경영 전문가',
      education: [
        '서울대학교 공과대학 박사',
        'KAIST 기술경영전문대학원 석사',
        '연세대학교 공과대학 학사'
      ],
      career: [
        '현) 한국기술경영학회 회장',
        '전) 삼성전자 기술전략실 수석연구원',
        '전) 현대자동차 R&D 센터장'
      ],
      expertise: [
        'R&D 전략 수립 및 기획',
        '기술로드맵 작성',
        '특허 분석 및 IP 전략',
        '기술가치평가'
      ],
      contact: {
        email: 'tech.kim@mot.com',
        phone: '02-1234-5678',
        linkedin: 'linkedin.com/in/techkim'
      }
    },
    {
      id: 2,
      name: '이혁신',
      title: '연구기획 전문가',
      education: [
        'MIT Sloan School 박사',
        'Stanford University 석사',
        'KAIST 학사'
      ],
      career: [
        '현) 국가과학기술연구회 이사',
        '전) LG이노베이션 센터장',
        '전) 한국산업기술평가관리원 실장'
      ],
      expertise: [
        '연구과제 기획 및 평가',
        '기술사업화',
        '기술혁신시스템',
        'R&D 성과관리'
      ],
      contact: {
        email: 'innovation.lee@mot.com',
        phone: '02-2345-6789',
        linkedin: 'linkedin.com/in/innovationlee'
      }
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-slate-50">
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute w-full h-full opacity-[0.07]" viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Abstract Circuit Lines */}
            <path d="M-100 300 C 200 300, 300 100, 600 100 S 1000 300, 1300 300" 
              className="text-indigo-600" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M-100 350 C 200 350, 300 150, 600 150 S 1000 350, 1300 350" 
              className="text-purple-600" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            
            {/* Connection Points */}
            <circle cx="600" cy="100" r="4" className="text-indigo-600" fill="currentColor"/>
            <circle cx="600" cy="150" r="4" className="text-purple-600" fill="currentColor"/>
            
            {/* Tech Grid Pattern */}
            <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" className="text-gray-200" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)"/>
            
            {/* Abstract Shapes */}
            <path d="M800 50 L850 100 L800 150 L750 100Z" className="text-indigo-500" fill="currentColor" fillOpacity="0.1"/>
            <path d="M900 200 L950 250 L900 300 L850 250Z" className="text-purple-500" fill="currentColor" fillOpacity="0.1"/>
            <path d="M100 400 L150 450 L100 500 L50 450Z" className="text-indigo-500" fill="currentColor" fillOpacity="0.1"/>
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FiAward className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">전문가 프로필</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl">
            MOT 플랫폼의 전문가들을 소개합니다. 각 분야의 전문가들이 여러분의 기술경영 여정을 함께합니다.
          </p>
        </div>
      </div>

      {/* Expert Cards */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {experts.map((expert) => (
            <div key={expert.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6">
              <div className="flex flex-col gap-8">
                {/* Photo and Basic Info */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-xl shadow-sm bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center overflow-hidden">
                      <div className="relative w-full h-full flex items-center justify-center">
                        <FiUser className="w-16 h-16 text-indigo-300" />
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-indigo-50/50" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-900">{expert.name}</h3>
                    <p className="text-indigo-600 font-medium mb-4">{expert.title}</p>
                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiMail className="w-4 h-4" />
                        <span>{expert.contact.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiPhone className="w-4 h-4" />
                        <span>{expert.contact.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiLinkedin className="w-4 h-4" />
                        <span>{expert.contact.linkedin}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div>
                  {/* Education & Career */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">학력 및 경력</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-500 mb-2">학력</h5>
                        <ul className="space-y-1">
                          {expert.education.map((edu, index) => (
                            <li key={index} className="text-gray-700">{edu}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-500 mb-2">경력</h5>
                        <ul className="space-y-1">
                          {expert.career.map((car, index) => (
                            <li key={index} className="text-gray-700">{car}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Expertise */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">업무영역</h4>
                    <div className="flex flex-wrap gap-2">
                      {expert.expertise.map((exp, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 