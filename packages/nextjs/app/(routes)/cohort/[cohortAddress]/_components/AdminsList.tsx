import React from "react";
import { AddAdmin } from "./AddAdmin";
import { RemoveAdmin } from "./RemoveAdmin";
import { Address } from "~~/components/scaffold-eth";

interface AdminListProps {
  cohortAddress: string;
  admins: string[];
  adminsLoading: boolean;
}

export const AdminsList = ({ cohortAddress, admins, adminsLoading }: AdminListProps) => {
  const LoadingAddress = () => (
    <div className="flex gap-4 mt-2 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded"></div>
      <div className="h-6 w-10 bg-gray-200 rounded"></div>
    </div>
  );

  return (
    <div>
      <AddAdmin cohortAddress={cohortAddress} />

      {adminsLoading ? (
        <>
          <LoadingAddress />
          <LoadingAddress />
        </>
      ) : (
        <>
          {admins.length === 0 && <p>No admin</p>}

          {admins.map((admin, index) => (
            <div className="flex gap-4 mt-2" key={index}>
              <Address address={admin} />
              <RemoveAdmin cohortAddress={cohortAddress} adminAddress={admin} />
            </div>
          ))}
        </>
      )}
    </div>
  );
};
