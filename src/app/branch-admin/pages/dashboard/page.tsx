"use client";

import { useGetBranchAdminByIdQuery } from "@/app/store/api/branch/branchApi";
import { useBranchDashboardPageStaticsQuery } from "@/app/store/api/student/studentApi";
import { buttonLoader, getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import Image from "next/image";
import React from "react";
import {
    FaChalkboardTeacher,
    FaUserGraduate,
    FaMale,
    FaFemale,
    FaMoneyBillWave,
    FaMoneyBillAlt,
} from "react-icons/fa";

const BranchAdminDashboard  = () => {
    const { data, isLoading } = useBranchDashboardPageStaticsQuery({});
    const userInfo = getUserInfoFromToken();
    const id = userInfo?.id; 

    const { data: adminData, isLoading: isAdminLoading } = useGetBranchAdminByIdQuery(id);

    // Stats configuration - using dynamic data where available
    const stats = [
        { title: "All Teachers", value: data?.data?.teacherCount || 0, icon: <FaChalkboardTeacher className="text-[#035140]" /> },
        { title: "All Students", value: data?.data?.studentCount || 0, icon: <FaUserGraduate className="text-[#035140]" /> },
        { title: "Boys", value: data?.data?.boys || 0, icon: <FaMale className="text-[#035140]" /> },
        { title: "Girls", value: data?.data?.girls || 0, icon: <FaFemale className="text-[#035140]" /> },
        { title: "Income", value: data?.data?.income || 0, icon: <FaMoneyBillWave className="text-[#035140]" /> },
        { title: "Expense", value: data?.data?.expense || 0, icon: <FaMoneyBillAlt className="text-[#035140]" /> },
    ];

    if (isLoading || isAdminLoading) {
        return (
            <main className="min-h-screen bg-gray-100 p-6 flex justify-center">
                {buttonLoader}
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            {/* Header Section */}
            <header className="mb-8">
                
                {/* Support Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-white border-2 rounded-lg border-gray-200 shadow-md">

                    <div className="flex gap-x-2 p-4">
                        <Image
                            src={adminData?.data?.avatar || 'https://hips.hearstapps.com/hmg-prod/images/maggie-lindemann-pretty-girl-1475155655.jpg?crop=1.00xw:0.668xh;0,0&resize=1200:*'}
                            width={128}
                            height={128}
                            alt='Admin Avatar'
                            className="w-16 h-16 object-cover border border-gray-300 rounded-lg"
                        />
                        <div className="">
                            <h3 className="font-semibold text-gray-800">
                                {adminData?.data?.name || 'Labiba Nahar'} 
                                
                            </h3>
                            <p className="text-gray-600">
                                {adminData?.data?.branch?.address || 'Dhaka'}
                            </p>
                            {adminData?.data?.branch && (
                                <p className="text-gray-600 text-sm mt-1">
                                    Branch: {adminData.data.branch.name} | Location: {adminData.data.branch.location} | Email: {adminData.data.branch.email}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Section */}
            <section>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition duration-200 flex justify-between items-start"
                        >
                            <div>
                                <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
                                <p className="text-sm text-gray-600 mt-2">{stat.title}</p>
                            </div>
                            <div className="text-2xl">
                                {stat.icon}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default BranchAdminDashboard ;