'use client';

import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "내용을 입력하세요...",
  height = 400 
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null);

  return (
    <Editor
      onInit={(evt, editor) => editorRef.current = editor}
      value={value}
      onEditorChange={(content) => onChange(content)}
      init={{
        height: height,
        menubar: false,
        plugins: ['lists', 'link'],
        toolbar: 'bold italic | alignleft aligncenter alignright | bullist numlist',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        placeholder: placeholder,
        branding: false,
        elementpath: false,
        resize: false,
        statusbar: false
      }}
    />
  );
} 