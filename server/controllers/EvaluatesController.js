import { StatusCodes } from "http-status-codes";
import Evaluation from "../models/EvaluatesModel.js";

export const getEvaluates = async (req, res) => {
    try {
        const evaluations = await Evaluation.find();

        if (!evaluations.length) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "ไม่พบข้อมูลที่ต้องการ" });
        }

        res.status(StatusCodes.OK).json(evaluations);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

export const getEvaluatesByUserIdAndDate = async (req, res) => {
    try {
        const { id } = req.params;

        const evaluations = await Evaluation.find({ userId: id });

        if (!evaluations.length) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "ไม่พบข้อมูลที่ต้องการ" });
        }

        res.status(StatusCodes.OK).json(evaluations);

    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};
