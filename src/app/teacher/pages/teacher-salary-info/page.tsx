'use client'
import TeacherSalaryPaidList from "@/components/pageComponents/dashboard/admin/teacherPanel/salaryList/teacherSalaryPaidList";
import TeacherSalaryUnpaidList from "@/components/pageComponents/dashboard/admin/teacherPanel/salaryList/teacherSalaryUnpaidList";
import { Box, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";

const TeacherSalaryTab = () => {
    const [activeTab, setActiveTab] = useState<'paid' | 'unPaid'>('paid');

    useEffect(() => {
        // Load active tab from localStorage if available
        const savedTab = localStorage.getItem('activeFeeTab');
        if (savedTab === 'paid' || savedTab === 'unPaid') {
            setActiveTab(savedTab);
        }
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: 'paid' | 'unPaid') => {
        setActiveTab(newValue);
        localStorage.setItem('activeFeeTab', newValue);
    };

    return (
        <Box sx={{
                    mt: 8,
                    
                }}>
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                    mb: 4,
                    '& .MuiTabs-indicator': {
                        backgroundColor: '#1A3C34',
                        height: 3,
                    },
                }}
            >
                <Tab
                    label="Paid Salary"
                    value="paid"
                    sx={{
                        fontWeight: 600,
                        color: activeTab === 'paid' ? '#1A3C34' : 'text.secondary',
                        '&.Mui-selected': {
                            color: '#1A3C34',
                        },
                    }}
                />
                <Tab
                    label="UnPaid Salary"
                    value="unPaid"
                    sx={{
                        fontWeight: 600,
                        color: activeTab === 'unPaid' ? '#1A3C34' : 'text.secondary',
                        '&.Mui-selected': {
                            color: '#1A3C34',
                        },
                    }}
                />
            </Tabs>

            {activeTab === 'paid' ? <TeacherSalaryPaidList /> : <TeacherSalaryUnpaidList />}
        </Box>
    );
};

export default TeacherSalaryTab;