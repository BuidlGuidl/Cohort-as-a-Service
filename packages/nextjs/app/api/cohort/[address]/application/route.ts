import { NextResponse } from "next/server";
import { recoverMessageAddress } from "viem";
import db from "~~/lib/db";

export async function POST(req: Request, { params }: { params: { address: string } }) {
  try {
    const { description, githubUsername, address: userAddress, signature, message } = await req.json();

    const recoveredAddress = await recoverMessageAddress({
      message,
      signature,
    });

    if (recoveredAddress.toLowerCase() !== userAddress.toLowerCase()) {
      return new NextResponse("Unauthorized - Signature mismatch", { status: 403 });
    }

    const cohort = await db.cohort.findUnique({
      where: {
        address: params.address.toLowerCase(),
      },
    });

    if (!cohort) {
      return new NextResponse("Cohort not found", { status: 404 });
    }

    const existingApplications = await db.application.findMany({
      where: {
        cohortId: cohort.id,
        address: userAddress,
      },
    });

    const hasPendingOrApproved = existingApplications.some(
      app => app.status === "PENDING" || app.status === "APPROVED",
    );

    if (hasPendingOrApproved) {
      return new NextResponse("You already have a pending or approved application for this cohort", { status: 400 });
    }

    const application = await db.application.create({
      data: {
        address: userAddress,
        description,
        githubUsername: githubUsername || null,
        cohortId: cohort.id,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("[APPLICATION_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { address: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const userAddress = searchParams.get("address");

    if (!userAddress) {
      return new NextResponse("Address is required", { status: 400 });
    }

    const cohort = await db.cohort.findUnique({
      where: {
        address: params.address,
      },
    });

    if (!cohort) {
      return new NextResponse("Cohort not found", { status: 404 });
    }

    const isAdmin = cohort.adminAddresses.includes(userAddress);

    const applications = await db.application.findMany({
      where: {
        cohortId: cohort.id,
        ...(isAdmin ? {} : { address: userAddress }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("[APPLICATION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
