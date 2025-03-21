import React, { useContext, createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch.js";
import { useLoaderData, useNavigate } from "react-router-dom";
import AllHeader from "../assets/components/AllHeader.jsx";

export const loader = async ({ request }) => {
  const params = Object.fromEntries([...new URL(request.url).searchParams.entries()]);
  try {
    const { data } = await customFetch.get("/allusers", { params });
    return { data, searchValues: { ...params } };
  } catch (error) {
    toast.error(error?.response?.data?.msg || "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้");
    return { data: [], searchValues: {} };
  }
};

const MyEvaluateContext = createContext();

const MyEvaluate = () => {
  const { data } = useLoaderData();
  const navigate = useNavigate();

  const [doctorId, setDoctorId] = useState(null);
  const [doctorFeedbacks, setDoctorFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [sortDate, setSortDate] = useState("latest");
  const [sortFeedbackType, setSortFeedbackType] = useState("all");

  useEffect(() => {
    const fetchDoctorId = async () => {
      try {
        const response = await customFetch.get("/doctors/me");
        if (response.data?.doctor?._id) {
          setDoctorId(response.data.doctor._id);
        } else {
          toast.error("ไม่พบข้อมูลแพทย์");
          setError("ไม่พบข้อมูลแพทย์");
        }
      } catch (error) {
        toast.error("ไม่สามารถดึงข้อมูลแพทย์ที่ล็อกอินได้");
        setError("ไม่สามารถดึงข้อมูลแพทย์ที่ล็อกอินได้");
      }
    };
    fetchDoctorId();
  }, []);

  useEffect(() => {
    if (!doctorId || !selectedMonth) return;

    const fetchDoctorFeedbacks = async () => {
      try {
        const response = await customFetch.get("feedbacks/doctor-feedbacks", {
          params: { doctor_id: doctorId, month: selectedMonth },
        });
        setDoctorFeedbacks(response.data.feedbacks || []);
        setError(null);
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลการประเมิน");
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูลการประเมิน");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorFeedbacks();
  }, [doctorId, selectedMonth]);

  const getMonthOptions = () => {
    const months = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const value = `${year}-${month}`;
      const label = date.toLocaleString("th-TH", { year: "numeric", month: "long" });
      months.push({ value, label });
    }
    return months;
  };
  

  const sortFeedbacks = (feedbacks) => {
    let sorted = [...feedbacks];

    if (sortDate === "latest") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortDate === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    if (sortFeedbackType === "positive") {
      sorted = sorted.filter((f) => f.feedback_type === "ทำได้ดี");
    } else if (sortFeedbackType === "negative") {
      sorted = sorted.filter((f) => f.feedback_type === "ควรปรับปรุง");
    }

    return sorted;
  };

  const sortedFeedbacks = sortFeedbacks(doctorFeedbacks);
  const countPositive = sortedFeedbacks.filter((f) => f.feedback_type === "ทำได้ดี").length;
  const countNegative = sortedFeedbacks.filter((f) => f.feedback_type === "ควรปรับปรุง").length;

  return (
    <MyEvaluateContext.Provider value={{ data, selectedMonth, setSelectedMonth, doctorFeedbacks }}>
      <AllHeader>การประเมินของฉัน</AllHeader>

      <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-3 md:space-y-0 mt-10 mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-base text-gray-700">เลือกเดือน:</label>
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setLoading(true);
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

        <div className="flex items-center space-x-2">
          <label className="text-base text-gray-700">เรียงตามวันที่:</label>
          <select
            value={sortDate}
            onChange={(e) => setSortDate(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="latest">ล่าสุด</option>
            <option value="oldest">เก่าสุด</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-base text-gray-700">ผลการประเมิน:</label>
          <select
            value={sortFeedbackType}
            onChange={(e) => setSortFeedbackType(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="all">ทั้งหมด</option>
            <option value="positive">ทำได้ดี</option>
            <option value="negative">ควรปรับปรุง</option>
          </select>
        </div>
      </div>

      {!loading && sortedFeedbacks.length > 0 && (
        <div className="flex justify-between items-center mb-4 flex-wrap gap-y-2">
          <p className="text-gray-700">
            ทั้งหมด {sortedFeedbacks.length} การประเมิน
          </p>
          <p className="text-sm text-gray-600">
            ✅ ทำได้ดี: <span className="font-medium text-green-600">{countPositive}</span>{" "}
            | ⚠️ ควรปรับปรุง: <span className="font-medium text-orange-500">{countNegative}</span>
          </p>
        </div>
      )}

      {loading ? (
        <p className="text-center text-lg text-gray-600">⏳ กำลังโหลดข้อมูล...</p>
      ) : sortedFeedbacks.length > 0 ? (
        sortedFeedbacks.map((feedback, index) => (
          <div
            key={feedback._id}
            className="border border-gray-200 p-4 mb-4 rounded-xl bg-white shadow-sm transition duration-200 hover:shadow-md"
          >
            <div className="text-base text-gray-800 mb-2">
              {index + 1}. ชื่อผู้ป่วย: {feedback.user_id.name} {feedback.user_id.surname}
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
            <div className="text-sm text-gray-500 mt-3">
  วันที่ตอบกลับ:{" "}
  {new Date(feedback.createdAt).toLocaleString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}
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
