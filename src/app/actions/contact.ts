"use server";

import { site } from "@/data/site";
import {
  enquirySchema,
  flattenErrors,
  type EnquiryState,
} from "@/lib/validation";

/**
 * Very small in-memory rate limit, keyed by nothing but time.
 *
 * A single process holds this, so it resets on redeploy and does not span
 * serverless instances. It is a speed bump for casual abuse, not a security
 * control — put a real limiter (Upstash, Vercel WAF) in front before launch.
 */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const recentSubmissions: number[] = [];

function rateLimited(): boolean {
  const now = Date.now();
  while (recentSubmissions.length && now - recentSubmissions[0] > RATE_LIMIT_WINDOW_MS) {
    recentSubmissions.shift();
  }
  if (recentSubmissions.length >= RATE_LIMIT_MAX) return true;
  recentSubmissions.push(now);
  return false;
}

/**
 * Hands the enquiry to whatever delivery mechanism is configured.
 *
 * Nothing is wired to a live provider yet — the studio has to choose one. The
 * environment variables are read here and never reach the client, and the
 * shapes below are what each provider expects, so switching one on is a matter
 * of removing a comment and setting the key.
 */
async function deliver(payload: Record<string, string>): Promise<void> {
  const endpoint = process.env.CONTACT_WEBHOOK_URL;

  if (!endpoint) {
    // No transport configured: log it so a self-hosted deployment still has a
    // record, and let the submission succeed rather than failing the visitor.
    console.info("[JOYFIRST] Enquiry received (no CONTACT_WEBHOOK_URL set):", {
      ...payload,
      receivedAt: new Date().toISOString(),
    });
    return;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      receivedAt: new Date().toISOString(),
      source: site.url,
    }),
    // Never let a slow webhook hold the visitor's request open.
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Delivery failed with status ${response.status}`);
  }
}

/**
 * Server action behind the contact form.
 *
 * Runs on the server only: the schema, the rate limit and the delivery
 * credentials never ship to the browser.
 */
export async function submitEnquiry(
  _previous: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    projectType: String(formData.get("projectType") ?? ""),
    location: String(formData.get("location") ?? ""),
    budget: String(formData.get("budget") ?? ""),
    message: String(formData.get("message") ?? ""),
    company: String(formData.get("company") ?? ""),
  };

  const parsed = enquirySchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      errors: flattenErrors(parsed.error),
    };
  }

  // Honeypot filled — accept silently so the bot learns nothing.
  if (parsed.data.company) {
    return { status: "success", message: "Thank you — we will be in touch shortly." };
  }

  if (rateLimited()) {
    return {
      status: "error",
      message: "Too many enquiries just now. Please try again in a minute.",
    };
  }

  try {
    await deliver({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      projectType: parsed.data.projectType,
      location: parsed.data.location || "—",
      budget: parsed.data.budget || "—",
      message: parsed.data.message,
    });

    return {
      status: "success",
      message: "Thank you — we will be in touch shortly.",
    };
  } catch (error) {
    console.error("[JOYFIRST] Enquiry delivery failed:", error);
    return {
      status: "error",
      message: `Something went wrong sending your enquiry. Please email ${site.contact.email} or call ${site.contact.phone}.`,
    };
  }
}
