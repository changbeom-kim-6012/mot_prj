'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// react-quill을 동적으로 import (SSR 문제 방지)
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>에디터 로딩 중...</p>,
});

import 'react-quill/dist/quill.snow.css';

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

export default function QuillEditor({
  value,
  onChange,
  placeholder = "내용을 입력하세요...",
  height = 400
}: QuillEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Quill 에디터 설정
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ]
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];

  if (!mounted) {
    return <div style={{ height: height }} className="border border-gray-300 rounded p-4 bg-gray-50 flex items-center justify-center">
      에디터 로딩 중...
    </div>;
  }

  return (
    <div style={{ height: height }}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ height: height - 42 }} // 툴바 높이만큼 빼기
      />
    </div>
  );
} 