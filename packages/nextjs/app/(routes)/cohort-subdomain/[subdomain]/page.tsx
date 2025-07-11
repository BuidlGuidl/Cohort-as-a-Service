import { notFound } from "next/navigation";
import CohortPage from "../../cohort/[cohortAddress]/page";
import db from "~~/lib/db";

export default async function SubdomainCohortPage({ params }: { params: { subdomain: string } }) {
  const cohort = await db.cohort.findFirst({
    where: { subdomain: params.subdomain.toLowerCase() },
  });

  if (!cohort) {
    notFound();
  }

  return <CohortPage params={{ cohortAddress: cohort.address }} />;
}
