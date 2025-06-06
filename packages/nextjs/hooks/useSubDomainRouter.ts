import { useCallback } from "react";
import { useRouter } from "next/navigation";

export const useSubdomainRouter = () => {
  const router = useRouter();

  const getBaseUrl = useCallback(() => {
    if (typeof window === "undefined") return "";

    const host = window.location.host;
    const protocol = window.location.protocol;

    // Check if we're on a cohort subdomain
    const cohortMatch = host.match(/^(0x[a-fA-F0-9]{40})\./i);

    if (cohortMatch) {
      // Extract the main domain (remove the cohort subdomain)
      const mainDomain = host.replace(/^0x[a-fA-F0-9]{40}\./i, "");
      return `${protocol}//${mainDomain}`;
    }

    return "";
  }, []);

  const pushToMainDomain = useCallback(
    (path: string) => {
      const baseUrl = getBaseUrl();
      if (baseUrl) {
        window.location.href = `${baseUrl}${path}`;
      } else {
        router.push(path);
      }
    },
    [router, getBaseUrl],
  );

  const pushWithinCohort = useCallback(
    (path: string) => {
      // If we're on a subdomain, stay on it
      // If we're on main domain, use regular routing
      router.push(path);
    },
    [router],
  );

  return {
    pushToMainDomain,
    pushWithinCohort,
    getBaseUrl,
  };
};
