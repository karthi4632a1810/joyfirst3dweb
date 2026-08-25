import { z } from "zod";

import { budgetRanges, projectTypes } from "@/data/services";

/**
 * Enquiry schema.
 *
 * Shared by the client form and the server action, so the browser and the
 * server apply exactly one set of rules — client-side validation is a courtesy,
 * and the server never trusts it.
 */
export const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(120, "That name is too long."),

  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .email("That does not look like a valid email address.")
    .max(200),

  phone: z
    .string()
    .trim()
    .min(7, "Please enter a phone number we can reach you on.")
    .max(30, "That phone number is too long.")
    .regex(/^[+\d][\d\s()\-.]{5,}$/, "Please enter a valid phone number."),

  projectType: z.enum(projectTypes, {
    message: "Please choose a project type.",
  }),

  location: z.string().trim().max(160).optional().or(z.literal("")),

  budget: z
    .enum(budgetRanges)
    .optional()
    .or(z.literal("")),

  message: z
    .string()
    .trim()
    .min(10, "Please tell us a little about the project.")
    .max(4000, "Please keep the message under 4000 characters."),

  /**
   * Honeypot. Real people never see this field, so anything in it is a bot and
   * the submission is dropped without an error — telling a bot it failed only
   * helps it try again.
   */
  company: z.string().max(0).optional().or(z.literal("")),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

/** Field-keyed errors, the shape the form renders directly. */
export type FieldErrors = Partial<Record<keyof EnquiryInput, string>>;

export interface EnquiryState {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: FieldErrors;
}

export function flattenErrors(error: z.ZodError<EnquiryInput>): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !result[key as keyof EnquiryInput]) {
      result[key as keyof EnquiryInput] = issue.message;
    }
  }
  return result;
}
