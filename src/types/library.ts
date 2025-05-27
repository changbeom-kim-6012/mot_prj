export interface Category {
  id: number;
  name: string;
  count: number;
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  category: string;
  author: string;
  tags: string[];
  date: string;
} 