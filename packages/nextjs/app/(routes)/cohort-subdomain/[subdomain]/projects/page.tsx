import { notFound } from "next/navigation";
import ProjectsPage from "../../../cohort/[cohortAddress]/projects/page";
import db from "~~/lib/db";

export default async function SubdomainProjectsPage({ params }: { params: { subdomain: string } }) {
  const cohort = await db.cohort.findUnique({
    where: { subdomain: params.subdomain.toLowerCase() },
  });

  if (!cohort) {
    notFound();
  }

  return <ProjectsPage params={{ cohortAddress: cohort.address }} />;
}
