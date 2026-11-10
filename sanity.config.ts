import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { media } from "sanity-plugin-media";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { schemaTypes } from "./src/sanity/schemas";
import { copyDocuments } from "./src/sanity/copy/definition";

// One document each: pick them from the list, never create new ones
const singletonTypes = new Set(["siteSettings", "socialProof", ...copyDocuments.map((doc) => doc.id)]);

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
                      .title("Income (added from the dashboard)")
                      .schemaType("incomeEntry")
                      .child(
                        S.documentTypeList("incomeEntry")
                          .title("Income")
                          .defaultOrdering([{ field: "date", direction: "desc" }])
                      ),
                    S.listItem()
                      .title("Paid Emails")
                      .schemaType("emailSession")
                      .child(
                        S.documentTypeList("emailSession")
                          .title("Paid Emails")
                          .defaultOrdering([{ field: "submittedAt", direction: "desc" }])
                      ),
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

            // Singleton: numbers, partners and reviews for the brands and home pages
            S.listItem()
              .title("Brands & Reviews")
              .child(S.document().schemaType("socialProof").documentId("socialProof").title("Brands & Reviews")),

            // Website text: every page's words, in Spanish and English
            S.listItem()
              .title("Website text")
              .child(
                S.list()
                  .title("Website text")
                  .items(
                    copyDocuments.map((doc) =>
                      S.listItem()
                        .title(doc.id === "about" ? "About page (Andrea and page text)" : doc.title)
                        .id(doc.id)
                        .child(S.document().schemaType(doc.id).documentId(doc.id).title(doc.title))
                    )
                  )
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
      // The Studio lives inside the site, so previews use whatever domain it's opened on
      previewUrl: {
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
    }),
    visionTool(),
    media(),
  ],
  schema: {
    types: schemaTypes,
    // Singletons exist once; income is only created from the dashboard (under a private id)
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType) && schemaType !== "incomeEntry"),
  },
  document: {
    actions: (actions, { schemaType }) =>
      singletonTypes.has(schemaType)
        ? actions.filter(({ action }) => action !== "duplicate" && action !== "delete")
        : actions,
  },
});
