import {
  Link,
  Form,
  redirect,
  useNavigation,
  useActionData,
} from "react-router-dom";
import React from "react";
import Wrapper from "../assets/wrappers/RegisterAndLoginPage";
import { FormRow, Logo } from "../assets/components";
import customFetch from "../utils/customFetch";
import { toast } from "react-toastify";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const errors = { msg: "" };
  if (data.password.length < 1) {
    errors.msg = "password too short";
    return errors;
  }
  // try {
  //   await customFetch.post("/auth/login", data);
  //   toast.success("เข้าสู่ระบบเรียบร้อยแล้ว");
  //   return redirect("/dashboard");
  // } catch (error) {
  //   // toast.error(error?.response?.data?.msg);
  //   errors.msg = error.response.data.msg;
  //   return errors;
  // }
  try {
    const response = await customFetch.post("/auth/login", data);
    console.log("Response:", response);

    const userData = {
      msg: "เข้าสู่ระบบสำเร็จ",
      doctor_id: response.data._id,
    };

    localStorage.setItem("userData", JSON.stringify(userData));
    // console.log("User data:");
    // console.log("Doctor ID:", userData.doctor_id);

    console.log("Login successful");
    toast.success("เข้าสู่ระบบเรียบร้อยแล้ว");
    return redirect("/dashboard");
  } catch (error) {
    console.error("Error during login:", error);
    errors.msg = error.response?.data?.msg || "เกิดข้อผิดพลาดบางอย่าง";
    toast.error(errors.msg);
    return errors;
  }
};

const Login = () => {
  const errors = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  return (
    <Wrapper>
      <Form method="post" className="form">
        <Logo />
        <h4>Login</h4>
        {errors && <p style={{ color: "red" }}>{errors.msg}</p>}
        <FormRow type="text" name="username" defaultValue="" />
        <FormRow type="password" name="password" defaultValue="" />
        <button type="submit" className="btn btn-block" disabled={isSubmitting}>
          {isSubmitting ? "submitting..." : "submit"}
        </button>
        <p>
          {/* Not a Member yet?
          <Link to="/register" className="member-btn">
            Register
          </Link> */}
        </p>
      </Form>
    </Wrapper>
  );
};

export default Login;
