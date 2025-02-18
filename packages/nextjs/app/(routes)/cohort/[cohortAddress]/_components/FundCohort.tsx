"use client";

import { useState } from "react";
import { EtherInput } from "~~/components/scaffold-eth";
import { useFunding } from "~~/hooks/useFunding";

interface FundCohortProps {
  cohortAddress: string;
  isErc20: boolean;
  tokenAddress: string;
  tokenSymbol: string;
}

export const FundCohort = ({ cohortAddress, tokenAddress, isErc20, tokenSymbol }: FundCohortProps) => {
  const [amount, setAmount] = useState<number>(0);
  const [isTransferLoading, setIsTransferLoading] = useState(false);

  const { fund, isLoading, isMining, approve, allowance } = useFunding({
    cohortAddress,
    amount,
    tokenAddress,
    isErc20,
    isTransferLoading,
  });

  const onClick = async () => {
    setIsTransferLoading(true);
    if (isErc20 && (allowance as number) < amount) {
      await approve();
    } else {
      await fund();
      setAmount(0);
    }
    setIsTransferLoading(false);
  };

  return (
    <>
      <input type="checkbox" id="fund-cohort-modal" className="modal-toggle" />
      <label htmlFor="fund-cohort-modal" className="modal cursor-pointer">
        <label className="modal-box relative shadow shadow-primary">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <div className="font-bold mb-8 flex items-center gap-1 text-error">Fund Cohort</div>
          <label htmlFor="fund-cohort-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <div className="flex flex-col gap-6 items-center ">
              <div className="w-full">
                {isErc20 ? (
                  <input
                    className="input input-sm rounded-md input-bordered border border-base-300 w-full"
                    placeholder={`Amount of ${tokenSymbol}`}
                    type="number"
                    onChange={e => setAmount(Number(e.target.value))}
                  />
                ) : (
                  <EtherInput value={amount.toString()} onChange={e => setAmount(Number(e))} />
                )}
              </div>
              <button className="btn btn-sm btn-primary w-full" onClick={onClick} disabled={isLoading || isMining}>
                {isErc20 ? <>{(allowance as number) < amount ? "Approve" : "Fund"}</> : "Fund"}
              </button>
            </div>
          </div>
        </label>
      </label>
    </>
  );
};
