import React, { useEffect, useState } from "react";
import { AdminsList } from "./AdminsList";
import { CohortActions } from "./CohortActions";
import { NativeBalance } from "./NativeBalance";
import { TokenBalance } from "./TokenBalance";
import { TriangleAlert, TriangleAlertIcon } from "lucide-react";
import { useAccount } from "wagmi";
import { useSwitchChain } from "wagmi";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { EtherInput } from "~~/components/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";
import { getChainById } from "~~/data/chains";
import { getNetworkColor } from "~~/hooks/scaffold-eth";
import { useCohortWithdraw } from "~~/hooks/useCohortWithdraw";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

interface StreamContractInfoProps {
  owner: string;
  isBuilder: boolean;
  oneTimeAlreadyWithdrawn?: boolean;
  cohortAddress: string;
  isErc20: boolean;
  tokenSymbol: string;
  balance: number;
  chainId?: number;
  chainName?: string;
  admins: string[];
  isLoadingAdmins: boolean;
  isAdmin: boolean;
  connectedAddressRequiresApproval: boolean;
  tokenAddress: string;
  tokenDecimals?: number;
  isLoading: boolean;
  locked: boolean;
  cycle: number;
  requiresApproval: boolean;
}

export const StreamContractInfo = ({
  owner,
  isBuilder,
  oneTimeAlreadyWithdrawn,
  cohortAddress,
  isErc20,
  tokenSymbol,
  balance,
  chainId: cohortChainId,
  chainName,
  admins,
  isLoadingAdmins,
  isAdmin,
  connectedAddressRequiresApproval,
  tokenAddress,
  isLoading,
  locked,
  tokenDecimals,
  cycle,
  requiresApproval,
}: StreamContractInfoProps) => {
  const { address, chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const [networkColor, setNetworkColor] = useState<string>("#bbbbbb");

  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const { streamWithdraw, isPending, isSuccess } = useCohortWithdraw({
    cohortAddress,
    amount,
    reason,
    isErc20,
    tokenDecimals,
  });

  const onClick = (chainId: number) => {
    switchChain({ chainId: chainId });
  };

  useEffect(() => {
    if (isSuccess) {
      const modalCheckbox = document.getElementById("withdraw-modal") as HTMLInputElement;
      if (modalCheckbox) {
        modalCheckbox.checked = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  useEffect(() => {
    if (!chainId) return;
    const chain = getChainById(chainId);
    const networkColor = getNetworkColor(chain as ChainWithAttributes, true);
    setNetworkColor(networkColor);
  }, [chainId]);

  return (
    <>
      <div className="">
        {cohortChainId && chainId !== cohortChainId && isConnected && (
          <div
            onClick={() => onClick(cohortChainId)}
            className="bg-error/15 px-3 py-1 w-fit rounded-md flex items-center gap-x-2 text-sm text-destructive mb-3 cursor-pointer hover:bg-error/25"
          >
            <TriangleAlert className="w-4 h-4" />
            <p>{`You are on the wrong network! Switch to ${chainName}`}</p>
          </div>
        )}
        <div className="flex gap-1 items-start">
          <div className="flex flex-col items-center">
            <Address address={cohortAddress} />
            <div className="flex gap-2 items-center mt-1 justify-between w-full">
              {locked && (
                <div className="tooltip cursor-pointer" data-tip="stream withdrawals are currently disallowed">
                  <span className="badge badge-error badge-outline text-xs">Locked</span>
                </div>
              )}

              <span className="text-xs" style={{ color: networkColor }}>
                {chainName}
              </span>
            </div>
            <div className="w-full">
              <span className="text-xs text-accent/70">{cycle > 0 ? `Cycle: ${cycle} days` : "One Time Cohort"}</span>
            </div>
          </div>{" "}
          /
          {!isLoading &&
            (isErc20 ? (
              <TokenBalance balance={balance} tokenSymbol={tokenSymbol} className="text-3xl" />
            ) : (
              <NativeBalance address={cohortAddress} className="text-3xl" chainId={cohortChainId as number} />
            ))}
          {isAdmin && (
            <CohortActions
              cohortAddress={cohortAddress}
              tokenAddress={tokenAddress}
              tokenSymbol={tokenSymbol}
              isErc20={isErc20}
              locked={locked}
              tokenDecimals={tokenDecimals}
              requiresApproval={requiresApproval}
            />
          )}
        </div>
        {address && isBuilder && !oneTimeAlreadyWithdrawn && (
          <div className="mt-3">
            <label
              htmlFor="withdraw-modal"
              className="btn btn-primary btn-sm px-2 rounded-md font-normal space-x-2 normal-case"
            >
              <BanknotesIcon className="h-4 w-4" />
              <span>Withdraw</span>
            </label>
          </div>
        )}
        {oneTimeAlreadyWithdrawn && isBuilder && (
          <div className="mt-3">
            <label className="bg-primary flex rounded-md items-center gap-4 p-2 w-fit">
              <TriangleAlertIcon className="h-4 w-4" />
              <span>Stream Withdrawn</span>
            </label>
          </div>
        )}
      </div>

      <input type="checkbox" id="withdraw-modal" className="modal-toggle" />
      <label htmlFor="withdraw-modal" className="modal cursor-pointer">
        <label className="modal-box relative border border-primary">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <h3 className="font-bold">
            {connectedAddressRequiresApproval ? "Request a Withdrawal" : "Withdraw from your stream"}
          </h3>
          {connectedAddressRequiresApproval && (
            <span className="label-text-alt text-base-content/60">
              Your withdrawal requires approval. You may submit a new request if you have no incomplete/pending request.
            </span>
          )}
          <label htmlFor="withdraw-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3 mt-8">
            <div className="flex flex-col gap-6 items-center">
              <textarea
                className="textarea textarea-ghost focus:outline-none min-h-[200px] focus:bg-transparent px-4 w-full font-medium placeholder:text-accent/50 border border-base-300 rounded-md text-accent"
                placeholder="Reason for withdrawing & links"
                value={reason}
                onChange={event => setReason(event.target.value)}
              />
              {cycle > 0 && (
                <div className="w-full">
                  {isErc20 ? (
                    <input
                      className="input input-sm rounded-md input-bordered border border-base-300 w-full"
                      placeholder={`Amount of ${tokenSymbol}`}
                      type="number"
                      onChange={e => setAmount(e.target.value.toString())}
                    />
                  ) : (
                    <EtherInput value={amount} onChange={value => setAmount(value)} />
                  )}
                </div>
              )}
              <button
                type="button"
                className="btn btn-secondary btn-sm w-full"
                disabled={isPending}
                onClick={streamWithdraw}
              >
                {connectedAddressRequiresApproval ? "Request Withdrawal" : "Withdraw"}
              </button>
            </div>
          </div>
        </label>
      </label>

      <div className="mt-8">
        <p className="font-bold mb-2 text-secondary">Owner</p>
        <Address address={owner} />
      </div>

      {isAdmin && (
        <div className="mt-8">
          <p className="font-bold mb-2 text-secondary">Admins</p>
          <AdminsList admins={admins} cohortAddress={cohortAddress} isLoading={isLoadingAdmins} />
        </div>
      )}
    </>
  );
};
