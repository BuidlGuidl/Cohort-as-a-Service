"use client";

import React, { useEffect, useState } from "react";
import { FundCohort } from "../_components/FundCohort";
import { StreamContractInfo } from "../_components/StreamContractInfo";
import { AddBatch } from "./_components/AddBatch";
import { RemoveCreator } from "./_components/RemoveCreator";
import { UpdateCreator } from "./_components/UpdateCreator";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { useCohortData } from "~~/hooks/useCohortData";

const Page = ({ params }: { params: { cohortAddress: string } }) => {
  const {
    name,
    primaryAdmin,
    creatorFlows,
    isCreator,
    isAdmin,
    tokenAddress,
    isERC20,
    tokenSymbol,
    balance,
    isLoading,
    admins,
  } = useCohortData(params.cohortAddress);

  const [selectedAddress, setSelectedAddress] = useState("");

  const [filteredWithdrawnEvents, setFilteredWithdrawnEvents] = useState<any[]>([]);

  const { address } = useAccount();

  const {
    data: withdrawn,
    isLoading: isLoadingWithdrawEvents,
    refetch,
  } = useScaffoldEventHistory({
    contractName: "Cohort",
    eventName: "Withdraw",
    fromBlock: BigInt(Number(process.env.NEXT_PUBLIC_DEPLOY_BLOCK) || 0),
    blockData: true,
    watch: true,
    receiptData: true,
    contractAddress: params.cohortAddress,
  });

  useEffect(() => {
    if (withdrawn && withdrawn.length > 0) {
      if (!withdrawn[0].args) {
        refetch();
      }
    }
  }, [withdrawn, refetch]);

  useEffect(() => {
    if (withdrawn && withdrawn.length > 0) {
      if (!withdrawn[0].args) {
        return;
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const filtered = withdrawn?.filter(event => event.args[0] == selectedAddress);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setFilteredWithdrawnEvents(filtered);
  }, [withdrawn, address, isLoadingWithdrawEvents, selectedAddress]);

  return (
    <div>
      <div className="max-w-3xl px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-primary-content bg-primary inline-block p-2">Members</h1>
        <div className="mb-16">
          <p className="mt-0 mb-10">
            These are the {name} active creators and their streams. You can click on any creator to see their detailed
            contributions.
          </p>

          <div className="flex flex-col gap-6">
            {isAdmin && <AddBatch cohortAddress={params.cohortAddress} isErc20={isERC20 ?? false} />}

            {isLoading ? (
              <div>
                <div className="text-4xl animate-bounce mb-2">👾</div>
                <div className="text-lg ">Loading...</div>
              </div>
            ) : !creatorFlows || Array.from(creatorFlows.values()).length == 0 ? (
              <div>No creators</div>
            ) : (
              Array.from(creatorFlows.values()).map(creatorFlow => {
                if (creatorFlow.cap == 0) return;
                const cap = creatorFlow.cap;
                const unlocked = creatorFlow.availableAmount;
                const percentage = Math.floor((unlocked / cap) * 100);
                return (
                  <div className="flex items-center" key={creatorFlow.creatorAddress}>
                    <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-6">
                      <div className="flex flex-col md:items-center">
                        <div>
                          {isERC20 ? tokenSymbol : "Ξ"} {unlocked.toFixed(4)} / {cap}
                        </div>
                        <progress
                          className="progress w-56 progress-primary bg-white"
                          value={percentage}
                          max="100"
                        ></progress>
                      </div>
                      <div className="md:w-1/2 flex items-center">
                        <label
                          htmlFor="withdraw-events-modal"
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedAddress(creatorFlow.creatorAddress);
                          }}
                        >
                          <Address address={creatorFlow.creatorAddress} disableAddressLink={true} />
                        </label>
                        {isAdmin && (
                          <div className="ml-4 flex">
                            <UpdateCreator
                              cohortAddress={params.cohortAddress as string}
                              creatorAddress={creatorFlow.creatorAddress}
                            />
                            <RemoveCreator
                              cohortAddress={params.cohortAddress as string}
                              creatorAddress={creatorFlow.creatorAddress}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {isAdmin && (
          <FundCohort
            cohortAddress={params.cohortAddress}
            isErc20={isERC20 ?? false}
            tokenAddress={tokenAddress ?? ""}
            tokenSymbol={tokenSymbol ?? ""}
          />
        )}
        <StreamContractInfo
          owner={primaryAdmin || ""}
          isCreator={isCreator || false}
          cohortAddress={params.cohortAddress}
          isErc20={isERC20 ?? false}
          tokenSymbol={tokenSymbol ?? ""}
          balance={balance ?? 0}
          admins={admins ?? []}
          isLoading={isLoading}
          isAdmin={isAdmin ?? false}
        />
      </div>

      <input type="checkbox" id="withdraw-events-modal" className="modal-toggle" />
      <label htmlFor="withdraw-events-modal" className="modal cursor-pointer">
        <label className="modal-box relative max-w-4xl shadow shadow-primary">
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />
          <h3 className="text-xl font-bold mb-8">
            <p className="mb-1">Contributions</p>
            <Address address={selectedAddress} />
          </h3>
          <label htmlFor="withdraw-events-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <ul>
              {isLoadingWithdrawEvents ? (
                <div>
                  <div className="text-4xl animate-bounce mb-2">👾</div>
                  <div className="text-lg">Loading...</div>
                </div>
              ) : filteredWithdrawnEvents?.length > 0 ? (
                <div className="flex flex-col">
                  {filteredWithdrawnEvents?.map(event => (
                    <div key={event.transactionHash} className="flex flex-col">
                      <div>
                        <span className="font-bold">Date: </span>
                        {new Date(Number(event.blockData.timestamp) * 1000).toISOString().split("T")[0]}
                      </div>
                      <div>
                        <span className="font-bold">Amount: </span>
                        {isERC20 ? tokenSymbol + " " : "Ξ"}
                        {formatEther(event.args[1].toString())}
                      </div>
                      <div>{event.args[2]}</div>
                      <hr className="my-8" />
                    </div>
                  ))}
                </div>
              ) : (
                <p>No contributions</p>
              )}
            </ul>
          </div>
        </label>
      </label>
    </div>
  );
};

export default Page;
