"use client"
import { useGetAllNoticesQuery } from "@/app/store/api/classes/noticeApi";
import Marquee from "react-fast-marquee";

interface Notice {
  id: number;
  branchId: number;
  noticeType: string;
  titleEnglish: string | null;
  titleBangla: string | null;
  pdfLink: string;
  createdAt: string;
  updatedAt: string;
}

interface NoticeResponse {
  success: boolean;
  statusCode: number;
  message: string;
  meta: {
    page: number;
    size: number;
    total: number;
    totalPage: number;
  };
  data: Notice[];
}

const NoticeMarquee = () => {
  const { data: noticeData } = useGetAllNoticesQuery({}) as { data: NoticeResponse };
  
  // Check if there are any notices to display
  const hasNotices = noticeData?.data && noticeData.data.length > 0;

  return (
    <>
      {hasNotices && (
        <div className="bg-blue-100 py-1 px-4">
          <Marquee 
            speed={40}
            gradient={false}
            className="text-[#003429] font-medium text-sm md:text-base"
          >
            {noticeData.data.map((notice) => (
              <span key={notice.id} className="mx-4">
                {notice.titleEnglish || notice.titleBangla || 'Untitled Notice'}
              </span>
            ))}
          </Marquee>
        </div>
      )}
    </>
  );
};

export default NoticeMarquee;