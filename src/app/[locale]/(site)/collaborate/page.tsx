import { getTranslations } from "next-intl/server";

export default async function CollaboratePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "collaborate" });

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
                {t("nameCompany")} *
              </label>
              <input type="text" id="name" name="name" required
                className="theme-field"
                placeholder={t("nameCompany")} />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-stone-700">
                {t("email")} *
              </label>
              <input type="email" id="email" name="email" required
                className="theme-field"
                placeholder="you@company.com" />
            </div>
          </div>

          <div>
            <label htmlFor="type" className="mb-1 block text-sm font-medium text-stone-700">
              {t("typeOfCollaboration")} *
            </label>
            <select id="type" name="type" required
              className="theme-field">
              <option value="">{t("selectOne")}</option>
              <option value="sponsorship">{t("podcastSponsorship")}</option>
              <option value="brand-partnership">{t("brandPartnership")}</option>
              <option value="content-collab">{t("contentCollab")}</option>
              <option value="affiliate">{t("affiliatePartnership")}</option>
              <option value="other">{t("other")}</option>
            </select>
          </div>

          <div>
            <label htmlFor="website" className="mb-1 block text-sm font-medium text-stone-700">
              {t("websiteSocial")}
            </label>
            <input type="text" id="website" name="website"
              className="theme-field"
              placeholder="https://..." />
          </div>

          <div>
            <label htmlFor="budget" className="mb-1 block text-sm font-medium text-stone-700">
              {t("budgetRange")}
            </label>
            <select id="budget" name="budget"
              className="theme-field">
              <option value="">{t("preferNotToSay")}</option>
              <option value="under-500">{t("under500")}</option>
              <option value="500-2000">{t("500to2000")}</option>
              <option value="2000-5000">{t("2000to5000")}</option>
              <option value="5000+">{t("5000plus")}</option>
            </select>
          </div>

          <div>
            <label htmlFor="proposal" className="mb-1 block text-sm font-medium text-stone-700">
              {t("tellUsIdea")} *
            </label>
            <textarea id="proposal" name="proposal" required rows={5}
              className="theme-field"
              placeholder={t("tellUsPlaceholder")} />
          </div>

          <button type="submit" className="btn-primary w-full">{t("submit")}</button>
          <p className="text-center text-xs text-stone-400">{t("note")}</p>
        </form>
      </div>
    </div>
  );
}
