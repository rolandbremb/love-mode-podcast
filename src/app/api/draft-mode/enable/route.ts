import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const previewSecret = process.env.NEXT_PUBLIC_SANITY_PREVIEW_SECRET;

  if (previewSecret && secret !== previewSecret) {
    return new Response("Invalid secret", { status: 401 });
  }

  const redirectTo = request.nextUrl.searchParams.get("redirect") ?? "/";
  (await draftMode()).enable();
  redirect(redirectTo);
}
