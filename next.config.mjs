import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  // The first love journey stop was renamed; keep its old address working
  async redirects() {
    return [
      {
        source: "/:locale(es|en)/love-journey/empezando-a-salir",
        destination: "/:locale/love-journey/en-mi-dating-era",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
