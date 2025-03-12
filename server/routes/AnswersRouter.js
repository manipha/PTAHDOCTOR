import express from "express";
import { getAnswersByUserId } from "../controllers/AnswersController.js";

const router = express.Router();

router.route("/:id").get(getAnswersByUserId);

export default router;
