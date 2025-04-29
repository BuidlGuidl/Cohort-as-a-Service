import { NextResponse } from "next/server";
import db from "~~/lib/db";

export async function POST(req: Request) {
  try {
    const { deployedAddress, adminAddress, builderAddresses, builderGithubUsernames } = await req.json();

    const cohort = await db.cohort.create({
      data: {
        address: deployedAddress,
        adminAddresses: [adminAddress],
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
