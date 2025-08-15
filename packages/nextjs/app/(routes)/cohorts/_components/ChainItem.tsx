"use client";

import React from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckIcon } from "lucide-react";
import qs from "query-string";
import { twMerge } from "tailwind-merge";

interface ChainItemProps {
  chainId: number;
  icon: string;
  name: string;
}

const ChainItem = ({ chainId, icon, name }: ChainItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentChainIds = searchParams.get("chainId");
  const currentCohort = searchParams.get("cohort");
  const currentFilter = searchParams.get("filter");

  // Parse current selected chain IDs
  const selectedChainIds = currentChainIds ? currentChainIds.split(",").map(id => parseInt(id)) : [];
  const isSelected = selectedChainIds.includes(chainId);

  const onClick = () => {
    let newChainIds: number[] = [];

    if (isSelected) {
      // Remove this chain from selection
      newChainIds = selectedChainIds.filter(id => id !== chainId);
    } else {
      // Add this chain to selection
      newChainIds = [...selectedChainIds, chainId];
    }

    // Convert back to string for URL (or null if empty)
    const chainIdParam = newChainIds.length > 0 ? newChainIds.join(",") : null;

    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          cohort: currentCohort,
          chainId: chainIdParam,
          filter: currentFilter,
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
    <button
      type="button"
      onClick={() => onClick()}
      className={twMerge(
        "btn btn-sm rounded-md btn-ghost justify-start gap-2 normal-case bg-base-100",
        isSelected && "btn-active",
      )}
    >
      <Image src={`${icon}`} alt={name} className="w-4 h-4" width={5} height={5} />
      <span>{name}</span>
      {isSelected && <CheckIcon className="h-4 w-4 ml-auto" />}
    </button>
  );
};

export default ChainItem;
