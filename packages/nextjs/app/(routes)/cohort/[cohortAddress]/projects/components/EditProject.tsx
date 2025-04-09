"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Project } from "@prisma/client";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useSignMessage } from "wagmi";
import * as z from "zod";
import { CreateProjectSchema } from "~~/schemas";
import { notification } from "~~/utils/scaffold-eth";

interface EditProjectProps {
  project: Project;
  onSuccess?: () => void;
}

export const EditProject = ({ project, onSuccess }: EditProjectProps) => {
  const params = useParams();
  const cohortAddress = params.cohortAddress as string;

  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formValues, setFormValues] = useState<z.infer<typeof CreateProjectSchema> | null>(null);
  const router = useRouter();

  const { data: signature, signMessage, isSuccess: isSignatureSuccess } = useSignMessage();

  const form = useForm<z.infer<typeof CreateProjectSchema>>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description,
      githubUrl: project.githubUrl || "",
      websiteUrl: project.websiteUrl || "",
    },
    mode: "onChange",
  });

  const { isSubmitting, isValid, errors } = form.formState;

  // Update form values if project prop changes
  useEffect(() => {
    form.reset({
      name: project.name,
      description: project.description,
      githubUrl: project.githubUrl || "",
      websiteUrl: project.websiteUrl || "",
    });
  }, [project, form]);

  useEffect(() => {
    if (isSuccess) {
      const modalCheckbox = document.getElementById(`edit-project-modal-${project.id}`) as HTMLInputElement;
      if (modalCheckbox) {
        modalCheckbox.checked = false;
      }

      if (onSuccess) {
        onSuccess();
      }

      setIsSuccess(false);
    }
  }, [isSuccess, onSuccess, project.id]);

  useEffect(() => {
    const submitWithSignature = async () => {
      if (signature && formValues && isSignatureSuccess) {
        try {
          const message = `Edit project ${project.id} for cohort ${cohortAddress}`;
          await axios.patch(`/api/cohort/${cohortAddress}/project/${project.id}`, {
            ...formValues,
            message,
            signature,
          });
          setIsSuccess(true);
          notification.success("Project updated successfully");
          router.refresh();
        } catch (error) {
          notification.error("Something went wrong");
          console.error("Error updating project:", error);
        } finally {
          setFormValues(null);
          setIsPending(false);
        }
      }
    };

    submitWithSignature();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, formValues, cohortAddress, project.id, isSignatureSuccess]);

  const onSubmit = async (values: z.infer<typeof CreateProjectSchema>) => {
    try {
      setIsPending(true);
      setFormValues(values);
      const message = `Edit project ${project.id} for cohort ${cohortAddress}`;
      signMessage({ message });
    } catch (error) {
      console.error("Error in signature process:", error);
      setIsPending(false);
    }
  };

  return (
    <div>
      <input type="checkbox" id={`edit-project-modal-${project.id}`} className="modal-toggle" />
      <label htmlFor={`edit-project-modal-${project.id}`} className="modal cursor-pointer">
        <label className="modal-box relative border border-primary">
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />
          <div className="font-bold mb-4 flex items-center gap-1">Edit project</div>
          <label
            htmlFor={`edit-project-modal-${project.id}`}
            className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3"
          >
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
                {isPending ? "Signing..." : "Update Project"}
              </button>
            </div>
          </form>
        </label>
      </label>
    </div>
  );
};

export default EditProject;
