import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TeacherMonthlyReports from "../reports/TeacherMonthlyReports";
import StudentMonthlyReports from "../reports/StudentMonthlyReports";

const MonthlyReportsOfTeacherStudent = () => {
    return (
        <div>
            <Tabs defaultValue="monthlyTeacherReport" className="w-full">
        <TabsList className="ml-auto">
          <TabsTrigger value="monthlyTeacherReport">
            Teacher Monthly Report
          </TabsTrigger>
          <TabsTrigger value="monthlyStudentReport">
            Student Monthly Report
          </TabsTrigger>
        </TabsList>
        <TabsContent value="monthlyTeacherReport">
          <TeacherMonthlyReports />
        </TabsContent>
        <TabsContent value="monthlyStudentReport">
          <StudentMonthlyReports />
        </TabsContent>
      </Tabs>
        </div>
    );
};

export default MonthlyReportsOfTeacherStudent;