import React from "react";
import ApplicationList from "./_components/ApplicationList";
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
      Application: true,
      Builder: true,
    },
  });

  if (!cohort) {
    return <div>Cohort not found</div>;
  }

  return (
    <div className="max-w-4xl mt-8 px-4 sm:px-6 lg:px-8">
      <CohortLink href="/" cohortAddress={params.cohortAddress} className="btn btn-ghost btn-sm rounded-sm">
        <ArrowLongLeftIcon className="w-7 h-4" />
        Back to Cohort
      </CohortLink>

      <div className="mt-8">
        <ApplicationList applications={cohort.Application} cohortAddress={params.cohortAddress} />
      </div>
    </div>
  );
};

export default page;
