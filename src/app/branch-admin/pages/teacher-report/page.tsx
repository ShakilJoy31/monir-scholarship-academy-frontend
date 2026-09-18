import PaidTeacherFeeReport from '@/components/pageComponents/dashboard/admin/teacherReport/PaidTeacherFeeReport';
import UnpaidTeacherFeeReport from '@/components/pageComponents/dashboard/admin/teacherReport/UnpaidTeacherFeeReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const TeacherReport = () => {
    return (
        <Tabs defaultValue="unpaidTeacherFeeReport" className="w-full">
             <TabsList className='ml-auto'>
               <TabsTrigger value="unpaidTeacherFeeReport">Unpaid Teacher Fee Report</TabsTrigger>
               <TabsTrigger value="paidTeacherFeeReport">Paid Teacher Fee Report</TabsTrigger>
             </TabsList>
             <TabsContent value="unpaidTeacherFeeReport">
               <UnpaidTeacherFeeReport />
             </TabsContent>
             <TabsContent value="paidTeacherFeeReport">
               <PaidTeacherFeeReport />
             </TabsContent>
           </Tabs>
    );
};

export default TeacherReport;