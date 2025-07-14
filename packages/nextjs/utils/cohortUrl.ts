export const getCohortUrl = (cohortAddress: string, subdomain?: string | null) => {
  const subdomainsEnabled = process.env.NEXT_PUBLIC_USE_SUBDOMAINS === "true";

  if (!subdomainsEnabled) {
    return `/cohort/${cohortAddress}`;
  }

  if (subdomain) {
    if (typeof window !== "undefined") {
      const host = window.location.host;
      const isLocalhost = host.includes("localhost");
      const isVercelApp = host.includes("vercel.app");

      if (isLocalhost) {
        return `http://${subdomain}.localhost:3000`;
      } else if (isVercelApp) {
        const vercelDomain = host.split(".").slice(-2).join(".");
        return `https://${subdomain}.${vercelDomain}`;
      } else {
        const customDomain = process.env.NEXT_PUBLIC_CUSTOM_DOMAIN || "cohorts.fun";
        return `https://${subdomain}.${customDomain}`;
      }
    } else {
      const customDomain = process.env.NEXT_PUBLIC_CUSTOM_DOMAIN || "cohorts.fun";
      return `https://${subdomain}.${customDomain}`;
    }
  }

  return `/cohort/${cohortAddress}`;
};
