'use client';

import { AnswerFormData } from '@/types/qna';
import { useState } from 'react';

interface AnswerFormProps {
  onSubmit: (data: AnswerFormData) => void;
  initialData?: AnswerFormData;
}

export default function AnswerForm({ onSubmit, initialData }: AnswerFormProps) {
  const [content, setContent] = useState(initialData?.content || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ content });
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
          답변 작성
        </label>
        <textarea
          id="answer"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="mt-1 block w-full p-3 border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="답변을 작성해주세요"
          required
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-violet-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          답변 등록
        </button>
      </div>
    </form>
  );
} 