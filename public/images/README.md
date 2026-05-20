# 画像ファイルの配置場所

このフォルダに画像ファイルを配置してください。

## 使用方法

### HTML/JSX内で使用する場合

```astro
<!-- 画像を表示 -->
<img src="/images/your-image.jpg" alt="説明" />

<!-- 背景画像として使用 -->
<div style="background-image: url('/images/your-image.jpg')"></div>
```

### ファイル名の推奨

- 小文字とハイフンを使用: `hero-image.jpg`
- 用途別にフォルダ分け: `hero/`, `services/`, `story/` など

## ファイルサイズの目安

- **WebP形式を推奨**: ファイルサイズが小さく、画質も良い
- **JPEG**: 写真向け
- **PNG**: ロゴや透明背景が必要な場合
- **SVG**: アイコンやシンプルな図形

## 最適化

大きな画像は事前に最適化することを推奨します：

- [Squoosh](https://squoosh.app/) - オンライン画像最適化ツール
- [ImageOptim](https://imageoptim.com/) - Mac用アプリ
