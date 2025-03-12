import { StatusCodes } from "http-status-codes";
import Questions from "../models/QuestionsModel.js";


export const getAllQuestions = async (req, res) => {
    try {
        const users = await Questions.find();
        res.status(StatusCodes.OK).json(users);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};