"use client";

import { Studio } from "sanity";
import config from "../../../../sanity.config";

export default function StudioClient() {
  return <Studio config={config} />;
}
