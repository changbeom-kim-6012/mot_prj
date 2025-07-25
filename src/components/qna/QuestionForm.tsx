'use client';

import { QuestionFormData } from '@/types/qna';
import { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface QuestionFormProps {
  onSubmit: (data: QuestionFormData) => void;
  initialData?: QuestionFormData;
}

const CATEGORIES = [
  '기술경영',
  '연구기획',
  '프로젝트 관리',
  '특허/지식재산',
  '기타',
];

export default function QuestionForm({ onSubmit, initialData }: QuestionFormProps) {
  const [formData, setFormData] = useState<QuestionFormData>(
    initialData || {
      title: '',
      content: '',
      tags: [],
      category1: CATEGORIES[0],
      category2: '',
      isPublic: true,
    }
  );
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag.trim()],
      });
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          카테고리
        </label>
        <select
          id="category"
          value={formData.category1}
          onChange={(e) => setFormData({ ...formData, category1: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 py-5"
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          제목
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 py-5"
          required
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          내용
        </label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={15}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
          required
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          태그
        </label>
        <div className="mt-1">
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-violet-50 text-violet-600 text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-violet-400 hover:text-violet-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            placeholder="태그를 입력하고 Enter를 누르세요"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 py-5"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-violet-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          질문 등록
        </button>
      </div>
    </form>
  );
} 