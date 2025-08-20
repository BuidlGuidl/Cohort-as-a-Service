"use client";

import { useEffect, useState } from "react";
import { Application } from "@prisma/client";
import { useAccount } from "wagmi";
import { EmptyApplicationsState } from "~~/components/EmptyStates";
import { Preview } from "~~/components/preview";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

interface ApplicationListProps {
  applications: Application[];
  cohortAddress: string;
}

export const ApplicationList = ({ applications }: ApplicationListProps) => {
  const { address } = useAccount();

  const [userApplications, setUserApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (address && applications) {
      const filtered = applications.filter(app => app.address.toLowerCase() === address.toLowerCase()).reverse();
      setUserApplications(filtered);
    }
  }, [address, applications]);

  const formatStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="badge badge-warning">Pending</span>;
      case "APPROVED":
        return <span className="badge badge-success">Approved</span>;
      case "REJECTED":
        return <span className="badge badge-error">Rejected</span>;
      default:
        return <span className="badge">Unknown</span>;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  if (!address) {
    return <RainbowKitCustomConnectButton />;
  }

  return (
    <div className="w-full">
      {!address ? (
        <div className="mb-4">Connect your wallet to view and submit applications</div>
      ) : (
        <>
          {userApplications.length === 0 ? (
            <div className="w-full">
              <EmptyApplicationsState isAdmin={false} />
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Your Applications</h3>
              {userApplications.map(application => (
                <div key={application.id} className="border border-base-300 rounded-md p-4 text-xs text-gray-400">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      Description: <Preview value={application.description} fontSize={12} />
                    </div>
                    {formatStatus(application.status)}
                  </div>
                  {application.githubUsername && (
                    <p>
                      GitHub:{" "}
                      <a
                        href={`https://github.com/${application.githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {application.githubUsername}
                      </a>
                    </p>
                  )}
                  {application.note && (
                    <div>
                      Note: <Preview value={application.note} fontSize={12} />
                    </div>
                  )}
                  <p className="mt-2">Submitted on {formatDate(application.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ApplicationList;
