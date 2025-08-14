"use client";

import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      {/* Background SVG */}
      <div className="fixed top-0 right-0 w-1/2 h-full overflow-hidden pointer-events-none opacity-50 z-0">
        <Image
          src="/Clip path group.svg"
          alt=""
          width={729}
          height={971}
          className="absolute right-0 top-2/3 transform -translate-y-1/2"
        />
      </div>

      <div className="flex flex-col flex-grow pt-5 max-w-4xl mx-auto mt-4 relative">
        <div>
          <h1 className="text-center">
            <span className="block text-4xl font-space-grotesk text-primary tracking-wide">
              Launch unstoppable payment streams and bounties in seconds.
            </span>
            <span className="block mt-4 font-space-grotesk tracking-wide">
              automate trust, empower builders, and fuel projects effortlessly.
            </span>
          </h1>

          {/* SVG Graphic */}
          <div className="flex justify-center mt-8">
            <Image
              src="/caas_5shapes.svg"
              alt="Cohort as a Service illustration"
              width={400}
              height={300}
              className="max-w-full h-auto"
            />
          </div>

          <p className="text-lg mt-4 mb-6 text-base-content/80"></p>

          <div className="mt-8 flex justify-center">
            <Link href="/deploy">
              <button className="btn bg-gray-800 hover:bg-gray-700 text-primary-content text-lg w-56 h-12 rounded-lg border-none font-share-tech-mono">
                Deploy Stream
              </button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-16">
            <div className="relative">
              {/* Header that breaks the border */}
              <div className="absolute -top-6 left-8 bg-base-100 px-4 py-2 z-10">
                <h3 className="text-primary text-2xl font-share-tech-mono">Payment Streams</h3>
              </div>

              {/* Card Body */}
              <div className="card bg-transparent shadow-xl border border-base-300 pt-2 h-80">
                <div className="card-body">
                  <ul className="space-y-2 text-base">
                    <li className="flex items-start text-base-content/80">
                      <span className="text-primary mr-2">•</span>
                      Deploy payment streams in seconds
                    </li>
                    <li className="flex items-start text-base-content/80">
                      <span className="text-primary mr-2">•</span>
                      Stream Ethereum or ERC20 Tokens
                    </li>
                    <li className="flex items-start text-base-content/80">
                      <span className="text-primary mr-2">•</span>
                      Add/remove builders and set max amounts
                    </li>
                    <li className="flex items-start text-base-content/80">
                      <span className="text-primary mr-2">•</span>
                      Builders can withdraw on their time
                    </li>
                    <li className="flex items-start text-base-content/80">
                      <span className="text-primary mr-2">•</span>
                      Streams automatically fill over your set timeframe
                    </li>
                    <li className="flex items-start text-base-content/80">
                      <span className="text-primary mr-2">•</span>
                      Control withdrawal permissions
                    </li>
                    <li className="flex items-start text-base-content/80">
                      <span className="text-primary mr-2">•</span>
                      Enable public applications
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Header that breaks the border */}
              <div className="absolute -top-6 left-8 bg-base-100 px-4 py-2 z-10">
                <h3 className="text-primary text-2xl font-share-tech-mono">Bounty System</h3>
              </div>

              {/* Card Body */}
              <div className="card bg-transparent shadow-xl border border-base-300 pt-2 h-80">
                <div className="card-body">
                  <ul className="space-y-2 text-base">
                    <li className="flex items-start text-base-content/80">
                      <span className="text-primary mr-2">•</span>
                      Use the one-time withdraw option to create bounties
                    </li>
                    <li className="flex items-start text-base-content/80">
                      <span className="text-primary mr-2">•</span>
                      List and describe your current projects
                    </li>
                    <li className="flex items-start text-base-content/80">
                      <span className="text-primary mr-2">•</span>
                      Set admin approval for withdraws
                    </li>
                    <li className="flex items-start text-base-content/80">
                      <span className="text-primary mr-2">•</span>
                      Builders are only allowed one withdraw
                    </li>
                    <li className="flex items-start text-base-content/80">
                      <span className="text-primary mr-2">•</span>
                      Add your chosen builders, or allow any to apply
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fee info text */}
        <div className="mt-8 flex justify-center">
          <p className="text-base text-center max-w-xl font-space-grotesk font-normal text-base-content/80">
            When deploying a cohort, a one-time $20 fee is contributed to{" "}
            <a
              href="https://buidlguidl.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
            >
              BuidlGuidl
            </a>{" "}
            to support open-source tooling and curriculum.
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
