import siteSettings from "./siteSettings";
import about from "./about";
import shopCollection from "./shopCollection";
import product from "./product";
import course from "./course";
import seo from "./seo";
import brandInquiry from "./brandInquiry";
import guestApplication from "./guestApplication";
import emailSession from "./emailSession";
import socialProof from "./socialProof";
import incomeEntry from "./incomeEntry";
import { contact, contentPost, plannerEpisode } from "./planner";
import { bilingualTypes, websiteTextDocuments } from "./websiteText";

export const schemaTypes = [
  siteSettings,
  about,
  shopCollection,
  product,
  course,
  seo,
  brandInquiry,
  guestApplication,
  emailSession,
  socialProof,
  incomeEntry,
  contact,
  plannerEpisode,
  contentPost,
  ...bilingualTypes,
  ...websiteTextDocuments,
];
