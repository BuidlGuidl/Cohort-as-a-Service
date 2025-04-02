import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Address } from "~~/components/scaffold-eth";
import { getChainById } from "~~/data/chains";
import { getNetworkColor } from "~~/hooks/scaffold-eth";
import { AllowedChainIds, ChainWithAttributes } from "~~/utils/scaffold-eth";

interface CohortCardProps {
  name?: string;
  cohortAddress?: string;
  chainId?: AllowedChainIds;
  createdAt: any;
  owner?: string;
  chainName?: string;
  role?: "ADMIN" | "BUILDER";
}

export const CohortCard = ({ cohortAddress, chainName, owner, name, role, chainId }: CohortCardProps) => {
  const [networkColor, setNetworkColor] = useState<string>("#bbbbbb");

  useEffect(() => {
    if (!chainId) return;
    const chain = getChainById(chainId);
    console.log(chain?.name);
    const networkColor = getNetworkColor(chain as ChainWithAttributes, true);
    setNetworkColor(networkColor);
  }, [chainId]);

  return (
    <div>
      <Link href={`/cohort/${cohortAddress}`}>
        <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-2 h-full relative">
          <div className="justify-between flex text-xs">
            <span>{role}</span>
            <span className="text-xs" style={{ color: networkColor }}>
              {chainName}
            </span>
          </div>
          <div className="flex flex-col pt-4 ">
            <div className="text-2xl font-medium group-hover:text-sky-700 transition line-clamp-2 ">{name}</div>
            <Address address={cohortAddress} disableAddressLink={true} />

            <div className="flex flex-row items-center justify-start mt-2 text-xs">
              Owner:
              <Address address={owner} size="xs" disableAddressLink={true} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
