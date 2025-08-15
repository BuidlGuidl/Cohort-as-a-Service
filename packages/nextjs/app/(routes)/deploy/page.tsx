import CreatePageClient from "./_components/CreatePageClient";
import db from "~~/lib/db";

const CreatePage = async () => {
  const dbCohorts = await db.cohort.findMany({});

  const existingSubdomains = dbCohorts
    .map(cohort => cohort.subdomain)
    .filter((subdomain): subdomain is string => subdomain !== null);

  return <CreatePageClient existingSubdomains={existingSubdomains} />;
};

export default CreatePage;
