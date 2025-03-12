import mongoose from "mongoose";
import { flushSync } from "react-dom";

const feedbackSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    doctor_response: { type: String, required: true },
    feedback_type: {
      type: String,
      enum: ["ทำได้ดี", "ควรปรับปรุง"],
      required: true,
    },
    evaluation_date: { type: String, required: true },
    doctor_id: { type: mongoose.Types.ObjectId, required: false }, // เพิ่ม Doctor เข้าไป
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
    },
  },
  { versionKey: false, collection: "feedback", timestamps: true }
);

export default mongoose.models.feedback ||
  mongoose.model("feedback", feedbackSchema);
