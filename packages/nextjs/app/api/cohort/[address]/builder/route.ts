import { NextRequest, NextResponse } from "next/server";
import { recoverMessageAddress } from "viem";
import db from "~~/lib/db";

// POST: Add multiple builders to a cohort
export async function POST(req: NextRequest, { params }: { params: { address: string } }) {
  try {
    const { builderAddresses, signature, message, builderGithubUsernames } = await req.json();

    if (!signature || !message || !builderAddresses || !Array.isArray(builderAddresses)) {
      return new NextResponse("Missing required fields or invalid format", { status: 400 });
    }

    // Verify signature
    const signerAddress = await recoverMessageAddress({
      message,
      signature,
    });

    // Find cohort
    const cohort = await db.cohort.findUnique({
      where: {
        address: params.address,
      },
    });

    if (!cohort) {
      return new NextResponse("Cohort not found", { status: 404 });
    }

    // Check if signer is admin
    if (!cohort.adminAddresses.includes(signerAddress)) {
      return new NextResponse("Unauthorized - Only admins can add builders", { status: 403 });
    }

    // Process builders
    const builderRecords = [];

    for (let i = 0; i < builderAddresses.length; i++) {
      const builderAddress = builderAddresses[i];
      if (typeof builderAddress !== "string") {
        continue;
      }

      const existingBuilder = await db.builder.findFirst({
        where: {
          address: builderAddress,
          cohortId: cohort.id,
        },
      });

      if (existingBuilder) {
        continue;
      }

      const builderRecord = await db.builder.create({
        data: {
          address: builderAddress,
          githubUsername: builderGithubUsernames[i],
          cohortId: cohort.id,
        },
      });

      builderRecords.push(builderRecord);
    }

    return NextResponse.json({
      success: true,
      message: `${builderRecords.length} new builders added to cohort successfully`,
      builders: builderRecords,
    });
  } catch (error) {
    console.error("[BUILDER_ADD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { address: string } }) {
  try {
    const { builderAddress, signature, message } = await req.json();

    if (!signature || !message || !builderAddress) {
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

    if (!cohort) {
      return new NextResponse("Cohort not found", { status: 404 });
    }

    if (!cohort.adminAddresses.includes(signerAddress)) {
      return new NextResponse("Unauthorized - Only admins can remove builders", { status: 403 });
    }

    const builderToDelete = cohort.Builder.find(
      builder => builder.address.toLowerCase() === builderAddress.toLowerCase(),
    );

    if (!builderToDelete) {
      return new NextResponse("Builder not found in this cohort", { status: 404 });
    }

    await db.builder.delete({
      where: {
        id: builderToDelete.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Builder removed from cohort successfully",
      deletedBuilder: builderToDelete,
    });
  } catch (error) {
    console.error("[BUILDER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
