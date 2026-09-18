import AutoSmsSetting from '@/components/pageComponents/dashboard/admin/manageAttendance/AutoSmsSetting'
import SetOffDay from '@/components/pageComponents/dashboard/admin/manageAttendance/SetOffDay'
import StudentSetup from '@/components/pageComponents/dashboard/admin/manageAttendance/StudentsSetup'
import StudentTime from '@/components/pageComponents/dashboard/admin/manageAttendance/StudentTime'
import TeachersSetup from '@/components/pageComponents/dashboard/admin/manageAttendance/TeachersSetup'
import TeachersTime from '@/components/pageComponents/dashboard/admin/manageAttendance/TeachersTime'
import ZKTecoDevice from '@/components/pageComponents/dashboard/admin/manageAttendance/ZKTecoDevice'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React from 'react'

const SettingPage = () => {
  return (
    <Tabs defaultValue="teachersTime" className="w-full">
      <TabsList className='ml-auto'>
        <TabsTrigger value="ZKTecoDevice">ZKTeco Device</TabsTrigger>
        <TabsTrigger value="teachersTime">Teachers Time</TabsTrigger>
        <TabsTrigger value="studentTime">Student Time</TabsTrigger>
        <TabsTrigger value="autoSMSSetting">Auto SMS Setting</TabsTrigger>
        <TabsTrigger value="teachersSetup">Teachers Setup</TabsTrigger>
        <TabsTrigger value="studentsSetup">Students Setup</TabsTrigger>
        <TabsTrigger value="setOffday">Set Off day</TabsTrigger>
      </TabsList>
      <TabsContent value="ZKTecoDevice">
        <ZKTecoDevice />
      </TabsContent>
      <TabsContent value="teachersTime">
        <TeachersTime />
      </TabsContent>
      <TabsContent value="studentTime">
        <StudentTime />
      </TabsContent>
      <TabsContent value="autoSMSSetting">
        <AutoSmsSetting />
      </TabsContent>
      <TabsContent value="teachersSetup">
        <TeachersSetup />
      </TabsContent>
      <TabsContent value="studentsSetup">
        <StudentSetup />
      </TabsContent>
      <TabsContent value="setOffday">
        <SetOffDay />
      </TabsContent>
    </Tabs>
  )
}

export default SettingPage