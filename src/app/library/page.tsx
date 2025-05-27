import type { Metadata } from 'next';
import LibraryPage from '@/components/library/LibraryPage';

export const metadata: Metadata = {
  title: 'Library - MOT Platform',
  description: '기술경영, 연구기획 및 관리업무에 대한 자료를 찾아보세요.',
};

const categories = [
  { id: 1, name: '기술과경영', count: 15 },
  { id: 2, name: 'MOT부서장교육', count: 12 },
  { id: 3, name: 'MOT담당자교육', count: 18 },
  { id: 4, name: 'KOITA교육', count: 10 },
];

const resources = [
  {
    id: 1,
    title: '기술로드맵 작성 가이드',
    description: '효과적인 기술로드맵 작성을 위한 단계별 가이드라인',
    category: '기술과경영',
    author: '김기술',
    tags: ['AI', 'R&D전략'],
    date: '2024-03-15',
  },
  {
    id: 2,
    title: '연구개발 조직 관리 전략',
    description: 'R&D 조직의 효율적인 운영과 성과 관리를 위한 리더십 가이드',
    category: 'MOT부서장교육',
    author: '이부장',
    tags: ['조직관리', '리더십'],
    date: '2024-03-14',
  },
  {
    id: 3,
    title: 'MOT 실무자를 위한 프로세스 가이드',
    description: '기술경영 담당자의 일상적인 업무 프로세스와 베스트 프랙티스',
    category: 'MOT담당자교육',
    author: '박실무',
    tags: ['업무프로세스', '실무가이드'],
    date: '2024-03-13',
  },
  {
    id: 4,
    title: '기술사업화 성공전략',
    description: 'KOITA 전문가가 전하는 기술사업화 성공 사례와 전략',
    category: 'KOITA교육',
    author: '최사업',
    tags: ['기술사업화', '사례연구'],
    date: '2024-03-12',
  },
  {
    id: 5,
    title: '연구개발 투자 전략',
    description: '효율적인 R&D 투자와 포트폴리오 관리 방안',
    category: '기술과경영',
    author: '정투자',
    tags: ['R&D투자', '포트폴리오'],
    date: '2024-03-11',
  },
  {
    id: 6,
    title: '기술경영 리더십',
    description: '기술조직을 위한 효과적인 리더십 방법론',
    category: 'MOT부서장교육',
    author: '강리더',
    tags: ['리더십', '조직문화'],
    date: '2024-03-10',
  },
  {
    id: 7,
    title: '연구개발 성과관리',
    description: 'R&D 프로젝트의 성과 측정과 평가 방법론',
    category: 'MOT담당자교육',
    author: '임성과',
    tags: ['성과관리', '평가방법'],
    date: '2024-03-09',
  },
  {
    id: 8,
    title: '특허 전략 수립',
    description: '효과적인 특허 포트폴리오 구축 전략',
    category: 'KOITA교육',
    author: '한특허',
    tags: ['지식재산', '특허전략'],
    date: '2024-03-08',
  },
  {
    id: 9,
    title: '기술가치평가 방법론',
    description: '기술의 경제적 가치 산정을 위한 평가 방법론',
    category: '기술과경영',
    author: '박가치',
    tags: ['가치평가', '기술사업화'],
    date: '2024-03-07',
  },
  {
    id: 10,
    title: '연구개발 인력관리',
    description: 'R&D 인력의 효율적 관리와 동기부여 전략',
    category: 'MOT부서장교육',
    author: '김인사',
    tags: ['인력관리', '동기부여'],
    date: '2024-03-06',
  }
];

export default function Page() {
  return <LibraryPage categories={categories} resources={resources} />;
} 