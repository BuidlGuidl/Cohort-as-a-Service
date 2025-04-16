import { NextResponse } from "next/server";
import { recoverMessageAddress } from "viem";
import db from "~~/lib/db";

export async function GET(req: Request, { params }: { params: { address: string } }) {
  try {
    const cohort = await db.cohort.findUnique({
      where: {
        address: params.address.toLowerCase(),
      },
    });

    if (!cohort) {
      console.error("[THEME_GET] Cohort not found");
      return new NextResponse("Cohort not found", { status: 404 });
    }

    return NextResponse.json({
      theme: cohort.theme || null,
    });
  } catch (error) {
    console.error("[THEME_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { address: string } }) {
  try {
    const { theme, signature, message } = await req.json();

    if (!theme || !signature || !message) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Recover signer address from signature
    const signerAddress = await recoverMessageAddress({
      message,
      signature,
    });

    // Find cohort
    const cohort = await db.cohort.findUnique({
      where: {
        address: params.address.toLowerCase(),
      },
    });

    if (!cohort) {
      return new NextResponse("Cohort not found", { status: 404 });
    }

    if (!cohort.adminAddresses.includes(signerAddress)) {
      return new NextResponse("Unauthorized - Not an admin", { status: 403 });
    }

    await db.cohort.update({
      where: {
        id: cohort.id,
      },
      data: {
        theme: theme as any,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Theme settings updated successfully",
    });
  } catch (error) {
    console.error("[THEME_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
