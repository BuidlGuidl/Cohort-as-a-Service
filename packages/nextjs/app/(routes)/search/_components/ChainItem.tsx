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

  const currentChainId = searchParams.get("chainId");
  const currentCohort = searchParams.get("cohort");

  const isSelected = currentChainId === chainId.toString();

  const onClick = () => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          cohort: currentCohort,
          chainId: isSelected ? null : chainId,
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
