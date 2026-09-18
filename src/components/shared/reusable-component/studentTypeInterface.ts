// types/student.ts
export interface Student {
    id: number;
    branchId?: number;
    type?: string;
    migrateStudentId?: number | null;
    sessionYearId?: number;
    name: string;
    studentUniqueId: string;
    phone?: string;
    email?: string;
    password?: string;
    classNameId?: number;
    classRoll?: string;
    sectionNameId?: number;
    streamNameId?: number;
    discountType?: string;
    discount?: number;
    studentClassFeeDiscountId?: number | null;
    gender?: string;
    religion?: string;
    dob?: string;
    bloodGroup?: string;
    address?: string;
    fatherName: string;
    motherName: string;
    parentPhone?: string;
    count?: number;
    blockDate?: string | null;
    active?: boolean;
    avatar?: string;
    createdAt?: string;
    updatedAt?: string;
    class?: {
        id: number;
        name: string;
    };
    section?: {
        id: number;
        name: string;
    };
    session?: {
        id: number;
        name: string;
    };
    stream?: {
        id: number;
        name: string;
    };
    selected?: boolean;
    [key: string]: unknown;
}