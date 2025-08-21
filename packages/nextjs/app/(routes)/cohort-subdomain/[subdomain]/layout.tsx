import { notFound } from "next/navigation";
import db from "~~/lib/db";

export default async function SubdomainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { subdomain: string };
}) {
  const cohort = await db.cohort.findFirst({
    where: { subdomain: params.subdomain.toLowerCase() },
  });

  if (!cohort) {
    notFound();
  }

  return <>{children}</>;
}
