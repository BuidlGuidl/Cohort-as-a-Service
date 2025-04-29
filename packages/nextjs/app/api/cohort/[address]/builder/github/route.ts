import { NextResponse } from "next/server";
import { recoverMessageAddress } from "viem";
import db from "~~/lib/db";

export async function PATCH(req: Request, { params }: { params: { address: string } }) {
  try {
    const { githubUsername, signature, message, builderAddress } = await req.json();

    if (!signature || !message || !githubUsername) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const signerAddress = await recoverMessageAddress({
      message,
      signature,
    });

    const cohort = await db.cohort.findUnique({
      where: {
        address: params.address,
      },
      include: {
        Builder: true,
      },
    });

    const builder = await db.builder.findFirst({
      where: {
        address: builderAddress,
      },
    });

    if (!cohort) {
      return new NextResponse("Cohort not found", { status: 404 });
    }

    if (builder?.cohortId !== cohort.id) {
      return new NextResponse("Builder not found in cohort", { status: 400 });
    }

    if (
      !cohort.adminAddresses.includes(signerAddress) &&
      !cohort.Builder.find(b => b.address.toLowerCase() == signerAddress.toLowerCase())
    ) {
      return new NextResponse("Unauthorized - Not an admin or builder", { status: 403 });
    }

    const updatedBuilder = await db.builder.update({
      where: {
        id: builder.id,
      },
      data: {
        githubUsername,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Builder github updated successfully",
      cohort: updatedBuilder,
    });
  } catch (error) {
    console.error("[BUILDER_GITHUB_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
