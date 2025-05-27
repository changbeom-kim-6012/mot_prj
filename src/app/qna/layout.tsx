import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Q&A - MOT Platform',
  description: 'MOT 관련 궁금한 점을 전문가에게 물어보세요',
};

export default function QnALayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="flex min-h-screen flex-col">
      {children}
    </section>
  );
} 