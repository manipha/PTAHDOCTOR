import express from "express";
import { getDataCalendar } from "../controllers/MainController.js";

const router = express.Router();

router.route("/datacalendar/:id").get(getDataCalendar);

export default router;
