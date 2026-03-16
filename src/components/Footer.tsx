import Link from "next/link";
import { getSiteSettings } from "@/sanity/client";

const defaultSocialLinks = [
  { platform: "Instagram", url: "#" },
  { platform: "TikTok", url: "#" },
  { platform: "YouTube", url: "#" },
  { platform: "Spotify", url: "#" },
];

export default async function Footer() {
  const settings = await getSiteSettings();
  const socialLinks =
    settings?.socialLinks && settings.socialLinks.length > 0
      ? settings.socialLinks
      : defaultSocialLinks;

  return (
    <footer className="border-t border-brand-100 bg-brand-950 text-brand-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">&#10084;&#65039;</span>
              <span className="font-serif text-lg font-bold text-white">
                Love Mode
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-brand-300">
              Real conversations about love, dating, and building meaningful
              relationships.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white">Podcast</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/episodes" className="hover:text-white">
                  All Episodes
                </Link>
              </li>
              <li>
                <Link href="/apply" className="hover:text-white">
                  Be a Guest
                </Link>
              </li>
              <li>
                <Link href="/collaborate" className="hover:text-white">
                  Collaborate
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white">Resources</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/shop" className="hover:text-white">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white">
                  Digital Products
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-white">
                  Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-white">Connect</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {socialLinks.map((link) => (
                <li key={link.platform}>
                  <a
                    href={link.url || "#"}
                    target={link.url && link.url !== "#" ? "_blank" : undefined}
                    rel={link.url && link.url !== "#" ? "noopener noreferrer" : undefined}
                    className="hover:text-white"
                  >
                    {link.platform}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-brand-800 pt-6 text-center text-xs text-brand-400">
          &copy; {new Date().getFullYear()} Love Mode Podcast. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
