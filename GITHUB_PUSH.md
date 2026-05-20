# GitHubへのPush手順

## 方法1: ターミナルで認証情報を入力

以下のコマンドを実行してください：

```bash
cd /Users/kim/Documents/nouvation-corporate
git push -u origin main
```

認証情報を求められたら：

- Username: あなたのGitHubユーザー名（segu8267）
- Password: GitHub Personal Access Token（パスワードではありません）

## 方法2: Personal Access Tokenを作成（推奨）

1. GitHubにログイン
2. Settings → Developer settings → Personal access tokens → Tokens (classic)
3. "Generate new token (classic)" をクリック
4. 以下の権限を選択：
   - `repo` (Full control of private repositories)
5. トークンを生成してコピー
6. push時にPasswordの代わりにこのトークンを入力

## 方法3: SSH鍵を使用（セキュア）

```bash
# SSH鍵を設定（既に設定済みの場合は不要）
ssh-keygen -t ed25519 -C "your_email@example.com"

# GitHubにSSH鍵を追加
# 1. ~/.ssh/id_ed25519.pub の内容をコピー
# 2. GitHub → Settings → SSH and GPG keys → New SSH key

# リモートURLをSSHに変更
git remote set-url origin git@github.com:segu8267/nouvation-corporate.git

# push
git push -u origin main
```
