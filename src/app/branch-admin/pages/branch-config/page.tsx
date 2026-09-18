"use client";
import { useGetBranchConfigQuery } from "@/app/store/api/branch/branchApi";
import { getUserInfoFromToken } from "@/app/utils/helper/tokenHelper";
import BranchConfigModal from "@/components/pageComponents/dashboard/admin/branchConfig/BranchConfigModal";
import { AnimatePresence } from "framer-motion";
import { Edit2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function SchoolConfigDisplay() {
    // states ************************************************
    const [openModal, setOpenModal] = useState(false);
    const [currentSection, setCurrentSection] = useState<
        | "logo"
        | "iDCard"
        | "schoolInfo"
        | "principalInfo"
        | "vicePrincipalInfo"
        | "socialAndContact"
        | null
    >(null);

    // Redux hooks calls ************************************
    const userInfo = getUserInfoFromToken();
    const {
        data: configData,
        isLoading,
        isError,
        error,
    } = useGetBranchConfigQuery(userInfo?.branchId);

    // handlers **********************************************
    const handleEditClick = (sectionType: typeof currentSection) => {
        setCurrentSection(sectionType);
        setOpenModal(true);
    };

    // reusable UI components *******************************
    const Section = ({
        title,
        sectionType,
        children,
    }: {
        title: string;
        sectionType:
        | "logo"
        | "iDCard"
        | "schoolInfo"
        | "principalInfo"
        | "vicePrincipalInfo"
        | "socialAndContact";
        children: React.ReactNode;
    }) => (
        <div className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 rounded-2xl p-5 mb-6">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <button
                    onClick={() => handleEditClick(sectionType)}
                    className="text-[#035140] hover:text-[#023b2f] transition"
                >
                    <Edit2 className="w-5 h-5" />
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {children}
            </div>
        </div>
    );

    const InfoItem = ({
        label,
        value,
        multiline = false,
    }: {
        label: string;
        value?: string | null;
        multiline?: boolean;
    }) => (
        <div className="flex flex-col bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
            <span className="text-sm text-gray-500 mb-1">{label}</span>
            {multiline ? (
                <textarea
                    readOnly
                    value={value || ""}
                    rows={3}
                    className="text-gray-800 font-medium bg-transparent resize-none outline-none border-none w-full"
                    placeholder="—"
                />
            ) : (
                <span className="font-medium text-gray-800 break-all">
                    {value || "—"}
                </span>
            )}
        </div>
    );

    const ImageItem = ({ label, src }: { label: string; src?: string | null }) => (
        <div className="flex flex-col items-start bg-gray-50 rounded-lg p-3">
            <span className="text-sm text-gray-500 mb-2">{label}</span>
            {src ? (
                <Image
                    width={120}
                    height={80}
                    src={src}
                    alt={label}
                    className="rounded-md object-cover border w-[120px] h-[80px]"
                />
            ) : (
                <span className="text-gray-400 italic">No image</span>
            )}
        </div>
    );

    // Conditional rendering **********************************
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#035140]" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-red-600 font-medium mb-2">Failed to load data 😕</p>
                <p className="text-gray-500 text-sm">
                    {(error as {
                        data?: {
                            message?: string;
                        }
                    }
                    )?.data?.message || "Something went wrong."}
                </p>
            </div>
        );
    }

    // Always render UI — even if no data
    const data = configData?.data || {};

    // Main Render ********************************************
    return (
        <>
            <div className="mx-auto p-6 min-h-screen rounded-xl">
                <h2 className="text-2xl font-bold text-[#035140] my-6">
                    🏫 School Configuration Overview
                </h2>

                {/* Logo Section */}
                <Section title="🎨 Logo Section" sectionType={"logo"}>
                    <ImageItem label="Logo" src={data?.logo} />
                    <ImageItem label="Footer Logo" src={data?.footerLogo} />
                </Section>

                {/* ID Card Section */}
                <Section title="🪪 ID Card Section" sectionType={"iDCard"}>
                    <ImageItem
                        label="ID Card Background"
                        src={data?.idCardBackground}
                    />
                    <ImageItem
                        label="ID Card Back Side"
                        src={data?.idCardBackSide}
                    />
                </Section>

                {/* School Information */}
                <Section title="🏫 School Information" sectionType={"schoolInfo"}>
                    <InfoItem label="School Name" value={data?.schoolName} />
                    <InfoItem label="Email" value={data?.schoolEmail} />
                    <InfoItem label="Address" value={data?.schoolAddress} />
                    <InfoItem label="Phone" value={data?.schoolPhone} />
                    <InfoItem label="Mobile" value={data?.schoolMobile} />
                    <InfoItem label="EIIN Number" value={data?.eiinNumber} />
                </Section>

                {/* Principal Information */}
                <Section title="👨‍🏫 Principal Information" sectionType={"principalInfo"}>
                    <InfoItem label="Principal Name" value={data?.principalName} />
                    <ImageItem
                        label="Principal Image"
                        src={data?.principalImage}
                    />
                    <ImageItem
                        label="Principal Signature"
                        src={data?.principalSignature}
                    />
                    <InfoItem
                        label="Principal Voice"
                        value={data?.principalVoice}
                        multiline={true}
                    />
                </Section>

                {/* Vice Principal Information */}
                <Section
                    title="👩‍🏫 Vice Principal Information"
                    sectionType={"vicePrincipalInfo"}
                >
                    <InfoItem
                        label="Vice Principal Name"
                        value={data?.vicePrincipalName}
                    />
                    <ImageItem
                        label="Vice Principal Image"
                        src={data?.vicePrincipalImage}
                    />
                    <ImageItem
                        label="Vice Principal Signature"
                        src={data?.vicePrincipalSignature}
                    />
                    <InfoItem
                        label="Vice Principal Voice"
                        value={data?.vicePrincipalVoice}
                        multiline={true}
                    />
                </Section>

                {/* Social & Contact Info */}
                <Section title="🌐 Social & Contact" sectionType={"socialAndContact"}>
                    <InfoItem label="Facebook" value={data?.facebook} />
                    <InfoItem label="Instagram" value={data?.instagram} />
                    <InfoItem label="Twitter" value={data?.twitter} />
                    <InfoItem label="WhatsApp" value={data?.whatsapp} />
                    <InfoItem label="LinkedIn" value={data?.linkedin} />
                    <InfoItem label="Location Map" value={data?.locationMap} multiline={true} />
                </Section>
            </div>

            <AnimatePresence>
                <BranchConfigModal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    sectionType={currentSection}
                    configData={data}
                />
            </AnimatePresence>
        </>
    );
}
