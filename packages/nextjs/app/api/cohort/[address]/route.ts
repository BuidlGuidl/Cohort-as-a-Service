import { NextResponse } from "next/server";
import db from "~~/lib/db";

export async function GET(req: Request, { params }: { params: { address: string } }) {
  try {
    const cohort = await db.cohort.findUnique({
      where: {
        address: params.address.toLowerCase(),
      },
    });

    if (!cohort) {
      console.error("[COHORT_GET] Cohort not found");
      return new NextResponse("Cohort not found", { status: 404 });
    }

    return NextResponse.json({
      cohort: cohort || null,
    });
  } catch (error) {
    console.error("[COHORT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
