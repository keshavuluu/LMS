import React, { useContext } from "react";
import { assets, dummyEducatorData } from "../../assets/assets";
import { UserButton, useUser } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AddContext";

const Navbar = () => {
  const educatorData = dummyEducatorData;
  const { user } = useUser();
  const navigate = useNavigate();
  const { setIsEducator } = useContext(AppContext);

  const handleHomeClick = () => {
    // Clear educator state when going back home
    localStorage.removeItem("isEducator");
    setIsEducator(false);
    navigate("/");
  };

  return (
    <div className="w-full px-4 py-3 border-b shadow-sm flex justify-between items-center">
      {/* Left: Logo */}
      <button onClick={handleHomeClick}>
        <img src={assets.logo} alt="Logo" className="w-28 lg:w-32" />
      </button>

      <div className="flex items-center gap-4 text-gray-600">
        <p className="hidden sm:block">
          Hi! {user ? user.fullName : "Developer"}
        </p>
        {user ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <img
            className="w-8 h-8 rounded-full"
            src={assets.profile_img}
            alt="Profile"
          />
        )}
      </div>
    </div>
  );
};

export default Navbar;
