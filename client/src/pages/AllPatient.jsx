import React, { useContext, createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch.js";
import PatientsContainer from "../assets/components/PatientsContainer.jsx";
import SearchContainer from "../assets/components/SearchContainer.jsx";
import AllHeader from "../assets/components/AllHeader.jsx";
import { useLoaderData, useNavigate } from "react-router-dom";
import Wrapper from "../assets/components/AddButton.jsx";

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

const AllPatientContext = createContext();

const AllPatient = () => {
    const { data, searchValues } = useLoaderData();
    const navigate = useNavigate();
    
    const [doctorId, setDoctorId] = useState(null);
    const [doctorFeedbacks, setDoctorFeedbacks] = useState([]); // ✅ เก็บข้อมูล Feedback ของแพทย์
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ เก็บเดือนที่เลือก (ค่าเริ่มต้นเป็นเดือนปัจจุบัน)
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    // ✅ ดึง `doctor_id` ของแพทย์ที่ล็อกอิน
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

    // ✅ ดึง Feedbacks ของหมอที่ล็อกอิน
    useEffect(() => {
        if (!doctorId) return;
    
        console.log(`🔍 ค่า selectedMonth ล่าสุด: ${selectedMonth}`); // ✅ ตรวจสอบว่าค่าเปลี่ยนหรือไม่
    
        const fetchDoctorFeedbacks = async () => {
            console.log(`⏳ กำลังโหลด Feedback ของหมอ ID: ${doctorId} ในเดือน ${selectedMonth}...`);
    
            try {
                const response = await customFetch.get("feedbacks/doctor-feedbacks", {
                    params: { doctor_id: doctorId, month: selectedMonth },
                });
    
                console.log("✅ Response จาก API:", response.data);
                setDoctorFeedbacks(response.data.feedbacks || []);
                setError(null);
            } catch (error) {
                console.error("❌ Error fetching doctor feedbacks:", error);
                console.log("❌ API URL:", `/api/v1/feedbacks/doctor-feedbacks?doctor_id=${doctorId}&month=${selectedMonth}`);
                toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลการประเมิน");
                setError("เกิดข้อผิดพลาดในการโหลดข้อมูลการประเมิน");
            } finally {
                setLoading(false);
            }
        };
    
        fetchDoctorFeedbacks();
    }, [doctorId, selectedMonth]); // ✅ ค่า selectedMonth เปลี่ยน ควรทำให้ useEffect ทำงาน
    

    // ✅ สร้างตัวเลือกเดือน (ย้อนหลัง 12 เดือน)
    const getMonthOptions = () => {
        const months = [];
        const today = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const value = date.toISOString().slice(0, 7); // "YYYY-MM"
            console.log(`📅 ตัวเลือกเดือน: ${value}`); // ✅ ตรวจสอบว่ามี 2025-03 จริงหรือไม่
            const label = date.toLocaleString("th-TH", { year: "numeric", month: "long" });
            months.push({ value, label });
        }
        return months;
    };
    
    return (
        <AllPatientContext.Provider value={{ data, searchValues, selectedMonth, setSelectedMonth, doctorFeedbacks }}>
            <SearchContainer />
            <Wrapper>
                <button onClick={() => navigate("/dashboard/add-user")}>เพิ่มผู้ป่วย</button>
            </Wrapper>
            <AllHeader>คนไข้ทั้งหมด</AllHeader>
            <PatientsContainer />

            {/* ✅ เพิ่มข้อมูลการประเมินของแพทย์ */}
            <div className="mt-10">
                <h2 className="text-xl font-bold text-center">การประเมินของฉัน</h2>

                {/* ✅ Dropdown เลือกเดือน */}
                <div className="flex justify-center mt-4">
                    <label className="mr-2 text-lg">เลือกเดือน:</label>
                    <select
    value={selectedMonth}
    onChange={(e) => {
        console.log(`📌 เปลี่ยนเดือนเป็น: ${e.target.value}`); // ✅ ดูว่าค่าถูกเปลี่ยนจริงไหม
        setSelectedMonth(e.target.value);
    }}
    className="border p-2 rounded"
>
    {getMonthOptions().map((month) => (
        <option key={month.value} value={month.value}>
            {month.label}
        </option>
    ))}
</select>

                </div>

                {loading ? (
                    <p className="text-center text-lg text-gray-600">⏳ กำลังโหลดข้อมูล...</p>
                ) : doctorFeedbacks.length > 0 ? (
                    doctorFeedbacks.map((feedback, index) => (
                        <div key={feedback._id} className="border p-4 mt-4 rounded-lg shadow">
                            <div className="text-lg font-medium">
                                {index + 1}. ผู้ป่วย: {feedback.patient_details?.name || "ไม่พบข้อมูลผู้ป่วย"}
                            </div>
                            <p className="text-gray-600">
                                วันที่ตอบกลับ: {new Date(feedback.createdAt).toLocaleDateString("th-TH")}
                            </p>
                            <p className="text-gray-800">
                                ผลการประเมิน: <span className="font-bold">{feedback.feedback_type}</span>
                            </p>
                            <p className="text-gray-600">
                                ความคิดเห็นของคุณ: {feedback.doctor_response || "ไม่มีความคิดเห็น"}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-lg text-gray-600">⚠️ คุณยังไม่มีการประเมิน</p>
                )}
            </div>
        </AllPatientContext.Provider>
    );
};

export const useAllPatientContext = () => useContext(AllPatientContext);
export default AllPatient;
