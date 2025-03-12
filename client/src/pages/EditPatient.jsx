/* eslint-disable react-hooks/exhaustive-deps */
import Wrapper from "../assets/wrappers/DashboardFormPage";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import customFetch from "../utils/customFetch";
import styled from "styled-components";
import PatientCalendar from "../assets/components/PatientCalendar.jsx";
import { PatientCard } from "../assets/components/PatientCard.jsx";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { redirect } from "react-router-dom";

export const loader = async ({ params }) => {
    try {
        const { _id } = params;
        if (!_id) {
            throw new Error("Invalid ID");
        }
        const { data } = await customFetch.get(`/allusers/${_id}`);
        return data;
    } catch (error) {
        toast.error(error.response.data.msg);
        return null;
    }
};

export const action = async ({ request, params }) => {
    const { _id } = params;
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    try {
        if (!_id) {
            throw new Error("Invalid ID");
        }
        await customFetch.patch(`/allusers/${_id}`, data);
        toast.success("แก้ไขข้อมูลคนไข้เรียบร้อยแล้ว");
        return redirect("/dashboard/all-patient");
    } catch (error) {
        toast.error(error?.response?.data?.msg);
        return error;
    }
};


const EditPatient = () => {
    const { _id } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [calendarData, setCalendarData] = useState([]);

    const fetchQuestions = async () => {
        try {
            const { data } = await customFetch.get("/questions");
            setQuestions(data);
        } catch (error) {
            toast.error(error?.response?.data?.msg || "เกิดข้อผิดพลาดในการโหลดคำถาม");
        }
    };

    const fetchAnswers = async () => {
        try {
            if (!_id) return;
            const { data } = await customFetch.get(`/answers/${_id}`);
            setAnswers(data[0] || {});
        } catch (error) {
            toast.error(error?.response?.data?.msg || "เกิดข้อผิดพลาดในการโหลดคำตอบ");
        } finally {
            setLoading(false);
        }
    };

    const fetchDataCalendar = async () => {
        try {
            const { data } = await customFetch.get(`/main/datacalendar/${_id}`);
            setCalendarData(data);
        } catch (error) {
            toast.error(error?.response?.data?.msg || "เกิดข้อผิดพลาดในการโหลดคำตอบ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (_id) {
            fetchQuestions();
            fetchAnswers();
            fetchDataCalendar();
        }
    }, [_id]);

    if (loading) {
        return <div className="text-center text-lg font-bold text-gray-600">กำลังโหลด...</div>;
    }

    if (!_id) {
        return <div className="text-center text-lg font-bold text-red-500">ไม่พบข้อมูลผู้ป่วย</div>;
    }

    return (
      <>
        <Wrapper>
          <StyledFormWrapper>
            <div className="flex flex-col w-full h-full space-y-12 form">
              <PatientCard userId={_id} />
              <div className="flex justify-center">
                <PatientCalendar calendarData={calendarData} userId={_id} />
              </div>
              <div className="flex flex-row space-x-4 text-lg font-bold">
                {/* <button onClick={() => navigate(`/dashboard/eval-doctor/${_id}/${new Date().toISOString().split("T")[0]}`)} className="w-full shadow-xl border-2 p-4 rounded-full">ประเมินผู้ป่วย</button> */}
                {/* <button
                  onClick={() => navigate("/dashboard/graph-posture")}
                  className="w-full shadow-xl border-2 p-4 rounded-full"
                >
                  กราฟแสดงการทำกายภาพ
                </button> */}
              </div>
            </div>
          </StyledFormWrapper>
        </Wrapper>

        <div className="my-10"></div>

        <Wrapper>
          <div className="text-xl font-regular text-center">
            การตอบคำถามก่อนเริ่มกายภาพบำบัดของผู้ป่วย
          </div>
          {questions.map((question, index) => {
            const answer = answers?.answers?.find((ans) =>
              question.choice.some((choice) => choice._id === ans._id)
            );

            const positiveAnswers = ["มาก", "ดีขึ้นมาก", "พร้อมแล้ว"];
            const isPositive = answer && positiveAnswers.includes(answer.name);
            const answerColor = isPositive ? "text-green-600" : "text-red-600";

            return (
              <div
                key={question._id}
                className="flex flex-col space-y-4 mt-4 p-4 border rounded-lg"
              >
                <div className="text-md font-regular">
                  {index + 1}. {question.name}
                </div>
                <div className={`text-md font-medium pt-2 ${answerColor}`}>
                  คำตอบ : {answer ? answer.name : "ไม่ได้ตอบ"}
                </div>
              </div>
            );
          })}
        </Wrapper>
      </>
    );
};

const StyledFormWrapper = styled.div`
    display: flex;
    .image-container {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1rem;
        .patient-image {
            max-width: 60%;
            max-height: 60%;
            border-radius: 10px;
        }
    }
    .form {
        flex: 2;
        padding: 1rem;
    }
`;

export default EditPatient;
