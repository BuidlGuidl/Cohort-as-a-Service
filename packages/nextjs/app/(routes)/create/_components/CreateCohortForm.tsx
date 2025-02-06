"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { getTransactionReceipt } from "@wagmi/core";
import { useForm } from "react-hook-form";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import * as z from "zod";
import currencies from "~~/data/currencies";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { CreateCohortSchema } from "~~/schemas";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const CreateCohortForm = () => {
  const router = useRouter();
  const { address, chainId } = useAccount();

  const [showCustomInput, setShowCustomInput] = useState(false);

  const currentChainCurrencies = chainId ? currencies[chainId]?.contracts || [] : [];

  const initialCurrency = currentChainCurrencies.length > 0 ? currentChainCurrencies[0].address : "";

  const form = useForm<z.infer<typeof CreateCohortSchema>>({
    resolver: zodResolver(CreateCohortSchema),
    defaultValues: {
      name: "",
      description: "",
      adminAddress: address || "",
      currencyAddress: initialCurrency,
    },
    mode: "onChange",
  });

  const [selectedCurrency, setSelectedCurrency] = useState<string>(initialCurrency);

  const { isSubmitting, isValid, errors } = form.formState;

  useEffect(() => {
    if (address) {
      form.setValue("adminAddress", address);
    }

    if (currentChainCurrencies.length > 0 && !selectedCurrency) {
      const defaultCurrency = currentChainCurrencies[0].address;
      handleCurrencySelect(defaultCurrency);
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

  const onSubmit = async (values: z.infer<typeof CreateCohortSchema>) => {
    try {
      const hash = await writeYourContractAsync({
        functionName: "createCohort",
        args: [values.adminAddress, values.currencyAddress, values.name, values.description],
        value: parseEther(costWithAllowance),
      });

      const receipt = await getTransactionReceipt(wagmiConfig, {
        hash: hash as `0x${string}`,
      });

      router.push(`/cohort/${receipt.logs[0].address}`);
    } catch (e) {
      console.error("Error creating cohort", e);
      // Consider adding error handling UI feedback here
    }
  };

  const handleCurrencySelect = (address: string) => {
    setSelectedCurrency(address);
    form.setValue("currencyAddress", address, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setShowCustomInput(false);
  };

  return (
    <div>
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
            </label>

            {errors.name && (
              <label className="label">
                <span className="label-text-alt text-error -mt-3">{errors.name.message}</span>
              </label>
            )}
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Description</span>
            </label>

            <textarea
              className={`textarea textarea-sm rounded-md input-bordered border border-base-300 w-full ${errors.description ? "input-error" : ""}`}
              placeholder="Ethereum Brawlers is a cohort for building on Ethereum"
              disabled={isSubmitting}
              {...form.register("description")}
            />

            <label className="label">
              <span className="label-text-alt text-base-content/60">Description cannot be changed afterwards</span>
            </label>

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

            <input
              className={`input input-sm rounded-md input-bordered border border-base-300 w-full ${errors.adminAddress ? "input-error" : ""}`}
              placeholder="0x1234567890abcdef1234567890abcdef12345678"
              disabled={isSubmitting}
              {...form.register("adminAddress")}
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
                  onClick={() => handleCurrencySelect(currency.address)}
                >
                  {currency.name}
                </button>
              ))}
              <button
                type="button"
                className={`btn btn-sm rounded-md ${showCustomInput ? "btn-primary" : "btn-outline"}`}
                onClick={() => setShowCustomInput(true)}
              >
                Custom
              </button>
            </div>

            {showCustomInput && (
              <div className="form-control">
                <input
                  type="text"
                  className={`input input-sm rounded-md input-bordered border border-base-300 w-full ${errors.currencyAddress ? "input-error" : ""}`}
                  placeholder="Enter custom currency address"
                  {...form.register("currencyAddress")}
                  onChange={e => {
                    setSelectedCurrency(e.target.value);
                    form.setValue("currencyAddress", e.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                />
                {errors.currencyAddress && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.currencyAddress.message}</span>
                  </label>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-x-2">
            <button type="submit" className="btn btn-primary btn-sm rounded-md" disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Creating..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCohortForm;
