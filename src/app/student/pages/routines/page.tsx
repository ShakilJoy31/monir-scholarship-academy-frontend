'use client'
import StudentClassRoutine from "@/components/pageComponents/dashboard/admin/studentPanel/routines/studentClassRoutine";
import StudentExamRoutine from "@/components/pageComponents/dashboard/admin/studentPanel/routines/studentExamRoutine";
import { Box, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";

const RoutineTab = () => {
    const [activeTab, setActiveTab] = useState<'class' | 'exam'>('class');

    useEffect(() => {
        // Load active tab from localStorage if available
        const savedTab = localStorage.getItem('activeFeeTab');
        if (savedTab === 'class' || savedTab === 'exam') {
            setActiveTab(savedTab);
        }
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: 'class' | 'exam') => {
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
                    label="Class Routine"
                    value="class"
                    sx={{
                        fontWeight: 600,
                        color: activeTab === 'class' ? '#1A3C34' : 'text.secondary',
                        '&.Mui-selected': {
                            color: '#1A3C34',
                        },
                    }}
                />
                <Tab
                    label="Exam Routine"
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

            {activeTab === 'class' ? <StudentClassRoutine /> : <StudentExamRoutine />}
        </Box>
    );
};

export default RoutineTab;