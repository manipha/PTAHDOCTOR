import mongoose from "mongoose";
import { TYPEPOSTURES, CHOOSEPOSTURES, TYPESTATUS, GENDER, } from "../utils/constants.js";

const PatientSchema = new mongoose.Schema(
  {
    idPatient: String,
    idNumber: String,
    namePatient: String,
    userGender: { type: String, enum: Object.values(GENDER), default: GENDER.GENDER_01, },
    userType: { type: String, enum: Object.values(TYPEPOSTURES), default: TYPEPOSTURES.TYPE_1, },
    userPosts: String,
    userStatus: { type: String, enum: Object.values(TYPESTATUS), default: TYPESTATUS.TYPE_ST1, },
    createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
    username: { type: String, required: true, unique: true },
    tel: { type: String, required: true },
    surname: { type: String, required: true },
    gender: { type: String, enum: ["ชาย", "หญิง", "อื่นๆ"], required: true },
    birthday: { type: Date, required: true },
    ID_card_number: { type: String, required: true, unique: true },
    nationality: { type: String, required: true },
    Address: { type: String, required: true },
    deletedAt: { type: Date, default: null },
    physicalTherapy: { type: Boolean, default: true },
    stars: { type: Number, default: 0 },
    lastStarredAt: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
    AdddataFirst: { type: Boolean, default: false },
  },
  { collection: "User", timestamps: true }
);

export default mongoose.model("Patient", PatientSchema);
