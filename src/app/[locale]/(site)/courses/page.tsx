import { draftMode } from "next/headers";
import { getTranslations } from "next-intl/server";
import PageHeader from "@/components/postal/PageHeader";
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
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <div className="page-container pb-24 lg:pb-32">

        <div className="grid gap-8 md:grid-cols-2">
          {courses.map((course) => (
            <div key={course._id} className="flex flex-col rounded-md bg-white p-7 shadow-postal">
              {course.status === "coming-soon" && (
                <span className="mb-3 inline-block w-fit rounded-full bg-bubblegum px-3 py-1 text-sm font-semibold">
                  {t("comingSoon")}
                </span>
              )}
              <h3 className="font-display text-[1.75rem] leading-tight">{course.title}</h3>
              <p className="mt-3 flex-1 text-base leading-relaxed text-mauve">{course.description}</p>
              <div className="mt-4 flex gap-4 text-sm text-mauve">
                <span>{course.duration}</span>
                <span>{course.format}</span>
              </div>
              {course.status === "coming-soon" ? (
                <button disabled className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-shell px-6 py-3.5 text-base font-semibold text-mauve">
                  {t("notifyMe")}
                </button>
              ) : (
                <a href={course.link} className="btn-primary mt-6 w-full">{t("enrollNow")}</a>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-[2.25rem] bg-plum p-8 text-center text-shell md:p-14">
          <h2 className="font-display text-[2.5rem] leading-tight text-bubblegum">{t("coachingTitle")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-[1.0625rem] text-shell/85">{t("coachingDescription")}</p>
          <button disabled className="mt-8 inline-flex items-center justify-center rounded-full border-[1.5px] border-shell/40 px-6 py-3.5 text-base font-semibold text-shell/80">
            {t("joinWaitlist")}
          </button>
        </div>
      </div>
    </div>
  );
}
