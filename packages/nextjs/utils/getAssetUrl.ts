export const getAssetUrl = (path: string, headers?: Headers) => {
  const checkIsSubdomain = (host: string): boolean => {
    const parts = host.split(".");

    if (parts.length >= 2) {
      const subdomain = parts[0];

      if (subdomain === "www" || subdomain === "cohorts" || subdomain.includes("localhost:")) {
        return false;
      }

      return /^[a-z0-9-]+$/i.test(subdomain);
    }

    return false;
  };

  const getMainDomain = (host: string): string => {
    const parts = host.split(".");

    if (parts.length >= 2 && checkIsSubdomain(host)) {
      return parts.slice(1).join(".");
    }

    return host;
  };

  if (typeof window === "undefined" && headers) {
    const host = headers.get("host") || "";
    const isSubdomain = checkIsSubdomain(host);

    if (isSubdomain) {
      const isLocalhost = host.includes("localhost");
      const mainDomain = isLocalhost ? "localhost:3000" : getMainDomain(host);
      const protocol = isLocalhost ? "http" : "https";
      return `${protocol}://${mainDomain}${path}`;
    }
    return path;
  }

  if (typeof window !== "undefined") {
    const host = window.location.host;
    const isSubdomain = checkIsSubdomain(host);

    if (isSubdomain) {
      const isLocalhost = host.includes("localhost");
      const mainDomain = isLocalhost ? "localhost:3000" : getMainDomain(host);
      const protocol = isLocalhost ? "http" : "https";
      return `${protocol}://${mainDomain}${path}`;
    }
  }

  return path;
};
