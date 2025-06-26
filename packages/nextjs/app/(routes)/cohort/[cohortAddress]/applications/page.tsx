import React from "react";
import Link from "next/link";
import AdminApplicationList from "./_components/AdminApplicationList";
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
      Application: true,
      Builder: true,
    },
  });

  if (!cohort) {
    return <div>Cohort not found</div>;
  }

  return (
    <div className="max-w-4xl mt-8">
      <Link href={`/cohort/${params.cohortAddress}`} className="btn btn-ghost btn-sm rounded-sm">
        <ArrowLongLeftIcon className="w-7 h-4" />
        Back to Cohort
      </Link>

      <div className="mt-8">
        <AdminApplicationList
          cohortAddress={params.cohortAddress}
          applications={cohort.Application.reverse()}
          adminAddresses={cohort.adminAddresses}
        />
      </div>
    </div>
  );
};

export default page;
