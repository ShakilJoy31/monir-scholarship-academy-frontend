export interface Account {
  id: number;
  bankName: string;
  accountHolderName: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  branchId: number;
  openingBalance: number;
  currentBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  accountId: number;
  userId: number | null;
  paymentAmount: number;
  branchId: number;
  type: string;
  subject: string;
  expenseId: number | null;
  teacherSalaryAdvanceId: number | null;
  teacherSalaryPayId: number | null;
  classFeePayId: number | null;
  admissionFeePayId: number;
  bookIssueId: number | null;
  hostelFeePayId: number | null;
  createdAt: string;
  updatedAt: string;
  account: Account;
}

export interface Class {
  id: number;
  branchId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: number;
  branchId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Stream {
  id: number;
  branchId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: number;
  branchId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Admission {
  id: number;
  branchId: number;
  applicationId: string;
  sessionYearId: number;
  name: string;
  phone: string;
  email: string;
  classNameId: number;
  sectionNameId: number;
  streamNameId: number;
  gender: string;
  religion: string;
  dob: string;
  bloodGroup: string;
  address: string | null;
  fatherName: string | null;
  motherName: string | null;
  parentPhone: string | null;
  previousSchool: string | null;
  status: string;
  netPayable: number;
  paymentStatus: string;
  paidAt: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  class: Class;
  section: Section;
  stream: Stream;
  session: Session;
}

export interface AdmissionFeePayment {
  id: number;
  branchId: number;
  admissionId: number;
  status: string;
  amount: number;
  note: string;
  createdAt: string;
  updatedAt: string;
  admission: Admission;
  Payment: Payment[];
}