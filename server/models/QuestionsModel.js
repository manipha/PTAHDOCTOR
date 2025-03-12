import mongoose from "mongoose";

const choiceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    result: { type: Boolean, required: true },
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true }
});

const questionsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    choice: { type: [choiceSchema], required: true },
    created_at: { type: Date, default: Date.now },
}, {
    versionKey: false
}, { collection: 'questions' });
export default mongoose.model("Questions", questionsSchema);
