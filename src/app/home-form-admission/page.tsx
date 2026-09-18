"use client"
import { PrintAdmissionForm } from "@/components/pageComponents/dashboard/admin/admission/PrintAdmissionForm";
import { Input } from "@mui/material";
import Footer from "@/components/pageComponents/publicComponent/footer/page";
import PublicNavigation from "@/components/pageComponents/publicComponent/publicNavigation/page";
import CancelButton from "@/components/shared/reusable-component/CancelButton";
import { useRouter } from "next/navigation";

const HomeFormAdmission = () => {

  const router = useRouter();

  return (
    <>
      <div className="bg-[#035140]">
        <PublicNavigation />
      </div>

      <div className="px-6 lg:px-24 py-5">
        <div className="mb-5 flex justify-between items-center">

          <CancelButton
            onClick={() => router.push('/home-online-admission')}
          >
            Back
          </CancelButton>


          <div className="flex gap-3">
            <PrintAdmissionForm />
          </div>
        </div>

        <div className="border border-gray-300 max-w-3xl mx-auto p-6 bg-white shadow-md">
          <div className="text-center mb-4">
            <h1 className="text-sm md:text-2xl font-bold text-gray-700">
              COMPLEX ACADEMY
            </h1>
            <p className="text-xs -mt-1">Another way to Education</p>
            <h2 className="text-base font-bold mt-2">
              EDUCATIONAL & IT TRAINING ACADEMY
            </h2>
            <h3 className="text-base font-semibold underline mt-1">
              ADMISSION FORM
            </h3>
          </div>

          <form className="space-y-4 text-sm text-gray-700">
            {/* Student Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label>Student&apos;s Name:</label>
                <Input type="text" />
              </div>
              <div>
                <label>Father&apos;s Name:</label>
                <Input type="text" />
              </div>
              <div>
                <label>Mother&apos;s Name:</label>
                <Input type="text" />
              </div>
              <div>
                <label>Birth Date:</label>
                <Input />
              </div>
            </div>

            {/* Academic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label>Session:</label>
                <Input type="text" />
              </div>
              <div>
                <label>Section:</label>
                <Input type="text" />
              </div>
              <div>
                <label>Class:</label>
                <Input type="text" />
              </div>
              <div>
                <label>Group:</label>
                <Input type="text" />
              </div>
            </div>

            {/* Gender */}
            <div className="flex items-center gap-5">
              <label>Gender:</label>
              <div className="flex items-center gap-4 mt-1">
                <label className="flex items-center gap-1">
                  <input type="checkbox" name="gender" value="male" />
                  Male
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" name="gender" value="female" />
                  Female
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" name="gender" value="female" />
                  Christian
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" name="gender" value="female" />
                  Other
                </label>
              </div>
            </div>

            {/* Present Address */}
            <div>
              <h4 className="font-semibold underline">Present Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label>Division:</label>
                  <Input type="text" />
                </div>
                <div>
                  <label>District:</label>
                  <Input type="text" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="mt-2">
                  <label>Address:</label>
                  <Input type="text" />
                </div>
                <div className="mt-2">
                  <label>Previous School:</label>
                  <Input type="text" />
                </div>
              </div>
            </div>

            {/* Permanent Address */}
            <div>
              <h4 className="font-semibold underline">Permanent Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label>Division:</label>
                  <Input type="text" />
                </div>
                <div>
                  <label>District:</label>
                  <Input type="text" />
                </div>
              </div>
              <div className="mt-2">
                <label>Address:</label>
                <textarea rows={2} />
              </div>
            </div>

            {/* Other Details */}
            <h4 className="font-semibold underline mt-2">Other Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label>Religion:</label>
                <Input type="text" />
              </div>
              <div>
                <label>Nationality:</label>
                <Input type="text" />
              </div>
              <div>
                <label>Phone Number:</label>
                <Input type="text" />
              </div>
              <div>
                <label>Blood Group:</label>
                <Input type="text" />
              </div>
              <div>
                <label>NID Number:</label>
                <Input type="text" />
              </div>
              <div>
                <label>Email Address:</label>
                <Input type="email" />
              </div>
              <div>
                <label>Occupation:</label>
                <Input type="text" />
              </div>
              <div className="flex items-center gap-3">
                <label>Status:</label>
                <div className="flex items-center gap-4 mt-1">
                  <label className="flex items-center gap-1">
                    <input type="checkbox" name="status" value="single" />
                    Single
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" name="status" value="married" />
                    Married
                  </label>
                </div>
              </div>
            </div>

            {/* Declaration */}
            <div className="mt-4 text-sm">
              <h4 className="font-semibold underline mb-1">DECLARATION</h4>
              <p>
                I hereby, declaring that I will obey all the rules and regulations
                of the institution and be fully responsible for violating the
                rules.
              </p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 mt-6 text-center text-sm">
              <div>
                <p className="border-t border-black inline-block px-4 pt-1">
                  Student&apos;s Signature
                </p>
              </div>
              <div>
                <p className="border-t border-black inline-block px-4 pt-1">
                  Authorised Signature
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HomeFormAdmission;