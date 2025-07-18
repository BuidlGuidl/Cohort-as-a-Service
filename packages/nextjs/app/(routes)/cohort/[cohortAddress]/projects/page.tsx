import React from "react";
import ProjectList from "./components/ProjectList";
import { ArrowLongLeftIcon } from "@heroicons/react/24/outline";
import { CohortLink } from "~~/components/CohortLink";
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
    <div className="max-w-4xl mt-8 px-4 sm:px-6 lg:px-8">
      <CohortLink href="/" cohortAddress={params.cohortAddress} className="btn btn-ghost btn-sm rounded-sm">
        <ArrowLongLeftIcon className="w-7 h-4" />
        Cohort
      </CohortLink>
      <div className="mt-4">
        <ProjectList projects={cohort?.Project} cohortAddress={params.cohortAddress} />
      </div>
    </div>
  );
};

export default page;
