import express from "express";
import { getEvaluates, getEvaluatesByUserIdAndDate } from "../controllers/EvaluatesController.js";


const router = express.Router();

router.route("/").get(getEvaluates);
router.route("/:id").get(getEvaluatesByUserIdAndDate).post(getEvaluatesByUserIdAndDate);

export default router;
