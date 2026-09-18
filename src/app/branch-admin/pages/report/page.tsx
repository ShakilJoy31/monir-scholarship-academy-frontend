import PaidClassFeeReport from '@/components/pageComponents/dashboard/admin/allReport/PaidClassFeeReport';
import UnpaidClassFeeReport from '@/components/pageComponents/dashboard/admin/allReport/UnpaidClassFeeReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const Report = () => {
    return (
        <Tabs defaultValue="unpaidClassFeeReport" className="w-full">
      <TabsList className='ml-auto'>
        <TabsTrigger value="unpaidClassFeeReport">Unpaid Class Fee Report</TabsTrigger>
        <TabsTrigger value="paidClassFeeReport">Paid Class Fee Report</TabsTrigger>
      </TabsList>
      <TabsContent value="unpaidClassFeeReport">
        <UnpaidClassFeeReport />
      </TabsContent>
      <TabsContent value="paidClassFeeReport">
        <PaidClassFeeReport />
      </TabsContent>
    </Tabs>
    );
};

export default Report;