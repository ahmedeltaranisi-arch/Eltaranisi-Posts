import React, { useContext, useState } from "react";
import { CounterContext } from "../../Context/CounterContext";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
// 1. استيراد سياق الإشعارات
import { NotificationContext } from "../../Context/NotificationContext";

export default function Navbar() {
  let navigate = useNavigate();
  let { setcounter, counter } = useContext(CounterContext);
  let { userToken, setuserToken, userData } = useContext(AuthContext);

  // 2. سحب الإشعارات من الـ Context
  let { notifications } = useContext(NotificationContext);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 3. حساب عدد الإشعارات غير المقروءة ديناميكياً
  // استخدام '?.' لتجنب أي خطأ في حالة كانت المصفوفة غير محملة بعد
  const unreadCount = notifications?.filter((n) => !n.isRead)?.length || 0;

  function logOut() {
    localStorage.removeItem("token");
    setuserToken(null);
    setIsDropdownOpen(false);
    navigate("/");
  }

  return (
    <>
      <nav className="sticky bg-white w-full z-20 top-0 start-0 border-b border-gray-100 shadow-sm">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-3 lg:px-8">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div
              className={`bg-[#002B9A] p-6 rounded-2xl inline-flex items-center justify-center ${className}`}
            >
              <svg
                viewBox="0 0 450 150"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full filter drop-shadow-(--shadow-spec)"
              >
                <filter
                  id="shadow"
                  x="-10%"
                  y="-10%"
                  width="120%"
                  height="120%"
                >
                  <feDropShadow
                    dx="0"
                    dy="4"
                    stdDeviation="3"
                    floodOpacity="0.3"
                  />
                </filter>

                <g filter="url(#shadow)" fill="#FFFFFF">
                  {/* E */}
                  <path d="M 45 40 H 68 V 56 H 55 V 68 H 66 V 82 H 55 V 96 H 68 V 112 H 45 Z" />
                  {/* l */}
                  <path d="M 72 30 H 82 V 112 H 72 Z" />
                  {/* t */}
                  <path d="M 86 52 H 93 V 40 H 101 V 52 H 109 V 66 H 101 V 98 C 101 104 103 105 107 105 H 109 V 112 H 99 C 91 112 86 106 86 96 Z" />
                  {/* a with wave cut */}
                  <path d="M 112 68 C 112 55 120 50 131 50 C 142 50 148 56 148 68 V 112 H 138 V 102 C 134 109 127 114 119 114 C 111 114 107 107 107 98 C 107 84 122 81 138 81 V 74 C 138 66 134 62 127 62 C 120 62 116 66 116 72 Z M 138 90 C 127 90 117 92 117 98 C 117 103 121 106 126 106 C 133 106 138 101 138 94 Z" />
                  {/* r wave effect */}
                  <path d="M 152 52 H 162 V 64 C 166 56 173 51 182 51 V 64 C 174 62 165 67 163 76 V 112 H 152 Z" />
                  {/* a */}
                  <path d="M 186 68 C 186 55 194 50 205 50 C 216 50 222 56 222 68 V 112 H 212 V 102 C 208 109 201 114 193 114 C 185 114 181 107 181 98 C 181 84 196 81 212 81 V 74 C 212 66 208 62 201 62 C 194 62 190 66 190 72 Z M 212 90 C 201 90 191 92 191 98 C 191 103 195 106 200 106 C 207 106 212 101 212 94 Z" />
                  {/* n with wave */}
                  <path d="M 226 52 H 236 V 62 C 240 55 248 50 257 50 C 267 50 272 57 272 69 V 112 H 262 V 72 C 262 63 257 59 250 59 C 243 59 236 65 236 74 V 112 H 226 Z" />
                  {/* i */}
                  <path d="M 277 52 H 287 V 112 H 277 Z M 277 34 H 287 V 44 H 277 Z" />
                  {/* s */}
                  <path d="M 292 98 C 292 107 300 114 312 114 C 323 114 330 107 330 98 C 330 84 300 84 300 71 C 300 64 306 60 312 60 C 318 60 323 63 323 70 H 332 C 332 58 324 51 312 51 C 301 51 291 58 291 69 C 291 83 321 82 321 97 C 321 103 315 106 310 106 C 302 106 298 102 298 98 Z" />
                  {/* i */}
                  <path d="M 334 52 H 344 V 112 H 334 Z M 334 34 H 344 V 44 H 334 Z" />
                </g>
              </svg>
            </div>
            <span className="self-center text-xl text-[#0b1427] font-bold whitespace-nowrap">
              Eltaranisi Posts
            </span>
          </div>

          {/* Center Links & Right Profile (Only if logged in) */}
          {userToken !== null ? (
            <>
              {/* Navigation Pills (Center) */}
              <div className="flex items-center bg-gray-50/80 border border-gray-200 rounded-full p-1 space-x-1 rtl:space-x-reverse mx-auto shadow-sm">
                <NavLink
                  to="/home"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 sm:px-5 py-2 rounded-full font-semibold transition-all ${
                      isActive
                        ? "text-blue-600 bg-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`
                  }
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span className="hidden sm:inline">Home</span>
                </NavLink>

                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 sm:px-5 py-2 rounded-full font-semibold transition-all ${
                      isActive
                        ? "text-blue-600 bg-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`
                  }
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Profile</span>
                </NavLink>

                {/* Notifications Link */}
                <NavLink
                  to="/notifications"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 sm:px-5 py-2 rounded-full font-semibold transition-all ${
                      isActive
                        ? "text-blue-600 bg-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`
                  }
                >
                  <div className="relative flex items-center justify-center">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>

                    {/* 4. عرض الرقم الفعلي للإشعارات غير المقروءة */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-3 bg-[#f5354e] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white flex items-center justify-center min-w-[20px] h-[20px]">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline ml-1">Notifications</span>
                </NavLink>
              </div>

              {/* User Dropdown Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 border border-gray-200 bg-gray-50/50 rounded-full p-1.5 pr-4 hover:bg-gray-100 transition-colors focus:outline-none"
                >
                  <img
                    src={
                      userData?.photo ||
                      `https://ui-avatars.com/api/?name=${userData?.name || "Ahmed"}&background=random`
                    }
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-semibold text-[#2c3345]">
                    {userData?.name || "Ahmed"}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>

                {/* Dropdown Content */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                    <NavLink
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#0b1427] font-medium transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Profile
                    </NavLink>
                    <NavLink
                      to="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#0b1427] font-medium transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Settings
                    </NavLink>

                    <div className="h-px bg-gray-100 my-1"></div>

                    <button
                      onClick={logOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[#e11d48] hover:bg-red-50 font-medium text-left transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Logged out Navigation */
            <ul className="flex items-center space-x-4 rtl:space-x-reverse font-semibold text-gray-600">
              <li>
                <NavLink
                  to="/"
                  className="hover:text-blue-600 transition-colors"
                >
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/register"
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Register
                </NavLink>
              </li>
            </ul>
          )}
        </div>
      </nav>
    </>
  );
}
