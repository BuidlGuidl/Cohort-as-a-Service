"use client";

import { useEffect, useState } from "react";
import { Plus, Trash } from "lucide-react";
import { AddressInput } from "~~/components/scaffold-eth";
import { EtherInput } from "~~/components/scaffold-eth";
import { useAddBuilders } from "~~/hooks/useAddBuilders";

interface AddbatchProps {
  cohortAddress: string;
  isErc20: boolean;
  tokenDecimals?: number;
  tokenSymbol?: string;
}

export const AddBatch = ({ cohortAddress, isErc20, tokenDecimals, tokenSymbol }: AddbatchProps) => {
  const [caps, setCaps] = useState<string[]>([""]);
  const [builderAddresses, setBuilderAddresses] = useState<string[]>([""]);
  const [githubUsernames, setGithubUsernames] = useState<string[]>([""]);
  const { addBatch, isPending, isSuccess } = useAddBuilders({
    cohortAddress,
    builderAddresses: builderAddresses,
    caps,
    githubUsernames,
    isErc20,
    tokenDecimals,
  });

  const handleInputChange = (index: number, value: number | string | undefined, setState: any) => {
    setState((prevState: any) => {
      const updatedState = [...prevState];
      updatedState[index] = value !== undefined ? value : "";
      return updatedState;
    });
  };

  const handleAddInput = () => {
    setBuilderAddresses((prev: string[] | undefined) => [...(prev ?? []), ""]);
    setCaps((prev: string[] | undefined) => [...(prev ?? []), ""]);
    setGithubUsernames((prev: string[] | undefined) => [...(prev ?? []), ""]);
  };

  const handleRemoveInput = (index: number) => {
    setBuilderAddresses(prev => {
      const newBatchBuilders = prev.filter((_, i) => i !== index);
      return newBatchBuilders;
    });
    setCaps(prev => {
      const newBatchCaps = prev.filter((_, i) => i !== index);
      return newBatchCaps;
    });
    setGithubUsernames(prev => {
      const newGithubUsernames = prev.filter((_, i) => i !== index);
      return newGithubUsernames;
    });
  };

  useEffect(() => {
    if (isSuccess) {
      const modalCheckbox = document.getElementById("add-batch-modal") as HTMLInputElement;
      if (modalCheckbox) {
        modalCheckbox.checked = false;
      }

      setBuilderAddresses([""]);
      setCaps([""]);
      setGithubUsernames([""]);
    }
  }, [isSuccess]);

  return (
    <div>
      <label htmlFor="add-batch-modal" className="btn rounded-md btn-primary btn-sm font-normal space-x-2 normal-case">
        Add builders
        <Plus className="h-4 w-4" />
      </label>

      <input type="checkbox" id="add-batch-modal" className="modal-toggle" />
      <label htmlFor="add-batch-modal" className="modal cursor-pointer">
        <label className="modal-box relative bg-base-100 border border-primary">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <p className="font-bold mb-8 flex items-center gap-1 ">Add new builders</p>
          <label htmlFor="add-batch-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <div className="flex flex-col gap-6 items-center ">
              <div className="w-full">
                {builderAddresses &&
                  builderAddresses.map((builder, index) => (
                    <div key={index}>
                      <label htmlFor={`builders-${index}`} className="block mt-4 mb-2 ">
                        Builder Address{index != 0 && " " + (index + 1)}:
                      </label>
                      {index != 0 && (
                        <div className="flex justify-between">
                          <div className="w-[92%]">
                            <AddressInput
                              name={`batch-builders-${index}`}
                              value={builder}
                              onChange={value => handleInputChange(index, value, setBuilderAddresses)}
                            />
                          </div>
                          <button
                            className="hover:bg-primary p-1 rounded-md active:scale-90"
                            onClick={() => {
                              handleRemoveInput(index);
                            }}
                          >
                            <Trash className="h-[1.5rem]" />
                          </button>
                        </div>
                      )}
                      {index == 0 && (
                        <AddressInput
                          name={`batch-builders-${index}`}
                          value={builder}
                          onChange={value => handleInputChange(index, value, setBuilderAddresses)}
                        />
                      )}

                      <label htmlFor={`batch-caps-${index}`} className="block mt-4 mb-2">
                        Cap{index != 0 && " " + (index + 1)}:
                      </label>

                      {isErc20 ? (
                        <div className="relative">
                          <input
                            className="input input-sm rounded-md input-bordered border border-base-300 w-full pr-16"
                            placeholder={`Enter stream cap`}
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*(\.[0-9]+)?"
                            onChange={e => handleInputChange(index, e.target.value.toString(), setCaps)}
                            value={caps ? caps[index]?.toString() : ""}
                          />
                          {tokenSymbol && (
                            <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">
                              {tokenSymbol}
                            </span>
                          )}
                        </div>
                      ) : (
                        <EtherInput
                          value={caps ? caps[index]?.toString() : ""}
                          onChange={value => handleInputChange(index, value, setCaps)}
                          placeholder="Enter stream cap"
                        />
                      )}

                      <label htmlFor={`github-handle-${index}`} className="block mt-4 mb-2">
                        GitHub Username{index != 0 && " " + (index + 1)} (optional):
                      </label>
                      <input
                        className="input input-sm rounded-md input-bordered border border-base-300 w-full bg-transparent"
                        id={`github-username-${index}`}
                        name={`github-username-${index}`}
                        placeholder="GitHub username (optional)"
                        value={githubUsernames[index] || ""}
                        onChange={e => handleInputChange(index, e.target.value, setGithubUsernames)}
                      />
                      <br />
                      <br />
                    </div>
                  ))}
                <button className="btn btn-primary btn-sm mt-2 rounded-md flex ml-auto" onClick={handleAddInput}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button className="btn btn-sm btn-primary w-full" onClick={addBatch} disabled={isPending}>
                Add
              </button>
            </div>
          </div>
        </label>
      </label>
    </div>
  );
};
