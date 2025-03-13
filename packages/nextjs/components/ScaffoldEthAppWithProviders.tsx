"use client";

import { Share_Tech_Mono } from "next/font/google";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { Toaster } from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import { WagmiProvider } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const shareTechMono = Share_Tech_Mono({ subsets: ["latin"], weight: "400" });

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();

  const pathName = usePathname();
  const isCohortPage = pathName.includes("/cohort/");

  return (
    <>
      <div
        className={`flex flex-col min-h-screen h-screen w-screen bg-base-100 overflow-x-hidden ${shareTechMono.className}`}
      >
        <div className={twMerge("h-[60px] fixed inset-y-0 w-full z-50", !isCohortPage && "md:pl-56")}>
          <Header />
        </div>
        <div className={twMerge("hidden md:flex h-full w-56 flex-col fixed inset-y-0", !isCohortPage && "z-50")}>
          <Sidebar />
        </div>
        <main className={twMerge("relative flex flex-col flex-1 pt-[60px] w-full px-2", !isCohortPage && "md:pl-56")}>
          <div className={twMerge("max-w-6xl w-full px-3", !isCohortPage && "mx-auto")}>{children}</div>
        </main>
        <div className="md:pl-56 border-2  ">
          <Footer />
        </div>
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ProgressBar height="3px" color="#2299dd" />
        <RainbowKitProvider avatar={BlockieAvatar} theme={darkTheme()}>
          <ScaffoldEthApp>{children}</ScaffoldEthApp>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
