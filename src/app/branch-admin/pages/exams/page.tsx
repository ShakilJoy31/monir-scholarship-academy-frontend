"use client";
import React, { useState, useEffect } from "react";
import {
    Box,
    Tabs,
    Tab,
} from "@mui/material";
import ExamList from "@/components/pageComponents/dashboard/admin/exam/ExamList";
import NoticeList from "@/components/pageComponents/dashboard/admin/exam/NoticeList";

const ExamNoticeWrapper = () => {
    const [activeTab, setActiveTab] = useState<'exam' | 'notice'>('exam');

    useEffect(() => {
        // Load active tab from localStorage if available
        const savedTab = localStorage.getItem('activeTab');
        if (savedTab === 'exam' || savedTab === 'notice') {
            setActiveTab(savedTab);
        }
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: 'exam' | 'notice') => {
        setActiveTab(newValue);
        localStorage.setItem('activeTab', newValue);
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
                    label="Exam"
                    value="exam"
                    sx={{
                        fontWeight: 600,
                        color: activeTab === 'exam' ? '#1A3C34' : 'text.secondary',
                        '&.Mui-selected': {
                            color: '#1A3C34',
                        },
                    }}
                />
                <Tab
                    label="Notice"
                    value="notice"
                    sx={{
                        fontWeight: 600,
                        color: activeTab === 'notice' ? '#1A3C34' : 'text.secondary',
                        '&.Mui-selected': {
                            color: '#1A3C34',
                        },
                    }}
                />
            </Tabs>

            {activeTab === 'exam' ? <ExamList /> : <NoticeList />}
        </Box>
    );
};

export default ExamNoticeWrapper;
