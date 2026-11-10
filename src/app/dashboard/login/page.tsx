import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/dashboard/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function DashboardLoginPage() {
  if (await isSignedIn()) redirect("/dashboard");
  const configured = Boolean(process.env.DASHBOARD_PASSWORD);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="relative w-full max-w-[26rem] overflow-hidden rounded-md bg-white px-8 pb-10 pt-12 shadow-postal">
        <span className="airmail absolute inset-x-0 top-0 [--airmail-gap:#ffffff]" aria-hidden="true" />
        <p className="font-display text-2xl">Love Mode</p>
        <h1 className="mb-8 mt-2 font-display text-[2.5rem] leading-none">Dashboard</h1>
        {configured ? (
          <LoginForm />
        ) : (
          <p className="text-[1.0625rem] leading-relaxed text-mauve">
            Set DASHBOARD_PASSWORD in Vercel (and .env.local for local use) to turn the dashboard on.
          </p>
        )}
      </div>
    </main>
  );
}
