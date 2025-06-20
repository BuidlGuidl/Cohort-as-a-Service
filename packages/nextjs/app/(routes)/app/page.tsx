"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { useAccount } from "wagmi";

const AppPage: NextPage = () => {
  const { address } = useAccount();

  if (!address) {
    return (
      <div className="flex flex-col flex-grow pt-10 max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Your Stream Dashboard</h1>
          <p className="text-lg text-base-content/70 mb-8">
            Connect your wallet to start managing payment streams and bounty systems
          </p>
          <div className="flex justify-center">
            <ConnectButton.Custom>
              {({ openConnectModal }) => {
                return (
                  <button className="btn btn-primary btn-sm" onClick={openConnectModal} type="button">
                    Connect Wallet
                  </button>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card bg-base-100 shadow-xl border border-base-300 opacity-50">
            <div className="card-body">
              <h2 className="card-title text-primary">Create Payment Stream</h2>
              <p className="text-sm text-base-content/70 mb-4">
                Deploy a new payment stream for your team with automated withdrawals and flexible controls.
              </p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm" disabled>
                  Connect Wallet First
                </button>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl border border-base-300 opacity-50">
            <div className="card-body">
              <h2 className="card-title text-primary">My Streams</h2>
              <p className="text-sm text-base-content/70 mb-4">
                View and manage your existing payment streams, builders, and withdrawal settings.
              </p>
              <div className="card-actions justify-end">
                <button className="btn btn-secondary btn-sm" disabled>
                  Connect Wallet First
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow pt-10 max-w-6xl mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to Your Dashboard</h1>
        <p className="text-lg text-base-content/70">Manage your payment streams and bounty systems</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Create New Stream */}
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-primary">Create Payment Stream</h2>
            <p className="text-sm text-base-content/70 mb-4">
              Deploy a new payment stream for your team with automated withdrawals and flexible controls.
            </p>
            <div className="card-actions justify-end">
              <Link href="/create">
                <button className="btn btn-primary btn-sm">Create Stream</button>
              </Link>
            </div>
          </div>
        </div>

        {/* View My Streams */}
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-primary">My Streams</h2>
            <p className="text-sm text-base-content/70 mb-4">
              View and manage your existing payment streams, builders, and withdrawal settings.
            </p>
            <div className="card-actions justify-end">
              <Link href="/cohorts">
                <button className="btn btn-secondary btn-sm">View Streams</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppPage;
