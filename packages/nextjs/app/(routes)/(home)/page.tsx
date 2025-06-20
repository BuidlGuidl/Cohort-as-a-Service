"use client";

import Link from "next/link";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex flex-col flex-grow pt-10 max-w-4xl mx-auto">
        <div>
          <h1 className="text-center">
            <span className="block text-3xl font-semibold">Stream Deployment Made Easy</span>
          </h1>
          <p className="text-lg mt-4 mb-6 text-base-content/80"></p>

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
                    List and describle your current projects
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Set admin approval for withdraws
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    Builders withdraw once and only once
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="transform scale-125">
            <Link href="/app">
              <button className="btn btn-primary btn-sm">Go To App</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
