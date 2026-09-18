import PaidExamFeeReport from '@/components/pageComponents/dashboard/admin/examReport/PaidExamFeeReport';
import UnpaidExamFeeReport from '@/components/pageComponents/dashboard/admin/examReport/UnpaidExamFeeReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const ExamReport = () => {
    return (
                <Tabs defaultValue="unpaidExamFeeReport" className="w-full">
      <TabsList className='ml-auto'>
        <TabsTrigger value="unpaidExamFeeReport">Unpaid Exam Fee Report</TabsTrigger>
        <TabsTrigger value="paidExamFeeReport">Paid Exam Fee Report</TabsTrigger>
      </TabsList>
      <TabsContent value="unpaidExamFeeReport">
        <UnpaidExamFeeReport />
      </TabsContent>
      <TabsContent value="paidExamFeeReport">
        <PaidExamFeeReport />
      </TabsContent>
    </Tabs>
    );
};

export default ExamReport;