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
    const cohortAddressMatch = pathname.match(/\/cohort\/([^\/]+)/);

    if (cohortAddressMatch && cohortAddressMatch[1]) {
      const address = cohortAddressMatch[1];
      setCohortAddress(address);

      document.documentElement.setAttribute("data-cohort-theme", address);

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
        
        /* Border variables explicitly set */
        --border-primary: ${theme.primary};
        --border-secondary: ${theme.secondary};
        --border-base: ${theme["base-content"]};
        --border-neutral: ${theme.neutral};
        
        /* Shadow variables */
        --shadow-primary: ${theme.primary}33;  /* With 20% alpha */
        --shadow-secondary: ${theme.secondary}33;
        --shadow-base: ${theme["base-100"]}33;
        --shadow-neutral: ${theme.neutral}33;
      }
      
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
      
      /* Border styles */
      html[data-cohort-theme="${address}"] .border-primary {
        border-color: var(--primary) !important;
      }
      
      html[data-cohort-theme="${address}"] .border-secondary {
        border-color: var(--secondary) !important;
      }
      
      html[data-cohort-theme="${address}"] .border-base-content {
        border-color: var(--base-content) !important;
      }
      
      html[data-cohort-theme="${address}"] .border-neutral {
        border-color: var(--neutral) !important;
      }
      
      /* Handle input focus borders */
      html[data-cohort-theme="${address}"] .input:focus,
      html[data-cohort-theme="${address}"] .select:focus,
      html[data-cohort-theme="${address}"] .textarea:focus {
        border-color: var(--primary) !important;
        outline-color: var(--primary) !important;
      }
      
      /* Modal and card borders */
      html[data-cohort-theme="${address}"] .modal-box,
      html[data-cohort-theme="${address}"] .card,
      html[data-cohort-theme="${address}"] .border {
        border-color: var(--border-neutral) !important;
      }
      
      /* Button outlines */
      html[data-cohort-theme="${address}"] .btn-outline.btn-primary {
        color: var(--primary) !important;
        border-color: var(--primary) !important;
      }
      
      html[data-cohort-theme="${address}"] .btn-outline.btn-secondary {
        color: var(--secondary) !important;
        border-color: var(--secondary) !important;
      }
      
      /* Shadow styles */
      html[data-cohort-theme="${address}"] .shadow-primary {
        --tw-shadow-color: var(--shadow-primary) !important;
        box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
      }
      
      html[data-cohort-theme="${address}"] .shadow-secondary {
        --tw-shadow-color: var(--shadow-secondary) !important;
        box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
      }
      
      html[data-cohort-theme="${address}"] .shadow-base {
        --tw-shadow-color: var(--shadow-base) !important;
        box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
      }
      
      html[data-cohort-theme="${address}"] .shadow-neutral {
        --tw-shadow-color: var(--shadow-neutral) !important;
        box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
      }
      
      /* Shadow variations like shadow-md with color */
      html[data-cohort-theme="${address}"] .shadow-md.shadow-primary {
        --tw-shadow: 0 4px 6px -1px var(--shadow-primary), 0 2px 4px -1px var(--shadow-primary) !important;
        --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -1px var(--tw-shadow-color) !important;
        box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
      }
      
      html[data-cohort-theme="${address}"] .shadow-md.shadow-secondary {
        --tw-shadow: 0 4px 6px -1px var(--shadow-secondary), 0 2px 4px -1px var(--shadow-secondary) !important;
        --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -1px var(--tw-shadow-color) !important;
        box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
      }
      
      html[data-cohort-theme="${address}"] .shadow-lg.shadow-primary {
        --tw-shadow: 0 10px 15px -3px var(--shadow-primary), 0 4px 6px -2px var(--shadow-primary) !important;
        --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -2px var(--tw-shadow-color) !important;
        box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
      }
      
      html[data-cohort-theme="${address}"] .shadow-lg.shadow-secondary {
        --tw-shadow: 0 10px 15px -3px var(--shadow-secondary), 0 4px 6px -2px var(--shadow-secondary) !important;
        --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -2px var(--tw-shadow-color) !important;
        box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow) !important;
      }
      
      /* Progress bar styles */
      html[data-cohort-theme="${address}"] .progress-primary {
        --progress-color: var(--primary) !important;
      }
      
      html[data-cohort-theme="${address}"] .progress-secondary {
        --progress-color: var(--secondary) !important;
      }
      
      html[data-cohort-theme="${address}"] .progress-primary::-webkit-progress-value {
        background-color: var(--primary) !important;
      }
      
      html[data-cohort-theme="${address}"] .progress-secondary::-webkit-progress-value {
        background-color: var(--secondary) !important;
      }
      
      html[data-cohort-theme="${address}"] .progress-primary::-moz-progress-bar {
        background-color: var(--primary) !important;
      }
      
      html[data-cohort-theme="${address}"] .progress-secondary::-moz-progress-bar {
        background-color: var(--secondary) !important;
      }
      
      html[data-cohort-theme="${address}"] .progress.progress-primary {
        background-color: color-mix(in srgb, var(--primary) 20%, transparent) !important;
      }
      
      html[data-cohort-theme="${address}"] .progress.progress-secondary {
        background-color: color-mix(in srgb, var(--secondary) 20%, transparent) !important;
      }
      
      html[data-cohort-theme="${address}"] .progress.bg-primary {
        background-color: var(--primary) !important;
      }
      
      html[data-cohort-theme="${address}"] .progress.bg-secondary {
        background-color: var(--secondary) !important;
      }
      
      /* Handle specific progress bar combinations */
      html[data-cohort-theme="${address}"] .progress.progress-primary.bg-secondary {
        background-color: var(--secondary) !important;
      }
      
      html[data-cohort-theme="${address}"] .progress.progress-primary.bg-secondary::-webkit-progress-value {
        background-color: var(--primary) !important;
      }
      
      html[data-cohort-theme="${address}"] .progress.progress-primary.bg-secondary::-moz-progress-bar {
        background-color: var(--primary) !important;
      }
      
      html[data-cohort-theme="${address}"] .progress.progress-secondary.bg-primary {
        background-color: var(--primary) !important;
      }
      
      html[data-cohort-theme="${address}"] .progress.progress-secondary.bg-primary::-webkit-progress-value {
        background-color: var(--secondary) !important;
      }
      
      html[data-cohort-theme="${address}"] .progress.progress-secondary.bg-primary::-moz-progress-bar {
        background-color: var(--secondary) !important;
      }
    `;
  };

  const resetTheme = () => {
    document.querySelectorAll('[id^="theme-"]').forEach(el => el.remove());

    applyTheme(defaultTheme);
  };

  return <>{children}</>;
};
