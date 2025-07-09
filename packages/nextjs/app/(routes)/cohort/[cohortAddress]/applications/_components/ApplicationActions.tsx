"use client";

import ApproveApplication from "./ApproveApplication";

interface ApplicationActionsProps {
  applicationId: string;
  cohortAddress: string;
  builderAddress: string;
  githubUsername?: string;
  isErc20: boolean;
  tokenDecimals?: number;
  tokenSymbol?: string;
}

export const ApplicationActions = ({
  applicationId,
  cohortAddress,
  builderAddress,
  githubUsername,
  isErc20,
  tokenDecimals,
  tokenSymbol,
}: ApplicationActionsProps) => {
  return (
    <ApproveApplication
      applicationId={applicationId}
      cohortAddress={cohortAddress}
      builderAddress={builderAddress}
      githubUsername={githubUsername}
      isErc20={isErc20}
      tokenDecimals={tokenDecimals}
      tokenSymbol={tokenSymbol}
    />
  );
};

export default ApplicationActions;
