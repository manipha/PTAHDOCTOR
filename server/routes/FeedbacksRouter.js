import express from "express";
import { getFeedbackByDateAndId, save , getFeedbacksByDoctorId} from "../controllers/FeedbacksController.js";


const router = express.Router();

router.route("/getfeedbackbydateandid").post(getFeedbackByDateAndId);
router.route("/save").post(save);
router.get("/doctor-feedbacks", getFeedbacksByDoctorId); // ✅ API ดึง Feedbacks ของแพทย์ที่ล็อกอิน


export default router;
