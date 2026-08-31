import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Helmet } from 'react-helmet-async';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#edf2f7] flex items-center justify-center p-6">
      <Helmet>
        <title> Sign In | Eltaranisi Posts </title>
      </Helmet>
      <div className="container max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* النصف الأيسر - معلومات Route Posts & Route Academy */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-[60px] font-extrabold text-[#002b8f] tracking-tight">
              Eltaranisi Posts
            </h1>
            <p className="text-xl text-gray-800 font-normal leading-snug">
              Connect with friends and the world around you on Eltaranisi Posts.
            </p>
          </div>

          {/* Card - About Route Academy */}
          <div className="bg-[#f8fafc]/90 border border-blue-200/60 p-6 rounded-2xl space-y-3 shadow-sm">
            <span className="text-[14px] font-bold text-[#002b8f] tracking-widest uppercase block">
              ABOUT Eltaranisi ACADEMY
            </span>

            <h3 className="text-[18px] text-gray-900 font-bold ">
              Egypt's Leading IT Training Center Since 2012
            </h3>

            <p className="text-[14px] text-gray-600 leading-relaxed">
              Eltaranisi Academy is the premier IT training center in Egypt,
              established in 2012. We specialize in delivering high-quality
              training courses in programming, web development, and application
              development. We've identified the unique challenges people may
              face when learning new technology and made efforts to provide
              strategies to overcome them.
            </p>

            {/* Grid 5 Cards (3 top, 2 bottom) */}
            <div className="pt-2 flex flex-col gap-2.5">
              {/* Row 1 */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-[#f0f5ff] p-3 rounded-xl border border-blue-200/50 text-left">
                  <p className="font-extrabold text-[#002b8f] text-base leading-none">
                    2012
                  </p>
                  <p className="text-[9px] font-bold text-gray-500 uppercase mt-1">
                    FOUNDED
                  </p>
                </div>
                <div className="bg-[#f0f5ff] p-3 rounded-xl border border-blue-200/50 text-left">
                  <p className="font-extrabold text-[#002b8f] text-base leading-none">
                    40K+
                  </p>
                  <p className="text-[9px] font-bold text-gray-500 uppercase mt-1">
                    GRADUATES
                  </p>
                </div>
                <div className="bg-[#f0f5ff] p-3 rounded-xl border border-blue-200/50 text-left">
                  <p className="font-extrabold text-[#002b8f] text-base leading-none">
                    50+
                  </p>
                  <p className="text-[9px] font-bold text-gray-500 uppercase mt-1">
                    PARTNER COMPANIES
                  </p>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-[#f0f5ff] p-3 rounded-xl border border-blue-200/50 text-left">
                  <p className="font-extrabold text-[#002b8f] text-base leading-none">
                    5
                  </p>
                  <p className="text-[9px] font-bold text-gray-500 uppercase mt-1">
                    BRANCHES
                  </p>
                </div>
                <div className="bg-[#f0f5ff] p-3 rounded-xl border border-blue-200/50 text-left">
                  <p className="font-extrabold text-[#002b8f] text-base leading-none">
                    20
                  </p>
                  <p className="text-[9px] font-bold text-gray-500 uppercase mt-1">
                    DIPLOMAS AVAILABLE
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* النصف الأيمن - الكارت الأيمن للـ Forms */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 w-full max-w-md mx-auto">
          {/* Nav Switcher */}
          <div className="flex bg-gray-100 p-1.5 rounded-xl mb-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex-1 py-2 text-center text-sm font-semibold rounded-lg transition-all ${
                  isActive
                    ? "bg-white text-[#002b8f] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `flex-1 py-2 text-center text-sm font-semibold rounded-lg transition-all ${
                  isActive
                    ? "bg-white text-[#002b8f] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`
              }
            >
              Register
            </NavLink>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
