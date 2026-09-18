import StudentAttendSummery from '@/components/pageComponents/dashboard/admin/reports/StudentAttendSummery'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import IndividualReports from '../individualReport/page'
import DailyReports from '../dailyReport/page'
import MonthlyReports from '../monthlyReport/page'

const ReportsPage = () => {
  return (
     <Tabs defaultValue="individualReport" className="w-full">
      <TabsList className='ml-auto'>
        <TabsTrigger value="individualReport">Individual Report</TabsTrigger>
        <TabsTrigger value="dailyReports">Daily Report</TabsTrigger>
        <TabsTrigger value="monthlyReports">Monthly Reports</TabsTrigger>
        <TabsTrigger value="studentAttendSummery">Student&apos;s Attend Summery</TabsTrigger>
      </TabsList>
       <TabsContent value="individualReport">
        <IndividualReports />
      </TabsContent>
       <TabsContent value="dailyReports">
        <DailyReports /> 
      </TabsContent>
       <TabsContent value="monthlyReports">
        <MonthlyReports />
      </TabsContent>
      <TabsContent value="studentAttendSummery">
        <StudentAttendSummery />
      </TabsContent>
    </Tabs>
  )
}

export default ReportsPage