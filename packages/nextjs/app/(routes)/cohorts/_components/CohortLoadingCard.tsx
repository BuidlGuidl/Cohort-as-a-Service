export const CohortLoadingCard = () => {
  return (
    <div className="border rounded-lg p-2 h-full relative">
      <div className="h-4 w-16 bg-gray-200 animate-pulse rounded absolute top-1 right-1" />
      <div className="flex flex-col pt-4 space-y-3">
        <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4" />
        <div className="h-6 bg-gray-200 animate-pulse rounded w-full" />
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-gray-200 animate-pulse rounded w-12" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-32" />
        </div>
      </div>
    </div>
  );
};
