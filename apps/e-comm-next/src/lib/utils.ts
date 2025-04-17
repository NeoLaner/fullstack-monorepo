import { clsx, type ClassValue } from "clsx";
import type { UseFormReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import type { ZodError, z } from "zod";
import type { signupSchema } from "./schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Executes a list of promises sequentially.
 *
 * Accepts a list of promise factories.
 *
 * @example
 * ```
 * const promiseCreator = (i: number, time: number, text: string) => {
 *   return new Promise(resolve => setTimeout(
 *     () => resolve(console.log(`${i} ${text}`)),
 *     time)
 *   );
 * };
 *
 * const promiseFactories = [
 *   () => promiseCreator(1, 1000, "sequential"),
 *   () => promiseCreator(2, 1000, "sequential"),
 *   () => promiseCreator(3, 1000, "sequential"),
 *   () => promiseCreator(4, 1000, "sequential"),
 *   () => promiseCreator(5, 1000, "sequential"),
 * ];
 *
 * excPromisesInSeq(promiseFactories);
 * ```
 *
 * @template T
 * @param {(() => Promise<T>)[]} promiseFactories
 * @return {Promise<T[]>}
 */
export const excPromisesInSeq = <T>(
  promiseFactories: (() => Promise<T>)[],
): Promise<T[]> | undefined => {
  let promiseChain: Promise<T> | undefined;
  const results: T[] = [];
  promiseFactories.forEach((promiseFactory) => {
    promiseChain = (
      !promiseChain ? promiseFactory() : promiseChain.then(promiseFactory)
    ).then((result) => {
      results.push(result);
      return result;
    });
  });

  return promiseChain?.then(() => results);
};

export function checkDisabledBasedOnForm(
  form: UseFormReturn<z.infer<typeof signupSchema>>,
) {
  const isDisabled =
    form.getValues("email") === "" ||
    (Object.keys(form.formState.errors).length > 0 &&
      !form.formState.isValid) ||
    form.formState.isSubmitting;

  return isDisabled;
}

export const errMethods = {
  zodToError: <T>(error: ZodError<T>) => {
    return {
      failed: true,
      type: "input",
      error: (Object.keys(error.formErrors.fieldErrors) as Array<keyof T>).map(
        (fieldName) => ({
          fieldName,
          message: error.formErrors.fieldErrors[fieldName]?.[0],
        }),
      ),
    } as const;
  },

  manualInputError: <K extends string>(error: Partial<Record<K, string>>) => {
    return {
      failed: true,
      type: "input",
      error: (Object.keys(error) as Array<K>).map((fieldName) => ({
        fieldName: fieldName,
        message: error[fieldName],
      })),
    } as const;
  },

  messageError: (error: string) => {
    return {
      failed: true,
      type: "custom",
      error: error,
    } as const;
  },
};
