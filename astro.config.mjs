import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://nouvation.ai",
  integrations: [
    tailwind(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  // Server output: 既存ページは prerender = true で SSG 維持、
  // /api/contact のみサーバーサイド実行されるハイブリッド構成
  output: "server",
  adapter: vercel(),
});
