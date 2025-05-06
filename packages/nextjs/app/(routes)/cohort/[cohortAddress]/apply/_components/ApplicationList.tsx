"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Application, Builder } from "@prisma/client";
import axios from "axios";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSignMessage } from "wagmi";
import { useAccount } from "wagmi";
import * as z from "zod";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const CreateApplicationSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  githubUsername: z.string().optional(),
});

interface ApplicationListProps {
  applications: Application[];
  builders: Builder[];
  adminAddresses: string[];
  cohortAddress: string;
}

export const ApplicationList = ({ applications, cohortAddress, builders, adminAddresses }: ApplicationListProps) => {
  const router = useRouter();
  const { address } = useAccount();

  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formValues, setFormValues] = useState<z.infer<typeof CreateApplicationSchema> | null>(null);
  const [userApplications, setUserApplications] = useState<Application[]>([]);

  const { data: signature, signMessage, isSuccess: isSignatureSuccess } = useSignMessage();

  const isBuilderorAdmin = () => {
    if (!address) return false;
    const isBuilder = builders.some(builder => builder.address.toLowerCase() === address.toLowerCase());
    const isAdmin = adminAddresses.some(admin => admin.toLowerCase() === address.toLowerCase());
    return isBuilder || isAdmin;
  };

  useEffect(() => {
    if (address && applications) {
      const filtered = applications.filter(app => app.address.toLowerCase() === address.toLowerCase());
      setUserApplications(filtered);
    }
  }, [address, applications]);

  const canApply = () => {
    if (!userApplications.length) return true;

    const hasPendingOrApproved = userApplications.some(app => app.status === "PENDING" || app.status === "APPROVED");

    return !hasPendingOrApproved;
  };

  const form = useForm<z.infer<typeof CreateApplicationSchema>>({
    resolver: zodResolver(CreateApplicationSchema),
    defaultValues: {
      description: "",
      githubUsername: "",
    },
    mode: "onChange",
  });

  const { isSubmitting, isValid, errors } = form.formState;

  useEffect(() => {
    if (isSuccess) {
      const modalCheckbox = document.getElementById("add-application-modal") as HTMLInputElement;
      if (modalCheckbox) {
        modalCheckbox.checked = false;
      }

      form.reset({
        description: "",
        githubUsername: "",
      });

      setIsSuccess(false);
      router.refresh();
    }
  }, [isSuccess, form, router]);

  useEffect(() => {
    const submitWithSignature = async () => {
      if (signature && formValues && isSignatureSuccess && address) {
        try {
          const message = `Submit application for cohort ${cohortAddress}`;
          await axios.post(`/api/cohort/${cohortAddress}/application`, {
            ...formValues,
            address,
            message,
            signature,
          });

          notification.success("Application submitted successfully");
          setIsSuccess(true);
        } catch (error) {
          notification.error("Something went wrong");
          console.error("Error submitting application:", error);
        } finally {
          setFormValues(null);
          setIsPending(false);
        }
      }
    };

    submitWithSignature();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, formValues, cohortAddress, isSignatureSuccess]);

  const onSubmit = async (values: z.infer<typeof CreateApplicationSchema>) => {
    try {
      setIsPending(true);
      setFormValues(values);
      const message = `Submit application for cohort ${cohortAddress}`;
      signMessage({ message });
    } catch (error) {
      console.error("Error in signature process:", error);
      setIsPending(false);
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="badge badge-warning">Pending</span>;
      case "APPROVED":
        return <span className="badge badge-success">Approved</span>;
      case "REJECTED":
        return <span className="badge badge-error">Rejected</span>;
      default:
        return <span className="badge">Unknown</span>;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  if (!address) {
    return <RainbowKitCustomConnectButton />;
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl mb-6 inline-block px-4 py-2 bg-primary text-secondary">Applications</h2>

      {!address ? (
        <div className="mb-4">Connect your wallet to view and submit applications</div>
      ) : isBuilderorAdmin() ? (
        <div className="mb-4">
          <p className="text-sm">You are already member of this cohort. You cannot apply.</p>
        </div>
      ) : (
        <>
          {canApply() && (
            <div className="mb-6">
              <label
                htmlFor="add-application-modal"
                className="btn rounded-md btn-primary btn-sm font-normal space-x-2 normal-case"
              >
                Apply for Cohort
                <Plus className="h-4 w-4" />
              </label>
            </div>
          )}

          {userApplications.length === 0 ? (
            <p>You haven&apos;t submitted any applications yet.</p>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Your Applications</h3>
              {userApplications.map(application => (
                <div key={application.id} className="border border-base-300 rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm ">{application.description}</span>
                    {formatStatus(application.status)}
                  </div>
                  {application.githubUsername && (
                    <p className="text-xs text-gray-400">
                      GitHub:{" "}
                      <a
                        href={`https://github.com/${application.githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {application.githubUsername}
                      </a>
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">Submitted on {formatDate(application.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <input type="checkbox" id="add-application-modal" className="modal-toggle" />
      <label htmlFor="add-application-modal" className="modal cursor-pointer">
        <label className="modal-box relative bg-base-100 border border-primary ">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <div className="font-bold mb-4 flex items-center gap-1">Submit Application</div>
          <label htmlFor="add-application-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Why do you want to join this cohort?</span>
              </label>
              <textarea
                className={`textarea textarea-sm rounded-md input-bordered border border-base-300 w-full h-36 bg-base-100 ${
                  errors.description ? "input-error" : ""
                }`}
                placeholder="Describe your background, skills, and why you're interested in joining this cohort..."
                disabled={isSubmitting || isPending}
                {...form.register("description")}
              />
              {errors.description && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.description.message}</span>
                </label>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">GitHub Username (Optional)</span>
              </label>
              <input
                type="text"
                className={`input input-sm rounded-md input-bordered border border-base-300 w-full bg-base-100 ${
                  errors.githubUsername ? "input-error" : ""
                }`}
                placeholder="username"
                disabled={isSubmitting || isPending}
                {...form.register("githubUsername")}
              />
              {errors.githubUsername && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.githubUsername.message}</span>
                </label>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="btn btn-primary btn-sm rounded-md"
                disabled={!isValid || isSubmitting || isPending}
              >
                {isPending ? "Signing..." : "Submit Application"}
              </button>
            </div>
          </form>
        </label>
      </label>
    </div>
  );
};

export default ApplicationList;
