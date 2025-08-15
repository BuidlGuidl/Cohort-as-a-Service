"use client";

import ChainToggler from "./ChainToggler";
import CreateCohortForm from "./CreateCohortForm";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

interface CreatePageClientProps {
  existingSubdomains: string[];
}

const CreatePageClient = ({ existingSubdomains }: CreatePageClientProps) => {
  const { address } = useAccount();

  return (
    <div className="max-w-4xl mt-10 space-y-6 mx-auto">
      <h1 className="text-2xl font-semibold font-space-grotesk">Create a new cohort</h1>

      {address ? (
        <>
          <ChainToggler />
          <CreateCohortForm existingSubdomains={existingSubdomains} />
        </>
      ) : (
        <div className="flex justify-center">
          <div className="[&_.btn]:bg-gray-800 [&_.btn]:hover:bg-gray-700 [&_.btn]:text-primary-content [&_.btn]:text-lg [&_.btn]:w-56 [&_.btn]:h-12 [&_.btn]:rounded-lg [&_.btn]:border-none [&_.btn]:font-share-tech-mono">
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePageClient;
