import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/* The dashboard is behind one password (DASHBOARD_PASSWORD). Signing in sets a
   cookie signed with that password, so changing the password signs everyone out. */

const COOKIE = "lm_dashboard";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function password() {
  return process.env.DASHBOARD_PASSWORD || null;
}

function signature(expires: number, key: string) {
  return createHmac("sha256", key).update(`love-mode-dashboard:${expires}`).digest("hex");
}

function sameText(a: string, b: string) {
  // Compare hashes so the check takes the same time whatever was typed
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export function passwordMatches(input: string) {
  const key = password();
  return Boolean(key) && sameText(input, key!);
}

export async function isSignedIn() {
  const key = password();
  if (!key) return false;
  const value = (await cookies()).get(COOKIE)?.value ?? "";
  const [expiresText, sig] = value.split(".");
  const expires = Number(expiresText);
  if (!expires || !sig || expires < Date.now() / 1000) return false;
  return sameText(sig, signature(expires, key));
}

// For every dashboard page and action: send anyone not signed in to the login page
export async function requireSignIn() {
  if (!(await isSignedIn())) redirect("/dashboard/login");
}

export async function startSession() {
  const key = password();
  if (!key) return;
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  (await cookies()).set(COOKIE, `${expires}.${signature(expires, key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/dashboard",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete({ name: COOKIE, path: "/dashboard" });
}
