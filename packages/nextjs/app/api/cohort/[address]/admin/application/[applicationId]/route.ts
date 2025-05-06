import { NextResponse } from "next/server";
import { recoverMessageAddress } from "viem";
import db from "~~/lib/db";

export async function PATCH(req: Request, { params }: { params: { address: string; applicationId: string } }) {
  try {
    const { status, signature, message } = await req.json();

    const adminAddress = await recoverMessageAddress({
      message,
      signature,
    });

    const cohort = await db.cohort.findUnique({
      where: {
        address: params.address.toLowerCase(),
      },
    });

    if (!cohort) {
      return new NextResponse("Cohort not found", { status: 404 });
    }

    if (!cohort.adminAddresses.includes(adminAddress)) {
      return new NextResponse("Unauthorized - Not an admin", { status: 403 });
    }

    const application = await db.application.findFirst({
      where: {
        id: params.applicationId,
        cohortId: cohort.id,
      },
    });

    if (!application) {
      return new NextResponse("Application not found", { status: 404 });
    }

    if (status !== "APPROVED" && status !== "REJECTED") {
      console.error("[APPLICATION_UPDATE] Invalid status", status);
      return new NextResponse("Invalid status", { status: 400 });
    }

    const updatedApplication = await db.application.update({
      where: {
        id: params.applicationId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("[APPLICATION_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
