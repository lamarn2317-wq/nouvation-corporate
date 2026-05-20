// MicroCMS Client
import { createClient } from "microcms-js-sdk";

const serviceDomain = import.meta.env.MICROCMS_SERVICE_DOMAIN || "";
const apiKey = import.meta.env.MICROCMS_API_KEY || "";

// MicroCMSクライアントの作成（環境変数がない場合はnullを返す）
export const client =
  serviceDomain && apiKey
    ? createClient({
        serviceDomain,
        apiKey,
      })
    : null;

// ニュース記事の型定義
export interface NewsItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  date: string;
  category: string;
  title: string;
  content?: string;
  link?: string;
}

// ニュース一覧を取得
export async function getNewsList(limit = 10): Promise<NewsItem[]> {
  if (!client) {
    // フォールバック: ダミーデータを返す
    return [
      {
        id: "1",
        createdAt: "2025-12-20T00:00:00.000Z",
        updatedAt: "2025-12-20T00:00:00.000Z",
        publishedAt: "2025-12-20T00:00:00.000Z",
        revisedAt: "2025-12-20T00:00:00.000Z",
        date: "2025.12.20",
        category: "プレスリリース",
        title:
          "農業情報インフラ「NOUVATION」公式サイトをリニューアルオープンしました",
      },
      {
        id: "2",
        createdAt: "2025-11-15T00:00:00.000Z",
        updatedAt: "2025-11-15T00:00:00.000Z",
        publishedAt: "2025-11-15T00:00:00.000Z",
        revisedAt: "2025-11-15T00:00:00.000Z",
        date: "2025.11.15",
        category: "メディア掲載",
        title: "日本農業新聞にて、当社のAI相談サービスが紹介されました",
      },
    ];
  }

  try {
    const data = await client.get({
      endpoint: "news",
      queries: {
        limit,
        orders: "-publishedAt",
      },
    });

    // MicroCMSのレスポンスをNewsItem型に変換
    return data.contents.map((item: any) => ({
      id: item.id,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      publishedAt: item.publishedAt,
      revisedAt: item.revisedAt,
      date:
        item.date ||
        new Date(item.publishedAt)
          .toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          .replace(/\//g, "."),
      category: item.category || "お知らせ",
      title: item.title,
      content: item.content,
      link: item.link,
    }));
  } catch (error) {
    console.error("Failed to fetch news from MicroCMS:", error);
    // エラー時もダミーデータを返す
    return [
      {
        id: "1",
        createdAt: "2025-12-20T00:00:00.000Z",
        updatedAt: "2025-12-20T00:00:00.000Z",
        publishedAt: "2025-12-20T00:00:00.000Z",
        revisedAt: "2025-12-20T00:00:00.000Z",
        date: "2025.12.20",
        category: "プレスリリース",
        title:
          "農業情報インフラ「NOUVATION」公式サイトをリニューアルオープンしました",
      },
    ];
  }
}
