import React, { useEffect, useState } from "react";
import { AdminsList } from "./AdminsList";
import { CohortActions } from "./CohortActions";
import { NativeBalance } from "./NativeBalance";
import { TokenBalance } from "./TokenBalance";
import { Project } from "@prisma/client";
import { ChevronDown, TriangleAlert, TriangleAlertIcon, X } from "lucide-react";
import { useAccount } from "wagmi";
import { useSwitchChain } from "wagmi";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { Editor } from "~~/components/editor";
import { Preview } from "~~/components/preview";
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
  allowApplications: boolean;
  projects?: Project[];
}

const ProjectSelector = ({
  projects = [],
  selectedProjects,
  onSelectionChange,
}: {
  projects: Project[];
  selectedProjects: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleProject = (projectId: string) => {
    const isSelected = selectedProjects.includes(projectId);
    if (isSelected) {
      onSelectionChange(selectedProjects.filter(id => id !== projectId));
    } else {
      onSelectionChange([...selectedProjects, projectId]);
      setIsOpen(false);
    }
  };

  const removeProject = (projectId: string) => {
    onSelectionChange(selectedProjects.filter(id => id !== projectId));
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectedProjectsData = projects.filter(p => selectedProjects.includes(p.id));

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <label className="label">
        <span className="label-text font-medium">Related Projects </span>
      </label>
      {selectedProjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedProjectsData.map(project => (
            <div key={project.id} className="badge badge-primary gap-2">
              <span className="text-xs">{project.name}</span>
              <button
                type="button"
                onClick={() => removeProject(project.id)}
                className="hover:bg-primary-focus rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative w-full">
        <div
          role="button"
          className="input input-sm input-bordered border border-base-300 w-full flex items-center justify-between bg-base-100 rounded-md cursor-pointer"
          onClick={toggleDropdown}
        >
          <span className="text-base-content/60">
            {selectedProjects.length === 0
              ? "Select related projects..."
              : `${selectedProjects.length} project${selectedProjects.length === 1 ? "" : "s"} selected`}
          </span>
          <ChevronDown className="w-4 h-4" />
        </div>

        {isOpen && (
          <ul className="absolute bottom-full left-0 right-0 mb-1 menu bg-base-100 rounded-box z-[9999] w-full p-2 shadow-lg border border-base-300 max-h-40 overflow-y-auto">
            {projects.map(project => {
              const isSelected = selectedProjects.includes(project.id);
              return (
                <li key={project.id}>
                  <label className="cursor-pointer flex items-center gap-2 hover:bg-base-200">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-primary"
                      checked={isSelected}
                      onChange={() => toggleProject(project.id)}
                    />
                    <span className="font-medium text-sm">{project.name}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

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
  allowApplications,
  projects = [],
}: StreamContractInfoProps) => {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [networkColor, setNetworkColor] = useState<string>("#bbbbbb");

  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const { streamWithdraw, isPending, isSuccess } = useCohortWithdraw({
    cohortAddress,
    amount,
    reason,
    isErc20,
    tokenDecimals,
    selectedProjects,
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
      setAmount("");
      setReason("");
      setSelectedProjects([]);
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
        {cohortChainId && chainId !== cohortChainId && address && (
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
              allowApplications={allowApplications}
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
      <div className="modal">
        <div className="modal-box relative bg-base-100 border border-primary max-w-2xl">
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
            <div className="flex flex-col gap-2 items-center space-y-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Reason for withdrawal</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`btn btn-xs ${!isPreviewing ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => setIsPreviewing(false)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={`btn btn-xs ${isPreviewing ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => setIsPreviewing(true)}
                    >
                      Preview
                    </button>
                  </div>
                </label>

                <div className="min-h-[200px] border border-base-300 rounded-md">
                  {isPreviewing ? (
                    <div className="p-4">
                      {reason ? (
                        <Preview value={reason} />
                      ) : (
                        <p className="text-base-content/60 italic">Nothing to preview yet...</p>
                      )}
                    </div>
                  ) : (
                    <Editor value={reason} onChange={setReason} />
                  )}
                </div>
              </div>

              {cycle > 0 && (
                <div className="w-full">
                  {isErc20 ? (
                    <div className="relative">
                      <input
                        className="input input-sm rounded-md input-bordered border border-base-300 w-full"
                        placeholder={`Amount of ${tokenSymbol}`}
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*(\.[0-9]+)?"
                        onChange={e => setAmount(e.target.value.toString())}
                        disabled={isPending}
                      />
                      {tokenSymbol && (
                        <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">
                          {tokenSymbol}
                        </span>
                      )}
                    </div>
                  ) : (
                    <EtherInput value={amount} onChange={value => setAmount(value)} placeholder="Amount in ETH" />
                  )}
                </div>
              )}

              <ProjectSelector
                projects={projects}
                selectedProjects={selectedProjects}
                onSelectionChange={setSelectedProjects}
              />

              <button
                type="button"
                className="btn btn-secondary btn-sm w-full"
                disabled={
                  isPending ||
                  reason === "" ||
                  reason === "<p><br></p>" ||
                  parseFloat(amount) <= 0 ||
                  Number.isNaN(parseFloat(amount))
                }
                onClick={streamWithdraw}
              >
                {connectedAddressRequiresApproval ? "Request Withdrawal" : "Withdraw"}
              </button>
            </div>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="withdraw-modal"></label>
      </div>

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
