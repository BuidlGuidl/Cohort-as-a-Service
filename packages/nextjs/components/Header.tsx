"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileSidebar } from "./MobileSidebar";
import SearchInput from "./search-input";
import { BugAntIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

export const HeaderLogo = () => {
  //const pathname = usePathname();

  return (
    <>
      {/* Logo Section */}
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image alt="BG logo" className="cursor-pointer" fill priority src="/BG_logo.svg" />
          </div>
          <div className="flex flex-col mt-1">
            <span className="font-bold leading-tight">BuidlGuidl Cohorts</span>
            <span className="text-xs"></span>
          </div>
        </Link>
      </div>
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const pathName = usePathname();
  const isSearchPage = pathName === "/search";
  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 h-[60px] flex-shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      {isSearchPage && (
        <div className="hidden md:block">
          <SearchInput />
        </div>
      )}
      <div className="navbar-start flex-grow mr-4">
        <HeaderLogo />
      </div>
      <div className="md:hidden">
        <MobileSidebar />
      </div>
      <div className="navbar-end flex-grow mr-4">
        <RainbowKitCustomConnectButton />
        <FaucetButton />
      </div>
    </div>
  );
};
