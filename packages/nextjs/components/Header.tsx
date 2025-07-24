"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SubdomainLink } from "./SubDomainLink";
import { useAccount } from "wagmi";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

const baseMenuLinks: HeaderMenuLink[] = [
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
  const { address } = useAccount();
  const [menuLinks, setMenuLinks] = useState<HeaderMenuLink[]>(baseMenuLinks);

  useEffect(() => {
    if (!address) {
      setMenuLinks(baseMenuLinks);
      return;
    }

    const bgAdmins = process.env.NEXT_PUBLIC_BG_ADMINS?.split(",").map(addr => addr.toLowerCase()) || [];
    const isAdmin = bgAdmins.includes(address.toLowerCase());

    if (isAdmin) {
      setMenuLinks([
        ...baseMenuLinks,
        {
          label: "Analytics",
          href: "/analytics",
        },
      ]);
    } else {
      setMenuLinks(baseMenuLinks);
    }
  }, [address]);

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <SubdomainLink
              href={href}
              toMainDomain={true}
              className={`btn btn-ghost btn-sm justify-start text-sm text-primary-content hover:bg-primary hover:text-primary-content leading-none py-1 ${isActive ? "btn-active" : ""}`}
            >
              {icon}
              <span>{label}</span>
            </SubdomainLink>
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
  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 h-[60px] flex-shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <details className="dropdown lg:hidden" ref={burgerMenuRef}>
          <summary className="btn btn-ghost hover:bg-transparent px-2">
            <Bars3Icon className="h-6 w-6" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-sm bg-base-100 rounded-box w-52"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
        <div className="p-2 hidden lg:flex">
          <SubdomainLink href="/" className="flex items-center gap-1" toMainDomain={true}>
            <div className="relative w-8 h-8">
              <Image alt="BG logo" className="cursor-pointer" fill src={"/BG_Logo.svg"} />
            </div>
            <div className="flex flex-col mt-2">
              <span className="font-bold leading-tight text-xs md:text-lg text-base-content">Cohorts.fun</span>
            </div>
          </SubdomainLink>
        </div>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal menu-md gap-4 pl-4">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end grow mr-4">
        <RainbowKitCustomConnectButton />
        <FaucetButton />
      </div>
    </div>
  );
};
