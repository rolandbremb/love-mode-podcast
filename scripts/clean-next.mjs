import path from "node:path";
import { promises as fs } from "node:fs";

const nextDistDir = path.join(process.cwd(), ".next");

await fs.rm(nextDistDir, {
  recursive: true,
  force: true,
  maxRetries: 5,
  retryDelay: 200,
});
