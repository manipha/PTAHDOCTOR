import { FaSuitcaseRolling, FaCalendarCheck } from "react-icons/fa";
import { GiHeartPlus } from "react-icons/gi";
import { IoPeople } from "react-icons/io5";
import Wrapper from "../wrappers/StatsContainer";
import StatItem from "./StatItem";
import styled from "styled-components";
import PieChartComponent from "../../pages/PieChartComponent";
import ThaiDatePicker from "../../pages/ThaiDatePicker";
import React, { useState } from "react";
import { useDashboardContext } from "../../pages/DashboardLayout";

const StatsHeader = styled.h2`
  text-align: center;
  margin-top: 0;
  margin-bottom: 50px;
  color: #6b6b6b;
  font-size: 18px;
`;

const StatsSubject = styled.h4`
  font-weight: 800;
  text-align: left;
  margin-top: 0;
  margin-bottom: 30px;
  color: #535353;
  font-size: 20px;
  border-bottom: 3px solid #87cefa;
  width: 250px;
  padding-bottom: 10px;
`;

const StatsContainer = ({ defaultStats }) => {
  const { user } = useDashboardContext(); 
  const [date, setDate] = useState(new Date());

  const stats = [
    {
      title: "ยังไม่ทำกายภาพ",
      count: `${defaultStats?.ผู้ป่วยที่ยังไม่ทำกายภาพบำบัด || 0} คน`,
      icon: <GiHeartPlus />,
      color: "#f8ba51",
      bcg: "#fcefc7",
    },
    {
      title: "ทำกายภาพแล้ว",
      count: `${defaultStats?.ผู้ป่วยที่ทำกายภาพบำบัด || 0} คน`,
      icon: <FaCalendarCheck />,
      color: "#72DA95",
      bcg: "#b6ffce91",
    },
    {
      title: "ผู้ป่วยทั้งหมด",
      count: `${defaultStats?.ผู้ป่วยทั้งหมด || 0} คน`,
      icon: <IoPeople />,
      color: "#87CEFA",
      bcg: "#87cefa44",
    },
  ];

  return (
    <>
      <StatsHeader>
        {user
          ? `${user.nametitle} ${user.name} ${user.surname}`
          : "ไม่มีข้อมูลผู้ใช้"}
      </StatsHeader>
      <StatsSubject>จำนวนผู้ป่วยทั้งหมด</StatsSubject>
      <Wrapper>
        {stats.map((item) => {
          return <StatItem key={item.title} {...item} />;
        })}
      </Wrapper>
      <div className="mt-12"></div>
      {/* <StatsSubject>ประเมินผู้ป่วย</StatsSubject> */}
      {/* <div className="mb-20 p-8 flex shadow-2xl rounded-2xl justify-center sm:justify-center w-full max-w-screen-lg mx-auto">
          <div className="flex flex-col space-y-4">
            <p>เลือกวันที่</p>
            <ThaiDatePicker
              selectedDate={date}
              setSelectedDate={setDate}
              bgColor="#87CEFA"
              textColor="white"
              iconColor="white"
            />
          </div>
          <div style={{ width: "520px", height: "520px" }} className="">
            <PieChartComponent assessedCount={10} notAssessedCount={5} />
          </div>
        </div> */}
    </>
  );
};

export default StatsContainer;
