import React, { useContext, createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch.js";
import PatientsContainer from "../assets/components/PatientsContainer.jsx";
import SearchContainer from "../assets/components/SearchContainer.jsx";
import AllHeader from "../assets/components/AllHeader.jsx";
import { useLoaderData, useNavigate } from "react-router-dom";
import Wrapper from "../assets/components/AddButton.jsx";

export const loader = async ({ request }) => {
    console.log(request.url);
    const params = Object.fromEntries([
        ...new URL(request.url).searchParams.entries(),
    ]);

    try {
        const { data } = await customFetch.get("/allusers", { params });
        return {
            data,
            searchValues: { ...params },
        };
    } catch (error) {
        toast.error(error?.response?.data?.msg);
        return error;
    }
};

const AllPatientContext = createContext();

const AllPatient = () => {
    const { data, searchValues } = useLoaderData();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]); // 📅 วันที่ปัจจุบัน
    const [doctorId, setDoctorId] = useState(null);
    const [doctorFeedbacks, setDoctorFeedbacks] = useState([]); // ✅ เก็บข้อมูล Feedback ของแพทย์
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ ดึง `doctor_id` ของแพทย์ที่ล็อกอิน
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

    // ✅ ดึง Feedbacks ของหมอที่ล็อกอิน
    const fetchDoctorFeedbacks = async () => {
        if (!doctorId) return;

        try {
            setLoading(true);
            console.log(`⏳ กำลังโหลด Feedback ของหมอ ID: ${doctorId} ในวันที่ ${selectedDate}...`);
            
            const response = await customFetch.get("/feedbacks/doctor-feedbacks", {
                params: { doctor_id: doctorId, date: selectedDate },
            });

            console.log("✅ Feedback ของหมอ:", response.data);
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

    useEffect(() => {
        fetchDoctorId();
    }, []);

    useEffect(() => {
        if (doctorId) {
            fetchDoctorFeedbacks();
        }
    }, [doctorId, selectedDate]);

    return (
        <AllPatientContext.Provider value={{ data, searchValues, selectedDate, setSelectedDate, doctorFeedbacks }}>
            <SearchContainer />
            <Wrapper>
                <button onClick={() => navigate("/dashboard/add-user")}>เพิ่มผู้ป่วย</button>
            </Wrapper>
            <AllHeader>คนไข้ทั้งหมด</AllHeader>
            <PatientsContainer />

            {/* ✅ เพิ่มข้อมูลการประเมินของแพทย์ */}
            <div className="mt-10">
                <h2 className="text-xl font-bold text-center">การประเมินของฉัน</h2>

                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="block mx-auto mt-4 border p-2 rounded"
                />

                {loading ? (
                    <p className="text-center text-lg text-gray-600">⏳ กำลังโหลดข้อมูล...</p>
                ) : doctorFeedbacks.length > 0 ? (
                    doctorFeedbacks.map((feedback, index) => (
                        <div key={feedback._id} className="border p-4 mt-4 rounded-lg shadow">
                            <div className="text-lg font-medium">
                                {index + 1}. ผู้ป่วย: {feedback.patient_details?.name || "ไม่พบข้อมูลผู้ป่วย"}
                            </div>
                            <p className="text-gray-600">วันที่ประเมิน: {feedback.evaluation_date}</p>
                            <p className="text-gray-800">
                                ผลการประเมิน: <span className="font-bold">{feedback.feedback_type}</span>
                            </p>
                            <p className="text-gray-600">ความคิดเห็นของคุณ: {feedback.doctor_response || "ไม่มีความคิดเห็น"}</p>
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
