import { useCallback } from "react";
import { useRouter } from "next/navigation";

export const useSubdomainRouter = () => {
  const router = useRouter();

  const getBaseUrl = useCallback(() => {
    if (typeof window === "undefined") return "";

    const host = window.location.host;
    const protocol = window.location.protocol;

    const parts = host.split(".");

    if (parts.length >= 2) {
      const subdomain = parts[0];

      if (subdomain === "www" || subdomain === "cohorts" || subdomain.includes("localhost")) {
        return "";
      }

      const isCustomSubdomain = /^[a-z0-9-]+$/i.test(subdomain);

      if (isCustomSubdomain) {
        const mainDomain = parts.slice(1).join(".");
        return `${protocol}//${mainDomain}`;
      }
    }

    return "";
  }, []);

  const getCurrentSubdomain = useCallback(() => {
    if (typeof window === "undefined") return null;

    const host = window.location.host;
    const parts = host.split(".");

    if (parts.length >= 2) {
      const subdomain = parts[0];

      if (subdomain === "www" || subdomain === "cohorts" || subdomain.includes("localhost")) {
        return null;
      }

      const isCustomSubdomain = /^[a-z0-9-]+$/i.test(subdomain);

      if (isCustomSubdomain) {
        return subdomain;
      }
    }

    return null;
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
      router.push(path);
    },
    [router],
  );

  const pushToSubdomain = useCallback((subdomain: string, path: string = "/") => {
    if (typeof window === "undefined") return;

    const host = window.location.host;
    const protocol = window.location.protocol;

    if (host.includes("localhost")) {
      window.location.href = `${protocol}//${subdomain}.localhost:3000${path}`;
    } else {
      const parts = host.split(".");
      const mainDomain = parts.length > 2 ? parts.slice(1).join(".") : host;
      window.location.href = `${protocol}//${subdomain}.${mainDomain}${path}`;
    }
  }, []);

  const isOnSubdomain = useCallback(() => {
    return getCurrentSubdomain() !== null;
  }, [getCurrentSubdomain]);

  return {
    pushToMainDomain,
    pushWithinCohort,
    pushToSubdomain,
    getBaseUrl,
    getCurrentSubdomain,
    isOnSubdomain,
  };
};
