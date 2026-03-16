export const metadata = {
  title: "Be a Guest | Love Mode Podcast",
  description: "Apply to be a guest on the Love Mode podcast. Share your story about love and relationships.",
};

export default function ApplyPage() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-4xl font-bold text-stone-900 md:text-5xl">
            Be a Guest
          </h1>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-500" />
          <p className="mt-4 text-lg text-stone-600">
            Have a story to share? A unique take on love, dating, or
            relationships? We&rsquo;d love to hear from you.
          </p>
        </div>

        <form
          action="https://formspree.io/f/YOUR_FORM_ID"
          method="POST"
          className="space-y-6"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-stone-700"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Your name"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-stone-700"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="social"
              className="mb-1 block text-sm font-medium text-stone-700"
            >
              Social Media Links
            </label>
            <input
              type="text"
              id="social"
              name="social"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              placeholder="Instagram, TikTok, LinkedIn, etc."
            />
          </div>

          <div>
            <label
              htmlFor="expertise"
              className="mb-1 block text-sm font-medium text-stone-700"
            >
              Your Expertise / Topic *
            </label>
            <input
              type="text"
              id="expertise"
              name="expertise"
              required
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              placeholder="e.g. Attachment styles, Dating after divorce, Self-love"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="mb-1 block text-sm font-medium text-stone-700"
            >
              Why would you be a great guest? *
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              placeholder="Tell us about yourself and what you'd bring to the conversation..."
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Submit Application
          </button>

          <p className="text-center text-xs text-stone-400">
            We review every application and will reach out if it&rsquo;s a fit!
          </p>
        </form>
      </div>
    </div>
  );
}
