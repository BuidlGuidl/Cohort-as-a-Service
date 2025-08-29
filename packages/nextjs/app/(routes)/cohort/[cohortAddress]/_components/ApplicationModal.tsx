import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useSignMessage } from "wagmi";
import { useAccount } from "wagmi";
import * as z from "zod";
import { Editor } from "~~/components/editor";
import { Preview } from "~~/components/preview";
import { useContentValidator } from "~~/hooks/useContentValidator";
import { notification } from "~~/utils/scaffold-eth";

interface ApplicationModalProps {
  cohortAddress: string;
  onApplicationSuccess?: () => void;
}

const CreateApplicationSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  githubUsername: z
    .string()
    .max(30, "GitHub username cannot exceed 30 characters")
    .regex(
      /^(?!-)[a-zA-Z0-9-]+(?<!-)$/,
      "GitHub username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen",
    )
    .or(z.literal(""))
    .optional(),
});

export const ApplicationModal = ({ cohortAddress, onApplicationSuccess }: ApplicationModalProps) => {
  const { address } = useAccount();
  const router = useRouter();
  const { validateContent } = useContentValidator();

  const [isValidating, setIsValidating] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [formValues, setFormValues] = useState<z.infer<typeof CreateApplicationSchema> | null>(null);
  const [description, setDescription] = useState("");

  const { data: signature, signMessage, isSuccess: isSignatureSuccess } = useSignMessage();

  const form = useForm<z.infer<typeof CreateApplicationSchema>>({
    resolver: zodResolver(CreateApplicationSchema),
    defaultValues: {
      description: "",
      githubUsername: "",
    },
    mode: "onChange",
  });

  const { isSubmitting, errors } = form.formState;

  useEffect(() => {
    form.setValue("description", description, { shouldValidate: true });
  }, [description, form]);

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
      setDescription("");
      setValidationError(null);

      if (onApplicationSuccess) {
        onApplicationSuccess();
      }

      router.refresh();
      setIsSuccess(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, form]);

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
          router.refresh();
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
      setIsValidating(true);
      setValidationError(null);

      const validationResult = await validateContent(values.description);

      if (!validationResult.isValid) {
        setValidationError(validationResult.reason || "Content contains inappropriate material");
        setIsPending(false);
        setIsValidating(false);
        return;
      }

      setIsValidating(false);
      setFormValues(values);
      const message = `Submit application for cohort ${cohortAddress}`;
      signMessage({ message });
    } catch (error) {
      console.error("Error in signature process:", error);
      setIsPending(false);
    }
  };

  return (
    <div>
      <input type="checkbox" id="add-application-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative bg-base-100 border border-primary max-w-2xl ">
          <input className="h-0 w-0 absolute top-0 left-0" />
          <div className="font-bold mb-4 flex items-center gap-1">Submit Application</div>
          <label htmlFor="add-application-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Why do you want to join this cohort?</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`btn btn-xs ${!isPreviewing ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setIsPreviewing(false)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`btn btn-xs ${isPreviewing ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setIsPreviewing(true)}
                  >
                    Preview
                  </button>
                </div>
              </label>

              <div className=" rounded-md">
                {isPreviewing ? (
                  <div className="p-4">
                    {description && description != "<p><br></p>" ? (
                      <Preview value={description} />
                    ) : (
                      <p className="text-base-content/60 italic">Nothing to preview yet...</p>
                    )}
                  </div>
                ) : (
                  <Editor
                    value={description}
                    onChange={value => {
                      setDescription(value);
                      if (value && value !== "<p><br></p>") {
                        setValidationError(null);
                      }
                    }}
                  />
                )}
              </div>

              {errors.description && !isPreviewing && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.description.message}</span>
                </label>
              )}

              {validationError && description && description !== "<p><br></p>" && (
                <label className="label">
                  <span className="label-text-alt text-error">{validationError}</span>
                </label>
              )}
            </div>

            <div className="form-control w-full ">
              <label className="label">
                <span className="label-text font-medium">GitHub Username</span>
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
                className="btn btn-primary w-full"
                disabled={isSubmitting || isPending || isValidating}
              >
                {isValidating ? "Validating content..." : isPending ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
