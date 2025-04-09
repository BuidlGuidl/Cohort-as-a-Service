import { NextResponse } from "next/server";
import { recoverMessageAddress } from "viem";
import db from "~~/lib/db";

export async function PATCH(req: Request, { params }: { params: { address: string } }) {
  try {
    const { action, adminAddress, signature, message } = await req.json();

    if (!action || !adminAddress || !signature || !message) {
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
    });

    if (!cohort) {
      return new NextResponse("Cohort not found", { status: 404 });
    }

    if (!cohort.adminAddresses.includes(signerAddress)) {
      return new NextResponse("Unauthorized - Not an admin", { status: 403 });
    }

    if (action === "add") {
      if (cohort.adminAddresses.includes(adminAddress)) {
        return new NextResponse("Address is already an admin", { status: 400 });
      }

      const updatedCohort = await db.cohort.update({
        where: {
          id: cohort.id,
        },
        data: {
          adminAddresses: {
            push: adminAddress,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Admin added successfully",
        cohort: updatedCohort,
      });
    } else if (action === "remove") {
      if (cohort.adminAddresses.length <= 1) {
        return new NextResponse("Cannot remove the last admin", { status: 400 });
      }

      if (!cohort.adminAddresses.includes(adminAddress)) {
        return new NextResponse("Address is not an admin", { status: 400 });
      }

      const updatedAdmins = cohort.adminAddresses.filter(address => address !== adminAddress);

      const updatedCohort = await db.cohort.update({
        where: {
          id: cohort.id,
        },
        data: {
          adminAddresses: updatedAdmins,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Admin removed successfully",
        cohort: updatedCohort,
      });
    } else {
      return new NextResponse("Invalid action", { status: 400 });
    }
  } catch (error) {
    console.error("[COHORT_ADMIN_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
