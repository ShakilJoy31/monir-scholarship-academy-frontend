'use client'
import StudentPaidMonthlyFees from "@/components/pageComponents/dashboard/admin/studentPanel/studentFees/studentPaidMonthlyFees";
import StudentUnPaidMonthlyFees from "@/components/pageComponents/dashboard/admin/studentPanel/studentFees/studentUnPaidMonthlyFees";
import { Box, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";

const StudentPaymentFeesTab = () => {
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
                    label="Paid Fee's"
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
                    label="Unpaid Fee's"
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

            {activeTab === 'paid' ? <StudentPaidMonthlyFees /> : <StudentUnPaidMonthlyFees />}
        </Box>
    );
};

export default StudentPaymentFeesTab;