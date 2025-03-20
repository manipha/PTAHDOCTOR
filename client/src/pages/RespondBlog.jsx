import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

// แก้ไข URL socket ตามจริง
// const socket = io(process.env.VITE_REACT_APP_SOCKET_URL, {
//   path: process.env.VITE_REACT_APP_SOCKET_PATH,
//   transports: ["websocket", "polling"]
// });

const socket = io(import.meta.env.VITE_REACT_APP_SOCKET_URL, {
   path: import.meta.env.VITE_REACT_APP_SOCKET_PATH,
   transports: ["websocket", "polling"]
 });


const RespondBlog = ({ currentUser }) => {
  const location = useLocation();
  const { post } = location.state || {};

  // State ของคอมเมนต์และ reply
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newReply, setNewReply] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  // ถ้าไม่มีข้อมูล post ส่งมาจริง ๆ
  if (!post) {
    return <p>ไม่พบข้อมูลกระทู้</p>;
  }

  // โหลดคอมเมนต์จาก Server + ตั้งค่า Socket
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await axios.get(`/api/v1/posts/${post._id}`);
        setComments(data.post.comments || []);
      } catch (error) {
        toast.error("ไม่สามารถโหลดความคิดเห็นได้");
      }
    };

    fetchComments();

    // ฟัง event "new-comment" จาก socket
    socket.on("new-comment", (updatedComments) => {
      setComments(updatedComments);
    });

    // ฟัง event "comment-deleted"
    socket.on("comment-deleted", ({ commentId }) => {
      setComments((prevComments) =>
        prevComments.filter((comment) => comment._id !== commentId)
      );
    });

    // ฟัง event "reply-deleted"
    socket.on("reply-deleted", ({ commentId, replyId }) => {
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? {
              ...comment,
              replies: comment.replies.filter((reply) => reply._id !== replyId),
            }
            : comment
        )
      );
    });

    // ลบการฟัง event เมื่อ component unmount
    return () => {
      socket.off("new-comment");
      socket.off("comment-deleted");
      socket.off("reply-deleted");
    };
  }, [post._id]);

  // ฟังก์ชันเพิ่มคอมเมนต์
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("กรุณาใส่ความคิดเห็น");
      return;
    }

    try {
      const { data } = await axios.put(
        `/api/v1/posts/comment/post/${post._id}`,
        { comment: newComment }
      );
      if (data.success) {
        setNewComment("");
        toast.success("เพิ่มความคิดเห็นสำเร็จ");
        setComments(data.post.comments);
        // แจ้ง socket ว่ามี comment ใหม่
        socket.emit("comment", data.post.comments);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเพิ่มความคิดเห็น");
    }
  };

  // ฟังก์ชันตอบกลับคอมเมนต์
  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    if (!newReply.trim()) {
      toast.error("กรุณาใส่คำตอบ");
      return;
    }

    try {
      const { data } = await axios.put(
        `/api/v1/posts/comment/reply/${post._id}/${commentId}`,
        { replyText: newReply }
      );
      if (data?.success) {
        // setNewReply("");
        setReplyTo(null);
        toast.success("ตอบกลับความคิดเห็นสำเร็จ");
        // setComments(data?.post?.comments);
        // แจ้ง socket ว่ามี reply ใหม่
        socket.emit("reply", data?.post?.comments);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการตอบกลับความคิดเห็น");
    }
  };

  // ฟังก์ชันลบคอมเมนต์
  const handleDeleteComment = async (commentId) => {
    try {
      const { data } = await axios.delete(
        `/api/v1/posts/comment/${post._id}/${commentId}`
      );
      if (data.success) {
        toast.success("ลบความคิดเห็นสำเร็จ");
        setComments((prevComments) =>
          prevComments.filter((comment) => comment._id !== commentId)
        );
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการลบความคิดเห็น");
    }
  };

  // ฟังก์ชันลบ reply
  const handleDeleteReply = async (commentId, replyId) => {
    try {
      const { data } = await axios.delete(
        `/api/v1/posts/reply/${post._id}/${commentId}/${replyId}`
      );

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? {
              ...comment,
              replies: comment.replies.filter((reply) => reply._id !== replyId),
            }
            : comment
        )
      );

      if (data.success) {
        toast.success("ลบคำตอบสำเร็จ");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการลบคำตอบ");
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8">
      {/* ส่วนแสดงเนื้อหากระทู้ */}
      <div className="border p-6 rounded-lg shadow-lg bg-white mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{post.title}</h2>
        <p className="text-gray-700 mb-6 text-justify">{post.content}</p>
        <p className="text-blue-700 mb-6">#{post.tag}</p>
        <div className="text-sm text-gray-500 mb-2 flex items-center">
          <span className="font-semibold">
            สร้างโดย :{" "}
            {post.postedBy
              ? post.postedBy.nametitle
                ? `${post.postedBy.nametitle} ${post.postedBy.name} ${post.postedBy.surname}`
                : `${post.postedBy.name} ${post.postedBy.surname}`
              : "ผู้โพสต์ไม่ทราบ"}
          </span>
          
        </div>
      </div>

      {/* ส่วนแสดงความคิดเห็นและการตอบกลับ */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">ความคิดเห็นทั้งหมด:</h3>
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="p-4 border rounded-lg bg-gray-50">
                {/* --------------------------
                    แก้ไขส่วน "ตอบกลับโดย" 
                    เพิ่ม fallback สำหรับ nametitle, name, surname
                -------------------------- */}
                <p className="font-medium text-gray-600">
                  ตอบกลับโดย:{" "}
                  {comment?.postedByPersonnel ? (
                    <>
                      {comment?.postedByPersonnel?.nametitle || ""}{" "}
                      {comment?.postedByPersonnel?.name || ""}{" "}
                      {comment?.postedByPersonnel?.surname || ""}
                    </>
                  ) : comment?.postedByUser ? (
                    <>
                      {comment?.postedByUser?.name || ""}{" "}
                      {comment?.postedByUser?.surname || ""}
                    </>
                  ) : (
                    "ผู้ใช้"
                  )}
                </p>

                <p className="text-gray-700 mt-2">{comment.text}</p>
                <p className="text-xs text-gray-500 mt-6">
                ตอบกลับเมื่อ: {new Date(comment.created).toLocaleString("th-TH")}
    </p>

                {/* ปุ่ม "ตอบกลับ" และฟอร์มตอบกลับ */}
                <div className="mt-4">
                  {replyTo == comment._id ? (
                    <form onSubmit={(e) => handleReplySubmit(e, comment._id)}>
                      <textarea
                        className="w-full p-3 border rounded-lg"
                        placeholder="พิมพ์คำตอบ..."
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2"
                      >
                        ส่งคำตอบ
                      </button>
                    </form>
                  ) : (
                    <button
                      className="text-blue-500 text-sm mr-2"
                      onClick={() => setReplyTo(comment._id)}
                    >
                      ตอบกลับ
                    </button>
                  )}

                  {/* ปุ่มลบคอมเมนต์ (ตัวอย่าง) */}
                  {currentUser === comment.postedByUser?._id && (
                    <button
                      className="text-red-500 text-sm"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      ลบความคิดเห็น
                    </button>
                  )}
                </div>

                {/* แสดง replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 ml-6 border-l-2 pl-4">
                    {comment.replies.map((reply) => (
                      <div key={reply._id} className="mb-2">
                        {/* --------------------------
                            แก้ไขส่วน "ตอบโดย"
                            เพิ่ม fallback เช่นกัน
                        -------------------------- */}
                        <p className="text-gray-600 text-sm">
                          ↪ ตอบโดย:{" "}
                          {reply.postedByPersonnel ? (
                            <>
                              {reply.postedByPersonnel.nametitle || ""}{" "}
                              {reply.postedByPersonnel.name || ""}{" "}
                              {reply.postedByPersonnel.surname || ""}
                            </>
                          ) : reply.postedByUser ? (
                            <>
                              {reply.postedByUser.name || ""}{" "}
                              {reply.postedByUser.surname || ""}
                            </>
                          ) : (
                            "ผู้ใช้"
                          )}
                        </p>
                        <p className="text-gray-700 text-sm">{reply.text}</p>
                        <p className="text-xs text-gray-500 mt-6">
              ตอบกลับเมื่อ: {new Date(reply.created).toLocaleString("th-TH")}
            </p>
                        

                        {/* ปุ่มลบ reply (เฉพาะเจ้าของ) */}
                        {currentUser === reply.postedByUser?._id && (
                          <button
                            className="text-red-500 text-xs"
                            onClick={() =>
                              handleDeleteReply(comment._id, reply._id)
                            }
                          >
                            ลบการตอบกลับ
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">ยังไม่มีความคิดเห็น</p>
        )}
      </div>

      {/* ฟอร์มเพิ่มความคิดเห็นใหม่ */}
      <form onSubmit={handleCommentSubmit}>
        <textarea
          className="w-full p-3 border rounded-lg"
          placeholder="พิมพ์ความคิดเห็น..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          ส่งความคิดเห็น
        </button>
      </form>
    </div>
  );
};

export default RespondBlog;
