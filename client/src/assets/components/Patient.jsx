import { FaLocationArrow, FaBriefcase, FaCalendarAlt, FaRegEdit, } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Link, Form } from "react-router-dom";
import Wrapper from "../wrappers/Patient";
import PatientInfo from "./PatientInfo";
import day from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { useAllPatientContext } from "../../pages/AllPatient";
day.extend(advancedFormat);

const Patient = ({ _id, username, name, surname, userType, userStatus, createdAt, }) => {
  const { searchValues } = useAllPatientContext();
  const formattedUserName = username ? username.slice(0, 8) + "x".repeat(Math.max(0, username.length - 8)) : "Unknown";

  const date = day(createdAt).format("MMM Do, YYYY");

  return (
    <Wrapper>
      <header>
        {/* ✅ แสดงอักษรแรกของชื่อ */}
        <div className={`main-icon ${searchValues.userStatus === "คนไข้ที่ขาดการทำกายภาพบำบัด" ? "!bg-orange-300" : "" }`}>{name.charAt(0)}</div>
        <div className="info">
          <h5>{name}</h5>
          <p>{surname}</p>
          <br />
          <p>มีผู้ดูแลที่บ้าน</p>
        </div>
      </header>
      <footer>
        <Link
          to={`../edit-patient/${_id}`}
          className={`btn edit-btn ${searchValues.userStatus === "คนไข้ที่ขาดการทำกายภาพบำบัด" ? "!bg-orange-300" : "" }`}
          style={{
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            textAlign: "center",
          }}
        >
          ดูผลกายภาพบำบัด
        </Link>
      </footer>
    </Wrapper>

  );
};

export default Patient;
