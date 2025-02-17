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
  return (
    <div>
      <AddAdmin cohortAddress={cohortAddress} />
      {admins.length == 0 && <p>No admin</p>}

      {admins.map((admin, index) => (
        <div className="flex gap-4 mt-2" key={index}>
          <Address address={admin} />
          <RemoveAdmin cohortAddress={cohortAddress} adminAddress={admin} />
        </div>
      ))}
    </div>
  );
};
