"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home } from "lucide-react";

// Keep the existing menu links
export const menuLinks = [
  {
    label: "Home",
    href: "/",
    icon: <Home className="h-4 w-4" />,
  },
  {
    label: "Browse",
    href: "/search",
    icon: <Compass className="h-4 w-4" />,
  },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-56 h-full bg-base-100 border-base-200 border-r">
      {/* Logo Section */}
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-10 h-10">
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.svg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">Cohorts Services</span>
            <span className="text-xs"></span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="px-1 pt-4">
        <ul className="menu menu-vertical gap-1">
          {menuLinks.map(({ label, href, icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`
                    ${isActive ? "bg-secondary text-secondary-content" : "text-base-content"}
                    hover:bg-secondary hover:text-secondary-content
                    transition-colors duration-200
                    flex items-center gap-2 p-3 rounded-lg
                  `}
                >
                  {icon}
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
