export const metadata = {
  title: "Collaborate | Love Mode Podcast",
  description: "Partner with Love Mode for sponsorships, brand deals, and creative collaborations.",
};

export default function CollaboratePage() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-4xl font-bold text-stone-900 md:text-5xl">
            Let&rsquo;s Collaborate
          </h1>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-500" />
          <p className="mt-4 text-lg text-stone-600">
            Brands, content creators, and coaches &mdash; let&rsquo;s create
            something meaningful together. We&rsquo;re open to sponsorships,
            partnerships, and creative collaborations.
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
                Name / Company *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Your name or company"
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
                placeholder="you@company.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="type"
              className="mb-1 block text-sm font-medium text-stone-700"
            >
              Type of Collaboration *
            </label>
            <select
              id="type"
              name="type"
              required
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Select one...</option>
              <option value="sponsorship">Podcast Sponsorship</option>
              <option value="brand-partnership">Brand Partnership</option>
              <option value="content-collab">Content Collaboration</option>
              <option value="affiliate">Affiliate Partnership</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="website"
              className="mb-1 block text-sm font-medium text-stone-700"
            >
              Website / Social Links
            </label>
            <input
              type="text"
              id="website"
              name="website"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              placeholder="https://..."
            />
          </div>

          <div>
            <label
              htmlFor="budget"
              className="mb-1 block text-sm font-medium text-stone-700"
            >
              Budget Range
            </label>
            <select
              id="budget"
              name="budget"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Prefer not to say</option>
              <option value="under-500">Under $500</option>
              <option value="500-2000">$500 - $2,000</option>
              <option value="2000-5000">$2,000 - $5,000</option>
              <option value="5000+">$5,000+</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="proposal"
              className="mb-1 block text-sm font-medium text-stone-700"
            >
              Tell Us About Your Idea *
            </label>
            <textarea
              id="proposal"
              name="proposal"
              required
              rows={5}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              placeholder="What do you have in mind? What would a successful collaboration look like?"
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Submit Proposal
          </button>

          <p className="text-center text-xs text-stone-400">
            We&rsquo;ll review your proposal and get back to you within 48
            hours.
          </p>
        </form>
      </div>
    </div>
  );
}
