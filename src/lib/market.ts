export interface MarketPriceData {
  date: string;
  item: string;
  market: string;
  price: number;
  unit: string;
}

/**
 * 1行のCSV文字列をセル配列にパースする
 * - ダブルクオートで囲まれたセル対応
 * - クオート内のカンマは区切り扱いしない
 * - クオート内のエスケープされたクオート（""）は1個のクオートに変換
 */
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      cells.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells;
}

/**
 * GAS から返ってくる「ワイド形式」のシートデータを
 * Long形式（行＝1観測値）に変換する。
 *
 * 入力構造の例：
 *   "日付","Thu Oct 02 2025 ...","Fri Oct 03 2025 ...", ...
 *   "大田市場","","","",...        ← 市場ヘッダー行（値は空）
 *   "キャベツ","97","97","","97.2",... ← 品目行（市場ヘッダー以降の品目はその市場に属する）
 *   "レタス", ...
 *   "札幌市場","","","",...        ← 次の市場ヘッダー
 *   "キャベツ","85","82",...
 */
function parseWideSheet(text: string): MarketPriceData[] {
  const result: MarketPriceData[] = [];
  const lines = text.split(/\r?\n/);

  // ヘッダー（日付）行を探す
  let headerIdx = -1;
  let headerCells: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    if (cells[0] === "日付" || cells[0] === "date") {
      headerIdx = i;
      headerCells = cells;
      break;
    }
  }
  if (headerIdx === -1) return [];

  // 各列の日付を ISO 形式 (YYYY-MM-DD) に変換
  const dates: (string | null)[] = headerCells.slice(1).map((raw) => {
    if (!raw) return null;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });

  // 既知の市場名（補助辞書。新しい市場名が登場しても下記の "市場" サフィックスで吸収する）
  const knownMarkets = new Set([
    "札幌市場",
    "仙台市場",
    "大田市場",
    "名古屋市場",
    "大阪市場",
    "広島市場",
    "福岡市場",
  ]);

  let currentMarket = "";

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const first = cells[0]?.trim();
    if (!first) continue;

    // 市場ヘッダー判定：
    // ① 1列目が "市場" で終わる（厳密判定）
    // ② または既知の市場名に完全一致
    //
    // 旧ロジックの「2列目以降が全て空なら市場」は false positive を起こすため廃止。
    // （データ更新が滞った品目が誤って市場扱いされ、配下の品目が壊れる事故が発生したため）
    if (first.endsWith("市場") || knownMarkets.has(first)) {
      currentMarket = first;
      continue;
    }

    // 品目行：各列の値を読んで {date, item, market, price} を生成
    if (!currentMarket) continue;
    const dataCells = cells.slice(1);
    const itemName = first;
    for (let j = 0; j < dataCells.length && j < dates.length; j++) {
      const date = dates[j];
      if (!date) continue;
      const raw = dataCells[j].trim();
      if (!raw) continue;
      const price = Number(raw);
      if (!Number.isFinite(price) || price <= 0) continue;

      result.push({
        date,
        item: itemName,
        market: currentMarket,
        price,
        unit: "円/kg",
      });
    }
  }

  return result;
}

export async function getMarketPrices(): Promise<MarketPriceData[]> {
  // 第1優先：AWS S3 配信のCSV（DynamoDB バックエンド由来・毎日更新）
  // 第2フォールバック：旧 GAS（停止していなければ）
  const PRIMARY_URL =
    "https://nouvation-market-preview.s3.ap-northeast-1.amazonaws.com/history.csv";
  const FALLBACK_URL =
    "https://script.google.com/macros/s/AKfycbyd_Or_Nxo2ZhqNk6GOo2btZ-uymgpJTU7kgE8bPWarWVTJ8bDX6QZW3YSD7Bij4Jvs/exec";

  async function fetchAndParse(url: string): Promise<MarketPriceData[]> {
    const response = await fetch(url, { redirect: "follow" });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);

    const text = await response.text();
    const trimmed = text.trim();

    // JSON 応答（API Gateway 直叩き等）の場合はそのまま処理
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      const data = JSON.parse(text);
      const rows = Array.isArray(data)
        ? data
        : data.rows || data.data || data.contents || data.records || [];
      return rows
        .map((d: any) => ({
          date: d.date || d.日付 || "",
          item: d.item || d.品目 || "",
          market: d.market || d.市場 || "",
          price: Number(d.price || d.価格 || 0),
          unit: d.unit || d.単位 || "円/kg",
        }))
        .filter((d: MarketPriceData) => d.date && d.item && d.price > 0);
    }

    // ワイド CSV 形式
    return parseWideSheet(text);
  }

  // まず S3 を試す
  try {
    const primary = await fetchAndParse(PRIMARY_URL);
    if (primary.length > 0) return primary;
    throw new Error("Primary source returned 0 records");
  } catch (primaryErr) {
    console.warn("[market] Primary source failed:", primaryErr);

    // フォールバックを試す
    try {
      return await fetchAndParse(FALLBACK_URL);
    } catch (fallbackErr) {
      console.error("[market] All sources failed:", fallbackErr);
      return [];
    }
  }
}
