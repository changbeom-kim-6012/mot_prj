export interface Expert {
  id: number;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  position?: string;
  education?: string;
  career?: string;
  keyPerformanceHistory?: string;
  field?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  lastLogin?: string;
  updatedAt: string;
}

export interface ExpertCreate {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  position?: string;
  education?: string;
  career?: string;
  keyPerformanceHistory?: string;
  field?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

export interface ExpertUpdate {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  position?: string;
  education?: string;
  career?: string;
  keyPerformanceHistory?: string;
  field?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

export interface ExpertSearchParams {
  name?: string;
  email?: string;
  organization?: string;
  field?: string;
  status?: string;
}

export interface ExpertStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
} 