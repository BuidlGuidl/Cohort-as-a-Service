"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSubdomainRouter } from "~~/hooks/useSubDomainRouter";

interface SubdomainLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  toMainDomain?: boolean;
  toSubdomain?: string;
}

export const SubdomainLink: React.FC<SubdomainLinkProps> = ({
  href,
  children,
  className,
  toMainDomain = false,
  toSubdomain,
}) => {
  const router = useRouter();
  const { getBaseUrl, pushToSubdomain, isOnSubdomain } = useSubdomainRouter();
  const [mounted, setMounted] = useState(false);

  const subdomainsEnabled = process.env.NEXT_PUBLIC_USE_SUBDOMAINS === "true";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (!subdomainsEnabled) {
      router.push(href);
      return;
    }

    if (toSubdomain) {
      pushToSubdomain(toSubdomain, href);
    } else if (toMainDomain && mounted) {
      const baseUrl = getBaseUrl();
      if (baseUrl) {
        window.location.href = `${baseUrl}${href}`;
      } else {
        router.push(href);
      }
    } else {
      router.push(href);
    }
  };

  if (!mounted) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  if (!subdomainsEnabled) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  if ((toMainDomain && isOnSubdomain()) || toSubdomain) {
    return (
      <a
        href={toMainDomain && getBaseUrl() ? `${getBaseUrl()}${href}` : href}
        onClick={handleClick}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
};
