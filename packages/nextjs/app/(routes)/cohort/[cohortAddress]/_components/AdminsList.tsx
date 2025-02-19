import React from "react";
import { RemoveAdmin } from "./RemoveAdmin";
import { AddAdmin } from "./AddAdmin";
import { Address } from "~~/components/scaffold-eth";

interface AdminListProps {
  cohortAddress: string;
  admins: string[];
  isLoading: boolean;
}

export const AdminsList = ({ cohortAddress, admins, isLoading }: AdminListProps) => {
  const LoadingAddress = () => (
    <div className="flex gap-4 mt-2 w-fit ">
      <div className="h-5 w-32 bg-gray-200 rounded skeleton"></div>
      <div className="h-5 w-10 bg-gray-200 rounded skeleton"></div>
    </div>
  );

  return (
    <div>
      <AddAdmin cohortAddress={cohortAddress} />

      {isLoading ? (
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
