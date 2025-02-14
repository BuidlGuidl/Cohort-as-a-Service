import React, { useCallback, useRef, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

export const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useOutsideClick(
    sidebarRef,
    useCallback(() => setIsOpen(false), []),
  );

  return (
    <div ref={sidebarRef}>
      <button className="btn btn-ghost drawer-button" onClick={() => setIsOpen(true)}>
        <Bars3Icon className="h-6 w-6" />
      </button>

      <div
        className={`
        fixed inset-y-0 left-0 z-50
        transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
        transition-transform duration-300 ease-in-out
      `}
      >
        <div className="h-full bg-base-100 shadow-xl ">
          <Sidebar />
        </div>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
};
