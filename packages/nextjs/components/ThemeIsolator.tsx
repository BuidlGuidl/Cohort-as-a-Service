"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Theme, applyTheme, defaultTheme } from "~~/components/ThemeCustomizer";

/**
 * ThemeIsolator ensures that themes are only applied on cohort pages and nowhere else
 * by using a data attribute approach rather than global CSS variables.
 */
export const ThemeIsolator = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [cohortAddress, setCohortAddress] = useState<string | null>(null);

  console.log(cohortAddress);

  useEffect(() => {
    // Extract cohort address from path if we're on a cohort page
    const cohortAddressMatch = pathname.match(/\/cohort\/([^\/]+)/);

    // If we're on a cohort page
    if (cohortAddressMatch && cohortAddressMatch[1]) {
      const address = cohortAddressMatch[1];
      setCohortAddress(address);

      // Add a data attribute to the html element
      document.documentElement.setAttribute("data-cohort-theme", address);

      // Fetch theme settings
      fetchTheme(address);
    } else {
      document.documentElement.removeAttribute("data-cohort-theme");
      setCohortAddress(null);

      resetTheme();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const fetchTheme = async (address: string) => {
    try {
      const response = await fetch(`/api/cohort/${address}/theme`);

      if (response.ok) {
        const data = await response.json();
        if (data.theme) {
          applyLocalTheme(data.theme, address);
        }
      }
    } catch (error) {
      console.error("Error fetching theme:", error);
    }
  };

  const applyLocalTheme = (theme: Theme, address: string) => {
    let styleEl = document.getElementById(`theme-${address}`);

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = `theme-${address}`;
      document.head.appendChild(styleEl);
    }

    // Generate scoped CSS that only applies when the data-cohort-theme attribute is present
    styleEl.textContent = `
      /* Scoped theme styles for cohort ${address} */
      html[data-cohort-theme="${address}"] {
        --primary: ${theme.primary};
        --primary-content: ${theme["primary-content"]};
        --secondary: ${theme.secondary};
        --secondary-content: ${theme["secondary-content"]};
        --accent: ${theme.accent};
        --accent-content: ${theme["accent-content"]};
        --neutral: ${theme.neutral};
        --neutral-content: ${theme["neutral-content"]};
        --base-100: ${theme["base-100"]};
        --base-content: ${theme["base-content"]};
        --font-family: ${theme.fontFamily};
      }
      
      /* Only apply these styles on the specific cohort page */
      html[data-cohort-theme="${address}"] body {
        font-family: var(--font-family, sans-serif);
      }
      
      html[data-cohort-theme="${address}"] .bg-primary {
        background-color: var(--primary) !important;
      }
      
      html[data-cohort-theme="${address}"] .bg-secondary {
        background-color: var(--secondary) !important;
      }
      
      html[data-cohort-theme="${address}"] .bg-base-100 {
        background-color: var(--base-100) !important;
      }
      
      html[data-cohort-theme="${address}"] .text-primary {
        color: var(--primary) !important;
      }
      
      html[data-cohort-theme="${address}"] .text-primary-content {
        color: var(--primary-content) !important;
      }
      
      html[data-cohort-theme="${address}"] .text-secondary {
        color: var(--secondary) !important;
      }
      
      html[data-cohort-theme="${address}"] .text-secondary-content {
        color: var(--secondary-content) !important;
      }
      
      html[data-cohort-theme="${address}"] .text-base-content {
        color: var(--base-content) !important;
      }
      
      html[data-cohort-theme="${address}"] .btn.btn-primary,
      html[data-cohort-theme="${address}"] .btn-primary,
      html[data-cohort-theme="${address}"] label.btn.btn-primary {
        background-color: var(--primary) !important;
        color: var(--primary-content) !important;
        border-color: var(--primary) !important;
      }
      
      html[data-cohort-theme="${address}"] .btn.btn-secondary,
      html[data-cohort-theme="${address}"] .btn-secondary,
      html[data-cohort-theme="${address}"] label.btn.btn-secondary {
        background-color: var(--secondary) !important;
        color: var(--secondary-content) !important;
        border-color: var(--secondary) !important;
      }
      
      html[data-cohort-theme="${address}"] .link-primary,
      html[data-cohort-theme="${address}"] .link.link-primary,
      html[data-cohort-theme="${address}"] span.link.link-primary {
        color: var(--primary) !important;
      }
      
      html[data-cohort-theme="${address}"] .badge-primary,
      html[data-cohort-theme="${address}"] .badge.badge-primary {
        background-color: var(--primary) !important;
        color: var(--primary-content) !important;
      }
      
      html[data-cohort-theme="${address}"] .badge-secondary,
      html[data-cohort-theme="${address}"] .badge.badge-secondary {
        background-color: var(--secondary) !important;
        color: var(--secondary-content) !important;
      }
    `;
  };

  // Reset theme by removing all cohort-specific style elements
  const resetTheme = () => {
    // Remove any cohort-specific style elements
    document.querySelectorAll('[id^="theme-"]').forEach(el => el.remove());

    // Apply default theme as global CSS variables
    applyTheme(defaultTheme);
  };

  return <>{children}</>;
};
