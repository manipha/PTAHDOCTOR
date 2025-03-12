import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    result: { type: Boolean, required: true },
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true }
});

const userAnswerSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    answers: { type: [answerSchema], required: true },
    created_at: { type: Date, default: Date.now }
}, {
    versionKey: false
}, { collection: 'answers' });

export default mongoose.models.answers || mongoose.model("answers", userAnswerSchema);
