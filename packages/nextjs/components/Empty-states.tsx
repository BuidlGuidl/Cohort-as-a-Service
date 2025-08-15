import React from "react";
import { ApplicationStatus } from "@prisma/client";

export const EmptyCohortsState = ({ isFiltered = false }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-6xl mb-4">🏛️</div>
      <h3 className="text-xl font-semibold mb-2">
        {isFiltered ? "No cohorts match your filters" : "No cohorts found"}
      </h3>
      <p className="text-gray-400 text-center max-w-md">
        {isFiltered
          ? "Try adjusting your search criteria or clearing filters to see more results."
          : "Get started by creating your first cohort to manage builders and projects."}
      </p>
    </div>
  );
};

export const EmptyApplicationsState = ({
  status,
  isAdmin = false,
}: {
  status?: ApplicationStatus | "ALL";
  isAdmin?: boolean;
}) => {
  const messages: Record<ApplicationStatus | "ALL", { icon: string; title: string; description: string }> = {
    ALL: {
      icon: "📝",
      title: "No applications yet",
      description: isAdmin
        ? "Applications will appear here once builders submit them."
        : "Submit your first application to join this cohort.",
    },
    PENDING: {
      icon: "⏳",
      title: "No pending applications",
      description: "All applications have been reviewed.",
    },
    APPROVED: {
      icon: "✅",
      title: "No approved applications",
      description: "Approved applications will appear here.",
    },
    REJECTED: {
      icon: "❌",
      title: "No rejected applications",
      description: "Rejected applications will appear here.",
    },
  };

  const message = messages[status ?? "ALL"];

  return (
    <div className="flex flex-col py-12">
      <div className="text-5xl mb-4">{message.icon}</div>
      <h3 className="text-lg font-semibold mb-2">{message.title}</h3>
      <p className="text-gray-400 max-w-sm text-sm">{message.description}</p>
    </div>
  );
};

export const EmptyProjectsState = ({ canAdd = false }) => {
  return (
    <div className="flex flex-col justify-center py-12">
      <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
      <p className="text-gray-400 max-w-sm text-sm">
        {canAdd
          ? "Start showcasing builder work by adding the first project."
          : "Projects will appear here once they're added by the cohort admin."}
      </p>
    </div>
  );
};

export const EmptyAnalyticsState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="text-6xl mb-4">📊</div>
      <h3 className="text-2xl font-semibold mb-2">No analytics data available</h3>
      <p className="text-gray-400 text-center max-w-md">
        Analytics will appear here once cohorts and builders are active on the platform.
      </p>
    </div>
  );
};

export const EmptyMembersState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-5xl mb-4">👥</div>
      <h3 className="text-lg font-semibold mb-2">No members yet</h3>
      <p className="text-gray-400 text-center max-w-sm text-sm">
        Members will appear here once applications are approved.
      </p>
    </div>
  );
};

export const EmptySearchState = ({ searchTerm = "" }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-5xl mb-4">🔍</div>
      <h3 className="text-lg font-semibold mb-2">No results found</h3>
      <p className="text-gray-400 text-center max-w-sm text-sm">
        {searchTerm
          ? `We couldn't find anything matching "${searchTerm}". Try different keywords.`
          : "Try adjusting your search to find what you're looking for."}
      </p>
    </div>
  );
};

export const EmptyEventsState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-5xl mb-4">📋</div>
      <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
      <p className="text-gray-400 text-center max-w-sm text-sm">Transaction history and events will appear here.</p>
    </div>
  );
};

export const EmptyState = ({
  icon = "📭",
  title = "Nothing here yet",
  description = "Items will appear here soon.",
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-center max-w-sm text-sm mb-4">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export const EmptyNotificationsState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="text-4xl mb-3">🔔</div>
      <h3 className="text-base font-semibold mb-1">No notifications</h3>
      <p className="text-gray-400 text-center text-sm">You&apos;re all caught up!</p>
    </div>
  );
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  EmptyCohortsState,
  EmptyApplicationsState,
  EmptyProjectsState,
  EmptyAnalyticsState,
  EmptyMembersState,
  EmptySearchState,
  EmptyEventsState,
  EmptyState,
  EmptyNotificationsState,
};
