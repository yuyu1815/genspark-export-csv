/**
 * GenSpark Export - 設定
 * このファイルには拡張機能の設定が含まれています
 */

// 設定
const config = {
    buttonText: 'CSV/Excel',
    buttonClass: 'genspark-export-csv-button',
    excelButtonText: 'Excel with Tabs',
    excelButtonClass: 'genspark-export-excel-button',
    mdButtonText: 'Markdown',
    mdButtonClass: 'genspark-export-md-button',
    targetSelector: '.present-and-export, .flex.flex-row.items-center.ml-\\[16px\\].flex-shrink-0', // ボタンを追加する要素
    tableSelector: '.dataset-table-container table', // エクスポートしたいテーブル
    tabSelector: '.sheets-bar-item', // タブのセレクター
    activeTabClass: 'active', // アクティブなタブのクラス
    fileName: 'genspark_export.csv',
    excelFileName: 'genspark_export.xlsx',
    mdFileName: 'genspark_export.md',
    selectionMenuSelector: '.selection-operation-menu', // 選択メニューのセレクター
    copyButtonText: 'セルをコピー', // コピーボタンのテキスト
    cellSeparator: ' ', // コピー時のセルのデフォルト区切り文字
    lineBreakReplacement: '' // 改行のデフォルト置換文字（空は置換なしを意味します）
};

// ストレージからユーザー設定を読み込む
chrome.storage.sync.get(
    {
        cellSeparator: ' ',
        lineBreakReplacement: ''
    },
    function (items) {
        config.cellSeparator = items.cellSeparator;
        config.lineBreakReplacement = items.lineBreakReplacement;
        console.log('GenSpark Export: ストレージからセル区切り文字を読み込みました:', config.cellSeparator);
        console.log('GenSpark Export: ストレージから改行置換を読み込みました:', config.lineBreakReplacement);
    }
);

module.exports = config;
