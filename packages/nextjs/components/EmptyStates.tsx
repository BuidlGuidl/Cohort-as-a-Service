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

export const EmptyEventsState = ({
  type,
}: {
  type?: "transactions" | "activity" | "withdrawals" | "requests" | "contributions";
}) => {
  return (
    <div className="flex flex-col  py-12">
      <div className="text-5xl mb-4">📋</div>
      <h3 className="text-lg font-semibold mb-2">No {type} yet</h3>
      <p className="text-gray-400  max-w-sm text-sm">{type} history and events will appear here.</p>
    </div>
  );
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  EmptyCohortsState,
  EmptyApplicationsState,
  EmptyProjectsState,
  EmptyEventsState,
};
