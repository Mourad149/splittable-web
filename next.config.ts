import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hardcoded absolute path to the web/ dir — pins Turbopack's
  // workspace root so it doesn't try to index the whole splittable
  // monorepo (sibling package-lock.json files in splittable-legal/
  // and the project root were triggering a 10-minute first compile).
  turbopack: {
    root: "/Users/mouradzinbi/Desktop/projects/splittable/web",
  },
};

export default nextConfig;
