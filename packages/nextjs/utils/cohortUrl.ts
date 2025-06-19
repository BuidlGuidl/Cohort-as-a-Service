export const getCohortUrl = (cohortAddress: string) => {
  if (typeof window !== "undefined") {
    const currentHost = window.location.host;
    const isSubdomain = currentHost.match(/^0x[a-fA-F0-9]{40}\./i);
    const isLocalhost = currentHost.includes("localhost");
    const isVercelApp = currentHost.includes("cohort-service.vercel.app");

    if (isSubdomain || process.env.NEXT_PUBLIC_USE_SUBDOMAINS === "true") {
      if (isLocalhost) {
        return `http://${cohortAddress.toLowerCase()}.localhost:3000`;
      } else if (isVercelApp || !process.env.NEXT_PUBLIC_CUSTOM_DOMAIN) {
        return `https://${cohortAddress.toLowerCase()}.cohort-service.vercel.app`;
      } else {
        return `https://${cohortAddress.toLowerCase()}.${process.env.NEXT_PUBLIC_CUSTOM_DOMAIN}`;
      }
    }
  }
  return `/cohort/${cohortAddress}`;
};
