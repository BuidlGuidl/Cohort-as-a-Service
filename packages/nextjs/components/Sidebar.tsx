"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home } from "lucide-react";

export const menuLinks = [
  {
    label: "Home",
    href: "/",
    icon: <Home className="h-4 w-4" />,
  },
  {
    label: "My Cohorts",
    href: "/cohorts",
    icon: <Compass className="h-4 w-4" />,
  },
];

export const Sidebar = () => {
  const pathname = usePathname();

  const isCohortPage = pathname.includes("/cohort/");

  console.log(pathname);

  if (isCohortPage) return null;

  return (
    <div className="w-56 h-full bg-base-100 border-base-200 border-r">
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
