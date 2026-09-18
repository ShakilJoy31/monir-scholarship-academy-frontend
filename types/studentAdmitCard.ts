// src/types/student.ts
export interface Student {
  id: number;
  studentUniqueId: string;
  name: string;
  fatherName?: string;  // Made optional to match both components
  motherName?: string;  // Made optional to match both components
  class?: string;
  section?: string;
  classRoll?: string;
  phone?: string;
  bloodGroup?: string;
  avatar?: string;
  stream?: string;
  sessionYear?: string;
}

export interface Subject {
  sl: number;
  date: string;
  subjectCode: string;
  subjectName: string;
  time: string;
}

export interface ClassItem {
  id: number;
  name: string;
}

export interface Session {
  id: number;
  name: string;
}

export interface Section {
  id: number;
  name: string;
}

export interface Stream {
  id: number;
  name: string;
}