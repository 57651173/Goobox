# Goobox コンテナ積載シミュレーションシステム

Vue 3とThree.jsを使用して構築された3Dコンテナ積載シミュレーションシステムで、ユーザーがコンテナスペースの利用率と貨物積載計画を最適化するのを支援します。

[English](./README.md) | [中文](./README.zh-CN.md) | [Deutsch](./README.de.md)

## 特徴

- **高度に視覚化された3D積載シミュレーション**: コンテナ内の貨物配置とスペース利用状況をリアルタイムで表示
- **複数のコンテナタイプをサポート**: 標準ドライコンテナ(20GP/40GP/40HC)と冷蔵コンテナ(20RF/40RF/40RQHC)を含む
- **リアルタイム積載統計**: 積載効率を最適化するための容積と重量の利用率を表示
- **インテリジェント積載アルゴリズム**: スペースの利用率を最大化するために貨物配置を自動計算および最適化
- **多言語サポート**: 中国語、英語、日本語、ドイツ語、スペイン語のインターフェースを内蔵
- **積載計画のエクスポート**: 詳細な積載計画とレポートのエクスポートをサポート
- **検索エンジン最適化 (SEO)**: 検索エンジンでのウェブサイトの可視性向上
- **ユーザー認証システム**: ユーザー登録とログイン機能をサポート

## 技術スタック

- **フロントエンドフレームワーク**: Vue 3
- **ビルドツール**: Vite
- **UIコンポーネントライブラリ**: Ant Design Vue 4.x
- **3Dレンダリング**: Three.js
- **国際化**: Vue I18n
- **ルーター**: Vue Router

## システム要件

- Node.js >= 14.0.0
- Yarn >= 1.22.0 (推奨) または npm >= 6.0.0

## クイックスタート

### プロジェクトセットアップ

```sh
# プロジェクトをクローン
git clone https://github.com/57651173/Goobox.git

# 依存関係をインストール
yarn

# 開発サーバーを起動
yarn dev
```

### 本番ビルド

```sh
yarn build
```

ビルド後、生成された静的ファイルは `dist` ディレクトリに格納されます。

## 国際化 (i18n)

このプロジェクトは以下の設定で多言語サポートを統合しています：

1. 言語ファイルは `src/locales/` ディレクトリにあります：
   - `zh.json` - 中国語翻訳
   - `en.json` - 英語翻訳
   - `ja.json` - 日本語翻訳
   - `de.json` - ドイツ語翻訳
   - `es.json` - スペイン語翻訳

2. i18n設定（`src/main.js`に既に設定済み）：
```js
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'
import de from './locales/de.json'
import es from './locales/es.json'
import ja from './locales/ja.json'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,  // 保存された言語設定またはブラウザ言語をデフォルトとして使用
  fallbackLocale: 'en',
  messages: { en, zh, de, es, ja }
})

app.use(i18n)
```

3. アプリケーションの右上に言語セレクターがあり、ユーザーは簡単に言語を切り替えることができます。

## プロジェクト構造

```
├── public/            # 静的リソースディレクトリ
├── src/               # ソースコード
│   ├── assets/        # 静的アセットファイル
│   ├── components/    # 共通コンポーネント
│   │   ├── container/ # コンテナ関連コンポーネント
│   │   ├── home/      # ホームページ関連コンポーネント
│   │   └── icons/     # アイコンコンポーネント
│   ├── config/        # グローバル設定
│   ├── locales/       # 国際化言語ファイル
│   ├── router/        # ルーター設定
│   ├── views/         # ページビュー
│   ├── App.vue        # メインアプリケーションコンポーネント
│   └── main.js        # アプリケーションエントリーポイント
├── index.html         # HTMLテンプレート
├── vite.config.js     # Vite設定
├── .eslintrc.js       # ESLint設定
├── package.json       # プロジェクト依存関係
└── README.md          # プロジェクトドキュメント
```

## 貢献ガイドライン

私たちはあらゆる形の貢献を歓迎します。以下を含みますが、これらに限定されません：

1. バグを報告したり、新機能を提案するためのIssueの提出
2. コードやドキュメントを改善するためのPull Requestの作成
3. 翻訳の支援や多言語サポートの強化

## ライセンス

[MIT License](LICENSE) 