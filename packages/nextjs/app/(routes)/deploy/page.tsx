import ChainToggler from "./_components/ChainToggler";
import CreateCohortForm from "./_components/CreateCohortForm";

const CreatePage = () => {
  return (
    <div className="max-w-4xl mt-10 space-y-6 mx-auto">
      <h1 className="text-2xl font-semibold">Create a new cohort</h1>
      <ChainToggler />
      <CreateCohortForm />
    </div>
  );
};

export default CreatePage;

