import { NextResponse } from "next/server";
import { recoverMessageAddress } from "viem";
import db from "~~/lib/db";

export async function POST(req: Request, { params }: { params: { address: string } }) {
  try {
    const { name, description, githubUrl, websiteUrl, signature, message } = await req.json();

    const adminAddress = await recoverMessageAddress({
      message,
      signature,
    });

    const cohort = await db.cohort.findUnique({
      where: {
        address: params.address,
      },
    });

    if (!cohort) {
      return new NextResponse("Cohort not found", { status: 404 });
    }

    if (!cohort.adminAddresses.includes(adminAddress)) {
      return new NextResponse("Unauthorized - Not an admin", { status: 403 });
    }

    const project = await db.project.create({
      data: {
        name,
        description,
        githubUrl,
        websiteUrl,
        cohortId: cohort.id,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
