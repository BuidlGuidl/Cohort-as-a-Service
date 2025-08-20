import CreatePageClient from "./_components/CreatePageClient";
import { PageAnimation } from "~~/components/PageAnimation";
import db from "~~/lib/db";

const CreatePage = async () => {
  const dbCohorts = await db.cohort.findMany({});

  const existingSubdomains = dbCohorts
    .map(cohort => cohort.subdomain)
    .filter((subdomain): subdomain is string => subdomain !== null);

  return (
    <PageAnimation>
      <CreatePageClient existingSubdomains={existingSubdomains} />
    </PageAnimation>
  );
};

export default CreatePage;
