import { Share_Tech_Mono, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech-mono",
});

export const metadata = getMetadata({
  title: "Cohorts.fun",
  description:
    "Launch unstoppable payment streams and bounties in seconds. Automate trust, empower builders, and fuel projects effortlessly.",
  imageRelativePath: "/Square-01.png",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${shareTechMono.variable}`}>
        {/* Privacy-friendly analytics by Plausible */}
        <Script src="https://plausible.io/js/pa-20VHH_zRdIUlJduXGi_1H.js" strategy="afterInteractive" />
        <Script id="plausible-init" strategy="afterInteractive">
          {`
            window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
            plausible.init()
          `}
        </Script>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
