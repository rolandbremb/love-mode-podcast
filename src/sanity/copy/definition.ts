/* Every piece of website text that can be edited in the Studio, grouped by page.
   The Studio schema and the site both read this list, so a field added here
   shows up in the Studio and is used by the site without further wiring.

   Each field points at a translation key ("namespace.key"); the text in
   messages/<locale>.json is the fallback whenever a Studio field is empty. */

export type CopyFieldType = "string" | "text" | "stringList" | "textList" | "stops" | "sections";

export interface CopyField {
  /** Translation key the field fills, e.g. "home.listenNow" */
  key: string;
  title: string;
  type?: CopyFieldType;
  section?: string;
  description?: string;
}

export interface CopyDocument {
  /** Sanity document type, also used as the singleton document id */
  id: string;
  title: string;
  sections?: { name: string; title: string }[];
  fields: CopyField[];
}

const home: CopyDocument = {
  id: "homePage",
  title: "Home page",
  sections: [
    { name: "hero", title: "Top of the page" },
    { name: "topics", title: "Topics" },
    { name: "welcome", title: "Welcome" },
    { name: "journey", title: "Love journey" },
    { name: "episodes", title: "Featured episodes" },
    { name: "talk", title: "¿Lo hablamos? (paid sessions)" },
    { name: "host", title: "About Andrea" },
    { name: "guest", title: "Share your story" },
    { name: "news", title: "Newsletter" },
    { name: "coffee", title: "Coffee and brands" },
  ],
  fields: [
    { key: "home.dearYou", title: "Greeting above the title", section: "hero" },
    { key: "home.heroTitle", title: "Title", section: "hero" },
    { key: "home.heroTagline", title: "Tagline", section: "hero" },
    { key: "home.heroBy", title: "Tagline line", section: "hero" },
    { key: "home.heroDescription", title: "Description", type: "text", section: "hero" },
    { key: "home.listenNow", title: "Button", section: "hero" },
    { key: "home.listenLatest", title: "Button to the latest episode", section: "hero" },
    { key: "home.followOn", title: "Label before the listening apps", section: "hero" },
    { key: "home.latestLabel", title: "Latest episode: label", section: "hero" },
    { key: "home.latestCta", title: "Latest episode: button", section: "hero" },
    { key: "home.heroHome", title: "Handwritten note next to the button", section: "hero" },
    { key: "home.photoNote", title: "Note under the photo", section: "hero" },
    { key: "home.stampFrom", title: "Small text on the stamp", section: "hero" },
    { key: "home.postmark", title: "Text around the postmark", section: "hero" },
    { key: "home.heroPhotoAlt", title: "Photo description (for screen readers)", section: "hero" },

    {
      key: "home.topics",
      title: "Topics",
      type: "stringList",
      section: "topics",
      description: "Each topic opens the episodes page searched for it.",
    },
    {
      key: "home.topicSearches",
      title: "Topics: episode search words",
      type: "stringList",
      section: "topics",
      description: "One per topic, in the same order. Episodes are in Spanish, so use a Spanish word that appears in their titles or descriptions.",
    },
    { key: "home.topicsLabel", title: "Topics label (for screen readers)", section: "topics" },
    { key: "home.topicsIntro", title: "Line above the topics", section: "topics" },

    { key: "home.welcomeTitle", title: "Title", section: "welcome" },
    {
      key: "home.welcomeParagraphs",
      title: "Paragraphs",
      type: "textList",
      section: "welcome",
      description: 'The first paragraph is shown large and the last one in bold. A paragraph starting with "I got ya!" gets that phrase handwritten.',
    },

    { key: "home.journeyTitle", title: "Title", section: "journey" },
    { key: "home.journeyIntro", title: "Intro", type: "text", section: "journey" },
    { key: "home.journeyNote", title: "Handwritten note", section: "journey" },
    { key: "home.journeyStops", title: "Stops", type: "stops", section: "journey", description: "Four stops, in order." },
    {
      key: "home.journeyIntros",
      title: "Stop pages: intros",
      type: "textList",
      section: "journey",
      description: "One per stop, in the same order. The opening text of each stop's page.",
    },
    {
      key: "home.journeyKeywords",
      title: "Stop pages: keywords",
      type: "stringList",
      section: "journey",
      description:
        "One line per stop, in the same order, with words separated by commas. An episode joins a stop when one of its words is in the episode's title or first paragraph. Episodes are in Spanish, so use Spanish words.",
    },
    { key: "home.journeyPageNote", title: "Stop pages: line above the title", section: "journey" },
    { key: "home.journeyEpisodes", title: "Stop pages: episode count", section: "journey", description: "{count} is filled in automatically." },
    { key: "home.journeyOther", title: "Stop pages: other stops title", section: "journey" },
    { key: "home.journeyEpisodeStops", title: "Episode pages: stops label", section: "journey" },
    { key: "home.stopLabel", title: "Word before the stop number (for screen readers)", section: "journey" },

    { key: "home.mostViewedEpisodes", title: "Title", section: "episodes" },
    { key: "home.topEpisodesTitle", title: "Most listened: title", section: "episodes" },
    { key: "home.reviewsTitle", title: "Listener reviews: title", section: "episodes", description: "The reviews themselves are in Brands & Reviews." },
    {
      key: "home.episodesIntro",
      title: "Intro",
      type: "textList",
      section: "episodes",
      description: "The first and the last paragraph are shown, one after the other.",
    },
    { key: "home.viewAllEpisodes", title: "Link to all episodes", section: "episodes" },
    { key: "home.withGuest", title: "Guest line on each stamp", section: "episodes" },
    { key: "home.episodesNote", title: "Handwritten note", section: "episodes" },

    { key: "home.talkTitle", title: "Title", section: "talk" },
    { key: "home.talkIntro", title: "Intro", type: "text", section: "talk" },
    { key: "home.callTitle", title: "Call: title", section: "talk" },
    { key: "home.callBody", title: "Call: description", type: "text", section: "talk" },
    { key: "home.callCta", title: "Call: button", section: "talk" },
    { key: "home.callPrice", title: "Call: price", section: "talk" },
    { key: "home.emailTitle", title: "Email: title", section: "talk" },
    { key: "home.emailBody", title: "Email: description", type: "text", section: "talk" },
    { key: "home.emailCta", title: "Email: button", section: "talk" },
    { key: "home.emailPrice", title: "Email: price", section: "talk" },
    { key: "home.talkDisclaimer", title: "Small print", type: "text", section: "talk" },

    { key: "home.hostTitle", title: "Title", section: "host" },
    { key: "home.meetHostCta", title: "Button", section: "host" },
    { key: "home.hostNote", title: "Handwritten note", section: "host" },
    { key: "home.hostPostmark", title: "Text around the postmark", section: "host" },

    { key: "home.wantToBeAGuest", title: "Title", section: "guest" },
    { key: "home.guestParagraphs", title: "Text", type: "textList", section: "guest" },
    { key: "home.applyNow", title: "Button", section: "guest" },
    { key: "home.postcardTo", title: "Postcard: address line", section: "guest" },
    { key: "home.postcardLine", title: "Postcard: first line", section: "guest" },
    { key: "home.postcardPostmark", title: "Postcard: text around the postmark", section: "guest" },
    { key: "home.guestNote", title: "Small print", type: "text", section: "guest" },

    { key: "home.newsTitle", title: "Title", section: "news" },
    { key: "home.newsBody", title: "Text", type: "text", section: "news" },
    { key: "home.newsName", title: "Name field", section: "news" },
    { key: "home.newsEmail", title: "Email field", section: "news" },
    { key: "home.newsInterests", title: "Question above the options", section: "news" },
    { key: "home.newsOptions", title: "Options", type: "stringList", section: "news" },
    { key: "home.newsCta", title: "Button", section: "news" },
    { key: "home.newsFinePrint", title: "Small print under the button", type: "text", section: "news" },
    { key: "home.newsSuccessTitle", title: "After signing up: title", section: "news" },
    { key: "home.newsSuccessBody", title: "After signing up: text", type: "text", section: "news" },
    { key: "home.newsPrivacy", title: "Privacy policy link", section: "news" },

    { key: "home.supportTheShow", title: "Coffee: title", section: "coffee" },
    { key: "home.supportDescription", title: "Coffee: text", type: "text", section: "coffee" },
    { key: "home.supportThanks", title: "Coffee: handwritten thanks", section: "coffee" },
    { key: "home.buyMeCoffee", title: "Coffee: button", section: "coffee" },
    { key: "home.brandsTitle", title: "Brands: title", section: "coffee" },
    { key: "home.brandsShort", title: "Brands: text", type: "text", section: "coffee" },
    { key: "home.brandsCta", title: "Brands: button", section: "coffee" },
  ],
};

const episodes: CopyDocument = {
  id: "episodesPage",
  title: "Episodes page",
  fields: [
    { key: "episodes.title", title: "Title" },
    { key: "episodes.subtitle", title: "Intro", type: "text" },
    { key: "episodes.count", title: "Episode count above the title" },
    { key: "episodes.latest", title: "Label on the latest episode" },
    { key: "episodes.listenNow", title: "Latest episode: button" },
    { key: "episodes.searchLabel", title: "Search: label (for screen readers)" },
    { key: "episodes.searchPlaceholder", title: "Search: placeholder" },
    { key: "episodes.filtersLabel", title: "Topic buttons: label (for screen readers)" },
    { key: "episodes.noResults", title: "Search: no results" },
    { key: "episodeCard.listenNow", title: "Episode card: button" },
    { key: "episodeCard.views", title: "Episode card: views" },
    { key: "episode.backToAll", title: "Episode page: link back to all episodes" },
    { key: "episode.number", title: "Episode page: episode number" },
    { key: "episode.withGuest", title: "Episode page: guest line" },
    { key: "episode.play", title: "Episode page: play button (for screen readers)" },
    { key: "episode.listenOn", title: "Episode page: other apps label" },
    { key: "episode.showNotes", title: "Episode page: show notes heading" },
    { key: "episode.related", title: "Episode page: more episodes heading" },
    {
      key: "episode.languageNote",
      title: "Episode page: language note",
      description: "Shown on the English site only, so visitors know the episode is in Spanish.",
    },
    { key: "episodes.comingSoon", title: "No episodes yet: title" },
    { key: "episodes.episodesComingSoon", title: "No episodes yet: text" },
    { key: "episodes.setRssUrl", title: "No episodes yet: note for the team" },
  ],
};

const about: CopyDocument = {
  id: "about",
  title: "About page",
  fields: [
    { key: "about.meetYourHost", title: "Handwritten line above the name" },
    { key: "about.findMe", title: "Label before her social links" },
    { key: "about.storyTitle", title: "Her story: title" },
    { key: "about.signOff", title: "Her story: sign-off above her name" },
    { key: "about.ourMission", title: "Mission: label" },
    { key: "about.listenTitle", title: "Episodes card: title" },
    { key: "about.listenDesc", title: "Episodes card: text", type: "text" },
    { key: "about.listenCta", title: "Episodes card: button" },
    { key: "about.guestTitle", title: "Share your story card: title" },
    { key: "about.guestDesc", title: "Share your story card: text", type: "text" },
    { key: "about.guestCta", title: "Share your story card: button" },
    { key: "about.supportTitle", title: "Coffee card: title" },
    { key: "about.supportDesc", title: "Coffee card: text", type: "text" },
    { key: "about.supportCta", title: "Coffee card: button" },
  ],
};

const guest: CopyDocument = {
  id: "guestPage",
  title: "Share your story page",
  sections: [
    { name: "page", title: "Page" },
    { name: "form", title: "Form" },
  ],
  fields: [
    { key: "apply.label", title: "Handwritten line above the title", section: "page" },
    { key: "apply.title", title: "Title", section: "page" },
    { key: "apply.subtitle", title: "Intro", type: "text", section: "page" },
    { key: "apply.perksTitle", title: "Side panel: title", section: "page" },
    { key: "apply.perks", title: "Side panel: list", type: "stringList", section: "page" },
    { key: "apply.handNote", title: "Side panel: handwritten note", section: "page" },
    { key: "apply.fullName", title: "Name", section: "form" },
    { key: "apply.email", title: "Email", section: "form" },
    { key: "apply.socialLinks", title: "Social media", section: "form" },
    { key: "apply.emailPlaceholder", title: "Email: placeholder", section: "form" },
    { key: "apply.socialPlaceholder", title: "Social media: placeholder", section: "form" },
    { key: "apply.expertise", title: "Topic", section: "form" },
    { key: "apply.expertisePlaceholder", title: "Topic: placeholder", section: "form" },
    { key: "apply.whyGuest", title: "Story", section: "form" },
    { key: "apply.whyGuestPlaceholder", title: "Story: placeholder", section: "form" },
    { key: "apply.submit", title: "Send button", section: "form" },
    { key: "apply.note", title: "Note under the button", type: "text", section: "form" },
    { key: "apply.successTitle", title: "After sending: title", section: "form" },
    { key: "apply.successBody", title: "After sending: text", type: "text", section: "form" },
  ],
};

const brands: CopyDocument = {
  id: "brandsPage",
  title: "For brands page",
  sections: [
    { name: "page", title: "Page" },
    { name: "form", title: "Form" },
  ],
  fields: [
    { key: "collaborate.label", title: "Handwritten line above the title", section: "page" },
    { key: "collaborate.title", title: "Title", section: "page" },
    { key: "collaborate.subtitle", title: "Intro", type: "text", section: "page" },
    { key: "collaborate.sideTitle", title: "Side panel: title", section: "page" },
    { key: "collaborate.statsLabel", title: "Numbers: label (for screen readers)", section: "page" },
    { key: "collaborate.partnersTitle", title: "Partner logos: title", section: "page", description: "The logos themselves are in Brands & Reviews." },
    { key: "collaborate.offersTitle", title: "What we can create: title", section: "page" },
    { key: "collaborate.mediaKit", title: "Media kit button", section: "page", description: "Shows once a PDF is uploaded in Brands & Reviews." },
    { key: "home.brandsDescription", title: "Side panel: text", type: "text", section: "page" },
    { key: "home.statEpisodes", title: "Side panel: episodes label", section: "page" },
    { key: "home.statViews", title: "Side panel: views label", section: "page" },
    { key: "home.statSubscribers", title: "Side panel: subscribers label", section: "page" },
    { key: "home.statPlatforms", title: "Side panel: platforms label", section: "page" },
    { key: "collaborate.nameCompany", title: "Name or company", section: "form" },
    { key: "collaborate.email", title: "Email", section: "form" },
    { key: "collaborate.typeOfCollaboration", title: "Type of collaboration", section: "form" },
    { key: "collaborate.typeHint", title: "Type of collaboration: hint", section: "form" },
    { key: "collaborate.podcastSponsorship", title: "Option: podcast integration", section: "form" },
    { key: "collaborate.brandPartnership", title: "Option: brand partnership", section: "form" },
    { key: "collaborate.contentCollab", title: "Option: content", section: "form" },
    { key: "collaborate.affiliatePartnership", title: "Option: affiliates", section: "form" },
    { key: "collaborate.other", title: "Option: other", section: "form" },
    { key: "collaborate.websiteSocial", title: "Website or social media", section: "form" },
    { key: "collaborate.budgetRange", title: "Budget", section: "form" },
    { key: "collaborate.budgetHint", title: "Budget: hint", section: "form" },
    { key: "collaborate.preferNotToSay", title: "Budget: prefer not to say", section: "form" },
    { key: "collaborate.under500", title: "Budget: under $500", section: "form" },
    { key: "collaborate.500to2000", title: "Budget: $500 to $2,000", section: "form" },
    { key: "collaborate.2000to5000", title: "Budget: $2,000 to $5,000", section: "form" },
    { key: "collaborate.5000plus", title: "Budget: over $5,000", section: "form" },
    { key: "collaborate.tellUsIdea", title: "Idea", section: "form" },
    { key: "collaborate.emailPlaceholder", title: "Email: placeholder", section: "form" },
    { key: "collaborate.tellUsPlaceholder", title: "Idea: placeholder", section: "form" },
    { key: "collaborate.submit", title: "Send button", section: "form" },
    { key: "collaborate.note", title: "Note under the button", type: "text", section: "form" },
    { key: "collaborate.successTitle", title: "After sending: title", section: "form" },
    { key: "collaborate.successBody", title: "After sending: text", type: "text", section: "form" },
  ],
};

const menu: CopyDocument = {
  id: "menuFooter",
  title: "Menu and footer",
  sections: [
    { name: "menu", title: "Menu" },
    { name: "footer", title: "Footer" },
  ],
  fields: [
    { key: "nav.episodes", title: "Episodes", section: "menu" },
    { key: "nav.about", title: "About", section: "menu" },
    { key: "nav.beAGuest", title: "Share your story", section: "menu" },
    { key: "nav.shop", title: "Shop", section: "menu" },
    { key: "nav.products", title: "Products", section: "menu" },
    { key: "nav.courses", title: "Courses", section: "menu" },
    { key: "nav.workWithUs", title: "Button", section: "menu" },
    { key: "nav.menu", title: "Menu button (for screen readers)", section: "menu" },
    { key: "footer.tagline", title: "Handwritten line under the logo", section: "footer" },
    { key: "footer.allEpisodes", title: "Episodes", section: "footer" },
    { key: "footer.about", title: "About", section: "footer" },
    { key: "footer.beAGuest", title: "Share your story", section: "footer" },
    { key: "footer.collaborate", title: "For brands", section: "footer" },
    { key: "footer.shop", title: "Shop", section: "footer" },
    { key: "footer.digitalProducts", title: "Products", section: "footer" },
    { key: "footer.courses", title: "Courses", section: "footer" },
    { key: "footer.privacy", title: "Privacy policy link", section: "footer" },
    { key: "footer.terms", title: "Terms link", section: "footer" },
    { key: "footer.copyright", title: "Copyright", section: "footer" },
  ],
};

const forms: CopyDocument = {
  id: "formMessages",
  title: "Form messages",
  fields: [
    { key: "forms.sending", title: "While sending" },
    { key: "forms.errorInvalid", title: "Error: missing or invalid fields", type: "text" },
    { key: "forms.errorFailed", title: "Error: couldn't send", type: "text" },
    { key: "forms.sendAnother", title: "Send another" },
    { key: "forms.honeypot", title: "Hidden spam-trap label (for screen readers)" },
  ],
};

const resources: CopyDocument = {
  id: "resourcePages",
  title: "Shop, products and courses",
  sections: [
    { name: "shop", title: "Shop" },
    { name: "products", title: "Products" },
    { name: "courses", title: "Courses" },
  ],
  fields: [
    { key: "shop.title", title: "Title", section: "shop" },
    { key: "shop.subtitle", title: "Intro", type: "text", section: "shop" },
    { key: "shop.affiliateNote", title: "Affiliate note", type: "text", section: "shop" },
    { key: "shop.browseCollection", title: "Collection link", section: "shop" },
    { key: "products.title", title: "Title", section: "products" },
    { key: "products.subtitle", title: "Intro", type: "text", section: "products" },
    { key: "products.getItNow", title: "Button", section: "products" },
    { key: "courses.title", title: "Title", section: "courses" },
    { key: "courses.subtitle", title: "Intro", type: "text", section: "courses" },
    { key: "courses.comingSoon", title: "Coming soon label", section: "courses" },
    { key: "courses.notifyMe", title: "Button while coming soon", section: "courses" },
    { key: "courses.enrollNow", title: "Enroll button", section: "courses" },
    { key: "courses.coachingTitle", title: "Coaching: title", section: "courses" },
    { key: "courses.coachingDescription", title: "Coaching: text", type: "text", section: "courses" },
    { key: "courses.joinWaitlist", title: "Coaching: button", section: "courses" },
  ],
};

const seo: CopyDocument = {
  id: "searchSharing",
  title: "Search and sharing",
  fields: [
    { key: "meta.title", title: "Site name in search results" },
    {
      key: "meta.homeTitle",
      title: "Home page: title in search results",
      description: "Around 60 characters at most, or Google cuts it off.",
    },
    {
      key: "meta.description",
      title: "Site description in search results",
      type: "text",
      description: "Around 155 characters at most, or Google cuts it off.",
    },
    { key: "meta.aboutTitle", title: "About page: title in search results" },
    { key: "meta.aboutDescription", title: "About page: description in search results", type: "text" },
    { key: "meta.episodesTitle", title: "Episodes page: title in search results" },
    { key: "meta.episodesDescription", title: "Episodes page: description in search results", type: "text" },
    { key: "meta.brandsTitle", title: "For brands page: title in search results" },
    { key: "meta.brandsDescription", title: "For brands page: description in search results", type: "text" },
    { key: "meta.privacyDescription", title: "Privacy page: description in search results", type: "text" },
    { key: "meta.termsDescription", title: "Terms page: description in search results", type: "text" },
  ],
};

const terms: CopyDocument = {
  id: "termsPage",
  title: "Terms page",
  fields: [
    { key: "terms.title", title: "Title" },
    { key: "terms.updated", title: "Last updated line", description: "Change the date whenever the terms change." },
    { key: "terms.intro", title: "Intro", type: "text" },
    {
      key: "terms.sections",
      title: "Sections",
      type: "sections",
      description:
        'Keep prices and the refund rules in step with Cal.com and the home page. Leave an empty line between paragraphs; lines starting with "- " become a list.',
    },
  ],
};

const emailSession: CopyDocument = {
  id: "emailSessionPage",
  title: "Paid email page",
  sections: [
    { name: "page", title: "Page" },
    { name: "form", title: "Form" },
    { name: "after", title: "After paying" },
  ],
  fields: [
    { key: "emailSession.label", title: "Line above the title", section: "page" },
    { key: "emailSession.title", title: "Title", section: "page" },
    { key: "emailSession.intro", title: "Intro", type: "text", section: "page" },
    { key: "emailSession.metaDescription", title: "Description in search results", type: "text", section: "page" },
    { key: "emailSession.asideTitle", title: "How it works: title", section: "page" },
    { key: "emailSession.price", title: "How it works: price", section: "page", description: "The charge itself is set in the code (US$35)." },
    { key: "emailSession.steps", title: "How it works: steps", type: "stringList", section: "page" },
    { key: "emailSession.privacyNote", title: "Privacy note", type: "text", section: "page" },
    { key: "emailSession.name", title: "Name: label", section: "form" },
    { key: "emailSession.email", title: "Email: label", section: "form" },
    { key: "emailSession.emailPlaceholder", title: "Email: placeholder", section: "form" },
    { key: "emailSession.emailHint", title: "Email: hint", section: "form" },
    { key: "emailSession.story", title: "Story: label", section: "form" },
    { key: "emailSession.storyPlaceholder", title: "Story: placeholder", section: "form" },
    { key: "emailSession.wordCount", title: "Story: word count", section: "form", description: "{count} and {max} are filled in automatically." },
    { key: "emailSession.tooLong", title: "Story: too long", section: "form" },
    { key: "emailSession.consent", title: "Disclaimer checkbox", type: "text", section: "form" },
    { key: "emailSession.submit", title: "Button", section: "form" },
    { key: "emailSession.redirecting", title: "Button while opening payment", section: "form" },
    { key: "emailSession.termsNote", title: "Terms line", type: "text", section: "form", description: "Keep the <terms>…</terms> and <privacy>…</privacy> tags around the link words." },
    { key: "emailSession.cancelled", title: "Payment cancelled message", type: "text", section: "form" },
    { key: "emailSession.productName", title: "Name on the Stripe payment page", section: "form" },
    { key: "emailSession.thanksTitle", title: "Thank-you page: title", section: "after" },
    { key: "emailSession.thanksBody", title: "Thank-you page: text", type: "text", section: "after", description: "{email} is filled in automatically." },
    { key: "emailSession.processingTitle", title: "Payment still confirming: title", section: "after" },
    { key: "emailSession.processingBody", title: "Payment still confirming: text", type: "text", section: "after" },
    { key: "emailSession.thanksCta", title: "Thank-you page: button", section: "after" },
    { key: "emailSession.confirmSubject", title: "Confirmation email: subject", section: "after" },
    { key: "emailSession.confirmBody", title: "Confirmation email: text", type: "text", section: "after", description: "{name} is filled in automatically." },
  ],
};

const privacy: CopyDocument = {
  id: "privacyPage",
  title: "Privacy page",
  fields: [
    { key: "privacy.title", title: "Title" },
    { key: "privacy.updated", title: "Last updated line", description: "Change the date whenever the policy changes." },
    { key: "privacy.intro", title: "Intro", type: "text" },
    {
      key: "privacy.sections",
      title: "Sections",
      type: "sections",
      description: 'Each section has a heading and text. Leave an empty line between paragraphs; lines starting with "- " become a list.',
    },
  ],
};

const confirmed: CopyDocument = {
  id: "confirmedPage",
  title: "Newsletter confirmed page",
  fields: [
    { key: "confirmed.title", title: "Title" },
    { key: "confirmed.body", title: "Text", type: "text" },
    { key: "confirmed.note", title: "Handwritten note" },
    { key: "confirmed.cta", title: "Button" },
    { key: "confirmed.home", title: "Link to the home page" },
    { key: "confirmed.postmark", title: "Text around the postmark" },
  ],
};

const popup: CopyDocument = {
  id: "newsletterPopup",
  title: "Newsletter pop-up",
  fields: [
    { key: "popup.title", title: "Title" },
    { key: "popup.body", title: "Text", type: "text" },
    { key: "popup.name", title: "Name field label" },
    { key: "popup.email", title: "Email field label" },
    { key: "popup.cta", title: "Button" },
    { key: "popup.finePrint", title: "Fine print" },
    { key: "popup.privacy", title: "Link to the privacy page" },
    { key: "popup.successTitle", title: "After signing up: title" },
    { key: "popup.successBody", title: "After signing up: text", type: "text" },
    { key: "popup.close", title: "Close button (read out by screen readers)" },
  ],
};

const lista: CopyDocument = {
  id: "listaPage",
  title: "\"Esto apenas empieza\" page (/lista)",
  fields: [
    { key: "lista.title", title: "Title" },
    { key: "lista.intro", title: "Intro paragraphs", type: "textList" },
    { key: "lista.name", title: "Name field label" },
    { key: "lista.email", title: "Email field label" },
    { key: "lista.phone", title: "WhatsApp field label" },
    { key: "lista.phoneHint", title: "WhatsApp field hint" },
    { key: "lista.country", title: "Country picker (read out by screen readers)" },
    { key: "lista.phoneInvalid", title: "Error for a wrong number", description: "{country} is replaced by the chosen country." },
    { key: "lista.phoneConfirm", title: "Line confirming the number", description: "{number} is replaced by the number, written out in full." },
    { key: "lista.consent", title: "WhatsApp consent checkbox", description: "Appears once someone types a phone number." },
    { key: "lista.cta", title: "Button" },
    { key: "lista.finePrint", title: "Fine print" },
    { key: "lista.privacy", title: "Link to the privacy page" },
    { key: "lista.successTitle", title: "After signing up: title" },
    { key: "lista.successBody", title: "After signing up: text", type: "text" },
    { key: "lista.listen", title: "Link to the episodes" },
    { key: "lista.postmark", title: "Text around the postmark" },
    { key: "lista.metaDescription", title: "Description in search results and link previews", type: "text" },
  ],
};

export const copyDocuments: CopyDocument[] = [
  home,
  episodes,
  about,
  guest,
  brands,
  menu,
  forms,
  resources,
  privacy,
  terms,
  emailSession,
  confirmed,
  popup,
  lista,
  seo,
];

/* Sanity field name for a translation key: "home.listenNow" -> "listenNow" on the
   home page document; keys from another namespace keep it as a prefix. */
export function copyFieldName(doc: CopyDocument, key: string) {
  const [namespace, name] = key.split(".");
  const ownNamespace = doc.fields[0].key.split(".")[0];
  const fieldName = namespace === ownNamespace ? name : `${namespace}_${name}`;
  return /^\d/.test(fieldName) ? `n${fieldName}` : fieldName;
}
