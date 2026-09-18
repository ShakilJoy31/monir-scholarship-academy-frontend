import dayjs from "dayjs";

export const getMonthRange = (selectedMonth) => {
    const firstDate = dayjs(selectedMonth).startOf("month");
    const lastDate = dayjs(selectedMonth).endOf("month");
    return { firstDate, lastDate };
};