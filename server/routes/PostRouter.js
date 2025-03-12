import express from "express";
import { authenticateUser } from "../middleware/authMiddleware.js"; // นำเข้า middleware สำหรับการตรวจสอบการเข้าสู่ระบบ
import {
  getAllPost,
  createPost,
  getPost,
  addComment,
  addReply,
  deleteComment,
  deleteReply
} from "../controllers/PostController.js";

const router = express.Router();

// ใช้ middleware authenticateUser กับ route ที่ต้องการตรวจสอบการเข้าสู่ระบบ
router.route("/").get(getAllPost).post(createPost);
router.route("/:_id").get(getPost);

// ใช้ authenticateUser ในการตรวจสอบการเข้าสู่ระบบก่อนเข้าใช้ addComment
router.put("/comment/post/:_id", authenticateUser, addComment);
router.put("/comment/reply/:postId/:commentId", authenticateUser, addReply);

// Route สำหรับลบความคิดเห็นและการตอบกลับที่เป็นของตนเอง
router.delete("/comment/:postId/:commentId", authenticateUser, deleteComment);
router.delete("/reply/:postId/:commentId/:replyId", authenticateUser, deleteReply);


export default router;
