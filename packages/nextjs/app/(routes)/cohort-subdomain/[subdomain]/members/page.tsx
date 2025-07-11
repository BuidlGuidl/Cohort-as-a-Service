import { notFound } from "next/navigation";
import MembersPage from "../../../cohort/[cohortAddress]/members/page";
import db from "~~/lib/db";

export default async function SubdomainMembersPage({ params }: { params: { subdomain: string } }) {
  const cohort = await db.cohort.findUnique({
    where: { subdomain: params.subdomain.toLowerCase() },
  });

  if (!cohort) {
    notFound();
  }

  return <MembersPage params={{ cohortAddress: cohort.address }} />;
}
