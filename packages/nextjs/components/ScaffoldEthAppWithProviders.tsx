"use client";

import { Share_Tech_Mono } from "next/font/google";
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

  return (
    <>
      <div
        className={`flex flex-col min-h-screen h-screen w-screen bg-base-100 overflow-x-hidden ${shareTechMono.className}`}
      >
        <div className={twMerge("h-[60px] fixed inset-y-0 w-full z-50 ")}>
          <Header />
        </div>
        <main className="relative flex flex-col flex-1 pt-[60px] w-full px-2">
          <div>{children}</div>
        </main>
        <div className="w-full">
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
