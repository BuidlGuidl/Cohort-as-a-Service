"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Builder } from "@prisma/client";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useSignMessage } from "wagmi";
import * as z from "zod";
import { notification } from "~~/utils/scaffold-eth";

const EditGithubSchema = z.object({
  githubUsername: z
    .string()
    .min(1, "GitHub username is required")
    .max(39, "GitHub username cannot exceed 39 characters")
    .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, "Invalid GitHub username format"),
});

interface EditGithubProps {
  builder?: Builder;
  onSuccess?: () => void;
}

export const EditGithub = ({ builder, onSuccess }: EditGithubProps) => {
  const params = useParams();
  const cohortAddress = params.cohortAddress as string;

  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formValues, setFormValues] = useState<z.infer<typeof EditGithubSchema> | null>(null);
  const router = useRouter();

  const { data: signature, signMessage, isSuccess: isSignatureSuccess } = useSignMessage();

  const form = useForm<z.infer<typeof EditGithubSchema>>({
    resolver: zodResolver(EditGithubSchema),
    defaultValues: {
      githubUsername: builder?.githubUsername || "",
    },
    mode: "onChange",
  });

  const { isSubmitting, isValid, errors } = form.formState;

  useEffect(() => {
    form.reset({
      githubUsername: builder?.githubUsername || "",
    });
  }, [builder, form]);

  useEffect(() => {
    if (isSuccess) {
      const modalCheckbox = document.getElementById(`edit-github-modal-${builder?.id}`) as HTMLInputElement;
      if (modalCheckbox) {
        modalCheckbox.checked = false;
      }

      if (onSuccess) {
        onSuccess();
      }

      setIsSuccess(false);
    }
  }, [isSuccess, onSuccess, builder?.id]);

  useEffect(() => {
    const submitWithSignature = async () => {
      if (signature && formValues && isSignatureSuccess) {
        try {
          const message = `Update GitHub username for builder ${builder?.address} in cohort ${cohortAddress}`;
          await axios.patch(`/api/cohort/${cohortAddress}/builder/github`, {
            githubUsername: formValues.githubUsername,
            builderAddress: builder?.address,
            message,
            signature,
          });
          setIsSuccess(true);
          notification.success("GitHub username updated");
          router.refresh();
        } catch (error) {
          notification.error("Something went wrong");
          console.error("Error updating GitHub username:", error);
        } finally {
          setFormValues(null);
          setIsPending(false);
        }
      }
    };

    submitWithSignature();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, formValues, cohortAddress, builder?.address, isSignatureSuccess]);

  const onSubmit = async (values: z.infer<typeof EditGithubSchema>) => {
    try {
      setIsPending(true);
      setFormValues(values);
      const message = `Update GitHub username for builder ${builder?.address} in cohort ${cohortAddress}`;
      signMessage({ message });
    } catch (error) {
      console.error("Error in signature process:", error);
      setIsPending(false);
    }
  };

  return (
    <div>
      <input type="checkbox" id={`edit-github-modal-${builder?.id}`} className="modal-toggle" />
      <label htmlFor={`edit-github-modal-${builder?.id}`} className="modal cursor-pointer">
        <label className="modal-box relative bg-base-100 border border-primary">
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />
          <div className="font-bold mb-4 flex items-center gap-1">Edit GitHub Username</div>
          <label
            htmlFor={`edit-github-modal-${builder?.id}`}
            className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3"
          >
            ✕
          </label>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">GitHub Username</span>
              </label>
              <input
                type="text"
                className={`input input-sm rounded-md input-bordered border border-base-300 w-full bg-transparent ${
                  errors.githubUsername ? "input-error" : ""
                }`}
                placeholder="github username"
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
                {isPending ? "Signing..." : "Update GitHub"}
              </button>
            </div>
          </form>
        </label>
      </label>
    </div>
  );
};
