import Patient from "../models/PatientModel.js";
import Evaluation from "../models/EvaluatesModel.js";
import FeedbacksModel from "../models/FeedbacksModel.js";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import day from "dayjs";

export const getAllPatients = async (req, res) => {
  const { search, userStatus, userType, sort, isDeleted } = req.query;

  const today = day().startOf("day").toDate();

  const queryObject = {};

  if (typeof isDeleted !== "undefined") {
    queryObject.isDeleted = isDeleted === "true";
  } else {
    queryObject.isDeleted = { $nin: [true] };
  }

  queryObject.physicalTherapy = true;

  if (search) {
    queryObject.$or = [
      { username: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
      { surname: { $regex: search, $options: "i" } },
    ];
  }

  if (userStatus === "คนไข้ที่ขาดการทำกายภาพบำบัด") {
    try {
      const allPatients = await Patient.find(queryObject).select(
        "_id name surname username"
      );

      const evaluates = await Evaluation.aggregate([
        {
          $match: {
            userId: { $in: allPatients.map((p) => p._id.toString()) },
          },
        },
        {
          $group: {
            _id: "$userId",
            lastEvaluate: { $max: "$created_at" },
          },
        },
      ]);

      const evaluateMap = evaluates.reduce((acc, ev) => {
        acc[ev._id] = ev.lastEvaluate;
        return acc;
      }, {});

      const filteredPatients = allPatients.filter((patient) => {
        const lastEvaluate = evaluateMap[patient._id.toString()];
        if (!lastEvaluate) return true;
        const daysSinceLastEvaluate =
          (today - lastEvaluate) / (1000 * 60 * 60 * 24);
        return daysSinceLastEvaluate >= 3;
      });

      return res.status(StatusCodes.OK).json({
        totalPatients: filteredPatients.length,
        numOfPages: 1,
        currentPage: 1,
        allusers: filteredPatients,
      });
    } catch (error) {
      console.error("❌ Error fetching evaluates:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
  }

  if (userStatus === "คนไข้ที่ยังไม่ได้ประเมินวันนี้") {
    try {
      const evaluationsToday = await Evaluation.find({
        created_at: {
          $gte: day().startOf("day").toDate(),
          $lt: day().endOf("day").toDate(),
        },
      }).select("userId");

      const userIdsEvaluatedToday = evaluationsToday.map((e) =>
        e.userId.toString()
      );

      const feedbacks = await FeedbacksModel.find({
        user_id: { $in: userIdsEvaluatedToday },
        evaluation_date: { $eq: day().format("YYYY-MM-DD") },
      }).select("user_id");

      const usersWithFeedback = new Set(
        feedbacks.map((f) => f.user_id.toString())
      );

      const patientsWithoutFeedback = await Patient.find({
        _id: {
          $in: userIdsEvaluatedToday,
          $nin: Array.from(usersWithFeedback),
        },
      }).select("_id name surname username");

      return res.status(StatusCodes.OK).json({
        totalPatients: patientsWithoutFeedback.length,
        numOfPages: 1,
        currentPage: 1,
        allusers: patientsWithoutFeedback,
      });
    } catch (error) {
      console.error("❌ Error fetching feedback data:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
    }
  }

  if (userStatus && userStatus !== "คนไข้ทั้งหมด") {
    queryObject.userStatus = userStatus;
  }

  if (userType && userType !== "all") {
    queryObject.userType = userType;
  }

  const sortOptions = {
    ใหม่ที่สุด: "-createdAt",
    เก่าที่สุด: "createdAt",
    "เรียงจาก ก-ฮ": "-name",
    "เรียงจาก ฮ-ก": "name",
  };

  const sortKey = sortOptions[sort] || sortOptions.ใหม่ที่สุด;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const allusers = await Patient.find(queryObject)
    .sort(sortKey)
    .skip(skip)
    .limit(limit);

  const totalPatients = await Patient.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalPatients / limit);

  res
    .status(StatusCodes.OK)
    .json({ totalPatients, numOfPages, currentPage: page, allusers });
};

// export const createPatient = async (req, res) => {
//   // Extract username from request body
//   const { _id } = req.body;

//   // Check if username already exists in the database
//   const existingPatient = await Patient.findOne({ _id });
//   if (existingPatient) {
//     return res
//       .status(StatusCodes.BAD_REQUEST)
//       .json({ message: "username already exists" });
//   }

//   // If username does not exist, proceed to create new patient
//   req.body.createdBy = req.user.userId;
//   const patientuser = await Patient.create(req.body);
//   res.status(StatusCodes.CREATED).json({ patientuser });
// };

export const createPatient = async (req, res) => {
  try {
    const { _id, username, name, email } = req.body;

    console.log("Request body:", req.body);

    if (!_id || !username || !name || !email) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Missing required fields" });
    }

    const existingPatient = await Patient.findOne({ _id });
    if (existingPatient) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Patient with this ID already exists" });
    }

    req.body.createdBy = req.user?.userId || "unknown"; // Handle missing userId
    const patientuser = await Patient.create(req.body);
    res.status(StatusCodes.CREATED).json({ patientuser });
  } catch (error) {
    console.error("Error in createPatient:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getPatient = async (req, res) => {
  const patient = await Patient.findById(req.params._id);
  if (!patient) throw new NotFoundError(`no patient with id : ${username}`);
  res.status(StatusCodes.OK).json({ patient });
};

export const updatePatient = async (req, res) => {
  const updatedPatients = await Patient.findByIdAndUpdate(
    req.params._id,
    req.body,
    {
      new: true,
    }
  );

  if (!updatedPatients)
    throw new NotFoundError(`no patient with id : ${req.params._id}`);

  res.status(StatusCodes.OK).json({ patient: updatedPatients });
};

// export const deletePatient = async (req, res) => {
//   const removedPatient = await Patient.findByIdAndDelete(req.params._id);

//   if (!removedPatient)
//     throw new NotFoundError(`no patient with id : ${username}`);
//   res.status(StatusCodes.OK).json({ patient: removedPatient });
// };

export const deletePatient = async (req, res) => {
  const { _id } = req.params;

  try {
    const updatedPatients = await Patient.findByIdAndUpdate(
      _id,
      { isDeleted: true },
      { new: true }
    );

    if (!updatedPatients) {
      throw new NotFoundError(`no Patient with id : ${_id}`);
    }

    res.status(StatusCodes.OK).json({ Patient: updatedPatients });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

export const showStats = async (req, res) => {
  try {
    let stats = await Patient.aggregate([
      { $match: { physicalTherapy: true, isDeleted: { $nin: [true] } } },
      { $group: { _id: "$userStatus", count: { $sum: 1 } } },
    ]);

    stats = stats.reduce((acc, curr) => {
      const { _id: title, count } = curr;
      acc[title] = count;
      return acc;
    }, {});

    const patientsWithEvaluation = await Evaluation.distinct("userId");

    const totalphysicalTherapyPatients = await Patient.countDocuments({
      _id: { $in: patientsWithEvaluation },
      physicalTherapy: true,
      isDeleted: { $nin: [true] },
    });

    const totalNonPhysicalTherapyPatients = await Patient.countDocuments({
      _id: { $nin: patientsWithEvaluation },
      physicalTherapy: true,
      isDeleted: { $nin: [true] },
    });

    const totalPatients =
      totalphysicalTherapyPatients + totalNonPhysicalTherapyPatients;

    const defaultStats = {
      กำลังรักษา: stats.กำลังรักษาอยู่ || 0,
      จบการรักษา: stats.จบการรักษา || 0,
      ผู้ป่วยทั้งหมด: totalPatients || 0,
      ผู้ป่วยที่ทำกายภาพบำบัด: totalphysicalTherapyPatients || 0,
      ผู้ป่วยที่ยังไม่ทำกายภาพบำบัด: totalNonPhysicalTherapyPatients || 0,
    };

    let monthlyApplications = await Patient.aggregate([
      { $match: { physicalTherapy: true } }, // ✅ กรองเฉพาะคนที่ทำกายภาพบำบัด
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
    ]);

    monthlyApplications = monthlyApplications
      .map(({ _id: { year, month }, count }) => ({
        date: day()
          .month(month - 1)
          .year(year)
          .format("MMM YYYY"),
        count,
      }))
      .reverse();

    let monthlyApplications2 = await Patient.aggregate([
      { $match: { physicalTherapy: true, createdAt: { $exists: true } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
    ]);

    monthlyApplications2 = monthlyApplications2
      .map(({ _id: { year, month }, count }) => ({
        date: day()
          .month(month - 1)
          .year(year)
          .format("MMM YYYY"),
        count,
      }))
      .reverse();

    res
      .status(StatusCodes.OK)
      .json({ defaultStats, monthlyApplications, monthlyApplications2 });
  } catch (error) {
    console.error("❌ Error fetching stats:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};