import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Library - MOT Club',
  description: '기술경영, 연구기획 및 관리업무에 대한 자료를 찾아보세요.',
};

const LibraryPage = dynamic(() => import('@/components/library/LibraryPage'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center min-h-screen">로딩 중...</div>
});

export default function Page() {
  return <LibraryPage />;
} 