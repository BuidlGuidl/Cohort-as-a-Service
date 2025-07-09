"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Deploy",
    href: "/deploy",
  },
  {
    label: "My Cohorts",
    href: "/cohorts",
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
              className={`btn btn-ghost btn-sm text-sm text-primary-content hover:bg-primary hover:text-primary-content leading-none py-1 ${isActive ? "btn-active" : ""}`}
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

/**
 * Site header
 */
export const Header = () => {
  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 h-[60px] flex-shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="p-2">
        <Link href="/" className="flex items-center gap-1">
          <div className="relative w-10 h-10">
            <Image alt="BG logo" className="cursor-pointer" fill src="/BG_Logo.svg" />
          </div>
          <div className="flex flex-col mt-2">
            <span className="font-bold leading-tight text-xs md:text-lg text-base-content">Cohorts.fun</span>
          </div>
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal menu-md gap-4 pl-8">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end flex-grow mr-4">
        <RainbowKitCustomConnectButton />
        <FaucetButton />
      </div>
    </div>
  );
};
