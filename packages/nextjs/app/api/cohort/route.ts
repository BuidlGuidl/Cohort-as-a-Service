import { NextResponse } from "next/server";
import db from "~~/lib/db";

export async function POST(req: Request) {
  try {
    const { deployedAddress, adminAddress } = await req.json();

    const cohort = await db.cohort.create({
      data: {
        address: deployedAddress,
        adminAddresses: [adminAddress],
      },
    });

    return NextResponse.json(cohort);
  } catch (error) {
    console.log("[COHORT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
