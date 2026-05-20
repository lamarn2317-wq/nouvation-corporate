# Git Hooks

このディレクトリは **二度と起こさないための安全装置** です。

## 含まれるフック

### pre-commit
コミット直前に以下を検査します：

1. **大量削除検査**：ステージング中の削除ファイルが 10 件超なら中断
2. **重要ファイル削除検査**：package.json、Layout.astro、Voice.astro 等のコアファイルが削除予定なら中断

## 有効化方法

このリポジトリでは `core.hooksPath = .githooks` に設定されているため、
clone 直後から自動的に有効になります。

もし無効化されている場合は以下を実行：

```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

## 緊急時の迂回（非推奨）

意図的に大量削除や重要ファイル削除を行いたい場合：

```bash
git commit --no-verify
```

ただし、これを使う前に「本当に削除して良いか」を必ず確認してください。
