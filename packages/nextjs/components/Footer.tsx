import React from "react";
//import { HeartIcon } from "@heroicons/react/24/outline";
import { BuidlGuidlLogo } from "~~/components/assets/BuidlGuidlLogo";

/**
 * Site footer
 */
export const Footer = () => {
  return (
    <div className=" flex justify-between items-center w-full z-10 p-4 left-0 pointer-events-none bg-base-100">
      <div className="flex justify-center items-center gap-2 w-full">
        <p className="m-0 text-center">Powered by</p>
        <a
          className="flex justify-center items-center gap-1"
          href="https://buidlguidl.com/"
          target="_blank"
          rel="noreferrer"
        >
          <BuidlGuidlLogo className="w-3 h-5 pb-1" />
          <span className="link">BuidlGuidl</span>
        </a>
      </div>
    </div>
  );
};
