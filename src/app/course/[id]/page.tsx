import type { Metadata } from 'next';
import CourseDetailPage from '@/components/course/CourseDetailPage';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: '과정 상세보기 - MOT Club',
  description: 'MOT 과정별 상세 정보',
};

const courseDataMap: Record<string, any> = {
  '1': {
    title: 'MOT 이론 및 방법론',
    subtitle: 'R&D 전략기획부터 MOT Expert Course까지',
    description: 'R&D 전략기획, R&D 기획관리, MOT Expert Course를 통한 종합적인 MOT 이론 및 방법론을 학습합니다.',
    topics: [
      {
        id: 1,
        title: 'Ⅰ. R&D 전략기획',
        items: [
          {
            subtitle: '1. 신사업 발굴 및 기획',
            goal: '중장기 전략의 방향(영역, 가치사슬내 위치, 사업형태 등)에 따라 관련 산업(사업, 제품·기술군)의 분석을 통하여 신사업·신제품 기회를 포착하고, 개발 및 제안·계획서를 작성할 수 있는 역량을 확보함.',
            content: [
              '상시적 인텔리전스 활동 방법과 이를 통한 사회·산업적 현상(phenomenon)을 인식 및 주요 Trend를 분석/평가 역량 확보.',
              '주요 Trend에 기반하여 Idea generation을 통한 신사업·신제품 Long-list의 확보와 우선순위 평가 및 분석방석을 통한 Short-list를 확보하고 사업 로드맵 구축.',
              '우선순위에 의한 사업 및 제안서 작성을 위한 방법론과 향후 R&D Project 관리를 위한 PMS 연계관리 방안 학습'
            ]
          },
          {
            subtitle: '2. 환경분석과 Scenario Planning',
            goal: '환경의 변화에 대한 전략, 계획의 유연성을 확보하고, 환경 리스크에 선행적으로 대응할 수 있는 시나리오 기획 방법의 실무적 이해와 활용 역량을 확보함.',
            content: [
              '환경분석에 대한 전반적 개념의 이해와 다양한 방법론에 대하여 이해하고, 목적별 활용 방법 선택.',
              '환경 변화에 따른 전략의 유연성을 확보하고 리스크에 선행적으로 대응할 수 있는 시나리오 기법의 단계별 개념과 활용 Know-how 함양.',
              'Dynamic하고 변화하는 환경에 유연하게 대응할 수 있는 전략의 다양한 선택안 개발과 변화에 우선적 대응을 위한 실행 역량을 확보'
            ]
          },
          {
            subtitle: '3. PRM/TRM 구축',
            goal: '환경변화에 따른 시장 Needs에 기반한 제품 Pipeline을 확충하고, 제품개발의 Time-to-market을 위한 핵심기술에 대한 단계별 개발 목표, 기술전략, 자원투입 계획 등 수립방법을 이해하고 관련 역량을 확보함.',
            content: [
              '환경분석을 통한 기존 사업에 대한 제품 Pipe-line(Product Roadmap)을 강화할 수 있는 역량을 확보.',
              '시장 Needs에 대응한 제품 Concept을 구체화하고 제품서비스의 기능/속성에 대한 개발 목표구현을 위한 기술개발 비전 달성을 위한 Time-frame내 각 단계별 기술개발 계획을 구체화함.',
              '기술목표(비전) 달성과 관련된 소요 자원분석 방법의 학습을 통하여 종합 PRM/TRM을 구축 역량을 확보함.'
            ]
          },
          {
            subtitle: '4. 핵심역량 분석과 강화(Core Competency Assessment)',
            goal: '기존사업의 강화, 신규사업의 추진 및 성과의 조기 창출 등을 위한 내부 보유 혹은 미래 필요 핵심역량을 파악하여, 경쟁력 우위 확보 및 유지를 위한 전략적 활동 방안의 구체화, 사업전략의 실행 및 목표 달성을 위한 기반을 확보할 수 있음.',
            content: [
              '사업 혹은 제품군의 경영활동(수익창출)과정에서 나타난 성공·실패 활동을 분석하여 내부의 사업, 경영, 연구개발 활동이 가치사슬내 어떤 부분에 위치하고 있는지를 분석함.',
              '현재사업에서의 보유 역량, 그리고 미래사업에서의 요구역량을 규명하고, 자사의 핵심역량을 네이밍 할 수 있음.',
              '경영목표 달성을 위해 혹은 시장경쟁력 강화를 위해 확보/강화해야 할 역량, Gap을 극복하기 위한 활동계획을 수립함.'
            ]
          }
        ],
      },
      {
        id: 2,
        title: 'Ⅱ. R&D 기획관리',
        items: [
          {
            subtitle: '1. R&D 기획관리 통합과정',
            goal: 'R&D 전략 및 기획 활동에 대하여 전반적으로 이해하고 전략수립, 단계별 기획활동, 관리에 대한 지식과 Know-how를 확보할 수 있음. R&D 전략기획 업무 및 전략수립에 대한 핵심 방법론을 실무에 적용할 수 있도록 관련 Skill-set 제공.',
            content: [
              '전략과 사업 Portfolio, R&D Portfolio에 대한 연계구조와 Portfolio 분석 방법론의 이해를 통하여 구체적 분석 Know-how를 확보함.',
              '환경의 이해로 부터 기회 포착, 사업 및 R&D 계획서 작성 등 과제기획 방법, 그리고 TRM 및 Risk 관리 방법을 이해함.',
              '실무 적용을 위해 단계별 실습을 통하여 수립 구조, 방법, 분석 Skill을 체득함'
            ]
          },
          {
            subtitle: '2. R&D Project 관리',
            goal: '신사업·신제품·신기술 Idea에서 부터 사업화·기술이관까지 전주기의 R&D Project 수행에 따른 관리 활동을 효율적으로 추진할 수 있는 운영체계, Process, 관련 협력체계 등과 Project 관리와 관련된 의사결정 정보 제공역량의 확보.',
            content: [
              'Project의 개념과 범위, 역사적 배경과 사례를 통한 기획관리의 핵심 Point에 대한 다양한 지식을 습득.',
              'Project 관리를 위한 Process, 유형, Work Flow에 대한 조직과 운영체계에 대하여 설계 방안.',
              'R&F Project의 유형, 관련 Template, 내부 운영체계(운영, 관리, Review, 의사결정 체계 연계 등) 및 Risk 관리 방안, 실시간 관리를 위한 IT 연계 체계.'
            ]
          },
          {
            subtitle: '3. R&D와 기술사업화',
            goal: 'R&D 활동의 결과 혹은 개발 중에 있는 기술에 대한 상업화 유형, Business Model, Process, 계획 수립 내용에 대하여 단계별 분석 대상, 구체화 방안에 대하여 실무적으로 활용할 수 있는 역량을 확보함.',
            content: [
              '기업에서의 기술사업화 의미, 개념, 주요 활동과 핵심 요소, 사업화 계획 및 전략수립 방법에 대하여 학습함.',
              '내부 기술에 대한 기술마케팅 측면에서의 Application 관련 추가적 R&D idea에서 business model 구체화, 사업화를 위한 완성도 분석 Skill-set 확보.',
              '실무 적용을 위한 기술가치평가, 재무평가, 상업화를 위한 역량분석과 종합적 사업전략 수립에 대한 역량을 확보함.'
            ]
          },
          {
            subtitle: '4. R&D Risk 관리체계',
            goal: 'R&D 활동과정에서 나타날 수 있는 Risk를 사전에 식별하고 관리할 수 있는 분석방법과 대응방안을 수립하여 R&D 성과를 향상시킬 수 있는 관리방안에 대한 Skill-set 및 Know-how을 확보함.',
            content: [
              'R&D Process에서 발생될 수 있는 Risk를 식별, 분석, 회피, 대응할 수 있는 방법론 및 관련 Skill를 함양함.',
              'Risk Pool에 대하여 종합적 대응방안 전략을 수립하고, Cause & Effect 분석을 통하여 사전 개선방안 설계 능력을 확보.',
              '사전 내부 체계의 개선으로 교정, 교육 및 제도의 개선, 내부 업무 Process를 통하여 조직적 차원, 단위 팀 및 개인이 개선활동 등 구체적 방안을 도출/대응 역량을 확보함.'
            ]
          }
        ],
      },
      {
        id: 3,
        title: 'Ⅲ. MOT Expert Course',
        items: [
          {
            subtitle: '1. MOT Expert Course',
            goal: '기업의 경영성과 달성을 위해 R&D활동의 원활한 추진과 사업 성과로 연계될 수 있는 현황 진단, 분석을 통해 개선, 재정비, 새로운 체계를 설계함. 경영목표 달성을 위한 R&D 체계의 전반적 분석 Skill Set 제공 및 역할 확보',
            content: [
              '경영활동에서 배제 혹은 명확한 활동 방향의 모호성을 개선하여, 기업성장에 따른 R&D 기능의 동반적 고도화를 추진함. 전략적 방향 설정 상황 분석을 위한 현사업과 미래 지속성장을 위한 사업 구조, 그리고 R&D를 중심으로 시장-생산-판매 기능조직 간의 목표달성 연계 구조를 다루는 역량 함양.',
              '기본교육·분석·설계 활동의 추진과정에서 체득한 방법론, Know-how 등 Skill-Set의 체계화를 통한 종합적 MOT 전문역량을 배양함.'
            ]
          }
        ],
      }
    ],
    instructor: {
      name: 'MOT 전문가',
      title: 'MOT 이론 및 방법론 전문가',
      description: '20년 이상의 MOT 이론 및 실무 경험',
    },
    duration: '24시간',
    format: '오프라인 강의 + 실습',
    level: '중급~고급',
    prerequisites: [
      '기본적인 경영/기술 지식',
      'R&D 프로세스에 대한 이해',
    ],
    materials: [
      'R&D 전략기획 강의자료.pdf',
      'R&D 기획관리 강의자료.pdf',
      'MOT Expert Course 강의자료.pdf',
    ],
  },
  '2': {
    title: 'MOT 운영 시스템 교과목',
    subtitle: 'MOT 관리 시스템의 실제 교과목 구성',
    description: 'MOT 관리 시스템의 전반적인 이해와 실제 구축 사례, 실무 적용을 위한 교과목별 내용을 학습합니다.',
    topics: [
      {
        id: 1,
        title: 'R&D 관리 시스템 Overview',
        items: [
          'R&D 관리 시스템에 영향을 미치는 기업문화 및 외부 환경에 대한 이해',
          'Project와 R&D Project에 대한 이해',
          '기업의 R&D Project 유형별 특성에 대한 이해',
          'Project 관리항목 및 항목별 관리기법에 대한 이해',
          'R&D 관련 시스템(PMS, KMS, PLM, ...)에 대한 이해',
        ],
      },
      {
        id: 2,
        title: 'R&D Planning Mgmt System (기획관리 시스템)',
        items: [
          'R&D 기획과 Intelligence 활동에 대한 시스템적 접근',
          '경영전략, 중장기 R&D 전략과 Project Pool에 대한 시스템적 접근',
          'R&D Dashboard(Portfolio Analysis, PRM, TRM, Status Summary 등)에 대한 이해',
        ],
      },
      {
        id: 3,
        title: 'R&D Resource Mgmt System (자원관리 시스템)',
        items: [
          '연구자원 축적 및 공유에 필수 요소인 기술 등 연구자원에 대한 분류체계',
          'Open R&D/Innovation과 R&D Procurement',
          'Knowledge Resource(연구문서 등)에 대한 실시간 축적 및 공유 체계',
          'KMS 2.0 등 정보기술과 R&D 자원관리',
        ],
      },
      {
        id: 4,
        title: 'R&D 관리시스템 구축 및 운영 단계의 주요 Issue',
        items: [
          '시스템에 대한 안정화 단계 및 변화관리',
          '구축단계에서 고려해야 하는 주요 이슈',
          '운영단계에서 발생하는 주요 이슈',
        ],
      },
      {
        id: 5,
        title: 'R&D 관리 시스템 구축 사례',
        items: [
          '실제 기업의 R&D 관리 시스템 구축 사례 및 실무 적용',
        ],
      },
    ],
    instructor: {
      name: '김기술',
      title: 'R&D 시스템 전문가',
      description: '20년 이상의 R&D 시스템 구축 및 운영 경험',
    },
    duration: '16시간',
    format: '오프라인 강의 + 실습',
    level: '중급',
    prerequisites: [
      '기본적인 R&D 프로세스 이해',
      '기업 내 R&D 경험 또는 관심',
    ],
    materials: [
      '강의자료#1.pdf',
      '강의자료#2.pdf',
      '강의자료#3.pdf',
      '강의자료#4.pdf',
      '강의자료#5.pdf',
      '강의자료#6.pdf',
      '강의자료#7.pdf',
      '강의자료#8.pdf',
      '강의자료#9.pdf',
    ],
  },
};

export default function Page({ params }: { params: { id: string } }) {
  const course = courseDataMap[params.id];
  if (!course) return notFound();
  return <CourseDetailPage course={course} />;
} 