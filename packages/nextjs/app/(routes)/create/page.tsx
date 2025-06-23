import Link from "next/link";
import ChainToggler from "./_components/ChainToggler";
import CreateCohortForm from "./_components/CreateCohortForm";
import { ArrowLongLeftIcon } from "@heroicons/react/24/outline";

const CreatePage = () => {
  return (
    <div className="max-w-4xl mt-16 space-y-6 mx-auto">
      <Link href="/" className="btn btn-ghost btn-sm rounded-sm">
        <ArrowLongLeftIcon className="w-7 h-4" />
        Home
      </Link>
      <h1 className="text-2xl font-semibold">Create a new cohort</h1>
      <ChainToggler />
      <CreateCohortForm />
    </div>
  );
};

export default CreatePage;
