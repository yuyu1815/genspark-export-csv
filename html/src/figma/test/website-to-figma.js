// website-to-figma.js
const {htmlToFigma} = require('../../../html-to-figma/src/browser/html-to-figma');
const fetch = require('node-fetch');
const fs = require('fs');

async function convertWebsiteToFigma(url) {
    try {
        // ウェブサイトのHTMLを取得
        const response = await fetch(url);
        const html = await response.text();

        console.log(`${url}からHTMLを取得しました`);

        // HTMLをFigmaノードに変換
        const figmaNodes = await htmlToFigma({
            html,
            convertSvg: true,
            getImageDataUrl: async (imageUrl) => {
                // 相対URLを絶対URLに変換
                const absoluteUrl = new URL(imageUrl, url).href;
                return absoluteUrl;
            },
        });

        // 結果をJSONファイルに保存
        fs.writeFileSync('figma-output.json', JSON.stringify(figmaNodes, null, 2));

        console.log('Figma変換が完了しました。結果は figma-output.json に保存されました。');
        return figmaNodes;
    } catch (error) {
        console.error('エラーが発生しました:', error);
    }
}

// 変換したいウェブサイトのURLを指定
convertWebsiteToFigma('https://example.com');
