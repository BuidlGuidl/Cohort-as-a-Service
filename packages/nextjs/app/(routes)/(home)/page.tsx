"use client";

import Link from "next/link";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex flex-col flex-grow pt-5 max-w-4xl mx-auto mt-4">
        <div>
          <h1 className="text-center">
            <span className="block text-2xl font-semibold">
              Launch unstoppable payment streams and bounties in seconds - automate trust, empower builders, and fuel
              projects effortlessly.
            </span>
          </h1>
          <p className="text-lg mt-4 mb-6 text-base-content/80"></p>

          <div className="mt-8 flex justify-center">
            <Link href="/deploy">
              <button className="btn btn-primary btn-lg text-lg w-48">Deploy Stream</button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body">
                <h3 className="card-title text-primary">Payment Streams</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Deploy payment streams in seconds
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Stream Ethereum or ERC20 Tokens
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Add/remove builders and set max amounts
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Builders can withdraw on their time
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Streams automatically fill over your set timeframe
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Control withdrawal permissions
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Enable public applications
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body">
                <h3 className="card-title text-primary">Bounty System</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Use the one-time withdraw option to create bounties
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    List and describe your current projects
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Set admin approval for withdraws
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Builders are only allowed one withdraw
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Add your chosen builders, or allow any to apply
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Fee info text */}
        <div className="mt-8 flex justify-center">
          <p className="text-base text-center text-primary max-w-xl">
            When deploying a cohort, a one-time $20 fee is contributed to{" "}
            <a
              href="https://buidlguidl.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary-focus"
            >
              BuidlGuidl
            </a>{" "}
            to support open-source tooling and educational initiatives.
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
