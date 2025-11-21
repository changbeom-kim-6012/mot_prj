import type { Metadata } from 'next';
import LibraryPageClient from '@/components/library/LibraryPageClient';

export const metadata: Metadata = {
  title: 'Library - MOT Club',
  description: '기술경영, 연구기획 및 관리업무에 대한 자료를 찾아보세요.',
};

export default function Page() {
  return <LibraryPageClient />;
} 