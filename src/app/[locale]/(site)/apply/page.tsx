import { getTranslations } from "next-intl/server";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "apply" });

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-4xl font-bold text-stone-900 md:text-5xl">
            {t("title")}
          </h1>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-500" />
          <p className="mt-4 text-lg text-stone-600">{t("subtitle")}</p>
        </div>

        <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-stone-700">
                {t("fullName")} *
              </label>
              <input type="text" id="name" name="name" required
                className="theme-field"
                placeholder={t("fullName")} />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-stone-700">
                {t("email")} *
              </label>
              <input type="email" id="email" name="email" required
                className="theme-field"
                placeholder="you@example.com" />
            </div>
          </div>

          <div>
            <label htmlFor="social" className="mb-1 block text-sm font-medium text-stone-700">
              {t("socialLinks")}
            </label>
            <input type="text" id="social" name="social"
              className="theme-field"
              placeholder={t("socialPlaceholder")} />
          </div>

          <div>
            <label htmlFor="expertise" className="mb-1 block text-sm font-medium text-stone-700">
              {t("expertise")} *
            </label>
            <input type="text" id="expertise" name="expertise" required
              className="theme-field"
              placeholder={t("expertisePlaceholder")} />
          </div>

          <div>
            <label htmlFor="message" className="mb-1 block text-sm font-medium text-stone-700">
              {t("whyGuest")} *
            </label>
            <textarea id="message" name="message" required rows={5}
              className="theme-field"
              placeholder={t("whyGuestPlaceholder")} />
          </div>

          <button type="submit" className="btn-primary w-full">{t("submit")}</button>
          <p className="text-center text-xs text-stone-400">{t("note")}</p>
        </form>
      </div>
    </div>
  );
}
