// enhanced-html-to-figma-test.js
const {htmlToFigma} = require('../../../html-to-figma/src/browser/html-to-figma');
const fs = require('fs');

// テスト用の拡張HTML - 新機能をテストするための要素を含む
const html = `
<div style="display: flex; flex-direction: column; padding: 20px; background-color: #f5f5f5;">
  <!-- 基本的なテキスト要素 -->
  <h1 style="color: #333; font-size: 24px; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
    テキストシャドウのテスト
  </h1>

  <!-- CSSフィルターのテスト -->
  <div style="filter: blur(2px) brightness(1.2) drop-shadow(3px 3px 5px #888); 
              background-color: #0066ff; color: white; padding: 15px; margin: 10px 0;">
    CSSフィルターのテスト（ぼかし、明るさ、ドロップシャドウ）
  </div>

  <!-- 背景画像の位置とサイズのテスト -->
  <div style="width: 300px; height: 200px; 
              background-image: url('https://picsum.photos/600/400'); 
              background-size: cover; 
              background-position: center center;
              margin: 10px 0;">
    背景画像の位置とサイズのテスト
  </div>

  <!-- Flexレイアウトの方向反転テスト -->
  <div style="display: flex; flex-direction: row-reverse; margin: 10px 0; background-color: #eee; padding: 10px;">
    <div style="background-color: #ff6b6b; padding: 10px; margin: 5px;">アイテム1</div>
    <div style="background-color: #48dbfb; padding: 10px; margin: 5px;">アイテム2</div>
    <div style="background-color: #1dd1a1; padding: 10px; margin: 5px;">アイテム3</div>
  </div>

  <!-- 列方向の反転テスト -->
  <div style="display: flex; flex-direction: column-reverse; margin: 10px 0; background-color: #eee; padding: 10px;">
    <div style="background-color: #ff6b6b; padding: 10px; margin: 5px;">アイテム1</div>
    <div style="background-color: #48dbfb; padding: 10px; margin: 5px;">アイテム2</div>
    <div style="background-color: #1dd1a1; padding: 10px; margin: 5px;">アイテム3</div>
  </div>
</div>
`;

async function testEnhancedHtmlToFigma() {
    try {
        console.log('拡張HTML-to-Figmaテストを開始します...');

        // HTMLをFigmaノードに変換（自動レイアウトを有効化）
        const figmaNodes = await htmlToFigma({
            html,
            convertSvg: true,
            useAutoLayout: true,
            getImageDataUrl: async (url) => url,
        });

        // 結果をJSONファイルに保存
        fs.writeFileSync('enhanced-figma-output.json', JSON.stringify(figmaNodes, null, 2));

        console.log('拡張テスト完了。結果は enhanced-figma-output.json に保存されました。');

        // 特定の機能が正しく変換されたかチェック
        validateConversion(figmaNodes);

        return figmaNodes;
    } catch (error) {
        console.error('エラーが発生しました:', error);
    }
}

function validateConversion(figmaNodes) {
    console.log('変換結果の検証:');

    // テキストシャドウの検証
    const hasTextShadow = findNodeWithProperty(figmaNodes, 'effects',
        effects => effects && effects.some(e => e.type === 'DROP_SHADOW'));
    console.log('- テキストシャドウ: ' + (hasTextShadow ? '✓ 変換成功' : '✗ 変換失敗'));

    // CSSフィルターの検証
    const hasFilter = findNodeWithProperty(figmaNodes, 'effects',
        effects => effects && effects.some(e => e.type === 'LAYER_BLUR' || e.type === 'DROP_SHADOW'));
    console.log('- CSSフィルター: ' + (hasFilter ? '✓ 変換成功' : '✗ 変換失敗'));

    // 背景画像の検証
    const hasBackgroundImage = findNodeWithProperty(figmaNodes, 'fills',
        fills => fills && fills.some(f => f.type === 'IMAGE' && f.scaleMode === 'FILL'));
    console.log('- 背景画像: ' + (hasBackgroundImage ? '✓ 変換成功' : '✗ 変換失敗'));

    // Flexレイアウトの検証
    const hasFlexLayout = findNodeWithProperty(figmaNodes, 'layoutMode',
        mode => mode === 'HORIZONTAL' || mode === 'VERTICAL');
    console.log('- Flexレイアウト: ' + (hasFlexLayout ? '✓ 変換成功' : '✗ 変換失敗'));

    // 行方向反転の検証
    const hasRowReverse = findNodeWithProperty(figmaNodes, 'primaryAxisAlignItems',
        align => align === 'MAX');
    console.log('- 行方向反転: ' + (hasRowReverse ? '✓ 変換成功' : '✗ 変換失敗'));
}

// 指定したプロパティと条件を持つノードを再帰的に検索
function findNodeWithProperty(node, propName, condition) {
    if (!node) return false;

    // 現在のノードがプロパティを持ち、条件を満たす場合
    if (node[propName] && condition(node[propName])) {
        return true;
    }

    // 子ノードを検索
    if (node.children && node.children.length > 0) {
        for (const child of node.children) {
            if (findNodeWithProperty(child, propName, condition)) {
                return true;
            }
        }
    }

    return false;
}

// テスト実行
testEnhancedHtmlToFigma();
