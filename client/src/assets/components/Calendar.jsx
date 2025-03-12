import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const CalendarComponent = () => {
  const [value, onChange] = useState(new Date());

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        marginTop: "-100px",
      }}
    >
      <div className="calend" style={{ marginLeft: "50px" }}>
        <p>เลือกวันประเมินผู้ป่วย</p>
        <br />
        <Calendar onChange={onChange} value={value} />
      </div>
    </div>
  );
};

export default CalendarComponent;
