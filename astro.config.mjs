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
      // noindex ページを sitemap からも除外
      // → 検索エンジンに存在自体を教えない（多層防御）
      // ※ /about（会社概要）は運営者情報として index させる方針のため除外しない。
      //   代表者氏名は本文で画像表示（alt 空）にしており機械可読ではない。
      filter: (page) =>
        !page.includes("/privacy") &&
        !page.includes("/legal") &&
        !page.includes("/404"),
    }),
  ],
  // Server output: 既存ページは prerender = true で SSG 維持、
  // /api/contact のみサーバーサイド実行されるハイブリッド構成
  output: "server",
  adapter: vercel(),
});
