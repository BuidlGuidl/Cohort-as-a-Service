"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Editor } from "~~/components/editor";
import { Preview } from "~~/components/preview";
import { useEditDescription } from "~~/hooks/useEditDescription";

interface EditDescriptionProps {
  cohortAddress: string;
  currentDescription: string;
  onEditSuccess?: () => void;
}

const EditDescriptionSchema = z.object({
  description: z.string().min(1, "Description cannot be empty"),
});

export const EditDescription = ({ cohortAddress, currentDescription }: EditDescriptionProps) => {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [description, setDescription] = useState(currentDescription);

  const { editDescription, isPending, isSuccess } = useEditDescription({
    cohortAddress,
    description,
  });

  const form = useForm<z.infer<typeof EditDescriptionSchema>>({
    resolver: zodResolver(EditDescriptionSchema),
    defaultValues: {
      description: currentDescription,
    },
    mode: "onChange",
  });

  const { isSubmitting, isValid, errors } = form.formState;

  useEffect(() => {
    form.setValue("description", description, { shouldValidate: true });
  }, [description, form]);

  useEffect(() => {
    setDescription(currentDescription);
    form.setValue("description", currentDescription);
  }, [currentDescription, form]);

  useEffect(() => {
    if (isSuccess) {
      const modalCheckbox = document.getElementById("edit-description-modal") as HTMLInputElement;
      if (modalCheckbox) {
        modalCheckbox.checked = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  const onSubmit = async () => {
    try {
      await editDescription();
    } catch {}
  };

  return (
    <div>
      <label
        htmlFor="edit-description-modal"
        className="btn rounded-md btn-ghost btn-sm font-normal space-x-2 normal-case"
      >
        {currentDescription && currentDescription.length > 0 && currentDescription != "<p><br></p>"
          ? "Edit"
          : "Add description"}
        <Edit className="h-4 w-4" />
      </label>

      <input type="checkbox" id="edit-description-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative bg-base-100 border border-primary max-w-4xl">
          <div className="font-bold mb-4 flex items-center gap-1">
            {currentDescription && currentDescription.length > 0 && currentDescription != "<p><br></p>"
              ? "Edit description"
              : "Add description"}
          </div>
          <label htmlFor="edit-description-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">Description</span>
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

              <div className="rounded-md">
                {isPreviewing ? (
                  <div className="p-4 min-h-[300px] border border-base-300 rounded-md">
                    {description && description !== "<p><br></p>" ? (
                      <Preview value={description} />
                    ) : (
                      <p className="text-base-content/60 italic">Nothing to preview yet...</p>
                    )}
                  </div>
                ) : (
                  <Editor value={description} onChange={setDescription} height="300px" />
                )}
              </div>

              {errors.description && !isPreviewing && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.description.message}</span>
                </label>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <label htmlFor="edit-description-modal" className="btn btn-sm btn-outline">
                Cancel
              </label>
              <button type="submit" className="btn btn-sm btn-primary" disabled={!isValid || isSubmitting || isPending}>
                {isPending ? "Updating..." : "Update Description"}
              </button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" htmlFor="edit-description-modal">
          Close
        </label>
      </div>
    </div>
  );
};
