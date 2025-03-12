import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import Post from "../models/PostModel.js";
import { verifyJWT } from "../utils/tokenUtils.js"; // ฟังก์ชันตรวจสอบ JWT token
import { PREFIXDOCTOR } from "../utils/constants.js"; // นำเข้า PREFIXDOCTOR
import Doctor from "../models/DoctorModel.js"; // Import Doctor model

// Get all posts
export const getAllPost = async (req, res) => {
  const { search, sort, isDeleted } = req.query;

  const queryObject = {};
  if (typeof isDeleted !== "undefined") {
    queryObject.isDeleted = isDeleted === "true";
  } else {
    queryObject.isDeleted = { $nin: [true] };
  }

  if (search) {
    queryObject.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  const sortOptions = {
    ใหม่ที่สุด: "-createdAt",
    เก่าที่สุด: "createdAt",
    "เรียงจาก ก-ฮ": "title",
    "เรียงจาก ฮ-ก": "-title",
  };

  const sortKey = sortOptions[sort] || sortOptions["ใหม่ที่สุด"];
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // ดึงโพสต์ทั้งหมดพร้อม populate ชื่อผู้โพสต์
    const posts = await Post.find(queryObject)
      .populate("postedBy", "name surname") // populate ชื่อผู้โพสต์โพสต์
      .populate("comments.postedByUser", "name surname") // populate ชื่อผู้โพสต์ความคิดเห็น (ถ้าเป็น Patient)
      .populate("comments.postedByPersonnel", "nametitle name surname") // populate ชื่อผู้โพสต์ความคิดเห็น (ถ้าเป็น Doctor)
      .populate("comments.replies.postedByUser", "name surname") // populate ชื่อผู้ตอบกลับ (ถ้าเป็น Patient)
      .populate("comments.replies.postedByPersonnel", "nametitle name surname") // populate ชื่อผู้ตอบกลับ (ถ้าเป็น Doctor)
      .sort(sortKey)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPosts = await Post.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalPosts / limit);

    res
      .status(StatusCodes.OK)
      .json({ totalPosts, numOfPages, currentPage: page, posts });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

// Get a single post
export const getPost = async (req, res) => {
  try {
    const postId = req.params._id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid ID format" });
    }

    // ค้นหาโพสต์ตาม ID และ populate ชื่อผู้โพสต์ความคิดเห็นและผู้ตอบกลับ
    const post = await Post.findById(postId)
      .populate("postedBy", "name surname") // populate ชื่อผู้โพสต์โพสต์
      .populate("comments.postedByUser", "name surname") // populate ชื่อผู้โพสต์ความคิดเห็น (ถ้าเป็น Patient)
      .populate("comments.postedByPersonnel", "nametitle name surname") // populate ชื่อผู้โพสต์ความคิดเห็น (ถ้าเป็น Doctor)
      .populate("comments.replies.postedByUser", "name surname") // populate ชื่อผู้ตอบกลับ (ถ้าเป็น Patient)
      .populate("comments.replies.postedByPersonnel", "nametitle name surname"); // populate ชื่อผู้ตอบกลับ (ถ้าเป็น Doctor)

    if (!post) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `No post with id: ${postId}` });
    }

    res.status(StatusCodes.OK).json({ success: true, post });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: error.message });
  }
};

// Create a new post
export const createPost = async (req, res) => {
  const { title, content, tag, postedBy } = req.body;

  if (!postedBy) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "PostedBy is required" });
  }

  try {
    const newPost = await Post.create({ title, content, tag, postedBy });
    res.status(StatusCodes.CREATED).json({ post: newPost });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

// Add a comment to a post

// Add a comment to a post
export const addComment = async (req, res) => {
  const { comment } = req.body;
  const { _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "โพสต์ไม่ถูกต้อง" });
  }

  if (!comment || comment.trim() === "" || comment === ".") {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "ต้องใส่ข้อความความคิดเห็นที่ถูกต้อง" });
  }

  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication token is required" });
  }

  try {
    const decoded = verifyJWT(token); // ตรวจสอบ token ว่า valid หรือไม่
    console.log("Decoded Token:", decoded); // ดูว่า decoded มีค่าอย่างไร
    console.log(
      "User ID from decoded token:",
      decoded?.userId,
      "Doctor ID:",
      decoded?.doctorId
    ); // ตรวจสอบค่าของ userId และ doctorId

    let userId = decoded?.userId || decoded?.doctorId;
    let role = decoded?.role;

    // ตรวจสอบว่า decoded มีข้อมูลตามที่คาดหวังหรือไม่
    if (!userId || !role) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Role or User ID is missing in token" });
    }

    // ตรวจสอบ role ว่าถ้าเป็นคำนำหน้าหมอให้ปรับเป็น "doctor"
    if (Object.values(PREFIXDOCTOR).includes(role)) {
      role = "doctor"; // ถ้า role เป็นคำนำหน้าหมอให้ตั้งเป็น "doctor"
    } else if (role === "ผู้ป่วย") {
      role = "patient";
    }

    console.log("Updated Role:", role); // เพิ่ม log ตรวจสอบค่าของ role

    const post = await Post.findById(_id);
    if (!post) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "ไม่พบโพสต์นี้" });
    }

    let newComment = {
      text: comment,
      postedByPersonnel: role === "doctor" ? userId : null,
      postedByUser: role === "patient" ? userId : null,
    };

    console.log("New Comment before save:", newComment); // ตรวจสอบค่าของ newComment

    post.comments.push(newComment);
    await post.save();

    const updatedPost = await Post.findById(_id)
      .populate("comments.postedByPersonnel", "nametitle name surname")
      .populate("comments.postedByUser", "name surname");

    console.log("Updated Post after adding comment:", updatedPost); // ดูค่าโพสต์ที่อัปเดต

    res.status(StatusCodes.OK).json({ success: true, post: updatedPost });
  } catch (error) {
    console.error("Error adding comment:", error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const addReply = async (req, res) => {
  const { replyText } = req.body;
  const { postId, commentId } = req.params;

  // ตรวจสอบความถูกต้องของ postId และ commentId
  if (
    !mongoose.Types.ObjectId.isValid(postId) ||
    !mongoose.Types.ObjectId.isValid(commentId)
  ) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "โพสต์หรือความคิดเห็นไม่ถูกต้อง" });
  }

  // ตรวจสอบข้อความตอบกลับ
  if (!replyText || replyText.trim() === "") {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "ต้องใส่ข้อความการตอบกลับ" });
  }

  try {
    // หาโพสต์
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "ไม่พบโพสต์นี้" });
    }

    // หาความคิดเห็นที่ต้องการตอบกลับ
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "ไม่พบความคิดเห็นนี้" });
    }

    // ตรวจสอบสิทธิ์: ตรวจสอบว่า userId ใน token กับข้อมูลในฐานข้อมูลตรงกันหรือไม่
    if (!req.user || (!req.user.userId && !req.user.doctorId)) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "คุณไม่มีสิทธิ์ในการตอบกลับ" });
    }

    // ตรวจสอบว่าเป็นแพทย์หรือผู้ป่วย
    const replyData = {
      text: replyText,
    };

    // ถ้าเป็นแพทย์
    if (req.user.doctorId) {
      replyData.postedByPersonnel = req.user.doctorId; // แปลงเป็น ObjectId อย่างชัดเจน
      // สำหรับแพทย์ เราจะไม่เก็บ postedByUser ตามที่กำหนดใน requirement
    } else if (req.user.userId) {
      // เปลี่ยนเป็น else if เพื่อป้องกันการเก็บ postedByUser เมื่อเป็นแพทย์
      replyData.postedByUser = req.user.userId; // ใช้ userId สำหรับผู้ป่วย
    }

    // เพิ่มคำตอบในความคิดเห็น
    comment.replies.push(replyData);

    // บันทึกโพสต์
    await post.save();

    // โหลดโพสต์พร้อมกับการตอบกลับและผู้ตอบกลับ
    const updatedPost = await Post.findById(postId)
      .populate("comments.replies.postedByUser", "name surname")
      .populate("comments.replies.postedByPersonnel", "nametitle name surname");

    // ส่งข้อมูลกลับ
    res.status(StatusCodes.OK).json({ success: true, post: updatedPost });
  } catch (error) {
    console.error("Error adding reply:", error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "โพสต์หรือความคิดเห็นไม่ถูกต้อง" });
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "ไม่พบโพสต์นี้" });
    }

    const commentIndex = post.comments.findIndex((comment) => comment._id.toString() === commentId);

    if (commentIndex === -1) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "ไม่พบความคิดเห็นนี้" });
    }

    // ตรวจสอบสิทธิ์ว่าเป็นเจ้าของความคิดเห็นหรือไม่
    const comment = post.comments[commentIndex];
    if (
      !req.user ||
      (comment.postedByUser && comment.postedByUser.toString() !== req.user.userId) &&
      (comment.postedByPersonnel && comment.postedByPersonnel.toString() !== req.user.doctorId)
    ) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "คุณไม่มีสิทธิ์ในการลบความคิดเห็นนี้" });
    }

    // ลบความคิดเห็น
    post.comments.splice(commentIndex, 1);
    await post.save();

    res.status(StatusCodes.OK).json({ success: true, message: "ลบความคิดเห็นสำเร็จ" });
  } catch (error) {
    console.error("Error deleting comment:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Delete a reply
export const deleteReply = async (req, res) => {
  const { postId, commentId, replyId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(replyId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "ไม่พบโพสต์, ความคิดเห็น หรือการตอบกลับที่ถูกต้อง" });
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "ไม่พบโพสต์นี้" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "ไม่พบความคิดเห็นนี้" });
    }

    const replyIndex = comment.replies.findIndex((reply) => reply._id.toString() === replyId);

    if (replyIndex === -1) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "ไม่พบการตอบกลับนี้" });
    }

    const reply = comment.replies[replyIndex];
    // ตรวจสอบสิทธิ์ว่าเป็นเจ้าของการตอบกลับหรือไม่
    if (
      !req.user ||
      (reply.postedByUser && reply.postedByUser.toString() !== req.user.userId) &&
      (reply.postedByPersonnel && reply.postedByPersonnel.toString() !== req.user.doctorId)
    ) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "คุณไม่มีสิทธิ์ในการลบการตอบกลับนี้" });
    }

    // ลบการตอบกลับ
    comment.replies.splice(replyIndex, 1);
    await post.save();

    res.status(StatusCodes.OK).json({ success: true, message: "ลบการตอบกลับสำเร็จ" });
  } catch (error) {
    console.error("Error deleting reply:", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};
