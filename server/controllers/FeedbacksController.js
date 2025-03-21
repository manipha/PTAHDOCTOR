import { StatusCodes } from "http-status-codes";
import FeedbacksModel from "../models/FeedbacksModel.js";
import Doctor from "../models/DoctorModel.js"; // Import Doctor model
import mongoose from "mongoose";

export const save = async (req, res) => {
  try {
    const {
      user_id,
      doctor_response,
      feedback_type,
      evaluation_date,
      doctor_id,
    } = req.body;

    if (!user_id || !doctor_response || !feedback_type || !doctor_id) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    const newFeedback = new FeedbacksModel({
      user_id,
      doctor_response,
      feedback_type,
      evaluation_date,
      doctor_id,
    });

    await newFeedback.save();

    res
      .status(201)
      .json({ message: "บันทึก feedback สำเร็จ!", feedback: newFeedback });
  } catch (error) {
    res
      .status(500)
      .json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล", details: error });
  }
};

// export const getFeedbackByDateAndId = async (req, res) => {
//     try {
//         const { id, date } = req.body;

//         if (!id || !date) {
//             return res.status(400).json({ error: "กรุณาระบุ ID และวันที่" });
//         }

//         // ✅ ดึงข้อมูล Feedback ที่มี doctor_id และ user_id
//         const evaluations = await FeedbacksModel.find({ user_id: id, evaluation_date: date })
//             .populate("user_id", "username name surname email") // ✅ ดึงข้อมูลผู้ใช้
//             .lean(); // ✅ แปลงเป็น Plain Object เพื่อให้แก้ไขได้ง่าย

//         if (evaluations.length === 0) {
//             return res.status(404).json({ message: "ไม่พบข้อมูล Feedback ในวันนี้" });
//         }

//         // ✅ ดึงข้อมูลหมอทั้งหมดที่เกี่ยวข้อง
//         const doctorIds = [...new Set(evaluations.map(e => e.doctor_id.toString()))]; // เอา doctor_id ที่ไม่ซ้ำกัน
//         const doctors = await Doctor.find({ _id: { $in: doctorIds } }).lean(); // ดึงข้อมูลหมอทั้งหมด

//         console.log("Doctors:", doctors);

//         const doctorMap = doctors.reduce((acc, doctor) => {
//             acc[doctor._id.toString()] = doctor;
//             return acc;
//         }, {}); // ✅ Map หมอเป็น Object เพื่อให้ค้นหาเร็วขึ้น

//         // ✅ รวมข้อมูล `doctor_details` เข้าไปในแต่ละ `evaluation`
//         const formattedEvaluations = evaluations.map(evaluation => ({
//             ...evaluation,
//             doctor_details: doctorMap[evaluation.doctor_id.toString()] || null, // ✅ ใช้ข้อมูลหมอที่ดึงมา
//             user_details: evaluation.user_id, // ✅ ใช้ข้อมูลผู้ใช้ที่ populate มาแล้ว
//             doctor_id: undefined, // ✅ ลบ doctor_id เดิม
//             user_id: undefined // ✅ ลบ user_id เดิม
//         }));

//         res.status(200).json(formattedEvaluations);

//     } catch (error) {
//         console.error("Error fetching feedback:", error);
//         res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล", details: error.message });
//     }
// };

export const getFeedbackByDateAndId = async (req, res) => {
  try {
    const { id, date } = req.body;

    if (!id || !date) {
      return res.status(400).json({ error: "กรุณาระบุ ID และวันที่" });
    }

    // ✅ ดึงข้อมูล Feedback ที่มี doctor_id และ user_id
    const evaluations = await FeedbacksModel.find({
      user_id: id,
      evaluation_date: date,
    })
      .populate("user_id", "username name surname email") // ✅ ดึงข้อมูลผู้ใช้
      .lean(); // ✅ แปลงเป็น Plain Object เพื่อให้แก้ไขได้ง่าย

    if (evaluations.length === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูล Feedback ในวันนี้" });
    }

    // ✅ ดึงข้อมูลหมอทั้งหมดที่เกี่ยวข้อง และเลือกเฉพาะ `nametitle`, `name`, `surname`
    const doctorIds = [
      ...new Set(evaluations.map((e) => e.doctor_id.toString())),
    ]; // เอา doctor_id ที่ไม่ซ้ำกัน
    const doctors = await Doctor.find({ _id: { $in: doctorIds } })
      .select("nametitle name surname") // ✅ ดึงเฉพาะ 3 ฟิลด์
      .lean();

    // ✅ สร้าง Map ของหมอ (key = doctor_id, value = "นพ. John Doe")
    const doctorMap = doctors.reduce((acc, doctor) => {
      acc[
        doctor._id.toString()
      ] = `${doctor.nametitle} ${doctor.name} ${doctor.surname}`; // ✅ รวมเป็น String
      return acc;
    }, {});

    // ✅ รวมข้อมูล `doctor_details` เข้าไปในแต่ละ `evaluation`
    const formattedEvaluations = evaluations.map((evaluation) => ({
      ...evaluation,
      doctor_details:
        doctorMap[evaluation.doctor_id.toString()] || "ไม่พบข้อมูลหมอ", // ✅ ใช้ String
      user_details: evaluation.user_id, // ✅ ใช้ข้อมูลผู้ใช้ที่ populate มาแล้ว
      doctor_id: undefined, // ✅ ลบ doctor_id เดิม
      user_id: undefined, // ✅ ลบ user_id เดิม
    }));

    res.status(200).json(formattedEvaluations);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res
      .status(500)
      .json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล", details: error.message });
  }
};


export const getFeedbacksByDoctorId = async (req, res) => {
  try {
    const { doctor_id, month } = req.query;

    if (!doctor_id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "กรุณาระบุ doctor_id" });
    }

    if (!mongoose.Types.ObjectId.isValid(doctor_id)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "doctor_id ไม่ถูกต้อง" });
    }

    const query = { doctor_id: new mongoose.Types.ObjectId(doctor_id) };

    // ✅ Filter ตามเดือนที่เลือก
    if (month) {
      const [year, monthIndex] = month.split("-").map(Number); // monthIndex เป็น 1-based (1=Jan)
      const startOfMonth = new Date(Date.UTC(year, monthIndex - 1, 1, 0, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(year, monthIndex, 0, 23, 59, 59, 999)); // วันที่ 0 ของเดือนถัดไปคือวันสุดท้ายของเดือนนี้
    
      query.createdAt = { $gte: startOfMonth, $lte: endOfMonth };
    }
    

    // ✅ ดึงข้อมูล feedback พร้อมข้อมูลคนไข้
    const feedbacks = await FeedbacksModel.find(query)
    .populate("user_id", "name surname")
    .lean();
  
  
    if (!feedbacks.length) {
      return res.status(StatusCodes.OK).json({
        message: "ไม่พบข้อมูลการประเมิน",
        feedbacks: [],
      });
    }

    // ✅ จัด format ข้อมูลให้นำไปใช้บน frontend ได้ง่าย
    const formatted = feedbacks.map((fb) => ({
      _id: fb._id,
      doctor_response: fb.doctor_response,
      feedback_type: fb.feedback_type,
      evaluation_date: fb.evaluation_date,
      createdAt: fb.createdAt,
      patient_details: fb.user_id
        ? {
            name: fb.user_id.name || fb.user_id.username || "ไม่พบชื่อ",
            surname: fb.user_id.surname || "ไม่พบชื่อ",
            fullName: `${fb.user_id.name || "ไม่พบชื่อ"} ${fb.user_id.surname || ""}`.trim(),
          }
        : null, // ถ้าไม่มี user_id ให้เป็น null
    }));
    

    console.log("📌 ข้อมูล feedbacks ที่จะส่งกลับไป frontend:", formatted);
    
    return res.status(StatusCodes.OK).json({ feedbacks: formatted });
    
  } catch (error) {
    console.error("❌ Error fetching feedbacks by doctor:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
};

