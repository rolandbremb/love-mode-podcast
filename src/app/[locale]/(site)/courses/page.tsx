import { draftMode } from "next/headers";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getCourses, getSiteSettings, type Course } from "@/sanity/client";

export const revalidate = 3600;

const defaultCourses: Course[] = [
  { _id: "1", title: "Dating with Intention", description: "A step-by-step course on how to date with purpose and attract the right people.", duration: "6 weeks", format: "Self-paced video", status: "coming-soon", link: "#" },
  { _id: "2", title: "Communicate Like a Pro", description: "Master the art of healthy communication in relationships.", duration: "4 weeks", format: "Self-paced video + live Q&A", status: "coming-soon", link: "#" },
];

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { isEnabled: preview } = await draftMode();
  const settings = await getSiteSettings({ preview, locale });

  if ((settings?.showCourses ?? true) === false) {
    redirect({ href: "/", locale });
  }

  const [t, cmsCourses] = await Promise.all([
    getTranslations({ locale, namespace: "courses" }),
    getCourses({ preview, locale }),
  ]);
  const courses = cmsCourses.length > 0 ? cmsCourses : defaultCourses;

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl font-bold text-stone-900 md:text-5xl">
            {t("title")}
          </h1>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-500" />
          <p className="mt-4 text-lg text-stone-600">{t("subtitle")}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {courses.map((course) => (
            <div key={course._id} className="card flex flex-col">
              {course.status === "coming-soon" && (
                <span className="mb-3 inline-block w-fit rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-600">
                  {t("comingSoon")}
                </span>
              )}
              <h3 className="font-serif text-xl font-bold text-stone-900">{course.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">{course.description}</p>
              <div className="mt-4 flex gap-4 text-xs text-stone-500">
                <span>{course.duration}</span>
                <span>{course.format}</span>
              </div>
              {course.status === "coming-soon" ? (
                <button disabled className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-stone-200 px-6 py-3 text-sm font-semibold text-stone-500">
                  {t("notifyMe")}
                </button>
              ) : (
                <a href={course.link} className="btn-primary mt-6 w-full">{t("enrollNow")}</a>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-center text-white md:p-12">
          <h2 className="font-serif text-3xl font-bold">{t("coachingTitle")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-100">{t("coachingDescription")}</p>
          <button disabled className="mt-8 inline-flex items-center justify-center rounded-full bg-white/20 px-6 py-3 text-sm font-semibold text-white backdrop-blur">
            {t("joinWaitlist")}
          </button>
        </div>
      </div>
    </div>
  );
}
