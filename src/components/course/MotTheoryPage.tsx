import React from 'react';

const motCourses = [
  {
    section: 'I. R&D 전략기획',
    courses: [
      {
        title: '1. 신사업 발굴 및 기획',
        goal: '중장기 전략의 방향(영역, 가치사슬내 위치, 사업형태 등)에 따라 관련 산업(사업, 제품·기술군)의 분석을 통하여 신사업·신제품 기회를 포착하고, 개발 및 제안·계획서를 작성할 수 있는 역량을 확보함 .',
        details: [
          '상시적 인텔리전스 활동 방법과 이를 통한 사회·산업적 현상(phenomenon)을 인식 및 주요 Trend를 분석/평가 역량 확보.',
          '주요 Trend에 기반하여 Idea generation을 통한 신사업·신제품 Long-list의 확보와 우선순위 평가 및 분석방석을 통한 Short-list를 확보하고 사업 로드맵 구축.',
          '우선순위에 의한 사업 및 제안서 작성을 위한 방법론과 향후 R&D Project 관리를 위한 PMS 연계관리 방안 학습',
        ],
      },
      {
        title: '2. 환경분석과 Scenario Planning',
        goal: '환경의 변화에 대한 전략, 계획의 유연성을 확보하고, 환경 리스크에 선행적으로 대응할 수 있는 시나리오 기획 방법의 실무적 이해와 활용 역량을 확보함.',
        details: [
          '환경분석에 대한 전반적 개념의 이해와 다양한 방법론에 대하여 이해하고, 목적별 활용 방법 선택.',
          '환경 변화에 따른 전략의 유연성을 확보하고 리스크에 선행적으로 대응할 수 있는 시나리오 기법의 단계별 개념과 활용 Know-how 함양.',
          'Dynamic하고 변화하는 환경에 유연하게 대응할 수 있는 전략의 다양한 선택안 개발과 변화에 우선적 대응을 위한 실행 역량을 확보',
        ],
      },
      // ... 이하 생략, 동일 구조로 추가 가능
    ],
  },
  {
    section: 'II. R&D 기획관리',
    courses: [
      {
        title: '1. R&D 기획관리 통합과정',
        goal: 'R&D 전략 및 기획 활동에 대하여 전반적으로 이해하고 전략수립, 단계별 기획활동, 관리에 대한 지식과 Know-how를 확보할 수 있음. R&D 전략기획 업무 및 전략수립에 대한 핵심 방법론을 실무에 적용할 수 있도록 관련 Skill-set 제공.',
        details: [
          '전략과 사업 Portfolio, R&D Portfolio에 대한 연계구조와 Portfolio 분석 방법론의 이해를 통하여 구체적 분석 Know-how를 확보함.',
          '환경의 이해로 부터 기회 포착, 사업 및 R&D 계획서 작성 등 과제기획 방법, 그리고 TRM 및 Risk 관리 방법을 이해함.',
          '실무 적용을 위해 단계별 실습을 통하여 수립 구조, 방법, 분석 Skill을 체득함',
        ],
      },
      // ... 이하 생략, 동일 구조로 추가 가능
    ],
  },
  {
    section: 'III. MOT Expert Course',
    courses: [
      {
        title: '1. MOT Expert Course',
        goal: '기업의 경영성과 달성을 위해 R&D활동의 원활한 추진과 사업 성과로 연계될 수 있는 현황 진단, 분석을 통해 개선, 재정비, 새로운 체계를 설계함. 경영목표 달성을 위한 R&D 체계의 전반적 분석 Skill Set 제공 및 역할 확보',
        details: [
          '경영활동에서 배제 혹은 명확한 활동 방향의 모호성을 개선하여, 기업성장에 따른 R&D 기능의 동반적 고도화를 추진함. 전략적 방향 설정 상황 분석을 위한 현사업과 미래 지속성장을 위한 사업 구조, 그리고 R&D를 중심으로 시장-생산-판매 기능조직 간의 목표달성 연계 구조를 다루는 역량 함양.',
          '기본교육·분석·설계 활동의 추진과정에서 체득한 방법론, Know-how 등 Skill-Set의 체계화를 통한 종합적 MOT 전문역량을 배양함',
        ],
      },
    ],
  },
];

export default function MotTheoryPage() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {motCourses.map(section => (
        <div key={section.section} className="mb-10">
          <h2 className="text-2xl font-bold mb-6">{section.section}</h2>
          <div className="space-y-6">
            {section.courses.map((course, idx) => (
              <div key={course.title} className="bg-white rounded-xl shadow flex flex-row gap-6 p-6 items-start">
                {/* 과정 설명 */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg mb-2">{course.title}</div>
                  <div className="mb-2">
                    <span className="font-bold text-gray-700">[목표]</span>
                    <span className="ml-2 text-gray-700">{course.goal}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-700">[주요내용]</span>
                    <ul className="list-disc ml-8 text-gray-600 space-y-1 mt-1">
                      {course.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {/* 자료 첨부/조회 영역 */}
                <div className="w-64 min-w-[180px] flex flex-col items-end">
                  <div className="w-full bg-gray-50 rounded border border-gray-200 p-3">
                    <div className="font-semibold mb-2">관련 자료</div>
                    <div className="text-gray-400 text-sm mb-2">첨부/조회 기능 자리</div>
                    <button className="w-full bg-emerald-500 text-white rounded py-1 hover:bg-emerald-600 transition">자료 첨부</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 