import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import humanizeDuration from "humanize-duration";
import { useNavigate } from "react-router-dom";
import { useAuth , useUser } from '@clerk/clerk-react';
export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const [allCourses, setAllCourses] = useState([]);
  const navigate = useNavigate();
  const {getToken} = useAuth()
  const {user} = useUser()
  
  const [isEducator, setIsEducator] = useState(() => {
    try {
      const saved = localStorage.getItem("isEducator");
      return saved === "true";
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return false;
    }
  });

  const [enrolledCourses, setEnrolledCoursed] = useState([]);

  useEffect(() => {
    try {
      if (isEducator) {
        localStorage.setItem("isEducator", "true");
      } else {
        localStorage.removeItem("isEducator");
      }
    } catch (error) {
      console.error("Error updating localStorage:", error);
    }
  }, [isEducator]);
const logToken = async()=>{
  console.log(await getToken());
}
  useEffect(() => {
    fetchAllCourses();
    fetchUserEnrolledCourses();
  }, []);
  useEffect(()=>{
    if(user){
      logToken()
    }
  },[user])
  const fetchAllCourses = async () => {
    setAllCourses(dummyCourses);
  };

  const calculateRating = (course) => {
    if (!course.courseRatings || course.courseRatings.length === 0) {
      return 0;
    }
    let totalRating = 0;
    course.courseRatings.forEach((rating) => {
      totalRating += rating.rating;
    });
    return totalRating / course.courseRatings.length;
  };

  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration));
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.map((chapter) =>
      chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration))
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateNoOfLectures = (course) => {
    let totalLectures = 0;
    course.courseContent.forEach((chapter) => {
      if (Array.isArray(chapter.chapterContent)) {
        totalLectures += chapter.chapterContent.length;
      }
    });
    return totalLectures;
  };

  const fetchUserEnrolledCourses = async () => {
    setEnrolledCoursed(dummyCourses);
  };

  const value = {
    currency,
    allCourses,
    calculateRating,
    isEducator,
    setIsEducator,
    calculateNoOfLectures,
    calculateCourseDuration,
    calculateChapterTime,
    enrolledCourses,
    setEnrolledCoursed,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};