// Hook for easy use in components
import { useCallback, useEffect, useState } from "react";
import * as z from "zod";
import { ValidationOptions, ValidationResult, contentValidator } from "~~/lib/validation/content-validator";

export function useContentValidator() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    contentValidator.initialize().then(() => {
      setIsInitialized(true);
    });
  }, []);

  const validateContent = useCallback(
    async (content: string, options?: ValidationOptions): Promise<ValidationResult> => {
      if (!isInitialized) {
        await contentValidator.initialize();
      }
      return contentValidator.validateContent(content, options);
    },
    [isInitialized],
  );

  return { validateContent, isInitialized };
}

export function withContentValidation<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  contentFields: (keyof T)[],
) {
  return schema.superRefine(async (data, ctx) => {
    for (const field of contentFields) {
      const content = data[field] as string;
      if (content) {
        const result = await contentValidator.validateContent(content);
        if (!result.isValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field as string],
            message: result.reason || "Content contains inappropriate material",
          });
        }
      }
    }
  });
}
