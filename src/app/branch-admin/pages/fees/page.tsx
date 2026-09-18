'use client'
import ExamFee from "@/components/pageComponents/dashboard/admin/feesManagement/ExamFee";
import MonthlyFee from "@/components/pageComponents/dashboard/admin/feesManagement/MonthlyFee";
import { Box, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";

const FeeWrapper = () => {
    const [activeTab, setActiveTab] = useState<'monthly' | 'exam'>('exam');

    useEffect(() => {
        // Load active tab from localStorage if available
        const savedTab = localStorage.getItem('activeFeeTab');
        if (savedTab === 'monthly' || savedTab === 'exam') {
            setActiveTab(savedTab);
        }
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: 'monthly' | 'exam') => {
        setActiveTab(newValue);
        localStorage.setItem('activeFeeTab', newValue);
    };

    return (
        <Box>
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
                    label="Monthly Fee"
                    value="monthly"
                    sx={{
                        fontWeight: 600,
                        color: activeTab === 'monthly' ? '#1A3C34' : 'text.secondary',
                        '&.Mui-selected': {
                            color: '#1A3C34',
                        },
                    }}
                />
                <Tab
                    label="Exam Fee"
                    value="exam"
                    sx={{
                        fontWeight: 600,
                        color: activeTab === 'exam' ? '#1A3C34' : 'text.secondary',
                        '&.Mui-selected': {
                            color: '#1A3C34',
                        },
                    }}
                />
            </Tabs>

            {activeTab === 'monthly' ? <MonthlyFee /> : <ExamFee />}
        </Box>
    );
};

export default FeeWrapper;