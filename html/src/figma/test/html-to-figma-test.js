// html-to-figma-test.js
const {htmlToFigma} = require('../../../html-to-figma/src/browser/html-to-figma');

// テスト用のシンプルなHTML
const html = `
<div style="display: flex; flex-direction: column; padding: 20px; background-color: #f5f5f5;">
  <h1 style="color: #333; font-size: 24px; margin-bottom: 10px;">Hello Figma!</h1>
  <p style="color: #666; font-size: 16px; line-height: 1.5;">
    これはHTML-to-Figmaのテストです。このHTMLはFigmaデザインに変換されます。
  </p>
  <button style="background-color: #0066ff; color: white; border: none; padding: 10px 20px; 
    margin-top: 20px; border-radius: 4px; cursor: pointer;">
    クリックしてください
  </button>
</div>
`;

async function testHtmlToFigma() {
    try {
        // HTMLをFigmaノードに変換
        const figmaNodes = await htmlToFigma({
            html,
            convertSvg: true, // SVGを含む場合に変換
            getImageDataUrl: async (url) => url, // 画像URLの処理（必要に応じてカスタマイズ）
        });

        // 結果をコンソールに出力
        console.log('Figmaノードに変換されました:');
        console.log(JSON.stringify(figmaNodes, null, 2));

        return figmaNodes;
    } catch (error) {
        console.error('エラーが発生しました:', error);
    }
}

testHtmlToFigma();
