"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingModal } from "./LoadingModal";
// Add this import
import { zodResolver } from "@hookform/resolvers/zod";
import { getBytecode, getTransactionReceipt } from "@wagmi/core";
import { readContract } from "@wagmi/core";
import axios from "axios";
import { Plus, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { erc20Abi, formatEther, parseEther, parseUnits } from "viem";
import { useAccount } from "wagmi";
import * as z from "zod";
import { Editor } from "~~/components/editor";
import { AddressInput } from "~~/components/scaffold-eth";
import currencies from "~~/data/currencies";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useContractSourceCode } from "~~/hooks/useContractSourceCode";
import { useLocalDeployedContractInfo } from "~~/hooks/useLocalDeployedContractInfo";
import { CreateCohortSchema } from "~~/schemas";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { verifyContract } from "~~/utils/verify";

const PREDEFINED_CYCLES = [
  { label: "1 Day", value: 1 },
  { label: "7 Days", value: 7 },
  { label: "14 Days", value: 14 },
  { label: "30 Days", value: 30 },
  { label: "One Time Stream", value: 0 },
  { label: "Custom", value: -1 },
];

const CreateCohortForm = () => {
  const router = useRouter();
  const { address, chainId } = useAccount();

  const [showCustomCurrencyInput, setShowCustomCurrencyInput] = useState(false);
  const [showCustomCycleInput, setShowCustomCycleInput] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(PREDEFINED_CYCLES[3].value);

  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [isLoadingError, setIsLoadingError] = useState(false);

  const currentChainCurrencies = chainId ? currencies[chainId]?.contracts || [] : [];

  const [currencyName, setCurrencyName] = useState(
    currentChainCurrencies.length > 0 ? currentChainCurrencies[0].name : "ETH",
  );

  const initialCurrency = currentChainCurrencies.length > 0 ? currentChainCurrencies[0].address : "";

  const [selectedCurrency, setSelectedCurrency] = useState<string>(initialCurrency);

  const { data: localDeployedContract } = useLocalDeployedContractInfo({ contractName: "Cohort" });

  const cohortSourceCode = useContractSourceCode({ contractName: "Cohort" });

  const form = useForm<z.infer<typeof CreateCohortSchema>>({
    resolver: zodResolver(CreateCohortSchema),
    defaultValues: {
      name: "",
      description: "",
      adminAddress: address || "",
      currencyAddress: initialCurrency,
      cycle: PREDEFINED_CYCLES[3].value,
      builderAddresses: [],
      builderCaps: [],
      requiresApproval: false,
      allowApplications: false,
    },
    mode: "onChange",
  });

  const { isSubmitting, isValid, errors } = form.formState;

  useEffect(() => {
    if (address) {
      form.setValue("adminAddress", address);
    }

    if (currentChainCurrencies.length > 0 && !selectedCurrency) {
      const defaultCurrency = currentChainCurrencies[0];
      handleCurrencySelect(defaultCurrency.address, defaultCurrency.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chainId, currentChainCurrencies, form, selectedCurrency]);

  const { data: requiredCost } = useScaffoldReadContract({
    contractName: "CohortFactory",
    functionName: "getRequiredEthAmount",
  });

  const nativeCurrencyCost = formatEther(requiredCost || BigInt(0));
  const costWithAllowance = (parseFloat(nativeCurrencyCost) * 1.001).toString();

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract({
    contractName: "CohortFactory",
  });

  const cycleInSeconds = (cycle: number) => cycle * 24 * 60 * 60;

  const handleCycleSelect = (cycle: number, label: string) => {
    if (label === "Custom") {
      setSelectedCycle(-1);
      setShowCustomCycleInput(true);
    } else {
      setSelectedCycle(cycle);
      setShowCustomCycleInput(false);
      form.setValue("cycle", cycle, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const handleCurrencySelect = (address: string, name: string) => {
    setSelectedCurrency(address);
    setCurrencyName(name);
    form.setValue("currencyAddress", address, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setShowCustomCurrencyInput(false);
  };

  const handleAddBuilder = () => {
    const currentAddresses = form.getValues("builderAddresses") || [];
    const currentCaps = form.getValues("builderCaps") || [];
    const currentGithubUsernames = form.getValues("builderGithubUsernames") || [];

    form.setValue("builderAddresses", [...currentAddresses, ""], {
      shouldValidate: true,
    });

    form.setValue("builderCaps", [...currentCaps, 1], {
      shouldValidate: true,
    });

    form.setValue("builderGithubUsernames", [...currentGithubUsernames, ""], {
      shouldValidate: true,
    });
  };

  const handleRemoveBuilder = (index: number) => {
    const currentAddresses = form.getValues("builderAddresses") || [];
    const currentCaps = form.getValues("builderCaps") || [];
    const currentGithubUsernames = form.getValues("builderGithubUsernames") || [];

    const newAddresses = currentAddresses.filter((_, i) => i !== index);
    const newCaps = currentCaps.filter((_, i) => i !== index);
    const newGithubUsernames = currentGithubUsernames.filter((_, i) => i !== index);

    form.setValue("builderAddresses", newAddresses, {
      shouldValidate: true,
    });

    form.setValue("builderCaps", newCaps, {
      shouldValidate: true,
    });

    form.setValue("builderGithubUsernames", newGithubUsernames, {
      shouldValidate: true,
    });
  };

  const handleLoadingClose = () => {
    setIsLoadingModalOpen(false);
    setIsLoadingError(false);
    setLoadingStage(0);
  };

  const handleLoadingRetry = () => {
    setIsLoadingError(false);
    setLoadingStage(0);
    form.handleSubmit(onSubmit)();
  };

  const onSubmit = async (values: z.infer<typeof CreateCohortSchema>) => {
    setIsLoadingModalOpen(true);
    setIsLoadingError(false);
    setLoadingStage(0);

    try {
      const filteredAddresses = values.builderAddresses.filter(addr => addr !== "");
      const filteredCaps = values.builderCaps.filter((_, index) => values.builderAddresses[index] !== "");
      const filteredGithubUsernames = values.builderGithubUsernames;

      const isNotNativeCurrency = currentChainCurrencies[0].address !== values.currencyAddress;

      let FormattedBuilderCaps = filteredCaps.map(cap => parseEther(cap.toString() || "0"));

      if (isNotNativeCurrency) {
        const decimals = await readContract(wagmiConfig, {
          address: values.currencyAddress,
          abi: erc20Abi,
          functionName: "decimals",
        });

        FormattedBuilderCaps = filteredCaps.map(cap => parseUnits(cap.toString() || "0", decimals || 18));
      }

      const hash = await writeYourContractAsync({
        functionName: "createCohort",
        args: [
          {
            primaryAdmin: values.adminAddress,
            tokenAddress: values.currencyAddress,
            name: values.name,
            description: values.description,
            cycle: BigInt(cycleInSeconds(values.cycle)),
            builders: filteredAddresses || [],
            caps: FormattedBuilderCaps || [],
            requiresApproval: values.requiresApproval,
            allowApplications: values.allowApplications,
          },
        ],
        value: parseEther(costWithAllowance),
      });

      setLoadingStage(1);

      const receipt = await getTransactionReceipt(wagmiConfig, {
        hash: hash as `0x${string}`,
      });

      const deployedAddress = receipt.logs[0].address as `0x${string}`;

      const bytecode = await getBytecode(wagmiConfig, {
        address: deployedAddress,
      });

      try {
        await verifyContract({
          address: deployedAddress,
          constructorArguments: [
            values.adminAddress,
            values.currencyAddress,
            values.name,
            values.description,
            BigInt(cycleInSeconds(values.cycle)),
            filteredAddresses || [],
            FormattedBuilderCaps || [],
            values.requiresApproval,
            values.allowApplications,
          ],
          contract: {
            abi: localDeployedContract?.abi,
            bytecode: bytecode,
            source: cohortSourceCode,
          },
          chainId: chainId || 0,
        });
        console.log("Contract verification submitted successfully");
      } catch (verifyError) {
        console.error("Contract verification failed:", verifyError);
      }

      setLoadingStage(2);

      await axios.post(`/api/cohort`, {
        deployedAddress,
        adminAddress: values.adminAddress,
        chainId,
        builderAddresses: filteredAddresses,
        builderGithubUsernames: filteredGithubUsernames,
      });

      setTimeout(() => {
        setIsLoadingModalOpen(false);
        router.push(`/cohort/${deployedAddress}`);
      }, 5000);
    } catch (e) {
      console.error("Error creating cohort", e);
      setIsLoadingError(true);
    }
  };

  useEffect(() => {
    if (!showCustomCurrencyInput) return;

    const fetchSymbol = async () => {
      try {
        const symbol = await readContract(wagmiConfig, {
          address: selectedCurrency,
          abi: erc20Abi,
          functionName: "symbol",
        });
        setCurrencyName(symbol);
      } catch (error) {
        console.error("Failed to fetch currency symbol:", error);
      }
    };

    fetchSymbol();
  }, [selectedCurrency, showCustomCurrencyInput]);

  return (
    <div className="p-4">
      <LoadingModal
        isOpen={isLoadingModalOpen}
        stage={loadingStage}
        isError={isLoadingError}
        onClose={handleLoadingClose}
        onRetry={handleLoadingRetry}
      />

      <div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Name</span>
            </label>

            <input
              type="text"
              className={`input input-sm rounded-md input-bordered border border-base-300 w-full ${errors.name ? "input-error" : ""}`}
              placeholder="Ethereum Brawlers"
              disabled={isSubmitting}
              {...form.register("name")}
            />

            <label className="label">
              <span className="label-text-alt text-base-content/60">Cohort name cannot be changed afterwards</span>
              <span className="label-text-alt">{form.watch("name")?.length || 0}/40</span>
            </label>

            {errors.name && (
              <label className="label">
                <span className="label-text-alt text-error -mt-3">{errors.name.message}</span>
              </label>
            )}
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Description (optional)</span>
            </label>

            <Editor
              value={form.watch("description") || ""}
              onChange={content => {
                form.setValue("description", content, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              height="150px"
            />

            {errors.description && (
              <label className="label">
                <span className="label-text-alt text-error -mt-3">{errors.description.message}</span>
              </label>
            )}
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Admin address</span>
            </label>

            <AddressInput
              name="adminAddress"
              value={form.watch("adminAddress")}
              disabled={isSubmitting}
              onChange={value => {
                form.setValue("adminAddress", value, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
            />

            <label className="label">
              <span className="label-text-alt text-base-content/60">Primary admin address</span>
            </label>

            {errors.adminAddress && (
              <label className="label">
                <span className="label-text-alt text-error -mt-3">{errors.adminAddress.message}</span>
              </label>
            )}
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Currency</span>
            </label>

            <div className="flex flex-wrap gap-2 mb-2">
              {currentChainCurrencies.map(currency => (
                <button
                  key={currency.address}
                  type="button"
                  className={`btn btn-sm rounded-md ${selectedCurrency === currency.address ? "btn-primary" : "btn-outline"}`}
                  onClick={() => handleCurrencySelect(currency.address, currency.name)}
                >
                  {currency.name}
                </button>
              ))}
              <button
                type="button"
                className={`btn btn-sm rounded-md ${showCustomCurrencyInput ? "btn-primary" : "btn-outline"}`}
                onClick={() => setShowCustomCurrencyInput(true)}
              >
                Custom
              </button>
            </div>

            {showCustomCurrencyInput && (
              <div className="form-control">
                <AddressInput
                  name="currencyAddress"
                  value={form.watch("currencyAddress")}
                  onChange={value => {
                    setSelectedCurrency(value);
                    form.setValue("currencyAddress", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  placeholder="Enter custom currency address"
                />
                {errors.currencyAddress && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.currencyAddress.message}</span>
                  </label>
                )}
              </div>
            )}
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Cohort Cycle</span>
            </label>

            <div className="flex flex-wrap gap-2 mb-2">
              {PREDEFINED_CYCLES.map(cycle => (
                <button
                  key={cycle.label}
                  type="button"
                  className={`btn btn-sm rounded-md ${selectedCycle === cycle.value ? "btn-primary" : "btn-outline"}`}
                  onClick={() => handleCycleSelect(cycle.value, cycle.label)}
                >
                  {cycle.label}
                </button>
              ))}
            </div>

            {showCustomCycleInput && (
              <div className="form-control">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.watch("cycle") || ""}
                  className={`input input-sm rounded-md input-bordered border border-base-300 w-full ${errors.cycle ? "input-error" : ""}`}
                  placeholder="Enter cycle days"
                  {...form.register("cycle", {
                    onChange: e => {
                      const value = e.target.value;
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue) || value === "") {
                        form.setValue("cycle", numValue, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }
                    },
                  })}
                />
                {errors.cycle && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.cycle.message}</span>
                  </label>
                )}
              </div>
            )}

            {form.watch("cycle") == 0 && (
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  One time withdraw cohorts only allow a single withdraw per builder
                </span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text font-medium">Require approval for builder withdrawals</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={form.watch("requiresApproval")}
                onChange={e => {
                  form.setValue("requiresApproval", e.target.checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />
            </label>
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                When enabled, builders will need admin approval before they can withdraw funds
              </span>
            </label>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text font-medium">Allow builder applications to join cohort</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={form.watch("allowApplications")}
                onChange={e => {
                  form.setValue("allowApplications", e.target.checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />
            </label>
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                When enabled, random builders can submit applications to join the cohort
              </span>
            </label>
          </div>

          <div className="form-control w-full">
            <div className="flex justify-between items-center">
              <label className="label">
                <span className="label-text font-medium">Builders (Optional)</span>
              </label>
            </div>

            <div className="">
              {form.watch("builderAddresses").map((_, index) => (
                <div key={index} className="flex gap-2 items-start mt-2 flex-col md:flex-row">
                  <div className="flex-grow md:w-[40%] w-full">
                    <AddressInput
                      name={`builderAddresses.${index}`}
                      value={form.watch(`builderAddresses.${index}`)}
                      onChange={value => {
                        form.setValue(`builderAddresses.${index}`, value, {
                          shouldValidate: true,
                        });
                      }}
                      placeholder="Enter builder address"
                    />
                    {form.formState.errors.builderAddresses?.[index] && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {form.formState.errors.builderAddresses[index]?.message}
                        </span>
                      </label>
                    )}
                  </div>
                  <div className="flex-grow md:w-[25%] w-full">
                    <div className="relative w-full">
                      <input
                        className="input input-sm rounded-md input-bordered border border-base-300 w-full pr-16"
                        placeholder="Enter stream cap"
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*(\.[0-9]+)?"
                        {...form.register(`builderCaps.${index}`, {
                          valueAsNumber: true,
                          onChange: e => {
                            const value = e.target.value;
                            form.setValue(`builderCaps.${index}`, value, {
                              shouldValidate: true,
                            });
                          },
                        })}
                      />
                      <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">
                        {currencyName}
                      </span>
                    </div>

                    {form.formState.errors.builderCaps?.[index] && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {form.formState.errors.builderCaps[index]?.message}
                        </span>
                      </label>
                    )}
                  </div>
                  <div className="flex flex-grow md:w-[35%] w-full">
                    <div className="w-full">
                      <input
                        className="input input-sm rounded-md input-bordered border border-base-300 w-full"
                        placeholder="Github username(optional)"
                        type="string"
                        {...form.register(`builderGithubUsernames.${index}`, {
                          onChange: e => {
                            const value = e.target.value;
                            form.setValue(`builderGithubUsernames.${index}`, value, {
                              shouldValidate: true,
                            });
                          },
                        })}
                      />
                      {form.formState.errors.builderGithubUsernames?.[index] && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {form.formState.errors.builderGithubUsernames[index]?.message}
                          </span>
                        </label>
                      )}
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm " onClick={() => handleRemoveBuilder(index)}>
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-primary btn-sm rounded-md mt-2 ml-4" onClick={handleAddBuilder}>
                <Plus className="h-4 w-4 mr-1" /> Add Builder
              </button>
            </div>
          </div>

          <div className="flex items-center gap-x-2">
            <button
              type="submit"
              className="btn btn-primary btn-sm rounded-md mt-4"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCohortForm;