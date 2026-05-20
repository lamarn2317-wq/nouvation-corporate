# Vercelデプロイ手順（GitHub経由）

## ステップ1: GitHubにpush

ターミナルで以下を実行：

```bash
cd /Users/kim/Documents/nouvation-corporate
git push -u origin main
```

認証が必要な場合：
- **Username**: `segu8267`
- **Password**: GitHub Personal Access Token（パスワードではありません）

### Personal Access Tokenの作成方法

1. [GitHub Settings](https://github.com/settings/tokens) にアクセス
2. 「Developer settings」→「Personal access tokens」→「Tokens (classic)」
3. 「Generate new token (classic)」をクリック
4. 権限を選択：
   - ✅ `repo` (Full control of private repositories)
5. 「Generate token」をクリック
6. トークンをコピー（一度しか表示されません）
7. push時にPasswordの代わりにこのトークンを入力

---

## ステップ2: Vercelでプロジェクトをインポート

### 1. Vercelにアクセス

1. [Vercel](https://vercel.com) にアクセス
2. 「Sign Up」または「Log In」
3. GitHubアカウントでログイン（推奨）

### 2. プロジェクトをインポート

1. ダッシュボードで「Add New...」→「Project」をクリック
2. 「Import Git Repository」セクションで
   - `segu8267/nouvation-corporate` を検索・選択
   - または、リポジトリURLを直接入力

### 3. プロジェクト設定

Vercelが自動検出しますが、確認してください：

- **Framework Preset**: `Astro` ✅
- **Root Directory**: `./` ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `dist` ✅
- **Install Command**: `npm install` ✅

### 4. 環境変数を設定

「Environment Variables」セクションで以下を追加：

| Name | Value |
|------|-------|
| `MICROCMS_SERVICE_DOMAIN` | あなたのMicroCMSサービスドメイン |
| `MICROCMS_API_KEY` | あなたのMicroCMS APIキー |

**注意**: 環境変数は後からでも追加・変更できます

### 5. デプロイ開始

1. 「Deploy」ボタンをクリック
2. ビルドが開始されます（1-2分程度）
3. デプロイが完了すると、URLが表示されます

---

## ステップ3: デプロイ完了後

### デプロイURL

デプロイが完了すると、以下のようなURLが生成されます：
- **本番URL**: `https://nouvation-corporate.vercel.app`
- **プレビューURL**: `https://nouvation-corporate-xxxxx.vercel.app` (各ブランチ/PRごと)

### 自動デプロイ

以降、GitHubにpushするたびに自動的にデプロイされます：
- `main`ブランチへのpush → 本番環境にデプロイ
- 他のブランチへのpush → プレビュー環境にデプロイ
- Pull Request作成 → プレビュー環境にデプロイ

### カスタムドメインの設定（オプション）

1. Vercelダッシュボードでプロジェクトを選択
2. 「Settings」→「Domains」
3. カスタムドメインを追加（例: `nouvation.com`）

---

## トラブルシューティング

### ビルドエラーが発生した場合

1. Vercelダッシュボードの「Deployments」タブでエラーログを確認
2. ローカルで `npm run build` を実行してエラーを確認
3. 環境変数が正しく設定されているか確認

### 環境変数を追加/変更した場合

1. Vercelダッシュボードで「Settings」→「Environment Variables」
2. 変数を追加/編集
3. 「Redeploy」をクリックして再デプロイ

### サイトが表示されない場合

1. ビルドログを確認
2. 環境変数が正しく設定されているか確認
3. `npm run build` がローカルで成功するか確認

---

## 次のステップ

- ✅ サイトが正常に表示されるか確認
- ✅ 各ページが正しく動作するか確認
- ✅ レスポンシブデザインを確認
- ✅ MicroCMS連携が動作するか確認（環境変数設定後）

