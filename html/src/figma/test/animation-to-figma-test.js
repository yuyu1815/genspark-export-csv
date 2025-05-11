// animation-to-figma-test.js
const {htmlToFigma} = require('../../../html-to-figma/src/browser/html-to-figma');
const fs = require('fs');
const path = require('path');

/**
 * このテストファイルは、複雑なCSSアニメーションを含むHTMLをFigmaノードに変換し、
 * HTML-to-Figmaライブラリの現在の制限を示すためのものです。
 *
 * EC-01テストケース: 複雑なCSSアニメーションを含むHTML
 * 期待結果: アニメーションは静的な状態で変換される
 */

async function testAnimationToFigma() {
    try {
        console.log('CSS アニメーションテストを開始します...');

        // HTMLファイルを読み込む
        const htmlFilePath = path.join(__dirname, 'css-animation-test.html');
        const html = fs.readFileSync(htmlFilePath, 'utf8');

        console.log('CSS アニメーションHTMLを読み込みました');

        // HTMLをFigmaノードに変換
        const figmaNodes = await htmlToFigma({
            html,
            convertSvg: true,
            useAutoLayout: true,
            getImageDataUrl: async (url) => url,
        });

        // 結果をJSONファイルに保存
        fs.writeFileSync('animation-figma-output.json', JSON.stringify(figmaNodes, null, 2));

        console.log('変換完了。結果は animation-figma-output.json に保存されました。');

        // アニメーション関連のプロパティを検証
        validateAnimationConversion(figmaNodes);

        return figmaNodes;
    } catch (error) {
        console.error('エラーが発生しました:', error);
    }
}

/**
 * 変換結果を検証し、アニメーション関連のプロパティがどのように処理されたかを確認します
 */
function validateAnimationConversion(figmaNodes) {
    console.log('\n変換結果の検証:');
    console.log('-------------------');

    // アニメーションプロパティの検索
    const hasAnimationProperty = findNodeWithCSSProperty(figmaNodes, 'animation');
    console.log('- animation プロパティ: ' + (hasAnimationProperty ? '✓ 保持' : '✗ 失われた'));

    // キーフレームの検索
    const hasKeyframes = findNodeWithKeyframes(figmaNodes);
    console.log('- @keyframes 定義: ' + (hasKeyframes ? '✓ 保持' : '✗ 失われた'));

    // トランジションプロパティの検索
    const hasTransition = findNodeWithCSSProperty(figmaNodes, 'transition');
    console.log('- transition プロパティ: ' + (hasTransition ? '✓ 保持' : '✗ 失われた'));

    // 3D変形の検索
    const has3DTransform = findNodeWithCSSProperty(figmaNodes, 'perspective');
    console.log('- 3D変形 (perspective): ' + (has3DTransform ? '✓ 保持' : '✗ 失われた'));

    console.log('\n結論:');
    if (!hasAnimationProperty && !hasKeyframes && !hasTransition && !has3DTransform) {
        console.log('CSS アニメーションは Figma 変換中に失われました。これは予想された制限です。');
        console.log('Figma はアニメーションをサポートしていないため、HTML-to-Figma は静的な状態のみを変換します。');
    } else {
        console.log('一部のアニメーションプロパティが保持されていますが、実際のアニメーション動作は Figma では再現されません。');
    }

    console.log('\nEC-01 テストケース結果: ⚠️ 制限あり (予想通り)');
}

/**
 * 指定したCSSプロパティを持つノードを再帰的に検索
 */
function findNodeWithCSSProperty(node, propertyName) {
    if (!node) return false;

    // スタイルプロパティを確認
    if (node.style && node.style[propertyName]) {
        return true;
    }

    // fills配列内のCSSプロパティを確認
    if (node.fills && Array.isArray(node.fills)) {
        for (const fill of node.fills) {
            if (fill.style && fill.style[propertyName]) {
                return true;
            }
        }
    }

    // 子ノードを検索
    if (node.children && node.children.length > 0) {
        for (const child of node.children) {
            if (findNodeWithCSSProperty(child, propertyName)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * キーフレーム定義を持つノードを検索
 */
function findNodeWithKeyframes(node) {
    // Figmaノードにはキーフレーム定義が保存されないため、常にfalseを返す
    return false;
}

// テスト実行
testAnimationToFigma();
