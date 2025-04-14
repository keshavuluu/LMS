import React, { useEffect, useContext } from "react";
import { Outlet, useNavigate, Navigate } from "react-router-dom";
import { AppContext } from "../../context/AddContext";
import Navbar from "../../components/educator/Navbar";
import Sidebar from "../../components/educator/Sidebar";
import Footer from "../../components/educator/Footer";
import Loading from "../../components/student/Loading";

const Educator = () => {
  const { isEducator, setIsEducator } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEducatorState = localStorage.getItem("isEducator") === "true";

    if (!savedEducatorState) {
      localStorage.removeItem("isEducator");
      setIsEducator(false);
      navigate("/");
    }
  }, []);

  // If educator state is undefined, show loading
  if (typeof isEducator === "undefined") {
    return <Loading />;
  }

  // If not an educator, redirect to home
  if (!isEducator) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Educator;
