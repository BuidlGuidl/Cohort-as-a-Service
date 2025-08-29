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
    <div className="max-w-4xl mt-10 space-y-6 mx-auto relative">
      {/* Content - always visible, blur only the main content area */}
      <div className={address ? "" : "blur-sm pointer-events-none relative z-0"}>
        <h1 className="text-2xl font-medium font-space-grotesk">Create a new cohort</h1>
        <ChainToggler />
        <CreateCohortForm existingSubdomains={existingSubdomains} />
      </div>

      {/* Fixed floating Connect Wallet button when not connected */}
      {!address && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="pointer-events-auto [&_.btn]:bg-gray-800 [&_.btn]:hover:bg-gray-700 [&_.btn]:text-primary-content [&_.btn]:text-lg [&_.btn]:w-56 [&_.btn]:h-12 [&_.btn]:rounded-lg [&_.btn]:border-none [&_.btn]:font-share-tech-mono [&_.btn]:shadow-2xl">
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePageClient;
