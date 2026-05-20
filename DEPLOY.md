# Vercelデプロイ手順

## 方法1: GitHub経由（推奨）

### 1. GitHubにpush

```bash
# GitHubの認証情報を入力してpush
git push -u origin main
```

または、GitHub CLIを使用している場合：

```bash
gh auth login
git push -u origin main
```

### 2. Vercelでプロジェクトをインポート

1. [Vercel](https://vercel.com)にアクセスしてログイン
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリ `segu8267/nouvation-corporate` を選択
4. プロジェクト設定：
   - **Framework Preset**: Astro
   - **Root Directory**: `./` (デフォルト)
   - **Build Command**: `npm run build` (自動検出される)
   - **Output Directory**: `dist` (自動検出される)
5. 「Environment Variables」セクションで以下を追加：
   - `MICROCMS_SERVICE_DOMAIN`: あなたのMicroCMSサービスドメイン
   - `MICROCMS_API_KEY`: あなたのMicroCMS APIキー
6. 「Deploy」をクリック

### 3. デプロイ完了後

デプロイが完了すると、自動的にURLが生成されます：

- 本番URL: `https://nouvation-corporate.vercel.app`
- カスタムドメインも設定可能

---

## 方法2: Vercel CLI経由

### 1. Vercel CLIをインストール

```bash
npm i -g vercel
```

### 2. ログイン

```bash
vercel login
```

### 3. デプロイ

```bash
# プレビューデプロイ
vercel

# 本番デプロイ
vercel --prod
```

### 4. 環境変数の設定

Vercelダッシュボードで環境変数を設定するか、CLIで設定：

```bash
vercel env add MICROCMS_SERVICE_DOMAIN
vercel env add MICROCMS_API_KEY
```

---

## 注意事項

- `.env`ファイルはGitに含まれていません（`.gitignore`に含まれています）
- 環境変数はVercelダッシュボードで設定してください
- デプロイ後、環境変数を変更した場合は再デプロイが必要です
