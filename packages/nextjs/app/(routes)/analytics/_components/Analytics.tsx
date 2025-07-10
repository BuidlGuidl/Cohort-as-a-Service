"use client";

import { useState } from "react";
import { formatEther, formatUnits } from "viem";
import { useAccount } from "wagmi";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { chains } from "~~/data/chains";
import { useAnalytics } from "~~/hooks/useAnalytics";

const Analytics = () => {
  const { address } = useAccount();
  const { data, loading, error, isAdmin, refetch } = useAnalytics();
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [sortField, setSortField] = useState<string>("totalWithdrawn");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const sortedCohorts = data?.cohortAnalytics
    ? [...data.cohortAnalytics]
        .filter(cohort => selectedChain === null || cohort.chainId === selectedChain)
        .sort((a, b) => {
          let aValue: any, bValue: any;

          switch (sortField) {
            case "name":
              aValue = a.name;
              bValue = b.name;
              break;
            case "totalBuilders":
              aValue = a.totalBuilders;
              bValue = b.totalBuilders;
              break;
            case "activeBuilders":
              aValue = a.activeBuilders;
              bValue = b.activeBuilders;
              break;
            case "totalWithdrawn":
              aValue = a.totalWithdrawn;
              bValue = b.totalWithdrawn;
              break;
            case "createdAt":
              aValue = a.createdAt;
              bValue = b.createdAt;
              break;
            default:
              aValue = a.totalWithdrawn;
              bValue = b.totalWithdrawn;
          }

          if (sortDirection === "asc") {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        })
    : [];

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const formatAmount = (amount: bigint, decimals: number, symbol?: string) => {
    const formatted = formatUnits(amount, decimals);
    const num = parseFloat(formatted);
    const display = num.toLocaleString(undefined, { maximumFractionDigits: 4 });
    return symbol ? `${display} ${symbol}` : `${display} ETH`;
  };

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl mb-4">Connect your wallet to access analytics</h2>
        <RainbowKitCustomConnectButton />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl text-error">Access Denied</h2>
        <p className="mt-4">You don&apos;t have permission to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl text-error">Error Loading Analytics</h2>
        <p className="mt-4 text-center">{error}</p>
        <button className="btn btn-primary mt-4" onClick={refetch}>
          Try Again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl mb-4">No data available</h2>
          <button className="btn btn-primary" onClick={refetch}>
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Cohort Analytics</h1>
        <button className="btn btn-sm btn-outline" onClick={refetch}>
          Refresh Data
        </button>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Chain Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.chainAnalytics.map(chain => (
            <div
              key={chain.chainId}
              className={`card shadow-xl cursor-pointer hover:border-primary border border-neutral transition-all ${
                selectedChain === chain.chainId ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedChain(selectedChain === chain.chainId ? null : chain.chainId)}
            >
              <div className="card-body">
                <h3 className="card-title text-lg">{chain.chainName}</h3>
                <div className="stats stats-vertical shadow">
                  <div className="stat py-2">
                    <div className="stat-title text-xs">Total Cohorts</div>
                    <div className="stat-value text-2xl">{chain.totalCohorts}</div>
                  </div>
                  <div className="stat py-2">
                    <div className="stat-title text-xs">Total Builders</div>
                    <div className="stat-value text-2xl">{chain.totalBuilders}</div>
                    <div className="stat-desc text-xs">{chain.activeBuilders} active</div>
                  </div>
                  <div className="stat py-2">
                    <div className="stat-title text-xs">Total Withdrawn</div>
                    <div className="stat-value text-lg">{formatEther(chain.totalWithdrawn).slice(0, 8)}</div>
                    <div className="stat-desc text-xs">ETH</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            Cohort Details
            {selectedChain && (
              <span className="text-sm font-normal ml-2">
                (Filtered by {chains.find(c => c.chainId === selectedChain)?.name})
              </span>
            )}
          </h2>
          {selectedChain && (
            <button className="btn btn-sm btn-ghost" onClick={() => setSelectedChain(null)}>
              Clear Filter
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="cursor-pointer hover:bg-neutral" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-1">
                    Name
                    {sortField === "name" &&
                      (sortDirection === "asc" ? (
                        <ArrowUpIcon className="w-4 h-4" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4" />
                      ))}
                  </div>
                </th>
                <th>Chain</th>
                <th>Type</th>
                <th className="cursor-pointer hover:bg-neutral" onClick={() => handleSort("totalBuilders")}>
                  <div className="flex items-center gap-1">
                    Total Builders
                    {sortField === "totalBuilders" &&
                      (sortDirection === "asc" ? (
                        <ArrowUpIcon className="w-4 h-4" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4" />
                      ))}
                  </div>
                </th>
                <th className="cursor-pointer hover:bg-neutral" onClick={() => handleSort("activeBuilders")}>
                  <div className="flex items-center gap-1">
                    Active Builders
                    {sortField === "activeBuilders" &&
                      (sortDirection === "asc" ? (
                        <ArrowUpIcon className="w-4 h-4" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4" />
                      ))}
                  </div>
                </th>
                <th className="cursor-pointer hover:bg-neutral" onClick={() => handleSort("totalWithdrawn")}>
                  <div className="flex items-center gap-1">
                    Total Withdrawn
                    {sortField === "totalWithdrawn" &&
                      (sortDirection === "asc" ? (
                        <ArrowUpIcon className="w-4 h-4" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4" />
                      ))}
                  </div>
                </th>
                <th className="cursor-pointer hover:bg-neutral" onClick={() => handleSort("createdAt")}>
                  <div className="flex items-center gap-1">
                    Created
                    {sortField === "createdAt" &&
                      (sortDirection === "asc" ? (
                        <ArrowUpIcon className="w-4 h-4" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4" />
                      ))}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCohorts.map(cohort => (
                <tr key={cohort.id} className="hover:bg-neutral">
                  <td>
                    <a
                      href={`/cohort/${cohort.address}`}
                      className="link link-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {cohort.name}
                    </a>
                  </td>
                  <td>{cohort.chainName}</td>
                  <td>
                    <span className={`badge ${cohort.isERC20 ? "badge-warning" : "badge-primary"}`}>
                      {cohort.isERC20 ? cohort.tokenSymbol || "ERC20" : "ETH"}
                    </span>
                  </td>
                  <td>{cohort.totalBuilders}</td>
                  <td>{cohort.activeBuilders}</td>
                  <td>
                    {formatAmount(
                      cohort.totalWithdrawn,
                      cohort.tokenDecimals,
                      cohort.isERC20 ? cohort.tokenSymbol : undefined,
                    )}
                  </td>
                  <td>{new Date(Number(cohort.createdAt) * 1000).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
