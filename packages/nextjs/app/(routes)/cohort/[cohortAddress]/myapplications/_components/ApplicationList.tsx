"use client";

import { useEffect, useState } from "react";
import { Application, Builder } from "@prisma/client";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

interface ApplicationListProps {
  applications: Application[];
  builders: Builder[];
  adminAddresses: string[];
  cohortAddress: string;
}

export const ApplicationList = ({ applications, builders, adminAddresses }: ApplicationListProps) => {
  const { address } = useAccount();

  const [userApplications, setUserApplications] = useState<Application[]>([]);

  const isBuilderorAdmin = () => {
    if (!address) return false;
    const isBuilder = builders.some(builder => builder.address.toLowerCase() === address.toLowerCase());
    const isAdmin = adminAddresses.some(admin => admin.toLowerCase() === address.toLowerCase());
    return isBuilder || isAdmin;
  };

  useEffect(() => {
    if (address && applications) {
      const filtered = applications.filter(app => app.address.toLowerCase() === address.toLowerCase());
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
      ) : isBuilderorAdmin() ? (
        <div className="mb-4">
          <p className="text-sm">You are already member of this cohort. You cannot apply.</p>
        </div>
      ) : (
        <>
          {userApplications.length === 0 ? (
            <p>You haven&apos;t submitted any applications yet.</p>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Your Applications</h3>
              {userApplications.map(application => (
                <div key={application.id} className="border border-base-300 rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm ">{application.description}</span>
                    {formatStatus(application.status)}
                  </div>
                  {application.githubUsername && (
                    <p className="text-xs text-gray-400">
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
                  <p className="text-xs text-gray-400 mt-2">Submitted on {formatDate(application.createdAt)}</p>
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
