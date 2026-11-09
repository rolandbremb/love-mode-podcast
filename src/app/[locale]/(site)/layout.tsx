import { draftMode } from "next/headers";
import { VisualEditing } from "@/components/VisualEditingClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsletterPopup from "@/components/NewsletterPopup";
import { getSiteSettings } from "@/sanity/client";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { isEnabled: preview } = await draftMode();
  const { locale } = await params;
  const settings = await getSiteSettings({ preview, locale });

  const navVisibility = {
    showShop: settings?.showShop ?? true,
    showProducts: settings?.showProducts ?? true,
    showCourses: settings?.showCourses ?? true,
  };

  return (
    <div className="min-h-screen">
      <div className="airmail" aria-hidden="true" />
      <Navbar {...navVisibility} />
      <main className="min-h-screen">{children}</main>
      <Footer locale={locale} {...navVisibility} />
      {preview ? <VisualEditing zIndex={1000} /> : <NewsletterPopup />}
    </div>
  );
}
