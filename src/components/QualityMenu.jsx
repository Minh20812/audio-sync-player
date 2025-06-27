import React from "react";

const QualityMenu = ({ show, qualities, currentQuality, onQualityChange }) => {
  if (!show) return null;

  return (
    <div className="absolute bottom-24 right-4 sm:right-6 bg-neutral-900/90 border border-white/10 rounded-md shadow-xl z-40 w-44 animate-fade-in transition-opacity duration-200">
      <div className="py-2">
        {qualities.map((q) => (
          <button
            key={q.value}
            onClick={() => onQualityChange(q.value)}
            className={`flex items-center justify-between w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors ${
              q.value === currentQuality ? "font-bold text-blue-400" : ""
            }`}
          >
            <span>{q.label}</span>
            {q.value === currentQuality && (
              <svg
                className="w-4 h-4 text-blue-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QualityMenu;
