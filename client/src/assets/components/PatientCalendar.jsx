import PropTypes from "prop-types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CalendarCell = ({ day, status, star, selectedYear, selectedMonth, userId }) => {
  const navigate = useNavigate();

  const today = new Date();
  const cellDate = new Date(selectedYear, selectedMonth, day);
  const isFutureDate = cellDate > today;

  const handleClick = () => {
    if (!day || isFutureDate) return;
    const formattedDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    navigate(`/dashboard/eval-doctor/${userId}/${formattedDate}`);
  };

  const getTextColor = () => {
    if (isFutureDate) return "text-gray-300";
    if (status === "wait") return "text-blue-300";
    if (status === "notsent") return "text-red-500 font-bold";
    if (status === 1) return "text-[#F4AE46] font-bold";
    if (status === 0) return "text-green-500 font-bold";
    return "text-gray-600";
  };

  return (
    <div
      className={`flex justify-center items-center h-12 rounded-md cursor-pointer ${status && !isFutureDate ? "hover:bg-gray-100" : "cursor-not-allowed"
        }`}
      onClick={handleClick}
    >
      <div className="relative flex flex-col items-center justify-center min-h-[60px]">
        {star && (
          <span className="absolute top-2 text-yellow-500 text-sm">⭐</span>
        )}
        <span className={`text-lg mt-4 ${getTextColor()}`}>{day}</span>
      </div>
    </div>
  );
};

CalendarCell.propTypes = {
  day: PropTypes.number,
  status: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  star: PropTypes.bool,
  selectedYear: PropTypes.number.isRequired,
  selectedMonth: PropTypes.number.isRequired,
  userId: PropTypes.string.isRequired,
};

const PatientCalendar = ({ calendarData, userId }) => {
  console.log("Calendar Data:", calendarData);
  const weekdays = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const transformData = (calendarData, selectedYear, selectedMonth) => {
    const statusData = {};
    const starData = {};

    calendarData.forEach(({ created_at, feedback_status, feedback_date, star }) => {
      if (!created_at) return;

      const dateKey = created_at?.split("T")[0] || "unknown_date";

      statusData[dateKey] = feedback_status !== undefined ? feedback_status : "wait";

      if (feedback_date || star) {
        starData[dateKey] = true;
      }
    });


    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const dateKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;

      if (!(dateKey in statusData) && !(dateKey in starData)) {
        statusData[dateKey] = "notsent";
      }
    }

    return { statusData, starData };
  };
  const { statusData, starData } = transformData(calendarData, selectedDate.year, selectedDate.month);

  const handleDateChange = (type, value) => {
    setSelectedDate((prev) => ({ ...prev, [type]: Number(value) }));
  };

  const days = [];
  const firstDay = new Date(selectedDate.year, selectedDate.month, 1).getDay();

  for (let i = 0; i < firstDay; i++) days.push(null);

  for (let i = 1; i <= new Date(selectedDate.year, selectedDate.month + 1, 0).getDate(); i++) {
    const dateKey = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    const cellDate = new Date(selectedDate.year, selectedDate.month, i);
    const isFutureDate = cellDate > today;

    days.push({
      day: i,
      status: !isFutureDate ? statusData?.[dateKey] ?? null : null,
      star: !isFutureDate ? starData?.[dateKey] ?? false : false,
      isFutureDate,
    });
  }

  return (
    <div className="flex flex-col gap-4 p-8 bg-[#f2faffd2] w-[500px] rounded-xl shadow-2xl">
      <div className="flex justify-between px-4 mb-3">
        <select
          className="text-lg font-extrabold text-[#2B7AAC] bg-transparent border-none focus:outline-none"
          value={selectedDate.month}
          onChange={(e) => handleDateChange("month", e.target.value)}
        >
          {[
            "มกราคม",
            "กุมภาพันธ์",
            "มีนาคม",
            "เมษายน",
            "พฤษภาคม",
            "มิถุนายน",
            "กรกฎาคม",
            "สิงหาคม",
            "กันยายน",
            "ตุลาคม",
            "พฤศจิกายน",
            "ธันวาคม",
          ].map((month, index) => (
            <option key={index} value={index}>
              {month}
            </option>
          ))}
        </select>
        <select
          className="text-lg font-extrabold text-[#2B7AAC] bg-transparent border-none focus:outline-none"
          value={selectedDate.year}
          onChange={(e) => handleDateChange("year", e.target.value)}
        >
          {Array.from(
            { length: 10 },
            (_, i) => today.getFullYear() - 5 + i
          ).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-7 font-bold text-lg">
        {weekdays.map((day) => (
          <div key={day} className="h-10 p-2 text-center">
            <span className="text-lg font-extrabold text-[#2B7AAC]">{day}</span>
          </div>
        ))}
        <div className="col-span-7 mt-3 px-4">
          <hr className="w-full border-gray-300" />
        </div>

        {days.map((cell, index) => (
          <CalendarCell
            key={index}
            day={cell?.day}
            status={cell?.status}
            star={cell?.star}
            selectedYear={selectedDate.year}
            selectedMonth={selectedDate.month}
            userId={userId}
            isFutureDate={cell?.isFutureDate}
          />
        ))}
      </div>
      <div className="w-full grid grid-cols-2 gap-y-2 px-4 font-bold text-gray-600 text-sm mt-10">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <span className="text-[18px] text-yellow-500 font-bold">⭐</span>
          </div>
          <p>ได้รับดาว</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-blue-300"></div>
          <p>หมอยังไม่ประเมิน</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-[#1DD047]"></div>
          <p>ทำได้ดี</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <p>ผู้ป่วยไม่ได้ทำกายภาพ</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-[#ffa51d]"></div>
          <p>ควรปรับปรุง</p>
        </div>
      </div>
    </div>
  );
};

PatientCalendar.propTypes = {
  calendarData: PropTypes.array.isRequired,
  userId: PropTypes.string.isRequired,
};

export default PatientCalendar;
