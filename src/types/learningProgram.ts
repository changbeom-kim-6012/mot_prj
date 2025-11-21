// Learning Program 관련 TypeScript 인터페이스

export interface LearningSubject {
  id: number;
  code: string;
  description: string;
  curriculumFileName?: string;
  curriculumFilePath?: string;
}

export interface LearningProgram {
  id: number;
  code: string;
  description: string;
  programType?: string;
  programGoal: string;
  mainContent: string;
  curriculumPdf?: string;
  curriculumFileName?: string;
  curriculumFilePath?: string;
  sortOrder: number;
  status: string;
  subjects?: LearningSubject[];
  createdAt: string;
  updatedAt: string;
}

export interface LearningProgramCreate {
  code: string;
  description: string;
  programType?: string;
  programGoal: string;
  mainContent: string;
  curriculumFileName?: string;
  curriculumFilePath?: string;
  sortOrder?: number;
  status?: string;
  subjectIds?: number[];
}

export interface LearningProgramUpdate {
  code?: string;
  description?: string;
  programType?: string;
  programGoal?: string;
  mainContent?: string;
  curriculumFileName?: string;
  curriculumFilePath?: string;
  sortOrder?: number;
  status?: string;
  subjectIds?: number[];
}


