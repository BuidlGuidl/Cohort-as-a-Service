import { notFound } from "next/navigation";
import ApplicationsPage from "../../../cohort/[cohortAddress]/applications/page";
import db from "~~/lib/db";

export default async function SubdomainApplicationsPage({ params }: { params: { subdomain: string } }) {
  const cohort = await db.cohort.findUnique({
    where: { subdomain: params.subdomain.toLowerCase() },
  });

  if (!cohort) {
    notFound();
  }

  return <ApplicationsPage params={{ cohortAddress: cohort.address }} />;
}
