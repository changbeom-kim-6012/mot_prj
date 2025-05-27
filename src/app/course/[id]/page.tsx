import type { Metadata } from 'next';
import CourseDetailPage from '@/components/course/CourseDetailPage';

export const metadata: Metadata = {
  title: 'R&D 시스템 Overview - MOT Platform',
  description: 'R&D 업무의 시스템적 접근에 대한 이해와 교육',
};

const courseData = {
  id: 1,
  title: 'R&D 시스템 Overview',
  subtitle: 'R&D 업무의 시스템적 접근에 대한 이 해',
  description: 'R&D 시스템의 전반적인 이해와 실제 구축 사례를 통해 기업에 적합한 R&D 시스템을 구축하고 운영하는 방법을 학습합니다.',
  topics: [
    {
      id: 1,
      title: 'R&D 시스템 Overview',
      items: [
        '시스템에 영향을 미치는 내부 기업문화 및 외부환경에 대한 이해',
        '다양한 Project 유형 및 자사 Project 특성에 대한 이해',
        'Project 관리항목과 항목별 관리기법에 대한 이해',
        'R&D-PMS, KMS, PLM 등 시스템에 대한 전반적인 이해'
      ]
    },
    {
      id: 2,
      title: 'R&D Planning 시스템',
      items: [
        '경영 및 R&D 전략에 영향을 미치는 Intelligence 활동에 대한 관리',
        '경영전략에 따른 중장기 R&D 전략관리 및 Project Pool 관리',
        'Dashboard(Portfolio Analysis, PRM, TRM, etc.)에 대한 이해'
      ]
    },
    {
      id: 3,
      title: 'R&D Resource 시스템',
      items: [
        'Knowledge Resource에 대한 실시간 측적 및 공유 체계',
        '기술 등 자원 분류체계 구축방안 및 운영에 대한 이해',
        'Open R&D/Innovation과 Human 및 Knowledge Resource 관리',
        'KMS 2.0, Knowledge Graph 등 최신 정보관리 기법'
      ]
    },
    {
      id: 4,
      title: 'R&D 시스템 구축 사례',
      items: [
        '기업에 실제 구축된 시스템에 대한 사례'
      ]
    },
    {
      id: 5,
      title: '새로운 IT 기술과 R&D 시스템',
      items: [
        '인공지능 등 발전된 정보기술을 환경분석, R&D 기획 및 관리 등 기술경영 시스템에 적용',
        'PMS 2.0, KMS 2.0'
      ]
    },
    {
      id: 6,
      title: 'R&D 관리시스템 구축/운영상 주요 Issue',
      items: [
        'R&D 시스템 구축 또는 시스템 운영 과정에서 발생하는 다양한 문제점의 원인 및 대처방안'
      ]
    }
  ],
  instructor: {
    name: '김기술',
    title: 'R&D 시스템 전문가',
    description: '20년 이상의 R&D 시스템 구축 및 운영 경험'
  },
  duration: '16시간',
  format: '오프라인 강의 + 실습',
  level: '중급',
  prerequisites: ['기본적인 R&D 프로세스 이해', 'Project Management 기초 지식'],
  materials: ['강의자료', '실습 워크북', '사례연구 자료집']
};

export default function Page() {
  return <CourseDetailPage course={courseData} />;
} 