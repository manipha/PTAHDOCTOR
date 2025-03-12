import Wrapper from "../assets/wrappers/DashboardFormPage";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DislikeButton, LikeButton } from "../assets/components/Button";
import { FcPrevious } from "react-icons/fc";
import PropTypes from "prop-types";
import customFetch from "../utils/customFetch";

const formatThaiDate = (dateString) => {
  if (!dateString) return "ไม่มีข้อมูลวันที่";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(date);
};

const PostureCard = ({ name, answers, suggestion }) => {
  return (
    <div className="p-4 border-b">
      {/* <h2 className="font-bold text-lg">{name || "-"}</h2> */}

      {Array.isArray(answers) && answers.length > 0 ? (
        <ul>
          {answers.map((answer, i) => (
            <li key={i} className="flex justify-between mb-7">
              <span>{answer.name || "ไม่มีข้อมูล"}</span>
              <span
                className={`${answer.result === "ง่าย"
                  ? "text-green-500"
                  : answer.result === "ปานกลาง"
                    ? "text-yellow-500"
                    : "text-red-500"
                  }`}
              >
                {answer.result || "ไม่มีผลลัพธ์"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">ไม่มีข้อมูลการตอบ</p>
      )}

      <p className="font-bold mt-2">
        ข้อความจากผู้ป่วย: {suggestion?.trim() ? suggestion : "ไม่มีข้อความ"}
      </p>
    </div>
  );
};

const EvaluatePatient = () => {
  const { date, _id } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(
    date || new Date().toISOString().split("T")[0]
  );
  const [dataList, setDataList] = useState([]);
  const [response, setResponse] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackData, setFeedbackData] = useState(null);
  const userData = JSON.parse(localStorage.getItem("userData"));

  const handleBack = () => navigate(-1);

  const sendData = async () => {
    try {
      const response = await customFetch.get("/evaluates/" + _id);
      setDataList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setDataList([]);
    }
  };

  const sendDataFeedback = async () => {
    try {
      const response = await customFetch.post(
        "/feedbacks/getfeedbackbydateandid",
        { id: _id, date }
      );
      console.log("Feedback data: ", response);
      if (Array.isArray(response.data) && response.data.length > 0) {
        setFeedbackData(response.data[0]);
      } else {
        setFeedbackData(null);
      }
    } catch (error) {
      console.error("Error fetching feedback data:", error);
      setFeedbackData(null);
    }
  };

  useEffect(() => {
    sendData();
    sendDataFeedback();
  }, [_id, date]);

  const handleSubmit = async () => {
    try {
      const payload = {
        user_id: _id,
        doctor_response: response,
        feedback_type: feedback,
        evaluation_date: date,
        doctor_id: userData.doctor_id,
      };

      await customFetch.post("/feedbacks/save", payload);
      sendDataFeedback();
    } catch (error) {
      console.error("บันทึก feedback ไม่สำเร็จ:", error);
    }
  };
  return (
    <Wrapper>
      <FcPrevious className="text-5xl cursor-pointer" onClick={handleBack} />
      <div className="w-full h-full flex flex-col justify-center space-y-8">
        <p className="font-semibold text-gray-600 text-xl text-center">
          {formatThaiDate(selectedDate)}
        </p>

        <div className="w-full flex flex-row justify-between px-4 font-thin text-gray-600">
          <span>
            {dataList.length > 3 &&
              (() => {
                const filteredList = dataList.filter(
                  (o) =>
                    new Date(o.created_at).toISOString().split("T")[0] === date
                );

                if (filteredList.length < 4) return null;

                const fourthItem = filteredList[3];
                if (!fourthItem || !fourthItem.timeSpent) return null;

                const formattedTime = fourthItem.timeSpent.slice(3);

                return (
                  <div className="font-bold mt-2">
                    <p>
                      รวมเวลาที่ใช้:{" "}
                      <span className="font-bold">{formattedTime}</span> นาที
                    </p>
                  </div>
                );
              })()}
          </span>
          <span className="text-green-600">ประเมินโดยผู้ป่วย</span>
        </div>

        <div className="w-full h-full flex flex-col border-2 p-8 rounded-lg space-y-8 shadow-lg">
          {dataList && Array.isArray(dataList) && dataList.filter((o) => o.created_at && new Date(o.created_at).toISOString().split("T")[0] === date).length > 0 ? (
            dataList.filter((o) => o.created_at && new Date(o.created_at).toISOString().split("T")[0] === date).map((val, index) => (
              <PostureCard
                key={index}
                name={val.name || "-"}
                answers={Array.isArray(val.answers) ? val.answers : []}
                suggestion={
                  val.suggestion?.trim() ? val.suggestion : "ไม่มีข้อความ"
                }
              />
            ))
          ) : (
            <p className="text-gray-400 text-center">ไม่พบผลประเมิน</p>
          )}
        </div>

        {feedbackData ? (
          <div>
            <p className="font-regular">
              ตอบกลับผู้ป่วย :
              <span className="ml-2 my-2">
                {feedbackData.doctor_response?.trim()
                  ? feedbackData.doctor_response
                  : "ไม่มีข้อความตอบกลับ"}
              </span>
            </p>
            <p className="font-regular mt-5">
              ผลการประเมิน :
              <span
                className={`ml-2 ${feedbackData.feedback_type === "ทำได้ดี"
                  ? "text-[#1DD047]"
                  : "text-[#ff9d0a]"
                  }`}
              >
                {feedbackData.feedback_type?.trim()
                  ? feedbackData.feedback_type
                  : "ไม่มีผลการประเมิน"}
              </span>
            </p>{" "}
            <p className="font-regular mt-5">
              ประเมินโดย :{" "}
              {feedbackData.doctor_details
                ? feedbackData.doctor_details
                : "ไม่มีผลการประเมิน"}
            </p>
          </div>
        ) : (
          <>
            <p className="font-bold">ตอบกลับ:</p>
            <textarea
              className="px-6 py-4 w-full h-16 border-2 rounded-xl resize-none"
              placeholder="ตอบกลับคนไข้"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
            ></textarea>

            <div className="w-[65%] flex space-x-2">
              <LikeButton
                isActive={feedback === "ทำได้ดี"}
                handleClick={() => setFeedback("ทำได้ดี")}
              />
              <DislikeButton
                isActive={feedback === "ควรปรับปรุง"}
                handleClick={() => setFeedback("ควรปรับปรุง")}
              />
            </div>

            <div className="w-full flex justify-end">
              <button
                onClick={handleSubmit}
                className="w-[25%] bg-[#84D0FF] text-white flex justify-center items-center px-1 py-4 rounded-3xl shadow-xl"
              >
                ส่ง
              </button>
            </div>
          </>
        )}
      </div>
    </Wrapper>
  );
};

PostureCard.propTypes = {
  name: PropTypes.string.isRequired,
  answers: PropTypes.array.isRequired,
  suggestion: PropTypes.string,
};

export default EvaluatePatient;
