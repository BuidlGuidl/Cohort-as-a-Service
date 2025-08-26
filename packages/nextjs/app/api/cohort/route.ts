import { NextResponse } from "next/server";
import db from "~~/lib/db";

export async function POST(req: Request) {
  try {
    const { deployedAddress, adminAddress, builderAddresses, builderGithubUsernames, chainId, subdomain } =
      await req.json();

    if (subdomain && subdomain.trim() !== "") {
      const existingSubdomain = await db.cohort.findFirst({
        where: { subdomain: subdomain.toLowerCase() },
      });

      if (existingSubdomain) {
        return new NextResponse("Subdomain already exists", { status: 400 });
      }
    }

    const cohort = await db.cohort.create({
      data: {
        address: deployedAddress,
        adminAddresses: [adminAddress],
        chainId: chainId.toString(),
        subdomain: subdomain && subdomain.trim() !== "" ? subdomain.toLowerCase() : null,
      },
    });

    for (let i = 0; i < builderAddresses.length; i++) {
      await db.builder.create({
        data: {
          cohortId: cohort.id,
          githubUsername: builderGithubUsernames[i],
          address: builderAddresses[i],
        },
      });
    }

    return NextResponse.json(cohort);
  } catch (error) {
    console.log("[COHORT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
