// import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  HomeLayout,
  Register,
  Login,
  DashboardLayout,
  Landing,
  Error,
  Stats,
  Profile,
  BlogManage,
  AllPatient,
  EditPatient,
  EvaluatePatient,
  GraphPosture,
  RespondBlog,
  AllRankStar,
} from "./pages";

import { action as registerAction } from "./pages/Register";
import { action as loginAction } from "./pages/Login";
import { loader as dashboardLoader } from "./pages/DashboardLayout";
import { loader as allpatientLoader } from "./pages/AllPatient";
import { loader as editPatientLoader } from "./pages/EditPatient";
import { action as editPatientAction } from "./pages/EditPatient";
import { loader as statsLoader } from "./pages/Stats";



export const checkDefaultTheme = () => {
  const isDarkTheme = localStorage.getItem("darkTheme") === "true";
  document.body.classList.toggle("dark-theme", isDarkTheme);
  return isDarkTheme;
};

checkDefaultTheme();

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "/register",
        element: <Register />,
        action: registerAction,
      },
      {
        path: "/login",
        element: <Login />,
        action: loginAction,
      },
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        loader: dashboardLoader,
        children: [
          {
            index: true,
            path: "/dashboard",
            element: <Stats />,
            loader: statsLoader,
          },
          {
            path: "profile",
            element: <Profile />,
          },
          {
            path: "blogmanage",
            element: <BlogManage />,
          },
          {
            path: "all-patient",
            element: <AllPatient />,
            loader: allpatientLoader,
          },
          {
            path: "edit-patient/:_id",
            element: <EditPatient />,
            loader: editPatientLoader,
            action: editPatientAction,
          },
          {
            path: "eval-doctor/:_id/:date",
            element: <EvaluatePatient />,
          },
          {
            path: "graph-posture",
            element: <GraphPosture />,
          },
          {
            path: "respond-blog",
            element: <RespondBlog />,
          },
          {
            path: "all-rankstar",
            element: <AllRankStar />,
          },
        ],
      },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
