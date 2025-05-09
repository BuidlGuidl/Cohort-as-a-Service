import React from "react";
import Link from "next/link";
import ProjectList from "./components/ProjectList";
import { ArrowLongLeftIcon } from "@heroicons/react/24/outline";
import db from "~~/lib/db";

const page = async ({
  params,
}: {
  params: {
    cohortAddress: string;
  };
}) => {
  const cohort = await db.cohort.findUnique({
    where: {
      address: params.cohortAddress.toLowerCase(),
    },
    include: {
      Project: true,
    },
  });

  if (!cohort) {
    return <div>Cohort not found</div>;
  }

  return (
    <div className="max-w-4xl">
      <Link href={`/cohort/${params.cohortAddress}`} className="btn btn-ghost btn-sm rounded-sm">
        <ArrowLongLeftIcon className="w-7 h-4" />
        Cohort
      </Link>
      <div className="mt-4">
        <ProjectList projects={cohort?.Project} cohortAddress={params.cohortAddress} />
      </div>
    </div>
  );
};

export default page;
