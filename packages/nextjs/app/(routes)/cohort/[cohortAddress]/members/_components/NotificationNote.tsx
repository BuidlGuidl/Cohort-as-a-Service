import React from "react";

interface NotificationBellProps {
  count: number;
  onClick: () => void;
  variant?: "info" | "warning" | "success";
}

export const NotificationNote: React.FC<NotificationBellProps> = ({ count, onClick, variant = "warning" }) => {
  const noteColor = {
    warning: "text-warning",
    info: "text-info",
    success: "text-success",
  }[variant];

  const badgeColor = {
    warning: "bg-error",
    info: "bg-info",
    success: "bg-success",
  }[variant];

  return (
    <div className="ml-2 relative cursor-pointer" onClick={onClick}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-6 w-6 ${noteColor}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {count > 0 && (
        <span
          className={`absolute -top-2 -right-2 ${badgeColor} text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center`}
        >
          {count}
        </span>
      )}
    </div>
  );
};
