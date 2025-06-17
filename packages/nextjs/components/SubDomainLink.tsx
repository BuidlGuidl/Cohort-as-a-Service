"use client";

import React from "react";
import Link from "next/link";
import { useSubdomainRouter } from "~~/hooks/useSubDomainRouter";

interface SubdomainLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  toMainDomain?: boolean;
}

export const SubdomainLink: React.FC<SubdomainLinkProps> = ({ href, children, className, toMainDomain = false }) => {
  const { getBaseUrl } = useSubdomainRouter();

  if (toMainDomain && typeof window !== "undefined") {
    const baseUrl = getBaseUrl();
    if (baseUrl) {
      return (
        <a href={`${baseUrl}${href}`} className={className}>
          {children}
        </a>
      );
    }
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
};
