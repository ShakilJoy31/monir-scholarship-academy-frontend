export interface ITeacherSalaryAssign {
  id: number;
  branchId: number;
  teacherId: number;
  month: string;
  year: string;
  baseSalary: number;
  deduction: number;
  advance: number;
  pay: number;
  netPayable: number;
  status: 'UnPaid' | 'Paid' | 'Partial';
  paidAt?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}