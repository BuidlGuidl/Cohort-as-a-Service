"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSignMessage } from "wagmi";
import * as z from "zod";
import { CreateProjectSchema } from "~~/schemas";
import { notification } from "~~/utils/scaffold-eth";

interface AddProjectProps {
  onSuccess?: () => void;
  cohortAddress: string;
}

export const AddProject = ({ onSuccess, cohortAddress }: AddProjectProps) => {
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formValues, setFormValues] = useState<z.infer<typeof CreateProjectSchema> | null>(null);

  const { data: signature, signMessage, isSuccess: isSignatureSuccess } = useSignMessage();

  const form = useForm<z.infer<typeof CreateProjectSchema>>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      githubUrl: "",
      websiteUrl: "",
    },
    mode: "onChange",
  });

  const { isSubmitting, isValid, errors } = form.formState;

  useEffect(() => {
    if (isSuccess) {
      const modalCheckbox = document.getElementById("add-project-modal") as HTMLInputElement;
      if (modalCheckbox) {
        modalCheckbox.checked = false;
      }

      form.reset({
        name: "",
        description: "",
        githubUrl: "",
        websiteUrl: "",
      });

      if (onSuccess) {
        onSuccess();
      }

      setIsSuccess(false);
    }
  }, [isSuccess, form, onSuccess]);

  useEffect(() => {
    const submitWithSignature = async () => {
      if (signature && formValues && isSignatureSuccess) {
        try {
          const message = `Create project for cohort ${cohortAddress}`;
          await axios.post(`/api/cohort/${cohortAddress}/project`, {
            ...formValues,
            message,
            signature,
          });

          notification.success("Project created successfully");
          setIsSuccess(true);
          router.refresh();
        } catch (error) {
          notification.error("Something went wrong");
          console.error("Error creating project:", error);
        } finally {
          setFormValues(null);
          setIsPending(false);
        }
      }
    };

    submitWithSignature();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, formValues, cohortAddress, isSignatureSuccess]);

  const onSubmit = async (values: z.infer<typeof CreateProjectSchema>) => {
    try {
      setIsPending(true);
      setFormValues(values);
      const message = `Create project for cohort ${cohortAddress}`;
      signMessage({ message });
    } catch (error) {
      console.error("Error in signature process:", error);
      setIsPending(false);
    }
  };

  return (
    <div>
      <label
        htmlFor="add-project-modal"
        className="btn rounded-md btn-primary btn-sm font-normal space-x-2 normal-case"
      >
        Add Project
        <Plus className="h-4 w-4" />
      </label>

      <input type="checkbox" id="add-project-modal" className="modal-toggle" />
      <label htmlFor="add-project-modal" className="modal cursor-pointer">
        <label className="modal-box relative border border-primary">
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />
          <div className="font-bold mb-4 flex items-center gap-1">Add a new project</div>
          <label htmlFor="add-project-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Name</span>
              </label>
              <input
                type="text"
                className={`input input-sm rounded-md input-bordered border border-base-300 w-full ${errors.name ? "input-error" : ""}`}
                placeholder="Project Name"
                disabled={isSubmitting || isPending}
                {...form.register("name")}
              />
              {errors.name && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.name.message}</span>
                </label>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea
                className={`textarea textarea-sm rounded-md input-bordered border border-base-300 w-full ${errors.description ? "input-error" : ""}`}
                placeholder="Project Description"
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
                <span className="label-text font-medium">GitHub URL (Optional)</span>
              </label>
              <input
                type="text"
                className={`input input-sm rounded-md input-bordered border border-base-300 w-full ${errors.githubUrl ? "input-error" : ""}`}
                placeholder="https://github.com/username/repo"
                disabled={isSubmitting || isPending}
                {...form.register("githubUrl")}
              />
              {errors.githubUrl && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.githubUrl.message}</span>
                </label>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Website URL (Optional)</span>
              </label>
              <input
                type="text"
                className={`input input-sm rounded-md input-bordered border border-base-300 w-full ${errors.websiteUrl ? "input-error" : ""}`}
                placeholder="https://yourproject.com"
                disabled={isSubmitting || isPending}
                {...form.register("websiteUrl")}
              />
              {errors.websiteUrl && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.websiteUrl.message}</span>
                </label>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="btn btn-primary btn-sm rounded-md"
                disabled={!isValid || isSubmitting || isPending}
              >
                {isPending ? "Signing..." : "Create Project"}
              </button>
            </div>
          </form>
        </label>
      </label>
    </div>
  );
};

export default AddProject;
