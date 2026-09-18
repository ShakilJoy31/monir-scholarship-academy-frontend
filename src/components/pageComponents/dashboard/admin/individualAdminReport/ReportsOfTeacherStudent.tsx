import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IndividualTeacherDailyReport from "../reports/IndividualTeacherDailyReport";
import IndividualStudentDailyReport from "../reports/IndividualStudentDailyReport";

const ReportsOfTeacherStudent = () => {
  return (
    <div>
      <Tabs defaultValue="individualTeacherReport" className="w-full">
        <TabsList className="ml-auto">
          <TabsTrigger value="individualTeacherReport">
            Individual Teacher&apos;s Reports
          </TabsTrigger>
          <TabsTrigger value="individualStudentReport">
            Individual Student&apos;s Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="individualTeacherReport">
          <IndividualTeacherDailyReport />
        </TabsContent>
        <TabsContent value="individualStudentReport">
          <IndividualStudentDailyReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsOfTeacherStudent;
