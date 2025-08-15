import React from "react";

export const TableSkeleton = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            {[...Array(columns)].map((_, i) => (
              <th key={i}>
                <div className="h-4 bg-gray-700 animate-pulse rounded w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {[...Array(columns)].map((_, colIndex) => (
                <td key={colIndex}>
                  <div className="h-4 bg-gray-700 animate-pulse rounded w-full max-w-[200px]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="border rounded-lg p-4 h-full relative animate-pulse">
      <div className="h-4 w-16 bg-gray-700 rounded absolute top-2 right-2" />
      <div className="flex flex-col pt-6 space-y-3">
        <div className="h-6 bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-700 rounded w-full" />
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-gray-700 rounded w-12" />
          <div className="h-4 bg-gray-700 rounded w-32" />
        </div>
      </div>
    </div>
  );
};

export const ListSkeleton = ({ items = 3 }) => {
  return (
    <div className="space-y-4">
      {[...Array(items)].map((_, index) => (
        <div key={index} className="border border-base-300 rounded-md p-4 animate-pulse">
          <div className="flex justify-between items-start mb-2">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-700 rounded w-1/2" />
            </div>
            <div className="h-6 w-20 bg-gray-700 rounded-full" />
          </div>
          <div className="h-3 bg-gray-700 rounded w-1/4 mt-2" />
        </div>
      ))}
    </div>
  );
};

export const AnalyticsCardSkeleton = () => {
  return (
    <div className="card shadow-xl border border-neutral animate-pulse">
      <div className="card-body">
        <div className="h-5 bg-gray-700 rounded w-24 mb-4" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-700 rounded w-20" />
            <div className="h-4 bg-gray-700 rounded w-10" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-700 rounded w-24" />
            <div className="h-4 bg-gray-700 rounded w-8" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-700 rounded w-28" />
            <div className="h-4 bg-gray-700 rounded w-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Project list skeleton
export const ProjectSkeleton = ({ items = 3 }) => {
  return (
    <div className="space-y-10">
      {[...Array(items)].map((_, index) => (
        <div key={index} className="w-full animate-pulse">
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gray-700 rounded w-32" />
            <div className="h-3 bg-gray-700 rounded w-24" />
          </div>
          <div className="h-4 bg-gray-700 rounded w-full mt-2" />
          <div className="flex gap-2 mt-2">
            <div className="h-3 bg-gray-700 rounded w-16" />
            <div className="h-3 bg-gray-700 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ShimmerBlock = ({ className = "" }) => {
  return (
    <div className={`bg-gray-700 animate-pulse rounded relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
    </div>
  );
};

export const LoadingOverlay = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 flex flex-col items-center space-y-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};

export const InlineLoader = ({ size = "sm" }) => {
  const sizeClass = {
    xs: "loading-xs",
    sm: "loading-sm",
    md: "loading-md",
    lg: "loading-lg",
  }[size];

  return <span className={`loading loading-spinner ${sizeClass}`}></span>;
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  TableSkeleton,
  CardSkeleton,
  ListSkeleton,
  AnalyticsCardSkeleton,
  ProjectSkeleton,
  ShimmerBlock,
  LoadingOverlay,
  InlineLoader,
};
