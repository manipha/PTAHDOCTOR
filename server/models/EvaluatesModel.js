import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    result: { type: String, required: true },
}, { _id: true }); // ใช้ `_id` อัตโนมัติสำหรับ answers

const evaluationSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        missionId: { type: String, required: true },
        suggestion: { type: String, default: "" },
        timeSpent: { type: String, required: true },
        answers: [AnswerSchema], // เชื่อมโยง answers
        created_at: { type: Date, default: Date.now },
    },
    { versionKey: false, collection: "evaluates" }
);

export default mongoose.models.evaluates || mongoose.model("evaluates", evaluationSchema);
