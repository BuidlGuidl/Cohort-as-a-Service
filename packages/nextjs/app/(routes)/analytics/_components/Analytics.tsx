"use client";

import { useState } from "react";
import { SearchInput } from "./SearchInput";
import { motion } from "framer-motion";
import { formatEther, formatUnits } from "viem";
import { useAccount } from "wagmi";
import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { EmptyAnalyticsState } from "~~/components/Empty-states";
import { FilterDropdown } from "~~/components/FilterDropdown";
import { AnalyticsCardSkeleton } from "~~/components/Skeletons";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { chains } from "~~/data/chains";
import { useAnalytics } from "~~/hooks/useAnalytics";

const Analytics = () => {
  const { address, isConnecting } = useAccount();
  const { data, loading, error, isAdmin, refetch } = useAnalytics();
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [sortField, setSortField] = useState<string>("totalWithdrawn");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const sortedCohorts = data?.cohortAnalytics
    ? [...data.cohortAnalytics]
        .filter(cohort => {
          if (selectedChain !== null && cohort.chainId !== selectedChain) return false;

          if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
              cohort.name.toLowerCase().includes(search) ||
              cohort.chainName.toLowerCase().includes(search) ||
              cohort.address.toLowerCase().includes(search)
            );
          }
          return true;
        })
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

  const totalItems = sortedCohorts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCohorts = sortedCohorts.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleChainFilter = (chainId: number | null) => {
    setSelectedChain(chainId);
    setCurrentPage(1);
  };

  const formatAmount = (amount: bigint, decimals: number, symbol?: string) => {
    const formatted = formatUnits(amount, decimals);
    const num = parseFloat(formatted);
    const display = num.toLocaleString(undefined, { maximumFractionDigits: 4 });
    return symbol ? `${display} ${symbol}` : `${display} ETH`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Cohort Analytics</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <AnalyticsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  } else if (!isConnecting && !loading && !address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl mb-4">Connect your wallet to access analytics</h2>
        <RainbowKitCustomConnectButton />
      </div>
    );
  } else if (!isAdmin && !isConnecting && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl text-error">Access Denied</h2>
        <p className="mt-4">You don&apos;t have permission to view this page.</p>
      </div>
    );
  } else if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl text-error">Error Loading Analytics</h2>
        <p className="mt-4 text-center">{error}</p>
        <button className="btn btn-primary mt-4" onClick={refetch}>
          Try Again
        </button>
      </div>
    );
  } else if (
    (!data || (data.chainAnalytics.length === 0 && data.cohortAnalytics.length === 0)) &&
    !isConnecting &&
    !loading &&
    address &&
    isAdmin
  ) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Cohort Analytics</h1>
        </div>
        <EmptyAnalyticsState />
      </div>
    );
  }

  if (!loading && data && address && isAdmin)
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
                onClick={() => handleChainFilter(selectedChain === chain.chainId ? null : chain.chainId)}
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
              <button className="btn btn-sm btn-ghost" onClick={() => handleChainFilter(null)}>
                Clear Filter
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6 tems-start">
            <SearchInput value={searchTerm} onChange={setSearchTerm} />
            <div className="flex gap-4 items-center">
              <FilterDropdown
                label="Sort By"
                value={sortField}
                onChange={setSortField}
                options={[
                  { value: "name", label: "Name" },
                  { value: "totalBuilders", label: "Total Builders" },
                  { value: "activeBuilders", label: "Active Builders" },
                  { value: "totalWithdrawn", label: "Total Withdrawn" },
                  { value: "createdAt", label: "Created Date" },
                ]}
              />

              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setSortDirection(prev => (prev === "asc" ? "desc" : "asc"))}
              >
                {sortDirection === "asc" ? "↑" : "↓"} {sortDirection}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between  mb-4 gap-4">
            <div className="text-sm">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Show</label>
              <select
                className="select select-bordered select-sm"
                value={itemsPerPage}
                onChange={e => handleItemsPerPageChange(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm">entries</span>
            </div>
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
              {paginatedCohorts.length > 0 ? (
                <tbody>
                  {paginatedCohorts.map((cohort, index) => (
                    <motion.tr
                      key={cohort.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
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
                    </motion.tr>
                  ))}
                </tbody>
              ) : (
                <div className="flex mx-auto px-4 py-8  w-full ">No cohots found</div>
              )}
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center mt-6 gap-4">
              <div className="join">
                <button
                  className="join-item btn btn-sm btn-neutral"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>

                {getPageNumbers().map((pageNum, index) => (
                  <button
                    key={index}
                    className={`join-item btn btn-sm ${
                      pageNum === currentPage ? "btn-neutral" : "btn-primary"
                    } ${pageNum === "..." ? "btn-disabled" : ""}`}
                    onClick={() => typeof pageNum === "number" && handlePageChange(pageNum)}
                    disabled={pageNum === "..."}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  className="join-item btn btn-sm btn-neutral"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">Go to page:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={e => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      handlePageChange(page);
                    }
                  }}
                  className="input input-bordered input-sm w-16"
                />
                <span className="text-sm">of {totalPages}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
};

export default Analytics;
