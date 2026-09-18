import PaidHostelFeeReport from '@/components/pageComponents/dashboard/admin/hostelReport/PaidHostelFeeReport';
import UnpaidHostelFeeReport from '@/components/pageComponents/dashboard/admin/hostelReport/UnpaidHostelFeeReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const HostelReport = () => {
    return (
         <Tabs defaultValue="unpaidHostelFeeReport" className="w-full">
      <TabsList className='ml-auto'>
        <TabsTrigger value="unpaidHostelFeeReport">Unpaid Hostel Fee Report</TabsTrigger>
        <TabsTrigger value="paidHostelFeeReport">Paid Hostel Fee Report</TabsTrigger>
      </TabsList>
      <TabsContent value="unpaidHostelFeeReport">
        <UnpaidHostelFeeReport />
      </TabsContent>
      <TabsContent value="paidHostelFeeReport">
        <PaidHostelFeeReport />
      </TabsContent>
    </Tabs>
    );
};

export default HostelReport;