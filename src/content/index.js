/**
 * GenSpark Export - コンテンツスクリプト
 * このスクリプトはGenSparkページで実行され、エクスポート機能を追加します
 */

// モジュールをインポート
const {initUI} = require('./ui');
const {setupCellCopyObserver} = require('./copy/cellCopy');

// 即時実行関数式 (IIFE)
(function () {
    'use strict';

    // UIを初期化します
    initUI();

    // セルコピーオブザーバーを設定します
    setupCellCopyObserver();
})();