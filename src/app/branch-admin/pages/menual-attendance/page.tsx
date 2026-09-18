import StudentAttendance from '@/components/pageComponents/dashboard/admin/manageAttendance/StudentAttendance'
import TeachersAttendance from '@/components/pageComponents/dashboard/admin/manageAttendance/TeachersAttendance'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React from 'react'

const MenualAttendancePage = () => {
  return (
    <Tabs defaultValue="teachersAttendance" className="w-full">
      <TabsList className='ml-auto'>
        <TabsTrigger value="teachersAttendance">Teachers Attendance</TabsTrigger>
        <TabsTrigger value="studentAttendance">Student Attendance</TabsTrigger>
      </TabsList>

      <TabsContent value="teachersAttendance">
        <TeachersAttendance />
      </TabsContent>

      <TabsContent value="studentAttendance">
        <StudentAttendance />
      </TabsContent>
      
    </Tabs>
  )
}

export default MenualAttendancePage