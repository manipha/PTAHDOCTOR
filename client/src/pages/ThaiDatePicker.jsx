import React, { useState, forwardRef } from "react";
import th from "date-fns/locale/th";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const ThaiDatePicker = ({
    selectedDate,
    setSelectedDate,
    bgColor = "white",
    textColor = "black",
    iconColor = "lightblue",
}) => {
    registerLocale("th", th);
    const [displayedDate, setDisplayedDate] = useState(new Date());

    const toBuddhistYear = (year) => year + 543;
    const toGregorianYear = (buddhistYear) => buddhistYear - 543;

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setDisplayedDate(date);
    };

    const CustomInput = forwardRef(({ value, onClick }, ref) => {
        const formattedDate = selectedDate
            ? format(selectedDate, "dd/MM/") +
              toBuddhistYear(selectedDate.getFullYear())
            : "";
        return (
            <div
                className={`ml-10 flex items-center border border-gray-300 rounded-full px-8 py-2 cursor-pointer`}
                style={{ backgroundColor: bgColor }}
                onClick={onClick}
                ref={ref}
            >
                <svg
                    className="w-5 h-5 mr-2 text-blue-500"
                    style={{ color: iconColor }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                    />
                </svg>
                <span style={{ color: textColor }}>{formattedDate}</span>
            </div>
        );
    });

    const renderCustomHeader = ({
        date,
        changeYear,
        changeMonth,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
    }) => {
        const years = [];
        const currentYear = date.getFullYear();
        const startYear = currentYear - 10;
        const endYear = currentYear + 10;
        for (let year = startYear; year <= endYear; year++) {
            years.push(year);
        }
        return (
            <div className="flex justify-center space-x-2 p-2">
                <select
                    className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={date.getMonth()}
                    onChange={({ target: { value } }) => {
                        changeMonth(parseInt(value, 10));
                        const newDate = new Date(
                            date.setMonth(parseInt(value, 10))
                        );
                        setSelectedDate(newDate);
                        setDisplayedDate(newDate);
                    }}
                >
                    {[...Array(12)].map((_, index) => (
                        <option key={index} value={index}>
                            {th.localize.month(index, { width: "wide" })}
                        </option>
                    ))}
                </select>
                <select
                    className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={toBuddhistYear(date.getFullYear())}
                    onChange={({ target: { value } }) => {
                        const newYear = toGregorianYear(parseInt(value, 10));
                        changeYear(newYear);
                        const newDate = new Date(date.setFullYear(newYear));
                        setSelectedDate(newDate);
                        setDisplayedDate(newDate);
                    }}
                >
                    {years.map((year) => (
                        <option key={year} value={toBuddhistYear(year)}>
                            {toBuddhistYear(year)}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    return (
        <DatePicker
            locale="th"
            selected={selectedDate}
            onChange={handleDateChange}
            onMonthChange={setDisplayedDate}
            onYearChange={setDisplayedDate}
            dateFormat="dd/MM/yyyy"
            renderCustomHeader={renderCustomHeader}
            customInput={<CustomInput />}
        />
    );
};

export default ThaiDatePicker;
