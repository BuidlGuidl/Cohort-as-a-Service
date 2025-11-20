import React from "react";
import ProjectList from "./components/ProjectList";
import { ArrowLongLeftIcon } from "@heroicons/react/24/outline";
import { CohortLink } from "~~/components/CohortLink";
import db from "~~/lib/db";

const page = async ({ params }: { params: { cohortAddress: string } }) => {
  const cohort = await db.cohort.findUnique({
    where: { address: params.cohortAddress.toLowerCase() },
    include: { Project: true },
  });

  if (!cohort) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold">Cohort not found</h1>
        <CohortLink href="/" cohortAddress={params.cohortAddress} className="btn btn-outline btn-sm rounded-md mt-8">
          <ArrowLongLeftIcon className="w-6 h-5" /> Cohort
        </CohortLink>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex-col flex items-start  gap-2">
          <CohortLink href="/" cohortAddress={params.cohortAddress} className="btn btn-ghost btn-sm rounded-md">
            <ArrowLongLeftIcon className="w-6 h-5" />
            Cohort
          </CohortLink>
          <span className="text-3xl md:text-4xl font-bold ml-2 font-share-tech-mono bg-primary text-primary-content px-3 py-1 rounded">
            Projects
          </span>
        </div>
      </div>
      {/* Projects list/empty state */}
      <ProjectList projects={cohort?.Project} cohortAddress={params.cohortAddress} />
    </div>
  );
};

export default page;
