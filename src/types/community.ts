export interface CommunityCategory {
  id: number;
  codeName: string;
  parent?: CommunityCategory;
}

export interface CommunityItem {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommonCode {
  id: number;
  codeName: string;
  codeValue: string;
  menuName: string;
  desc?: string;
  parentId?: number;
}

export interface CommunityFormData {
  title: string;
  content: string;
  author: string;
  categoryId: number;
} 