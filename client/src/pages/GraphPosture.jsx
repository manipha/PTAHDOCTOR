import React from "react";
import Wrapper from "../assets/wrappers/DashboardFormPage";
import { PatientCard } from "../assets/components/PatientCard";
import { FcPrevious } from "react-icons/fc";

const Bar = ({ value, maxValue, color, date, count, day }) => {
  const heightPercentage = (value / maxValue) * 100;

  return (
    <div className="flex flex-col space-y-4 justify-end items-center flex-grow">
      <span className="font-thin text-gray-500 text-sm">{count}</span>
      <div
        className={`w-full ${color}`}
        style={{ height: `${heightPercentage}%` }}
      ></div>
      <div className="flex flex-col space-y-2 font-semibold justify-center items-center">
        <span>{date}</span>
        <span>{day}</span>
      </div>
    </div>
  );
};

const BarChart = () => {
  const data = [
    { value: 3.5, count: "1/2", date: "9", day: "มิ.ย." },
    { value: 7, count: "2/2", date: "10", day: "มิ.ย." },
    { value: 3.5, count: "1/2", date: "11", day: "มิ.ย." },
    { value: 3.5, count: "1/2", date: "12", day: "มิ.ย." },
    { value: 7, count: "2/2", date: "13", day: "มิ.ย." },
    { value: 3.5, count: "1/2", date: "14", day: "มิ.ย." },
    { value: 7, count: "2/2", date: "15", day: "มิ.ย." },
    { value: 7, count: "2/2", date: "16", day: "มิ.ย." },
  ];

  return (
    <div className="border-l-2 border-r-2 border-b-2 rounded-b-xl shadow-xl w-full h-[32rem] flex p-12 space-x-8 relative">
      <div className="p-2 w-full flex absolute top-0 left-6 space-x-4">
        <div className="flex items-center space-x-2">
          <div className="rounded-full h-4 w-4 bg-[#9CEAB0]"></div>
          <span>ทำครบ</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="rounded-full h-4 w-4 bg-[#FD9DA0]"></div>
          <span>ทำไม่ครบ</span>
        </div>
      </div>
      {data.map((item, index) => (
        <Bar
          key={index}
          value={item.value}
          maxValue={9}
          color={item.count === "2/2" ? "bg-[#9CEAB0]" : "bg-[#FD9DA0]"}
          count={item.count}
          date={item.date}
          day={item.day}
        />
      ))}
    </div>
  );
};

const DateSelector = ({ label, options, width }) => (
  <div className="flex flex-col items-center justify-center space-y-3">
    <span>{label}</span>
    <select
      className={`bg-[#cceaff] text-sm font-semibold p-2 rounded-lg shadow-xl ${width}`}
    >
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const GraphPosture = () => {
  const dateOptions = [
    { value: "", label: "7 วัน" },
    { value: "", label: "14 วัน" },
    { value: "", label: "21 วัน" },
    { value: "", label: "1 เดือน" },
  ];
  const monthOptions = [
    { value: "", label: "มกราคม" },
    { value: "", label: "กุมภาพันธ์" },
    { value: "", label: "มีนาคม" },
    { value: "", label: "เมษายน" },
    { value: "", label: "พฤษภาคม" },
    { value: "", label: "มิถุนายน" },
    { value: "", label: "กรกฎาคม" },
    { value: "", label: "สิงหาคม" },
    { value: "", label: "กันยายน" },
    { value: "", label: "ตุลาคม" },
    { value: "", label: "พฤศจิกายน" },
    { value: "", label: "ธันวาคม" },
  ];
  const yearOptions = [];

  for (let year = 2550; year <= 2567; year++) {
    yearOptions.push({ value: "", label: String(year) });
  }

  return (
    <Wrapper>
      <div className="flex flex-col w-full h-full space-y-12 form">
        <FcPrevious className="text-5xl" />
        <PatientCard />
        <div className="w-full flex flex-col space-y-4 justify-center items-center">
          <span className="text-xl text-gray-900 font-light">
            ผลกายภาพบำบัด
          </span>
          <span className="font-thin text-gray-500">
            ประจำวันที่ 9 มิถุนายน - 16 มิถุนายน 2567
          </span>
          <div className="w-full flex justify-center p-4 space-x-8">
            <DateSelector
              label="ช่วงวันที่เลือก"
              options={dateOptions}
              width="w-30"
            />
          </div>
        </div>
        <BarChart />
      </div>
    </Wrapper>
  );
};

export default GraphPosture;
