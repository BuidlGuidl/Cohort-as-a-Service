import { useMemo } from "react";

interface UseContractSourceCodeProps {
  contractName: string;
}

export const useContractSourceCode = ({ contractName }: UseContractSourceCodeProps): string => {
  return useMemo(() => {
    try {
      const source = require(`../contracts/sourceFiles/${contractName}`).default;
      return source;
    } catch (error) {
      console.error(`Error loading source code for ${contractName}:`, error);
      return "";
    }
  }, [contractName]);
};
