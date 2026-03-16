import { getCourses, type Course } from "@/sanity/client";

export const revalidate = 3600;

export const metadata = {
  title: "Courses | Love Mode Podcast",
  description: "Online courses and coaching on dating, relationships, and self-love from Love Mode.",
};

const defaultCourses: Course[] = [
  { _id: "1", title: "Dating with Intention", description: "A step-by-step course on how to date with purpose, attract the right people, and stop wasting time on the wrong ones.", duration: "6 weeks", format: "Self-paced video", status: "coming-soon", link: "#", order: 1 },
  { _id: "2", title: "Communicate Like a Pro", description: "Master the art of healthy communication in relationships. Learn to express needs, set boundaries, and resolve conflict without drama.", duration: "4 weeks", format: "Self-paced video + live Q&A", status: "coming-soon", link: "#", order: 2 },
];

export default async function CoursesPage() {
  const cmsCourses = await getCourses();
  const courses = cmsCourses.length > 0 ? cmsCourses : defaultCourses;

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="font-serif text-4xl font-bold text-stone-900 md:text-5xl">
            Courses
          </h1>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-500" />
          <p className="mt-4 text-lg text-stone-600">
            Go deeper with structured courses on love, dating, and building
            relationships that last.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {courses.map((course) => (
            <div key={course._id} className="card flex flex-col">
              {course.status === "coming-soon" && (
                <span className="mb-3 inline-block w-fit rounded-full bg-gold-500/20 px-3 py-1 text-xs font-semibold text-gold-600">
                  Coming Soon
                </span>
              )}
              <h3 className="font-serif text-xl font-bold text-stone-900">
                {course.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">
                {course.description}
              </p>
              <div className="mt-4 flex gap-4 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  &#128338; {course.duration}
                </span>
                <span className="flex items-center gap-1">
                  &#127909; {course.format}
                </span>
              </div>
              {course.status === "coming-soon" ? (
                <button
                  disabled
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-stone-200 px-6 py-3 text-sm font-semibold text-stone-500"
                >
                  Notify Me When Available
                </button>
              ) : (
                <a href={course.link} className="btn-primary mt-6 w-full">
                  Enroll Now
                </a>
              )}
            </div>
          ))}
        </div>

        {/* 1:1 Coaching teaser */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-center text-white md:p-12">
          <h2 className="font-serif text-3xl font-bold">
            1:1 Coaching &mdash; Coming Soon
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-100">
            Personalized dating and relationship coaching is on the way. Get
            direct guidance, accountability, and a plan tailored to your love
            life.
          </p>
          <button
            disabled
            className="mt-8 inline-flex items-center justify-center rounded-full bg-white/20 px-6 py-3 text-sm font-semibold text-white backdrop-blur"
          >
            Join the Waitlist
          </button>
        </div>
      </div>
    </div>
  );
}
