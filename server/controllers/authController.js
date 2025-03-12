// authController.js
import { StatusCodes } from "http-status-codes";
import Doctor from "../models/DoctorModel.js";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import { UnauthenticatedError } from "../errors/customError.js";
import { createJWT , verifyJWT } from "../utils/tokenUtils.js";
import { sendEmail } from "../services/mailer.js"; // Correct the import statement

export const register = async (req, res) => {
  const hashedPassword = await hashPassword(req.body.password);
  req.body.password = hashedPassword;

  const doctor = await Doctor.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: "doctor created" });
};

// export const login = async (req, res) => {
//   const doctor = await Doctor.findOne({ username: req.body.username });

//   const isValidUser =
//     doctor && (await comparePassword(req.body.password, doctor.password));

//   if (!isValidUser) throw new UnauthenticatedError("ไม่สามารถเข้าสู่ระบบได้");

//   // const token = createJWT({ doctorId: doctor._id, role: doctor.role });
//   const token = createJWT({ doctorId: doctor._id, role: doctor.nametitle });

//   const oneDay = 1000 * 60 * 60 * 24;

//   res.cookie("token", token, {
//     httpOnly: true,
//     expires: new Date(Date.now() + oneDay),
//     secure: process.env.NODE_ENV === "production",
//   });

//   res.status(StatusCodes.CREATED).json({ msg: "doctor logged in" });
// };

export const login = async (req, res) => {
  console.log("Login request received:", req.body);

  const doctor = await Doctor.findOne({ username: req.body.username });
  if (!doctor) {
    console.log("Doctor not found");
    throw new UnauthenticatedError("ไม่สามารถเข้าสู่ระบบได้");
  }

  const isValidUser = await comparePassword(req.body.password, doctor.password);
  if (!isValidUser) {
    console.log("Invalid password");
    throw new UnauthenticatedError("ไม่สามารถเข้าสู่ระบบได้");
  }

  const token = createJWT({ doctorId: doctor._id, role: doctor.nametitle });
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    secure: process.env.NODE_ENV === "production",
  });

  console.log("Doctor details:", doctor);
  res.status(StatusCodes.OK).json({
    msg: "เข้าสู่ระบบสำเร็จ",
    _id: doctor._id, // เพิ่ม ID
  });

  // res.status(StatusCodes.OK).json({ msg: "เข้าสู่ระบบสำเร็จ" });
};

export const logout = (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "doctor logged out!" });
};

// รีเซ็ตรหัสผ่านโดยการส่งลิงก์รีเซ็นไปทาง Email

// รีเซ็ตรหัสผ่านโดยการส่งลิงก์รีเซ็นไปทาง Email
export const resetPassword = async (req, res) => {
  const { email } = req.body;
  const doctor = await Doctor.findOne({ email });

  if (!doctor) {
    throw new UnauthenticatedError("ไม่พบอีเมลนี้ในระบบ");
  }

  // Generate a reset token (you can use JWT or any other method)
  const resetToken = createJWT({ doctorId: doctor._id, role: doctor.nametitle });

  // Send reset email
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendEmail(
    "pharadonsiriforwork@gmail.com", 
    "การรีเซ็ตรหัสผ่าน", 
    `คลิกที่ลิงค์เพื่อรีเซ็ตรหัสผ่านของคุณ: ${resetLink}`, 
    `<p>คลิกที่ลิงค์เพื่อรีเซ็ตรหัสผ่านของคุณ: <a href="${resetLink}">${resetLink}</a></p>`
  );
  
  // await sendEmail(email, "Password Reset", `Click the link to reset your password: ${resetLink}`, `<p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`);

  res.status(StatusCodes.OK).json({ msg: "Password reset email sent" });
};


// ฟังก์ชันสำหรับการตั้งรหัสผ่านใหม่
export const setNewPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const payload = verifyJWT(token);
    const doctor = await Doctor.findById(payload.doctorId);

    if (!doctor) {
      throw new UnauthenticatedError("ไม่พบผู้ใช้");
    }

    const hashedPassword = await hashPassword(newPassword);
    doctor.password = hashedPassword;
    await doctor.save();

    res.status(StatusCodes.OK).json({ msg: "Password has been reset" });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Invalid or expired token" });
  }
};