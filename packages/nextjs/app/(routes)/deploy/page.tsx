import ChainToggler from "./_components/ChainToggler";
import CreateCohortForm from "./_components/CreateCohortForm";
import { PageAnimation } from "~~/components/PageAnimation";
import db from "~~/lib/db";

const CreatePage = async () => {
  const dbCohorts = await db.cohort.findMany({});

  const existingSubdomains = dbCohorts
    .map(cohort => cohort.subdomain)
    .filter((subdomain): subdomain is string => subdomain !== null);

  return (
    <PageAnimation>
      <div className="max-w-4xl mt-10 space-y-6 mx-auto">
        <h1 className="text-2xl font-semibold">Create a new cohort</h1>
        <ChainToggler />
        <CreateCohortForm existingSubdomains={existingSubdomains} />
      </div>
    </PageAnimation>
  );
};

export default CreatePage;
