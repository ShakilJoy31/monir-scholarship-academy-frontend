"use client"
import { useGetFilteredStudentsQuery, useMigrateStudentMutation } from "@/app/store/api/student/studentApi";
import { Button } from "@/components/ui/button";
import ReusableTable from "@/components/shared/reusable-component/ReusableTable";
import { useState, ChangeEvent } from "react";
import { Select, MenuItem, InputLabel, FormControl, Checkbox, Paper, Typography, CircularProgress } from "@mui/material";
import { useGetAllClassQuery } from "@/app/store/api/classes/classApi";
import { useGetAllSessionsQuery } from "@/app/store/api/classes/sessionApi";
import { useGetAllSectionsQuery } from "@/app/store/api/classes/sectionApi";
import { useGetAllStreamsQuery } from "@/app/store/api/classes/streamApi";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toastShowing } from "@/components/shared/reusable-component/toastShowing";
import SubmitButton from "@/components/shared/reusable-component/SubmitButton";
import { theStar } from "@/lib/requiredJSX";
import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";

interface Student {
  id: number;
  branchId: number;
  type: string;
  migrateStudentId: number | null;
  sessionYearId: number;
  name: string;
  studentUniqueId: string;
  phone: string;
  email: string;
  password: string;
  classNameId: number;
  classRoll: number;
  sectionNameId: number;
  streamNameId: number;
  discountType: string;
  discount: number;
  hostelFeeDiscountType: string;
  hostelDiscount: number;
  studentClassFeeDiscountId: number | null;
  gender: string;
  religion: string;
  dob: string;
  bloodGroup: string;
  address: string;
  fatherName: string;
  motherName: string;
  parentPhone: string;
  count: number;
  blockDate: string | null;
  active: boolean;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  class: {
    id: number;
    branchId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  section: {
    id: number;
    branchId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  session: {
    id: number;
    branchId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  stream: {
    id: number;
    branchId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  [key: string]: unknown;
}

interface ClassItem {
  id: number;
  name: string;
}

interface Session {
  id: number;
  name: string;
}

interface Section {
  id: number;
  name: string;
}

interface Stream {
  id: number;
  name: string;
}

interface ApiResponse<T> {
  data?: T[];
}

interface Column<T> {
  key: keyof T | string;
  header: string | React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

const StudentMigration = () => {
  const [tempFilters, setTempFilters] = useState({
    sessionYear: "",
    section: "",
    className: "",
    stream: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    sessionYear: "",
    section: "",
    className: "",
    stream: "",
  });

  const [selectedStudent,] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const { data: classes } = useGetAllClassQuery({});
  const { data: sessions } = useGetAllSessionsQuery({});
  const { data: sections } = useGetAllSectionsQuery({});
  const { data: streams } = useGetAllStreamsQuery({});

  const {
    data: filteredStudents,
    isLoading,
    error,
  } = useGetFilteredStudentsQuery({
    sessionYear: appliedFilters.sessionYear,
    section: appliedFilters.section,
    className: appliedFilters.className,
    stream: appliedFilters.stream,
  });

  // Fetching branch name, email, address and logo. 
  const userInfo = getUserInfoFromToken();
  const { data: branchConfigData } = useGetBranchConfigQuery(userInfo?.branchId)

  const branchInfo = branchConfigData?.data;

  const handleFilterChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    setAppliedFilters(tempFilters);
    setSelectedRows([]);
  };

  const toggleRowSelection = (studentId: number) => {
    setSelectedRows(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    if (filteredStudents?.data) {
      if (event.target.checked) {
        const allIds = filteredStudents.data.map((student: { id: number; }) => student.id);
        setSelectedRows(allIds);
      } else {
        setSelectedRows([]);
      }
    }
  };

  const handleSelectAllClick = () => {
    if (filteredStudents?.data) {
      if (selectedRows.length === filteredStudents.data.length) {
        setSelectedRows([]);
      } else {
        const allIds = filteredStudents.data.map((student: { id: number; }) => student.id);
        setSelectedRows(allIds);
      }
    }
  };

  const [migrationFilters, setMigrationFilters] = useState({
    newSessionYear: "",
    newSection: "",
    newClassName: "",
    newStream: "",
  });

  const handleMigrationFilterChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setMigrationFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const [migrateStudent] = useMigrateStudentMutation();

  const handleMigrationSubmit = async () => {
    if (selectedRows.length === 0) {
      toastShowing(
        "Please select at least one student",
        "bottom-right",
        2000,
        "red",
        "white"
      );
      return;
    }

    if (
      !migrationFilters.newSessionYear &&
      !migrationFilters.newClassName &&
      !migrationFilters.newSection &&
      !migrationFilters.newStream
    ) {
      toastShowing(
        "Please select at least one migration field",
        "bottom-right",
        2000,
        "red",
        "white"
      );
      return;
    }

    const migrationData = {
      students: selectedRows.map((studentId) => {
        const student = filteredStudents?.data?.find(
          (s: { id: number }) => s.id === studentId
        );

        // Find IDs for the selected migration fields
        const newSessionYearId = migrationFilters.newSessionYear
          ? (sessions as ApiResponse<Session>)?.data?.find(s => s.name === migrationFilters.newSessionYear)?.id
          : student?.sessionYearId;

        const newClassNameId = migrationFilters.newClassName
          ? (classes as ApiResponse<ClassItem>)?.data?.find(c => c.name === migrationFilters.newClassName)?.id
          : student?.classNameId;

        const newSectionNameId = migrationFilters.newSection
          ? (sections as ApiResponse<Section>)?.data?.find(sec => sec.name === migrationFilters.newSection)?.id
          : student?.sectionNameId;

        const newStreamNameId = migrationFilters.newStream
          ? (streams as ApiResponse<Stream>)?.data?.find(str => str.name === migrationFilters.newStream)?.id
          : student?.streamNameId;

        return {
          studentId,
          sessionYearId: newSessionYearId ? newSessionYearId : student?.sessionYearId,
          classNameId: newClassNameId ? newClassNameId : student?.classNameId,
          sectionNameId: newSectionNameId ? newSectionNameId : student?.sectionNameId,
          streamNameId: newStreamNameId ? newStreamNameId : student?.streamNameId,
          newRoll: student?.classRoll || 0,
        };
      }),
    };

    try {
      await migrateStudent(migrationData).unwrap();

      toastShowing(
        `Successfully migrated ${selectedRows.length} students`,
        "bottom-right",
        2000,
        "green",
        "white"
      );

      setSelectedRows([]);
      setMigrationFilters({
        newSessionYear: "",
        newSection: "",
        newClassName: "",
        newStream: "",
      });

      setAppliedFilters({ ...appliedFilters });

    } catch (error: unknown) {
      console.error("Migration error:", error);

      const errorMessage = (() => {
        if (error instanceof Error) {
          return error.message;
        }
        if (typeof error === "object" && error !== null && "data" in error) {
          const errorData = error as { data?: { message?: string } };
          return errorData.data?.message;
        }
        return "Failed to migrate students";
      })();

      toastShowing(
        errorMessage || "Failed to migrate students",
        "bottom-right",
        2000,
        "red",
        "white"
      );
    }
  };

  const columns: Column<Student>[] = [
    {
      key: "select",
      header: (
        <div className="flex items-center">
          <Checkbox
            checked={
              filteredStudents?.data &&
              filteredStudents.data.length > 0 &&
              selectedRows.length === filteredStudents.data.length
            }
            indeterminate={
              selectedRows.length > 0 &&
              filteredStudents?.data &&
              selectedRows.length < filteredStudents.data.length
            }
            onChange={toggleSelectAll}
          />
        </div>
      ),
      render: (row: Student) => (
        <Checkbox
          checked={selectedRows.includes(row.id)}
          onChange={() => toggleRowSelection(row.id)}
        />
      ),
    },
    {
      key: "studentUniqueId",
      header: "Student ID",
    },
    {
      key: "name",
      header: "Name",
    },
    {
      key: "class",
      header: "Class",
      render: (row: Student) => row.class?.name || "N/A"
    },
    {
      key: "section",
      header: "Section",
      render: (row: Student) => row.section?.name || "N/A"
    },
    {
      key: "stream",
      header: "Stream",
      render: (row: Student) => row.stream?.name || "N/A"
    },
    {
      key: "session",
      header: "Session Year",
      render: (row: Student) => row.session?.name || "N/A"
    },
  ];

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between py-4">
        <h2 className="text-xl font-semibold my-2">Migration List</h2>
        <div>
          <Button variant={"outline"}>Export All</Button>
          {selectedRows.length > 0 && (
            <>
              <Button variant={"outline"} className="ml-2">
                Export Selected ({selectedRows.length})
              </Button>
            </>
          )}
          {filteredStudents?.data && filteredStudents.data.length > 0 && (
            <>
              <Button
                variant={"outline"}
                className="ml-2"
                onClick={handleSelectAllClick}
              >
                {selectedRows.length === filteredStudents.data.length ?
                  "Deselect All" : "Select All"}
              </Button>
            </>
          )}
        </div>
      </div>

      <Paper sx={{ p: 3, mb: 3 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormControl fullWidth size="small">
            <InputLabel>Session Year {theStar}</InputLabel>
            <Select
              name="sessionYear"
              value={tempFilters.sessionYear}
              onChange={handleFilterChange}
              label="Session Year"
              sx={{
                height: 45,
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                },
              }}
            >
              <MenuItem value="">All Sessions</MenuItem>
              {(sessions as ApiResponse<Session>)?.data?.map((session) => (
                <MenuItem key={session.id} value={session.name}>
                  {session.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Class {theStar}</InputLabel>
            <Select
              name="className"
              value={tempFilters.className}
              onChange={handleFilterChange}
              label="Class"
              sx={{
                height: 45,
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                },
              }}
            >
              <MenuItem value="">All Classes</MenuItem>
              {(classes as ApiResponse<ClassItem>)?.data?.map((classItem) => (
                <MenuItem key={classItem.id} value={classItem.name}>
                  {classItem.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Section {theStar}</InputLabel>
            <Select
              name="section"
              value={tempFilters.section}
              onChange={handleFilterChange}
              label="Section"
              sx={{
                height: 45,
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                },
              }}
            >
              <MenuItem value="">All Sections</MenuItem>
              {(sections as ApiResponse<Section>)?.data?.map((section) => (
                <MenuItem key={section.id} value={section.name}>
                  {section.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Group {theStar}</InputLabel>
            <Select
              name="stream"
              value={tempFilters.stream}
              onChange={handleFilterChange}
              label="Stream"
              sx={{
                height: 45,
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                },
              }}
            >
              <MenuItem value="">All Streams</MenuItem>
              {(streams as ApiResponse<Stream>)?.data?.map((stream) => (
                <MenuItem key={stream.id} value={stream.name}>
                  {stream.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="flex justify-end mt-4">
          <SubmitButton
            onClick={handleSearch}>Search</SubmitButton>
        </div>
      </Paper>

      {isLoading && <p className="p-4 flex justify-center"><CircularProgress /></p>}
      {error && <p className="p-4 text-red-500"></p>}

      <Paper sx={{ p: 2 }}>
        {filteredStudents?.data?.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            No students found matching your filters.
          </Typography>
        ) : (
          <>
            {filteredStudents?.data && filteredStudents.data.length > 0 && (
              <div className="flex justify-between items-center mb-2">
                <Typography variant="body2">
                  Showing {filteredStudents.data.length} students
                </Typography>
                {selectedRows.length > 0 && (
                  <Typography variant="body2">
                    {selectedRows.length} selected
                  </Typography>
                )}
              </div>
            )}
            {filteredStudents?.data && filteredStudents.data.length > 0 && (
              <ReusableTable<Student>
                columns={columns}
                data={filteredStudents?.data || []}
              />
            )}

          </>
        )}
      </Paper>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[1000px] w-full max-h-[80vh] bg-white border-[10px] border-yellow-600 p-6 overflow-y-auto">
          {selectedStudent && (
            <div className="w-full text-black text-[14px] leading-relaxed font-serif relative border-4 border-[#a95c00] p-4 m-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">Student ID:</span> {selectedStudent?.id || "N/A"}
                </div>
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-[#5b00a9] uppercase leading-snug">
                    {/* SCOPUS INTERNATIONAL <br /> SCHOOL AND COLLEGE */}
                    {branchInfo?.schoolName}
                  </h2>
                  <hr className="border-blue-500" />
                  <p className="text-sm mt-1 text-end">
                    <span className="font-semibold">Address:</span> {selectedStudent?.address || "N/A"}
                  </p>
                  <p className="text-sm mt-1 text-end">
                    <span className="font-semibold">Email:</span> {selectedStudent?.email}
                  </p>
                </div>
              </div>
              <h1 className="text-center text-2xl font-bold text-red-700 underline mb-4">
                TRANSFER CERTIFICATE
              </h1>

              <div className="text-sm leading-relaxed px-2">
                <p className="mb-4">
                  This is to certify that {selectedStudent.gender === 'Male' ? 'he' : 'she'}:
                  <span className="font-bold underline"> {selectedStudent.name} </span>
                  son/daughter of <span className="font-bold underline">{selectedStudent.fatherName}</span> and
                  <span className="font-bold underline"> {selectedStudent.motherName}</span>,
                  was a student of this institute.
                </p>

                <p className="mb-4">
                  {selectedStudent.gender === 'Male' ? 'He' : 'She'} was in
                  <span className="font-bold underline"> {selectedStudent.class?.name || 'N/A'} </span> class,
                  <span className="font-bold underline"> {selectedStudent.section?.name || 'N/A'} </span> section,
                  <span className="font-bold underline"> {selectedStudent.stream?.name || 'N/A'} </span> stream.
                  In the session <span className="font-bold underline">{selectedStudent.session?.name || 'N/A'}</span>.
                </p>

                <p className="mb-4">
                  {selectedStudent.gender === 'Male' ? 'He' : 'She'} is a Bangladeshi by birth. To the best of my knowledge,
                  {selectedStudent.gender === 'Male' ? 'he' : 'she'} did not take part in any subversive activity
                  against the discipline of the state. {selectedStudent.gender === 'Male' ? 'He' : 'She'} has a good moral character.
                  I wish {selectedStudent.gender === 'Male' ? 'him' : 'her'} every success in life.
                </p>
              </div>

              <div className="flex justify-between mt-8 text-center text-sm">
                <div className="w-1/2">
                  <div className="border-t border-black mx-auto w-32 pt-1">Office Assistant</div>
                  <p className="mt-2">Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>

                <div className="w-1/2">
                  <div className="border-t border-black mx-auto w-32 pt-1">Head Master</div>
                  <p className="mt-2">{branchInfo?.schoolName}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {filteredStudents?.data?.length > 0 && (
        <>
          <div className="mt-10">
            <h2 className="text-xl font-semibold my-2">Migration to</h2>
          </div>

          {selectedRows.length > 0 && (
            <div className="mb-4 p-3 bg-blue-100 rounded">
              <p>
                <strong>{selectedRows.length} student(s) selected</strong> for migration to:
                {migrationFilters.newSessionYear && ` Session: ${migrationFilters.newSessionYear},`}
                {migrationFilters.newClassName && ` Class: ${migrationFilters.newClassName},`}
                {migrationFilters.newSection && ` Section: ${migrationFilters.newSection},`}
                {migrationFilters.newStream && ` Stream: ${migrationFilters.newStream}`}
              </p>
            </div>
          )}

          <Paper sx={{ p: 3, mb: 3 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormControl fullWidth size="small">
                <InputLabel>Session Year</InputLabel>
                <Select
                  name="newSessionYear"
                  value={migrationFilters.newSessionYear}
                  onChange={handleMigrationFilterChange}
                  label="Session Year"
                >
                  <MenuItem value="">Select Session</MenuItem>
                  {(sessions as ApiResponse<Session>)?.data?.map((session) => (
                    <MenuItem key={session.id} value={session.name}>
                      {session.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Class</InputLabel>
                <Select
                  name="newClassName"
                  value={migrationFilters.newClassName}
                  onChange={handleMigrationFilterChange}
                  label="Class"
                >
                  <MenuItem value="">Select Class</MenuItem>
                  {(classes as ApiResponse<ClassItem>)?.data?.map((classItem) => (
                    <MenuItem key={classItem.id} value={classItem.name}>
                      {classItem.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Section</InputLabel>
                <Select
                  name="newSection"
                  value={migrationFilters.newSection}
                  onChange={handleMigrationFilterChange}
                  label="Section"
                >
                  <MenuItem value="">Select Section</MenuItem>
                  {(sections as ApiResponse<Section>)?.data?.map((section) => (
                    <MenuItem key={section.id} value={section.name}>
                      {section.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Stream</InputLabel>
                <Select
                  name="newStream"
                  value={migrationFilters.newStream}
                  onChange={handleMigrationFilterChange}
                  label="Stream"
                >
                  <MenuItem value="">Select Stream</MenuItem>
                  {(streams as ApiResponse<Stream>)?.data?.map((stream) => (
                    <MenuItem key={stream.id} value={stream.name}>
                      {stream.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="flex justify-end mt-4">
              <SubmitButton
                onClick={handleMigrationSubmit}
              >
                Submit Migration
              </SubmitButton>
            </div>
          </Paper>
        </>
      )}
    </div>
  );
};

export default StudentMigration;