import { StatusCodes } from "http-status-codes";
import Doctor from "../models/DoctorModel.js";
import { NotFoundError } from "../errors/customError.js";

// export const getAllDoctor = async (req, res) => {
//   const doctors = await Doctor.find({});
//   res.status(StatusCodes.OK).json({ doctors });
// };

export const getAllDoctor = async (req, res) => {
  const { search, nametitle, sort, isDeleted } = req.query;
  console.log(isDeleted);

  const queryObject = {};
  if (typeof isDeleted !== "undefined") {
    queryObject.isDeleted = isDeleted === "true";
  } else {
    queryObject.isDeleted = { $nin: [true] };
  }
  if (search) {
    queryObject.$or = [{ name: { $regex: search, $options: "i" } }];
    queryObject.$or = [{ surname: { $regex: search, $options: "i" } }];
  }

  if (nametitle && nametitle !== "all") {
    queryObject.nametitle = nametitle;
  }

  const sortOptions = {
    ใหม่ที่สุด: "-createdAt",
    เก่าที่สุด: "createdAt",
    "a-z": "-name",
    "z-a": "name",
  };

  const sortKey = sortOptions[sort] || sortOptions.newest;

  // แบ่งหน้า

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const doctors = await Doctor.find(queryObject)
    .sort(sortKey)
    .skip(skip)
    .limit(limit); // ลบ { createdBy: req.user.userId } เพื่อค้นหาข้อมูลทั้งหมด
  const totalDoctors = await Doctor.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalDoctors / limit);
  res
    .status(StatusCodes.OK)
    .json({ totalDoctors, numOfPages, currentPage: page, doctors });
};

export const createDoctor = async (req, res) => {
  const { username } = req.body;

  const existingDoctor = await Doctor.findOne({ username });
  if (existingDoctor) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "username already exists" });
  }
  // If username does not exist, proceed to create new doctor
  req.body.createdBy = req.user.userId;
  const doctoruser = await Doctor.create(req.body);
  res.status(StatusCodes.CREATED).json({ doctoruser });
};

export const getDoctor = async (req, res) => {
  const doctor = await Doctor.findById(req.params._id);
  if (!doctor) throw new NotFoundError(`no doctor with id : ${_id}`);
  res.status(StatusCodes.OK).json({ doctor });
};

export const updateDoctor = async (req, res) => {
  const updatedDoctor = await Doctor.findByIdAndUpdate(
    req.params._id,
    req.body,
    {
      new: true,
    }
  );

  if (!updatedDoctor)
    throw new NotFoundError(`no doctor with id : ${req.params._id}`);

  res.status(StatusCodes.OK).json({ doctor: updatedDoctor });
};

// export const deleteDoctor = async (req, res) => {
//   const removedDoctor = await Doctor.findByIdAndDelete(req.params._id);

//   if (!removedDoctor) throw new NotFoundError(`no doctor with id : ${_id}`);
//   res.status(StatusCodes.OK).json({ doctor: removedDoctor });
// };

export const deleteDoctor = async (req, res) => {
  const { _id } = req.params;

  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      _id,
      { isDeleted: true },
      { new: true }
    );

    if (!updatedDoctor) {
      throw new NotFoundError(`no doctor with id : ${_id}`);
    }

    res.status(StatusCodes.OK).json({ doctor: updatedDoctor });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

export const getCurrentDoctor = async (req, res) => {
  try {
    const doctorId = req.user.doctorId;
    if (!doctorId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Not a doctor" });
    }
    const doctor = await Doctor.findById(doctorId).select("nametitle name surname");
    if (!doctor) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Doctor not found" });
    }
    res.status(StatusCodes.OK).json({ doctor });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};
