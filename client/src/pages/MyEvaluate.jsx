import React, { useContext, createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch.js";
import { useLoaderData, useNavigate } from "react-router-dom";
import AllHeader from "../assets/components/AllHeader.jsx";

export const loader = async ({ request }) => {
    console.log("🌍 URL ที่โหลด:", request.url);
    const params = Object.fromEntries([...new URL(request.url).searchParams.entries()]);

    try {
        const { data } = await customFetch.get("/allusers", { params });
        return { data, searchValues: { ...params } };
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        toast.error(error?.response?.data?.msg || "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้");
        return { data: [], searchValues: {} };
    }
};

const MyEvaluateContext = createContext();

const MyEvaluate = () => {
    const { data } = useLoaderData();
    const navigate = useNavigate();

    const [doctorId, setDoctorId] = useState(null);
    const [doctorFeedbacks, setDoctorFeedbacks] = useState([]); // เก็บข้อมูล Feedback ของแพทย์
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // เก็บเดือนที่เลือก (ค่าเริ่มต้นเป็นเดือนปัจจุบัน)
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    // ดึง doctor_id ของแพทย์ที่ล็อกอิน
    useEffect(() => {
        const fetchDoctorId = async () => {
            try {
                console.log("⏳ กำลังดึงข้อมูลหมอที่ล็อกอิน...");
                const response = await customFetch.get("/doctors/me");
                console.log("🔍 Doctor API Response:", response.data);

                if (response.data?.doctor?._id) {
                    setDoctorId(response.data.doctor._id);
                    console.log("✅ Doctor ID:", response.data.doctor._id);
                } else {
                    toast.error("ไม่พบข้อมูลแพทย์");
                    setError("ไม่พบข้อมูลแพทย์");
                }
            } catch (error) {
                console.error("❌ Error fetching doctor ID:", error);
                toast.error("ไม่สามารถดึงข้อมูลแพทย์ที่ล็อกอินได้");
                setError("ไม่สามารถดึงข้อมูลแพทย์ที่ล็อกอินได้");
            }
        };

        fetchDoctorId();
    }, []);

    // ดึง Feedbacks ของหมอที่ล็อกอิน
    useEffect(() => {
        if (!doctorId || !selectedMonth) return;

        console.log("📥 กำลังโหลดข้อมูลสำหรับ:");
        console.log("📆 เดือน:", selectedMonth);
        console.log("👨‍⚕️ หมอ:", doctorId);

        const fetchDoctorFeedbacks = async () => {
            try {
                const url = `feedbacks/doctor-feedbacks?doctor_id=${doctorId}&month=${selectedMonth}`;
                console.log("🌐 เรียก API URL:", url);

                const response = await customFetch.get("feedbacks/doctor-feedbacks", {
                    params: { doctor_id: doctorId, month: selectedMonth },
                });

                console.log("✅ ได้ข้อมูล feedback:", response.data.feedbacks);
                setDoctorFeedbacks(response.data.feedbacks || []);
                setError(null);
            } catch (error) {
                console.error("❌ Error fetching doctor feedbacks:", error);
                toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลการประเมิน");
                setError("เกิดข้อผิดพลาดในการโหลดข้อมูลการประเมิน");
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorFeedbacks();
    }, [doctorId, selectedMonth]);

    // สร้างตัวเลือกเดือน (ย้อนหลัง 12 เดือน)
    const getMonthOptions = () => {
        const months = [];
        const today = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - i, 1));
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const value = `${year}-${month}`;

            console.log(`📅 ตัวเลือกเดือน (UTC): ${value}`);

            const label = date.toLocaleString("th-TH", { year: "numeric", month: "long" });
            months.push({ value, label });
        }
        return months;
    };

    return (
        <MyEvaluateContext.Provider
            value={{ data, selectedMonth, setSelectedMonth, doctorFeedbacks }}
        >
            <AllHeader>
                การประเมินของฉัน
            </AllHeader>


            {/* Dropdown เลือกเดือน */}
            <div className="flex items-center space-x-3 mt-10 mb-10">
                <label className="text-lg font-medium text-gray-800">เลือกเดือน :</label>
                <div className="relative">
                    <select
                        value={selectedMonth}
                        onChange={(e) => {
                            const newMonth = e.target.value;
                            console.log(`📌 เปลี่ยนเดือนเป็น: ${newMonth}`);
                            setSelectedMonth(newMonth);
                            setLoading(true);
                        }}
                        className="appearance-none w-full px-4 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#87CEFA] transition bg-white text-gray-900"
                    >
                        {getMonthOptions().map((month) => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </select>
                    {/* ไอคอน dropdown */}
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <svg
                            className="w-4 h-4 text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>
            </div>


            {/* แสดงผลการประเมิน */}
            {loading ? (
                <p className="text-center text-lg text-gray-600">⏳ กำลังโหลดข้อมูล...</p>
            ) : doctorFeedbacks.length > 0 ? (
                doctorFeedbacks.map((feedback, index) => (
                    <div
                        key={feedback._id}
                        className="border border-gray-200 p-4 mb-4 rounded-xl bg-white shadow-sm transition duration-200 hover:shadow-md"
                    >
                        <div className="text-base text-gray-800 mb-2">
                            {index + 1}. ชื่อผู้ป่วย: {feedback.user_id?.name} {feedback.user_id?.surname}
                        </div>
                        <div className="text-sm text-gray-700 mb-1">
                            ผลการประเมิน:{" "}
                            <span
                                className={
                                    feedback.feedback_type === "ทำได้ดี"
                                        ? "text-green-600 font-medium"
                                        : "text-orange-500 font-medium"
                                }
                            >
                                {feedback.feedback_type}
                            </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                            ข้อความจากแพทย์: {feedback.doctor_response || "ไม่มีความคิดเห็น"}
                        </div>
                        <div className="text-sm text-gray-500 mb-1 mt-3">
                            วันที่ตอบกลับ:{" "}
                            {new Date(feedback.createdAt).toLocaleDateString("th-TH")}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-lg text-gray-600">⚠️ คุณยังไม่มีการประเมิน</p>
            )}
        </MyEvaluateContext.Provider>
    );
};

export const useMyEvaluateContext = () => useContext(MyEvaluateContext);
export default MyEvaluate;
