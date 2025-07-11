"use client";

import React from "react";
import Link from "next/link";
import { useSubdomainRouter } from "~~/hooks/useSubDomainRouter";

interface CohortLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  cohortAddress?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const CohortLink: React.FC<CohortLinkProps> = ({ href, children, className, cohortAddress, onClick }) => {
  const { isOnSubdomain } = useSubdomainRouter();

  const subdomainsEnabled = process.env.NEXT_PUBLIC_USE_SUBDOMAINS === "true";

  const getCorrectHref = () => {
    if (!subdomainsEnabled) {
      if (
        cohortAddress &&
        (href === "/members" || href === "/projects" || href === "/applications" || href === "/myapplications")
      ) {
        return `/cohort/${cohortAddress}${href}`;
      }

      if (cohortAddress && href === "/") {
        return `/cohort/${cohortAddress}`;
      }

      return href;
    }

    if (isOnSubdomain()) {
      if (href.startsWith("/cohort/")) {
        const match = href.match(/^\/cohort\/[^\/]+(.*)$/);
        if (match) {
          return match[1] || "/";
        }
      }

      if (href === "/") {
        return "/";
      }

      return href;
    } else {
      if (
        cohortAddress &&
        (href === "/members" || href === "/projects" || href === "/applications" || href === "/myapplications")
      ) {
        return `/cohort/${cohortAddress}${href}`;
      }

      if (href.startsWith("/cohort/")) {
        return href;
      }

      if (cohortAddress && href === "/") {
        return `/cohort/${cohortAddress}`;
      }

      return href;
    }
  };

  const finalHref = getCorrectHref();

  return (
    <Link href={finalHref} className={className} onClick={onClick}>
      {children}
    </Link>
  );
};
