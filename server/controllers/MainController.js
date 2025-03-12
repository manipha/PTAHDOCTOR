import { StatusCodes } from "http-status-codes";
import FeedbacksModel from "../models/FeedbacksModel.js";
import EvaluationsModel from "../models/EvaluatesModel.js";

export const getDataCalendar = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "User ID is required" });
        }

        // ✅ ดึงข้อมูลจากฐานข้อมูล
        const evaluations = await EvaluationsModel.find({ userId: id }, { created_at: 1, answers: 1 }).lean();
        const feedbacks = await FeedbacksModel.find({ user_id: id }, { evaluation_date: 1, feedback_type: 1 }).lean();

        console.log("📌 Evaluations:", evaluations);
        console.log("📌 Feedbacks:", feedbacks);

        if (!evaluations.length && !feedbacks.length) {
            return res.status(StatusCodes.OK).json([]);
        }

        const calendarMap = {};
        const dateCount = {};

        // ✅ เพิ่มข้อมูลจาก Evaluations
        evaluations.forEach((evalData) => {
            const dateKey = evalData.created_at.toISOString().split("T")[0];

            if (!calendarMap[dateKey]) {
                calendarMap[dateKey] = { created_at: evalData.created_at, star: false, feedback_date: null, feedback_status: null };
            }

            dateCount[dateKey] = (dateCount[dateKey] || 0) + 1;
        });

        // ✅ ถ้าวันใดมี 4 รายการ ให้กำหนด `feedback_date = ""` แม้ไม่มี Feedbacks
        Object.keys(dateCount).forEach((dateKey) => {
            if (dateCount[dateKey] === 4 && !calendarMap[dateKey].feedback_date) {
                calendarMap[dateKey].feedback_date = "";
                calendarMap[dateKey].star = true; // ⭐ ได้รับดาว
            }
        });

        // ✅ เพิ่มข้อมูลจาก Feedbacks
        feedbacks.forEach((fb) => {
            const dateKey = fb.evaluation_date;

            if (!calendarMap[dateKey]) {
                calendarMap[dateKey] = { created_at: null, star: false, feedback_date: dateKey, feedback_status: null };
            }

            if (dateCount[dateKey] == 4) {
                calendarMap[dateKey].feedback_date = dateKey;
            }

            if (calendarMap[dateKey].feedback_date !== null) {
                calendarMap[dateKey].star = true;
            }

            switch (fb.feedback_type) {
                case "ทำได้ดี":
                    calendarMap[dateKey].feedback_status = 0;
                    break;
                case "ควรปรับปรุง":
                    calendarMap[dateKey].feedback_status = 1;
                    break;
            }
        });

        const calendarData = Object.keys(calendarMap)
            .filter(dateKey => calendarMap[dateKey].created_at || calendarMap[dateKey].feedback_date !== null)
            .map(dateKey => {
                let item = calendarMap[dateKey];
                let result = { created_at: item.created_at ? item.created_at.toISOString() : null };

                if (item.feedback_status !== null) {
                    result.feedback_status = item.feedback_status;
                }

                if (item.feedback_date !== null) {
                    result.feedback_date = item.feedback_date;
                }

                if (item.star) {
                    result.star = true;
                }

                return result;
            });

        console.log("✅ Filtered Calendar Data for User:", id, calendarData);
        res.status(StatusCodes.OK).json(calendarData);
    } catch (error) {
        console.error("❌ Error fetching calendar data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};
