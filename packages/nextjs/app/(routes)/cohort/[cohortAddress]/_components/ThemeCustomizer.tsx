"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const DynamicThemeCustomizer = dynamic(() => import("~~/components/ThemeCustomizer").then(mod => mod.ThemeCustomizer), {
  ssr: false,
  loading: () => null,
});

interface ThemeCustomizerProps {
  cohortAddress: string;
  isAdmin: boolean;
}

export const ThemeCustomizer = ({ cohortAddress, isAdmin }: ThemeCustomizerProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    document.documentElement.setAttribute("data-cohort-theme", cohortAddress);

    return () => {};
  }, [cohortAddress]);

  if (!isMounted) return null;

  return <DynamicThemeCustomizer cohortAddress={cohortAddress} isAdmin={isAdmin} />;
};
