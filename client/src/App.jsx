import React, { useContext } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/student/Home";
import CoursesList from "./pages/student/CourseList";
import CourseDetails from "./pages/student/CourseDetails";
import MyEnrollments from "./pages/student/MyEnrollments";
import Player from "./pages/student/Player";
import Loading from "./components/student/Loading";
import Educator from "./pages/educator/Educator";
import Dashboard from "./pages/educator/Dashboard";
import AddCourse from "./pages/educator/AddCourse";
import MyCourses from "./pages/educator/MyCourses";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled";
import Navbar from "./components/student/Navbar";
import { AppContext } from "./context/AddContext";
import "quill/dist/quill.snow.css";
const App = () => {
  const location = useLocation();
  const { isEducator } = useContext(AppContext);
  const isEducatorRoute = location.pathname.startsWith("/educator");

  return (
    <div className="text-default min-h-screen bg-white">
      {/* Render student Navbar only when NOT in the educator section */}
      {!isEducatorRoute && <Navbar />}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/course-list" element={<CoursesList />} />
        <Route path="/course-list/:input" element={<CoursesList />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/my-enrollments" element={<MyEnrollments />} />
        <Route path="/player/:courseId" element={<Player />} />
        <Route path="/loading/:path" element={<Loading />} />

        {/* Protected educator routes */}
        <Route
          path="/educator/*"
          element={
            isEducator === undefined ? (
              <Loading />
            ) : isEducator ? (
              <Educator />
            ) : (
              <Home />
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="students-enrolled" element={<StudentsEnrolled />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
