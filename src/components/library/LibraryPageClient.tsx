'use client';

import dynamic from 'next/dynamic';

const LibraryPage = dynamic(() => import('@/components/library/LibraryPage'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center min-h-screen">로딩 중...</div>
});

export default function LibraryPageClient() {
  return <LibraryPage />;
}









