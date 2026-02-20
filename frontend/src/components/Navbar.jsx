import React, { useRef, useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserCircleIcon } from "@heroicons/react/24/solid";

// 🔹 Close dropdown when clicking outside
function useOutsideClick(ref, callback) {
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) callback();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, callback]);
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : null;

  return (
    <nav className="bg-blue-300 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* LEFT SECTION */}
        <div className="flex items-center gap-6">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold text-xl tracking-wider shadow-lg hover:shadow-xl transition-all duration-300">
              NOVA
            </div>
          </Link>

          {/* Public Home - only show when not logged in */}
          {!user && (
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-white bg-blue-600 font-medium p-3 rounded-md transition"
                  : "text-gray-700 font-medium p-3 rounded-md hover:text-white hover:bg-blue-600 transition"
              }
            >
              Home
            </NavLink>
          )}

          {/* Role-based Dashboard Links */}
          {user && (
            <>
              {user.role === "admin" && (
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) =>
                    isActive
                      ? "text-white bg-blue-600 font-medium p-3 rounded-md transition"
                      : "text-gray-700 font-medium p-3 rounded-md hover:text-white hover:bg-blue-600 transition"
                  }
                >
                  Dashboard
                </NavLink>
              )}

              {user.role === "faculty" && (
                <NavLink
                  to="/faculty/dashboard"
                  className={({ isActive }) =>
                    isActive
                      ? "text-white bg-blue-600 font-medium p-3 rounded-md transition"
                      : "text-gray-700 font-medium p-3 rounded-md hover:text-white hover:bg-blue-600 transition"
                  }
                >
                  Dashboard
                </NavLink>
              )}

              {user.role === "student" && (
                <NavLink
                  to="/student/dashboard"
                  className={({ isActive }) =>
                    isActive
                      ? "text-white bg-blue-600 font-medium p-3 rounded-md transition"
                      : "text-gray-700 font-medium p-3 rounded-md hover:text-white hover:bg-blue-600 transition"
                  }
                >
                  Dashboard
                </NavLink>
              )}

              {/* Timetable for admin only */}
              {user.role === "admin" && (
                <NavLink
                  to="/timetable"
                  className={({ isActive }) =>
                    isActive
                      ? "text-white bg-blue-600 font-medium p-3 rounded-md transition"
                      : "text-gray-700 font-medium p-3 rounded-md hover:text-white hover:bg-blue-600 transition"
                  }
                >
                  Timetable
                </NavLink>
              )}

              {/* Admin-only links */}
              {user.role === "admin" && (
                <>
                  <NavLink
                    to="/admin/batches"
                    className={({ isActive }) =>
                      isActive
                        ? "text-white bg-blue-600 font-medium p-3 rounded-md transition"
                        : "text-gray-700 font-medium p-3 rounded-md hover:text-white hover:bg-blue-600 transition"
                    }
                  >
                    Manage Batches
                  </NavLink>
                </>
              )}

              {/* Faculty-only link */}
              {user.role === "faculty" && (
                <NavLink
                  to="/faculty/classes"
                  className={({ isActive }) =>
                    isActive
                      ? "text-white bg-blue-600 font-medium p-3 rounded-md transition"
                      : "text-gray-700 font-medium p-3 rounded-md hover:text-white hover:bg-blue-600 transition"
                  }
                >
                  My Classes
                </NavLink>
              )}
            </>
          )}
        </div>

        {/* RIGHT SECTION */}
        {!user ? (
          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-md border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition"
            >
              Sign Up
            </Link>
          </div>
        ) : (
          <div ref={ref} className="relative">
            <button
              onClick={() => setOpen((o) => !o)}
              className="w-10 h-10 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center"
            >
              {initial || <UserCircleIcon className="w-6 h-6" />}
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-52 bg-white shadow-lg rounded-md border border-gray-100 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="text-sm font-semibold text-gray-800">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                  <div className="text-xs text-blue-600 font-medium capitalize">
                    {user.role}
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  onClick={() => setOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
