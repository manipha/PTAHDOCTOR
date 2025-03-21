import express from "express";
import { getFeedbackByDateAndId, save , getFeedbacksByDoctorId} from "../controllers/FeedbacksController.js";


const router = express.Router();

router.route("/getfeedbackbydateandid").post(getFeedbackByDateAndId);
router.route("/save").post(save);

router.route("/doctor-feedbacks")
    .get(getFeedbacksByDoctorId);

export default router;
