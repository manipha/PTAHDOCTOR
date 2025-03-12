import express from "express";
import { getAllQuestions } from "../controllers/QuestionsController.js";

const router = express.Router();

router.route("/").get(getAllQuestions);

export default router;
