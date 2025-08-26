import { notFound } from "next/navigation";
import MyApplicationsPage from "../../../cohort/[cohortAddress]/myapplications/page";
import db from "~~/lib/db";

export default async function SubdomainApplicationsPage({ params }: { params: { subdomain: string } }) {
  const cohort = await db.cohort.findFirst({
    where: { subdomain: params.subdomain.toLowerCase() },
  });

  if (!cohort) {
    notFound();
  }

  return <MyApplicationsPage params={{ cohortAddress: cohort.address }} />;
}
