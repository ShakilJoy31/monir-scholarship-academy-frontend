import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TeacherDailyReports from "../reports/TeacherDailyReports";
import StudentDailyReports from "../reports/StudentDailyReports";

const DailyReportsOfTeacherStudent = () => {
  return (
    <div>
      <Tabs defaultValue="dailyTeacherReport" className="w-full">
        <TabsList className="ml-auto">
          <TabsTrigger value="dailyTeacherReport">
            Teacher Daily Report
          </TabsTrigger>
          <TabsTrigger value="dailyStudentReport">
            Student Daily Report
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dailyTeacherReport">
          <TeacherDailyReports />
        </TabsContent>
        <TabsContent value="dailyStudentReport">
          <StudentDailyReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DailyReportsOfTeacherStudent;
