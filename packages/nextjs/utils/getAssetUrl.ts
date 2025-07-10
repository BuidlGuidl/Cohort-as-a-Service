import { domain } from "~~/data/domain";

export const getAssetUrl = (path: string, headers?: Headers) => {
  if (typeof window === "undefined" && headers) {
    const host = headers.get("host") || "";
    const isSubdomain = host.match(/^0x[a-fA-F0-9]{40}\./i);

    if (isSubdomain) {
      const isLocalhost = host.includes("localhost");
      const mainDomain = isLocalhost ? "localhost:3000" : domain;
      const protocol = isLocalhost ? "http" : "https";
      return `${protocol}://${mainDomain}${path}`;
    }
    return path;
  }

  if (typeof window !== "undefined") {
    const host = window.location.host;
    const isSubdomain = host.match(/^0x[a-fA-F0-9]{40}\./i);

    if (isSubdomain) {
      const isLocalhost = host.includes("localhost");
      const mainDomain = isLocalhost ? "localhost:3000" : domain;
      const protocol = isLocalhost ? "http" : "https";
      return `${protocol}://${mainDomain}${path}`;
    }
  }

  return path;
};
