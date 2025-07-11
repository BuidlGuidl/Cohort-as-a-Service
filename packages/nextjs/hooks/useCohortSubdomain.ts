import { useEffect, useState } from "react";
import axios from "axios";

export const useCohortSubdomain = (cohortAddress: string) => {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCohortData = async () => {
      try {
        const response = await axios.get(`/api/cohort/${cohortAddress}`);
        setSubdomain(response.data?.cohort?.subDomain || null);
      } catch (error) {
        console.error("Error fetching cohort subdomain:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (cohortAddress) {
      fetchCohortData();
    }
  }, [cohortAddress]);

  return { subdomain, isLoading };
};
