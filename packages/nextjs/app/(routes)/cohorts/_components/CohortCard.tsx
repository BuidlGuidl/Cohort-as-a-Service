import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Cohort } from "@prisma/client";
import { Address } from "~~/components/scaffold-eth";
import { getChainById } from "~~/data/chains";
import { getNetworkColor } from "~~/hooks/scaffold-eth";
import { getCohortUrl } from "~~/utils/cohortUrl";
import { AllowedChainIds, ChainWithAttributes } from "~~/utils/scaffold-eth";

interface CohortCardProps {
  name?: string;
  address?: string;
  chainId?: AllowedChainIds;
  createdAt: string;
  primaryAdmin?: string;
  chainName?: string;
  role?: "ADMIN" | "BUILDER";
  dbCohorts: Cohort[];
}

export const CohortCard = ({ address, chainName, primaryAdmin, name, role, chainId, dbCohorts }: CohortCardProps) => {
  const [networkColor, setNetworkColor] = useState<string>("#bbbbbb");

  const dbCohort = dbCohorts.find(cohort => cohort.address.toLowerCase() === address?.toLowerCase());
  const cohortUrl = getCohortUrl(address as string, dbCohort?.subdomain);

  useEffect(() => {
    if (!chainId) return;
    const chain = getChainById(chainId);
    const networkColor = getNetworkColor(chain as ChainWithAttributes, true);
    setNetworkColor(networkColor);
  }, [chainId]);

  return (
    <div>
      <Link href={cohortUrl}>
        <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-2 h-full relative">
          <div className="justify-between flex text-xs">
            <span>{role}</span>
            <span className="text-xs" style={{ color: networkColor }}>
              {chainName}
            </span>
          </div>
          <div className="flex flex-col pt-4 ">
            <div className="text-2xl font-medium group-hover:text-sky-700 transition line-clamp-2 ">{name}</div>
            <div className="mt-3">
              <Address address={address} disableAddressLink={true} />
            </div>

            <div className="flex flex-row items-center justify-start mt-2 text-xs">
              Owner:
              <Address address={primaryAdmin} size="xs" disableAddressLink={true} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
