import React from "react";

interface NotificationBellProps {
  count: number;
  onClick: () => void;
  variant?: "info" | "warning" | "success";
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ count, onClick, variant = "warning" }) => {
  // Map variant to colors
  const bellColor = {
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
        className={`h-6 w-6 ${bellColor}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
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
