import express from "express";
import { getFeedbackByDateAndId, save } from "../controllers/FeedbacksController.js";


const router = express.Router();

router.route("/getfeedbackbydateandid").post(getFeedbackByDateAndId);
router.route("/save").post(save);

export default router;
