import { StatusCodes } from "http-status-codes";
import Answers from "../models/AnswersModel.js";


export const getAnswersByUserId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Answers.find({ userId: `${id}` });
        res.status(StatusCodes.OK).json(result);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};