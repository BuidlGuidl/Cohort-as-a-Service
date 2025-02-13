"use client";

import React, { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import qs from "query-string";
import { useDebounce } from "~~/hooks/UseDebounce";

const SearchInputInner = () => {
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentChainId = searchParams.get("chainId");

  useEffect(() => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          cohort: debouncedValue,
          chainId: currentChainId,
        },
      },
      {
        skipNull: true,
        skipEmptyString: true,
      },
    );

    router.push(url);
  }, [debouncedValue, currentChainId, router, pathname]);

  return (
    <div className="relative">
      <Search className="absolute top-2 left-2 h-4 w-4 text-slate-600" />
      <input
        className="input input-sm input-bordered border border-base-300 w-full md:w-[400px] rounded-md pl-8"
        placeholder="Search for a cohort..."
        value={value}
        onChange={e => setValue(e.target.value)}
        type="search"
      />
    </div>
  );
};

const SearchInput = () => {
  return (
    <Suspense
      fallback={
        <div className="relative">
          <Search className="absolute top-2 left-2 h-4 w-4 text-slate-600" />
          <input
            className="input input-sm input-bordered border border-base-300 w-full md:w-[400px] rounded-md pl-8"
            placeholder="Loading..."
            disabled
          />
        </div>
      }
    >
      <SearchInputInner />
    </Suspense>
  );
};

export default SearchInput;
