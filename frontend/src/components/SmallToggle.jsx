import React from "react";

export default function SmallToggles({ value = "analyze", onChange }) {
  const isAnalyze = value === "analyze";

  return (
    <div
      className="
        relative inline-flex items-center 
        w-[130px] h-7 p-1 rounded-full 
        bg-gray-200 dark:bg-gray-700/40 
        cursor-pointer select-none
      "
    >
      {/* Sliding pill */}
      <div
        className={`
          absolute top-1 left-1 h-5 w-[62px] rounded-full 
          bg-white dark:bg-[#AD46FF]/40 shadow 
          transition-transform duration-200
        `}
        style={{
          transform: isAnalyze ? "translateX(0)" : "translateX(65px)",
        }}
      />

      {/* Analyze */}
      <span
        onClick={() => onChange("analyze")}
        className={`
          z-10 w-[62px] text-center text-[11px] font-medium 
          transition-colors duration-150
          ${isAnalyze ? "text-gray-900 dark:text-white" : "text-gray-500"}
        `}
      >
        Analyze
      </span>

      {/* Results */}
      <span
        // onClick={() => onChange("results")}
        className={`
          z-10 w-[62px] text-center text-[11px] font-medium 
          transition-colors duration-150
          ${!isAnalyze ? "text-gray-900 dark:text-white" : "text-gray-500"}
        `}
      >
        Results
      </span>
    </div>
  );
}
