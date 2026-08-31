import React from "react";

export default function Spinner({ fullScreen = true }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 transition-all duration-300 ${
        fullScreen
          ? "min-h-screen w-full bg-slate-50/60 backdrop-blur-md"
          : "py-12 w-full"
      }`}
    >
      {/* Spinner Container */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Glow خلفي */}
        <div className="absolute w-12 h-12 bg-blue-500/25 rounded-full blur-xl animate-pulse" />

        {/* الحلقة الخلفية الثابتة */}
        <div className="w-11 h-11 rounded-full border-[3px] border-blue-100/80" />

        {/* الحلقة المتحركة المزدوجة */}
        <div className="absolute w-11 h-11 rounded-full border-[3px] border-transparent border-t-blue-600 border-r-blue-600 animate-spin" />

        {/* نقطة نبض مركزية */}
        <div className="absolute w-2 h-2 bg-blue-600 rounded-full animate-ping opacity-75" />
      </div>

      {/* نص التحميل مع نقاط متحركة */}
      <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
        <span>Loading</span>
        <span className="flex items-center gap-1 ms-0.5">
          <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></span>
        </span>
      </div>
    </div>
  );
}
