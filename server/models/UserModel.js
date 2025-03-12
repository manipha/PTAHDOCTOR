import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  // isDeleted: { type: Boolean, default: false, },
  // username: { type: String, required: true, unique: true },
  // tel: { type: String, required: true },
  // surname: { type: String, required: true },
  // gender: { type: String, enum: ['ชาย', 'หญิง', 'อื่นๆ'], required: true },
  // birthday: { type: Date, required: true },
  // ID_card_number: { type: String, required: true, unique: true },
  // nationality: { type: String, required: true },
  // Address: { type: String, required: true },
  // deletedAt: { type: Date, default: null },
  // physicalTherapy: { type: Boolean, default: true },
  // stars: { type: Number, default: 0 },
  // lastStarredAt: { type: Date },
  // isEmailVerified: { type: Boolean, default: false },
  // AdddataFirst: { type: Boolean, default: false }
}, { collection: 'User' });

UserSchema.methods.toJSON = function () { var obj = this.toObject(); delete obj.password; return obj; };

export default mongoose.model("User", UserSchema);