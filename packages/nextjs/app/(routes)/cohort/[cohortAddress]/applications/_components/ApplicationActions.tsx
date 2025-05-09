"use client";

import ApproveApplication from "./ApproveApplication";

interface ApplicationActionsProps {
  applicationId: string;
  cohortAddress: string;
  builderAddress: string;
  githubUsername?: string;
  isErc20: boolean;
  tokenDecimals?: number;
}

export const ApplicationActions = ({
  applicationId,
  cohortAddress,
  builderAddress,
  githubUsername,
  isErc20,
  tokenDecimals,
}: ApplicationActionsProps) => {
  return (
    <ApproveApplication
      applicationId={applicationId}
      cohortAddress={cohortAddress}
      builderAddress={builderAddress}
      githubUsername={githubUsername}
      isErc20={isErc20}
      tokenDecimals={tokenDecimals}
    />
  );
};

export default ApplicationActions;
