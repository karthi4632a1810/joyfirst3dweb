"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";

import { submitEnquiry } from "@/app/actions/contact";
import { budgetRanges, projectTypes } from "@/data/services";
import type { EnquiryState } from "@/lib/validation";

const INITIAL: EnquiryState = { status: "idle" };

/**
 * Enquiry form.
 *
 * Progressive by construction: it is a real <form> posting to a server action,
 * so it works before hydration and without JavaScript. Errors come back from
 * the same schema the server validates against, are attached to their inputs
 * with aria-describedby, and the result is announced through a live region.
 */
export function ContactForm() {
  const [state, formAction] = useActionState(submitEnquiry, INITIAL);
  const form = useRef<HTMLFormElement>(null);
  const status = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      form.current?.reset();
    }
    if (state.status !== "idle") {
      // Move focus to the outcome so it is not missed on a long page.
      status.current?.focus();
    }
  }, [state]);

  if (state.status === "success") {
    return <SuccessState message={state.message} />;
  }

  return (
    <form ref={form} action={formAction} noValidate className="w-full">
      <div
        ref={status}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="outline-none"
      >
        {state.status === "error" && state.message && (
          <p className="mb-8 break-words border-l-2 border-bronze bg-linen px-5 py-4 text-[0.875rem] text-ink">
            {state.message}
          </p>
        )}
      </div>

      <div className="grid gap-x-[clamp(1.5rem,3vw,3rem)] gap-y-[clamp(1.75rem,3vw,2.5rem)] sm:grid-cols-2">
        <Field label="Name" name="name" autoComplete="name" required error={state.errors?.name} />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          error={state.errors?.email}
        />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          error={state.errors?.phone}
        />
        <SelectField
          label="Project type"
          name="projectType"
          required
          options={[...projectTypes]}
          placeholder="Select a type"
          error={state.errors?.projectType}
        />
        <Field
          label="Location"
          name="location"
          autoComplete="address-level2"
          placeholder="City or site location"
          error={state.errors?.location}
        />
        <SelectField
          label="Budget"
          name="budget"
          options={[...budgetRanges]}
          placeholder="Optional"
          error={state.errors?.budget}
        />

        <div className="sm:col-span-2">
          <Field
            label="Message"
            name="message"
            as="textarea"
            required
            placeholder="Tell us about the site, the brief and your timeline."
            error={state.errors?.message}
          />
        </div>
      </div>

      {/* Honeypot — visually and programmatically hidden from real visitors. */}
      <div aria-hidden="true" className="absolute h-px w-px overflow-hidden opacity-0">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-[clamp(2.5rem,5vw,3.5rem)] flex flex-col flex-wrap items-stretch gap-8 sm:flex-row sm:items-center">
        <SubmitButton />
        <p className="max-w-[38ch] text-[0.75rem] leading-relaxed text-stone">
          We reply to every enquiry, usually within two working days.
        </p>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      data-cursor="open"
      className="group inline-flex min-h-[44px] w-full touch-manipulation items-center justify-center gap-4 border border-ink/25 px-9 py-5 text-[0.8125rem] uppercase tracking-[0.16em] text-ink transition-colors duration-500 hover:border-bronze hover:text-bronze disabled:cursor-wait disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Sending" : "Start your project"}
      <span
        aria-hidden="true"
        className={`block h-3 w-5 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          pending ? "animate-pulse" : "group-hover:translate-x-1.5"
        }`}
      >
        <svg viewBox="0 0 20 14" fill="none" className="h-full w-full">
          <path
            d="M0 7h18M12 1l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="square"
          />
        </svg>
      </span>
    </button>
  );
}

function SuccessState({ message }: { message?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      tabIndex={-1}
      className="border-t border-bronze/40 pt-[clamp(2.5rem,6vw,4rem)] outline-none"
    >
      <p className="label-arch mb-6 text-bronze">Enquiry received</p>
      <p className="text-headline max-w-[16ch] text-ink">Thank you.</p>
      <p className="mt-6 max-w-[44ch] text-lede text-graphite">
        {message ?? "We will be in touch shortly."}
      </p>
      <p className="mt-4 max-w-[48ch] text-[0.875rem] leading-relaxed text-stone">
        If it is urgent, calling is faster than email — the studio picks up
        during working hours.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Fields                                                                      */
/* -------------------------------------------------------------------------- */

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  as?: "input" | "textarea";
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
}

const CONTROL =
  "min-h-[44px] w-full border-b border-line-strong bg-transparent pb-3 pt-2 text-[1rem] text-ink outline-none transition-colors duration-500 placeholder:text-stone/80 focus:border-bronze";

function Field({
  label,
  name,
  type = "text",
  as = "input",
  required,
  placeholder,
  autoComplete,
  error,
}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <label
        htmlFor={id}
        className="label-arch mb-4 block text-stone"
      >
        {label}
        {required && <span className="ml-1 text-bronze">*</span>}
      </label>

      {as === "textarea" ? (
        <textarea
          id={id}
          name={name}
          rows={5}
          required={required}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          data-cursor="hidden"
          className={`${CONTROL} resize-y ${error ? "border-bronze" : ""}`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          data-cursor="hidden"
          className={`${CONTROL} ${error ? "border-bronze" : ""}`}
        />
      )}

      {error && (
        <p id={errorId} className="mt-3 text-[0.8125rem] text-bronze">
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  name: string;
  options: string[];
  placeholder: string;
  required?: boolean;
  error?: string;
}

function SelectField({
  label,
  name,
  options,
  placeholder,
  required,
  error,
}: SelectFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="label-arch mb-4 block text-stone">
        {label}
        {required && <span className="ml-1 text-bronze">*</span>}
      </label>

      <div className="relative">
        <select
          id={id}
          name={name}
          required={required}
          defaultValue=""
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          data-cursor="hidden"
          className={`${CONTROL} appearance-none pr-8 ${error ? "border-bronze" : ""}`}
        >
          <option value="" disabled className="bg-paper">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option} className="bg-paper text-ink">
              {option}
            </option>
          ))}
        </select>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-4 right-1 block h-2 w-3 text-stone"
        >
          <svg viewBox="0 0 12 8" fill="none" className="h-full w-full">
            <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.25" />
          </svg>
        </span>
      </div>

      {error && (
        <p id={errorId} className="mt-3 text-[0.8125rem] text-bronze">
          {error}
        </p>
      )}
    </div>
  );
}
