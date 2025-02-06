"use client";

import React from "react";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { useSwitchChain } from "wagmi";
import { useAccount } from "wagmi";
import { CheckIcon } from "@heroicons/react/24/outline";
import { chains } from "~~/data/chains";

const ChainToggler = () => {
  const { chain } = useAccount();
  const selectedChain = chain?.id;
  const { isPending, switchChain } = useSwitchChain();

  const evmChains = chains.filter(chain => chain.isEVM);
  //   const otherChains = chains.filter(chain => !chain.isEVM);

  const onClick = (chainId: number) => {
    switchChain({ chainId: chainId });
  };

  return (
    <div>
      <div className="space-y-4">
        <h2 className="font-semibold">Select a chain</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {evmChains.map(chain => (
            <button
              key={chain.chainId}
              type="button"
              onClick={() => onClick(chain.chainId)}
              className={twMerge(
                "btn btn-sm rounded-md btn-ghost justify-start gap-2 normal-case bg-base-100",
                selectedChain === chain.chainId && !isPending && "btn-active",
              )}
            >
              <Image src={`${chain.icon}`} alt={chain.name} className="w-4 h-4" width={5} height={5} />
              <span>{chain.name}</span>
              {selectedChain === chain.chainId && <CheckIcon className="h-4 w-4 ml-auto" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChainToggler;
