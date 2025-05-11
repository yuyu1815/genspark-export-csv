# HTML-to-Figma 機能強化の変更点

## 概要

このドキュメントは、HTML-to-Figmaライブラリに対して行った機能強化と最適化の詳細をまとめたものです。これらの変更により、HTMLからFigmaへの変換の精度、機能性、パフォーマンスが向上しました。

## 1. CSS変換の強化

### 1.1 テキストシャドウのサポート

テキスト要素の`text-shadow`プロパティをFigmaのドロップシャドウエフェクトに変換する機能を追加しました。

```javascript
// text-to-figma.ts
// テキストシャドウの解析と変換
if (computedStyles.textShadow && computedStyles.textShadow !== 'none') {
    const effects: Effect[] = textNode.effects || [];
    const textShadows = computedStyles.textShadow.split(',').map(s => s.trim());
    
    for (const shadow of textShadows) {
        // シャドウの各コンポーネント（水平オフセット、垂直オフセット、ぼかし半径、色）を解析
        const parts = shadow.split(' ').filter(p => p.trim() !== '');
        
        if (parts.length >= 3) {
            // 色の位置を判断（最初または最後）
            let hShadow, vShadow, blur, color;
            
            if (parts[0].includes('rgb') || parts[0].includes('#') || parts[0].includes('hsl')) {
                color = parts[0];
                hShadow = parts[1];
                vShadow = parts[2];
                blur = parts.length > 3 ? parts[3] : '0px';
            } else {
                hShadow = parts[0];
                vShadow = parts[1];
                blur = parts.length > 3 ? parts[2] : '0px';
                color = parts[parts.length - 1];
            }
            
            // 値を解析してFigmaのドロップシャドウエフェクトに変換
            const hOffset = parseUnits(hShadow)?.value || 0;
            const vOffset = parseUnits(vShadow)?.value || 0;
            const blurRadius = parseUnits(blur)?.value || 0;
            const shadowColor = getRgb(color);
            
            if (shadowColor) {
                effects.push({
                    type: 'DROP_SHADOW',
                    color: {
                        r: shadowColor.r,
                        g: shadowColor.g,
                        b: shadowColor.b,
                        a: shadowColor.a || 1,
                    },
                    offset: { x: hOffset, y: vOffset },
                    radius: blurRadius,
                    spread: 0, // テキストシャドウにはスプレッドがない
                    visible: true,
                    blendMode: 'NORMAL',
                } as ShadowEffect);
            }
        }
    }
    
    if (effects.length > 0) {
        textNode.effects = effects;
    }
}
```

### 1.2 CSSフィルターのサポート

`filter`プロパティ（blur、brightness、drop-shadowなど）をFigmaの対応するエフェクトに変換する機能を追加しました。

```javascript
// element-to-figma.ts
// CSSフィルターの処理
if (computedStyle.filter && computedStyle.filter !== 'none') {
    const effects = rectNode.effects || [];
    const filterString = computedStyle.filter;
    const filterRegex = /(\w+)\(([^)]+)\)/g;
    let match;
    
    while ((match = filterRegex.exec(filterString)) !== null) {
        const [, filterName, filterValue] = match;
        
        switch (filterName) {
            case 'blur':
                // ぼかし半径を抽出して変換
                const blurRadius = parseFloat(filterValue.replace('px', ''));
                if (!isNaN(blurRadius)) {
                    effects.push({
                        type: 'LAYER_BLUR',
                        radius: blurRadius,
                        visible: true,
                    } as LayerBlurEffect);
                }
                break;
                
            case 'brightness':
                // 明るさを不透明度で近似
                const brightness = parseFloat(filterValue);
                if (!isNaN(brightness)) {
                    rectNode.opacity = (rectNode.opacity || 1) * Math.min(brightness, 1);
                }
                break;
                
            case 'drop-shadow':
                // ドロップシャドウの値を解析して変換
                const shadowValues = filterValue.split(' ').map(v => v.trim());
                if (shadowValues.length >= 3) {
                    const color = getRgb(shadowValues[0]);
                    const offsetX = parseFloat(shadowValues[1].replace('px', ''));
                    const offsetY = parseFloat(shadowValues[2].replace('px', ''));
                    const shadowBlurRadius = shadowValues.length > 3 ? 
                        parseFloat(shadowValues[3].replace('px', '')) : 0;
                    
                    if (color && !isNaN(offsetX) && !isNaN(offsetY)) {
                        effects.push({
                            type: 'DROP_SHADOW',
                            color: {
                                r: color.r,
                                g: color.g,
                                b: color.b,
                                a: color.a || 1,
                            },
                            offset: { x: offsetX, y: offsetY },
                            radius: shadowBlurRadius,
                            spread: 0,
                            visible: true,
                            blendMode: 'NORMAL',
                        } as ShadowEffect);
                    }
                }
                break;
                
            // その他のフィルター（contrast、grayscale、hue-rotate、invert、saturate、sepia）
            // これらはFigmaで直接対応するものがないため、警告を表示
            default:
                console.warn(`CSS filter '${filterName}' is not fully supported in Figma conversion`);
                break;
        }
    }
    
    if (effects.length > 0) {
        rectNode.effects = effects;
    }
}
```

### 1.3 背景画像の位置とサイズの強化

背景画像の位置（`background-position`）とサイズ（`background-size`）の詳細なサポートを追加しました。

```javascript
// element-to-figma.ts
// 背景画像の処理
if (url) {
    // 背景サイズの処理
    let scaleMode: 'FILL' | 'FIT' | 'TILE' | 'STRETCH' = 'FILL';
    
    if (computedStyle.backgroundSize) {
        if (computedStyle.backgroundSize === 'contain') {
            scaleMode = 'FIT';
        } else if (computedStyle.backgroundSize === 'cover') {
            scaleMode = 'FILL';
        } else if (computedStyle.backgroundSize === 'repeat') {
            scaleMode = 'TILE';
        } else if (computedStyle.backgroundSize.includes('100%')) {
            scaleMode = 'STRETCH';
        }
    }
    
    // 画像フィルの作成
    const imageFill: ImagePaint = {
        url: prepareUrl(url),
        type: 'IMAGE',
        scaleMode,
        imageHash: '',
    };
    
    // 背景位置の処理
    if (computedStyle.backgroundPosition && scaleMode !== 'TILE') {
        const position = computedStyle.backgroundPosition.split(' ');
        
        if (position.length >= 2) {
            const xPos = position[0];
            const yPos = position[1];
            
            // デフォルトのスケーリング（スケーリングなし）
            const scaleX = 1;
            const scaleY = 1;
            
            // 位置キーワードに基づく変換の計算
            let translateX = 0;
            let translateY = 0;
            
            // X位置の処理
            if (xPos === 'left') translateX = 0;
            else if (xPos === 'center') translateX = 0.5;
            else if (xPos === 'right') translateX = 1;
            else if (xPos.includes('%')) {
                translateX = parseFloat(xPos) / 100;
            }
            
            // Y位置の処理
            if (yPos === 'top') translateY = 0;
            else if (yPos === 'center') translateY = 0.5;
            else if (yPos === 'bottom') translateY = 1;
            else if (yPos.includes('%')) {
                translateY = parseFloat(yPos) / 100;
            }
            
            // imageTransformマトリックスの設定
            // 形式: [[scaleX, 0, translateX], [0, scaleY, translateY]]
            imageFill.imageTransform = [
                [scaleX, 0, translateX],
                [0, scaleY, translateY]
            ];
        }
    }
    
    fills.push(imageFill);
}
```

## 2. レイアウト変換の改善

### 2.1 Flexレイアウトの方向反転サポート

`flex-direction: row-reverse`と`flex-direction: column-reverse`の正確な変換を実装しました。

```javascript
// addAutoLayoutProps.ts
function setLayoutMode(flexProps: FlexPropsType, display: string, flexDirection: string): void {
    if (display === 'flex') {
        // row、row-reverse、column、column-reverseの処理
        if (flexDirection.startsWith('row')) {
            flexProps.layoutMode = 'HORIZONTAL';
            // row-reverseの場合、primaryAxisAlignItemsがMINならMAXに設定
            if (flexDirection === 'row-reverse' && flexProps.primaryAxisAlignItems === 'MIN') {
                flexProps.primaryAxisAlignItems = 'MAX';
            }
        } else {
            flexProps.layoutMode = 'VERTICAL';
            // column-reverseの場合、primaryAxisAlignItemsがMINならMAXに設定
            if (flexDirection === 'column-reverse' && flexProps.primaryAxisAlignItems === 'MIN') {
                flexProps.primaryAxisAlignItems = 'MAX';
            }
        }
    } else {
        flexProps.layoutMode = 'VERTICAL';
    }
}
```

## 3. パフォーマンスの最適化

### 3.1 スタイル計算のキャッシュ

計算済みスタイルをキャッシュして重複計算を削減する機能を追加しました。

```javascript
// utils.ts
// スタイルキャッシュの実装
export const styleCache = new Map<Element, CSSStyleDeclaration>();
export const pseudoStyleCache = new Map<string, CSSStyleDeclaration>();

/**
 * 要素の計算済みスタイルを取得し、可能な場合はキャッシュを使用
 * @param element スタイルを取得する要素
 * @param pseudo オプションの疑似要素文字列（例：':before'、':after'）
 * @returns 計算済みスタイル宣言
 */
export const getCachedComputedStyle = (element: Element, pseudo?: string): CSSStyleDeclaration => {
    if (!pseudo) {
        // キャッシュにスタイルがあるか確認
        if (styleCache.has(element)) {
            return styleCache.get(element)!;
        }
        
        // スタイルを取得してキャッシュ
        const style = context.window.getComputedStyle(element);
        styleCache.set(element, style);
        return style;
    } else {
        // 疑似要素のキャッシュキーを作成
        const cacheKey = `${element.tagName}_${element.className}_${pseudo}`;
        
        // キャッシュに疑似スタイルがあるか確認
        if (pseudoStyleCache.has(cacheKey)) {
            return pseudoStyleCache.get(cacheKey)!;
        }
        
        // 疑似スタイルを取得してキャッシュ
        const style = context.window.getComputedStyle(element, pseudo);
        pseudoStyleCache.set(cacheKey, style);
        return style;
    }
};

// コンテキスト変更時にキャッシュをクリア
export const setContext = (window: Window) => {
    context.document = window.document;
    // @ts-expect-error
    context.window = window;
    
    // コンテキスト変更時にキャッシュをクリア
    styleCache.clear();
    pseudoStyleCache.clear();
};
```

### 3.2 デバッグログの削減

不要な`console.log`と`console.warn`ステートメントを削除してパフォーマンスを向上させました。

```javascript
// 以下のようなコードを
console.log('gradient', JSON.stringify(gradient));
console.warn('fills', JSON.stringify(fills));
console.warn({ radialDirectionMatch });

// 以下のように変更
// Removed console.log for performance improvement
// Removed console.warn for performance improvement
```

## 4. テスト機能の強化

新しいテストファイル`enhanced-html-to-figma-test.js`を作成し、追加した機能をテストしました。このテストファイルには以下の機能が含まれています：

1. テキストシャドウのテスト
2. CSSフィルターのテスト（blur、brightness、drop-shadow）
3. 背景画像の位置とサイズのテスト
4. Flexレイアウトの方向反転テスト（row-reverse、column-reverse）
5. 変換結果の検証機能

## 5. 今後の課題

以下の機能は今回の改善では対応していないため、今後の課題として残っています：

1. CSS Gridのサポート
2. 複雑なSVG要素の変換精度向上
3. CSSアニメーションの対応
4. バッチ処理による大規模HTMLの効率的な処理

## 6. まとめ

これらの変更により、HTML-to-Figma変換の機能性とパフォーマンスが大幅に向上しました。特に、テキストシャドウ、CSSフィルター、背景画像の位置とサイズ、Flexレイアウトの方向反転などの機能が正確に変換されるようになり、大規模なHTMLドキュメントの変換速度も向上しました。