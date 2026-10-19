import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { media } from "sanity-plugin-media";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { schemaTypes } from "./src/sanity/schemas";

export default defineConfig({
  name: "love-mode-podcast",
  title: "Love Mode Podcast",
  basePath: "/studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title("Content")
          .items([
            // Inbox: submissions from the website forms, newest first
            S.listItem()
              .title("Inbox")
              .child(
                S.list()
                  .title("Inbox")
                  .items([
                    S.listItem()
                      .title("Brand Inquiries")
                      .schemaType("brandInquiry")
                      .child(
                        S.documentTypeList("brandInquiry")
                          .title("Brand Inquiries")
                          .defaultOrdering([{ field: "submittedAt", direction: "desc" }])
                      ),
                    S.listItem()
                      .title("Guest Applications")
                      .schemaType("guestApplication")
                      .child(
                        S.documentTypeList("guestApplication")
                          .title("Guest Applications")
                          .defaultOrdering([{ field: "submittedAt", direction: "desc" }])
                      ),
                  ])
              ),

            S.divider(),

            // Singleton: Site Settings
            S.listItem()
              .title("Site Settings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
              ),

            // Singleton: About Page
            S.listItem()
              .title("About Page")
              .child(
                S.document()
                  .schemaType("about")
                  .documentId("about")
              ),

            S.divider(),

            // Shop group
            S.listItem()
              .title("Shop")
              .child(
                S.list()
                  .title("Shop")
                  .items([
                    orderableDocumentListDeskItem({
                      type: "shopCollection",
                      title: "Collections",
                      S,
                      context,
                    }),
                    orderableDocumentListDeskItem({
                      type: "product",
                      title: "Products",
                      S,
                      context,
                    }),
                  ])
              ),

            S.divider(),

            // Education group
            S.listItem()
              .title("Education")
              .child(
                S.list()
                  .title("Education")
                  .items([
                    orderableDocumentListDeskItem({
                      type: "course",
                      title: "Courses",
                      S,
                      context,
                    }),
                  ])
              ),
          ]),
    }),
    presentationTool({
      previewUrl: {
        origin: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        draftMode: {
          enable: `/api/draft-mode/enable?secret=${process.env.NEXT_PUBLIC_SANITY_PREVIEW_SECRET}`,
        },
      },
    }),
    visionTool(),
    media(),
  ],
  schema: { types: schemaTypes },
});
