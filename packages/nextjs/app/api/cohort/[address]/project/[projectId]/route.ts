import { NextResponse } from "next/server";
import { recoverMessageAddress } from "viem";
import db from "~~/lib/db";

export async function PATCH(req: Request, { params }: { params: { address: string; projectId: string } }) {
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

    const project = await db.project.findUnique({
      where: {
        id: params.projectId,
      },
    });

    if (!cohort || !project) {
      return new NextResponse("Not found", { status: 404 });
    }

    if (!cohort.adminAddresses.includes(adminAddress)) {
      return new NextResponse("Unauthorized - Not an admin", { status: 403 });
    }

    const updatedProject = await db.project.update({
      where: {
        id: project.id,
      },
      data: {
        name,
        description,
        githubUrl,
        websiteUrl,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("[PROJECT_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { address: string; projectId: string } }) {
  try {
    const { signature, message } = await req.json();

    const adminAddress = await recoverMessageAddress({
      message,
      signature,
    });

    const cohort = await db.cohort.findUnique({
      where: {
        address: params.address,
      },
    });

    const project = await db.project.findUnique({
      where: {
        id: params.projectId,
      },
    });

    if (!cohort || !project) {
      return new NextResponse("Not found", { status: 404 });
    }

    if (!cohort.adminAddresses.includes(adminAddress)) {
      return new NextResponse("Unauthorized - Not an admin", { status: 403 });
    }

    await db.project.delete({
      where: {
        id: project.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PROJECT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
