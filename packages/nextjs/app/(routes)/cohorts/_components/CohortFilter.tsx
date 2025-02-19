"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";

const CohortFilter = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentChainId = searchParams.get("chainId");
  const currentCohort = searchParams.get("cohort");
  const currentFilter = searchParams.get("filter");

  const handleFilterChange = (value: string) => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          chainId: currentChainId,
          cohort: currentCohort,
          filter: value,
        },
      },
      {
        skipNull: true,
        skipEmptyString: true,
      },
    );
    router.push(url);
  };

  return (
    <div className="flex w-full">
      <div className="dropdown ml-auto">
        <div tabIndex={0} role="button" className="btn btn-sm m-1 rounded-md bg-base-100">
          Filter
          {currentCohort && (
            <span className="ml-2 badge badge-sm">{currentFilter === "admin" ? "Admin" : "Builder"}</span>
          )}
        </div>
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 border">
          <li>
            <button onClick={() => handleFilterChange("admin")} className={currentFilter === "admin" ? "active" : ""}>
              Admin Cohorts
            </button>
          </li>
          <li>
            <button
              onClick={() => handleFilterChange("builder")}
              className={currentFilter === "builder" ? "active" : ""}
            >
              Created Cohorts
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CohortFilter;
