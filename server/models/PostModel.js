import mongoose from "mongoose";

// Reply Schema
const replySchema = new mongoose.Schema({
  text: { type: String, required: true },
  created: { type: Date, default: Date.now },
  postedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }, // อ้างอิงถึง Patient
  postedByPersonnel: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }, // อ้างอิงถึง Doctor
});

// Comment Schema
const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  created: { type: Date, default: Date.now },
  postedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient'}, // อ้างอิงถึง Patient
  postedByPersonnel: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }, // อ้างอิงถึง Doctor
  replies: [replySchema],
});
  
  
const postSchema = new mongoose.Schema(
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
        tag: { type: String, required: true },
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
        comments: [commentSchema],
        isDeleted: { type: Boolean, default: false },
      },
      { timestamps: true }
    );

export default mongoose.model("Post", postSchema);

