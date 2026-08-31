import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 px-4 bg-white border-t border-gray-100">
        {/* حقوق النشر */}
        <p className="text-sm text-blue-700 font-medium">
          © 2026 Eltaranis Post All rights reserved.
        </p>

        {/* الإمضاء */}
        <div className="flex items-center gap-1.5 text-sm font-medium bg-gray-50 px-4 py-2 rounded-full border border-gray-100 shadow-sm">
          <span className="text-red-700">Created with</span>
          <svg
            className="w-4 h-4 text-red-500 animate-pulse"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="text-red-500">by</span>
          <span className="font-bold bg-gradient-to-r from-[#1b64da] to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer">
            Ahmed Eltaranisi
          </span>
        </div>
      </div>
    </footer>
  );
}
