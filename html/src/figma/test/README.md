# HTML-to-Figma テスト

このディレクトリには、HTMLをFigmaデザインに変換するためのテストコードが含まれています。

## 前提条件

以下のパッケージが必要です：

```bash
npm install @builder.io/html-to-figma jsdom node-fetch
```

これらのパッケージは既にプロジェクトの依存関係として追加されています。

## テストファイル

### 1. html-to-figma-test.js

シンプルなHTMLをFigmaノードに変換するための基本的なテストです。

実行方法：

```bash
node src/figma/test/html-to-figma-test.js
```

### 2. website-to-figma.js

実際のWebサイトのHTMLを取得してFigmaノードに変換し、結果をJSONファイルに保存するテストです。

実行方法：

```bash
node src/figma/test/website-to-figma.js
```

デフォルトでは、`https://example.com` のHTMLを変換します。別のURLを使用する場合は、ファイル内の
`convertWebsiteToFigma('https://example.com')` の部分を変更してください。

### 3. enhanced-html-to-figma-test.js

拡張機能（CSS filters、text shadows、background positioning、flex direction reverse）をテストするためのファイルです。

実行方法：

```bash
node src/figma/test/enhanced-html-to-figma-test.js
```

### 4. css-animation-test.html と animation-to-figma-test.js

複雑なCSSアニメーションを含むHTMLファイルと、それをFigmaに変換するテストファイルです。EC-01テストケースの実装として、HTML-to-Figmaの制限（アニメーションが静的な状態で変換される）を示します。

実行方法：

```bash
node src/figma/test/animation-to-figma-test.js
```

ブラウザでアニメーションを確認するには：

```bash
# HTMLファイルをブラウザで直接開く
start src/figma/test/css-animation-test.html  # Windows
open src/figma/test/css-animation-test.html   # macOS
```

## 注意事項

1. これらのテストはNode.js環境で実行されますが、HTML-to-Figmaライブラリは本来ブラウザ環境（Figmaプラグイン内）での実行が推奨されています。
2. 一部のCSSプロパティや複雑なレイアウトは正確に変換されない場合があります。
3. 大規模なHTMLやCSSを持つWebサイトの変換には時間がかかる場合があります。
4. 実際のFigmaプラグインとして使用する場合は、Figma Plugin APIとの統合が必要です。
5. CSSアニメーションはFigmaでサポートされていないため、静的な状態のみが変換されます。

## 参考リソース

- [@builder.io/html-to-figma - npm](https://www.npmjs.com/package/@builder.io/html-to-figma)
- [olliethedev/html-to-figma - GitHub](https://github.com/olliethedev/html-to-figma)
