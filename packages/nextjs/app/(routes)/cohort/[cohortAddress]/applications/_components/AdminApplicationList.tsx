"use client";

import { useEffect, useState } from "react";
import ApplicationActions from "./ApplicationActions";
import { Application, ApplicationStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAccount } from "wagmi";
import { useSwitchChain } from "wagmi";
import { EmptyApplicationsState } from "~~/components/Empty-states";
import { Preview } from "~~/components/preview";
import { Address, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useCohortData } from "~~/hooks/useCohortData";

interface AdminApplicationListProps {
  cohortAddress: string;
  applications?: Application[];
}

export const AdminApplicationList = ({ cohortAddress, applications }: AdminApplicationListProps) => {
  const [activeFilter, setActiveFilter] = useState<ApplicationStatus | "ALL">("ALL");
  const { address, chainId: connectedChainId } = useAccount();
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  const { isERC20: isErc20, tokenDecimals, tokenSymbol, chainId, isAdmin } = useCohortData(cohortAddress);
  const { switchChain } = useSwitchChain();

  const formatTime = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "Unknown time ago";
    }
  };

  const toggleDescription = (id: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    if (isAdmin && chainId && connectedChainId && chainId !== connectedChainId) {
      switchChain({ chainId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, address, connectedChainId, isAdmin]);

  const renderDescription = (description: string, id: string) => {
    const isExpanded = expandedDescriptions[id];
    const isLong = description.length > 150;

    if (!isLong) {
      return (
        <div className="text-sm ">
          <Preview value={description} />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className={`text-sm ${isExpanded ? "" : "max-h-4 overflow-hidden"}`}>
          <Preview value={description} />
        </div>
        <button onClick={() => toggleDescription(id)} className="btn btn-xs btn-ghost flex items-center gap-1">
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              <span>Show less</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              <span>Show more</span>
            </>
          )}
        </button>
      </div>
    );
  };

  const filteredApplications = applications?.filter(app => {
    if (activeFilter === "ALL") return true;
    return app.status === activeFilter;
  });

  if (!address) {
    return <RainbowKitCustomConnectButton />;
  }

  if (!isAdmin) {
    return <div>You do not have admin access to view applications</div>;
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl mb-6 inline-block px-4 py-2 bg-primary text-secondary">Manage Applications</h2>

      <div className="flex gap-2 mb-6">
        <button
          className={`btn btn-sm ${activeFilter === "ALL" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setActiveFilter("ALL")}
        >
          All ({applications?.length})
        </button>
        <button
          className={`btn btn-sm ${activeFilter === "PENDING" ? "btn-warning" : "btn-outline"}`}
          onClick={() => setActiveFilter("PENDING")}
        >
          Pending ({applications?.filter(a => a.status === "PENDING").length})
        </button>
        <button
          className={`btn btn-sm ${activeFilter === "APPROVED" ? "btn-success" : "btn-outline"}`}
          onClick={() => setActiveFilter("APPROVED")}
        >
          Approved ({applications?.filter(a => a.status === "APPROVED").length})
        </button>
        <button
          className={`btn btn-sm ${activeFilter === "REJECTED" ? "btn-error" : "btn-outline"}`}
          onClick={() => setActiveFilter("REJECTED")}
        >
          Rejected ({applications?.filter(a => a.status === "REJECTED").length})
        </button>
      </div>

      {filteredApplications?.length === 0 ? (
        <EmptyApplicationsState status={activeFilter} isAdmin={true} />
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Applicant</th>
                <th className="w-1/3">Description</th>
                <th>GitHub</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications?.map(application => (
                <tr key={application.id}>
                  <td>
                    <Address address={application.address} />
                  </td>
                  <td className="max-w-md">{renderDescription(application.description, application.id)}</td>
                  <td>
                    {application.githubUsername ? (
                      <a
                        href={`https://github.com/${application.githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {application.githubUsername}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {application.status === "PENDING" && <span className="badge badge-warning">Pending</span>}
                    {application.status === "APPROVED" && <span className="badge badge-success">Approved</span>}
                    {application.status === "REJECTED" && <span className="badge badge-error">Rejected</span>}
                  </td>
                  <td>{formatTime(application.createdAt)}</td>
                  <td>
                    {application.status === "PENDING" && (
                      <ApplicationActions
                        applicationId={application.id}
                        cohortAddress={cohortAddress}
                        builderAddress={application.address}
                        githubUsername={application.githubUsername || undefined}
                        isErc20={isErc20 || false}
                        tokenDecimals={tokenDecimals}
                        tokenSymbol={tokenSymbol || ""}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminApplicationList;
