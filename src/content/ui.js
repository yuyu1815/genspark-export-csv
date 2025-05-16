/**
 * GenSpark Export - UI
 * このファイルにはユーザーインターフェース用の関数が含まれています
 */

const config = require('../common/config');
const {exportAllTabsToCSV} = require('./export/csvExport');
const {exportAllTabsToExcel} = require('./export/excelExport');
const {exportAllTabsToMarkdown} = require('./export/markdownExport');

// GenSparkページにテーブルがあるかどうかを確認します
function checkForTable() {
    // www.genspark.ai/agents? URLの特別なケース
    if (window.location.href.includes('www.genspark.ai/agents')) {
        const topElement = document.querySelector('div.top');
        const tableElement = document.querySelector(config.tableSelector);

        if (topElement && tableElement) {
            console.log('GenSpark Export: エージェントページのテーブルとトップ要素が見つかりました');
            addExportButtons(topElement, tableElement, true);
        } else {
            // 要素が見つからない場合は、少し遅れて再試行します
            setTimeout(checkForTable, 1000);
        }
    } else {
        // 他のURLの元の動作
        const targetElement = document.querySelector(config.targetSelector);
        const tableElement = document.querySelector(config.tableSelector);

        if (targetElement && tableElement) {
            console.log('GenSpark Export: テーブルとターゲット要素が見つかりました');
            addExportButtons(targetElement, tableElement, false);
        } else {
            // 要素が見つからない場合は、少し遅れて再試行します
            setTimeout(checkForTable, 1000);
        }
    }
}

// エクスポートボタンをページに追加します
function addExportButtons(targetElement, tableElement, isAgentsPage) {
    // ボタンが既に存在するかどうかを確認します
    if (document.querySelector('.' + config.buttonClass)) {
        return;
    }

    // CSVボタンを作成します
    const csvButton = document.createElement('div');
    csvButton.className = 'button ' + config.buttonClass;
    csvButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 13.1111V15.4444C17 15.857 16.8361 16.2527 16.5444 16.5444C16.2527 16.8361 15.857 17 15.4444 17H4.55556C4.143 17 3.74733 16.8361 3.45561 16.5444C3.16389 16.2527 3 15.857 3 15.4444V4.55556C3 4.143 3.16389 3.74733 3.45561 3.45561C3.74733 3.16389 4.143 3 4.55556 3H6.88889" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M8 8L10 10L12 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M10 3V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        <div class="present-and-export-text">${config.buttonText}</div>
    `;

    // CSVボタンにクリックイベントリスナーを追加します
    csvButton.addEventListener('click', function () {
        exportAllTabsToCSV(tableElement);
    });

    // Excelボタンを作成します
    const excelButton = document.createElement('div');
    excelButton.className = 'button ' + config.excelButtonClass;
    excelButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 13.1111V15.4444C17 15.857 16.8361 16.2527 16.5444 16.5444C16.2527 16.8361 15.857 17 15.4444 17H4.55556C4.143 17 3.74733 16.8361 3.45561 16.5444C3.16389 16.2527 3 15.857 3 15.4444V4.55556C3 4.143 3.16389 3.74733 3.45561 3.45561C3.74733 3.16389 4.143 3 4.55556 3H6.88889" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M8 8L10 10L12 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M10 3V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        <div class="present-and-export-text">${config.excelButtonText}</div>
    `;

    // Excelボタンにクリックイベントリスナーを追加します
    excelButton.addEventListener('click', function () {
        exportAllTabsToExcel(tableElement);
    });

    // Markdownボタンを作成します
    const mdButton = document.createElement('div');
    mdButton.className = 'button ' + config.mdButtonClass;
    mdButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 13.1111V15.4444C17 15.857 16.8361 16.2527 16.5444 16.5444C16.2527 16.8361 15.857 17 15.4444 17H4.55556C4.143 17 3.74733 16.8361 3.45561 16.5444C3.16389 16.2527 3 15.857 3 15.4444V4.55556C3 4.143 3.16389 3.74733 3.45561 3.45561C3.74733 3.16389 4.143 3 4.55556 3H6.88889" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            <path d="M8 8L10 10L12 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M10 3V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        <div class="present-and-export-text">${config.mdButtonText}</div>
    `;

    // Markdownボタンにクリックイベントリスナーを追加します
    mdButton.addEventListener('click', function () {
        exportAllTabsToMarkdown(tableElement);
    });

    if (isAgentsPage) {
        // エージェントページの場合、ボタンをdiv.top要素に直接追加します
        targetElement.appendChild(csvButton);
        targetElement.appendChild(excelButton);
        targetElement.appendChild(mdButton);
    } else {
        // 他のページでは、コンテナアプローチを使用します
        // ボタン用のコンテナを作成します
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'genspark-buttons-container';

        // ボタンをコンテナに追加します
        buttonsContainer.appendChild(csvButton);
        buttonsContainer.appendChild(excelButton);
        buttonsContainer.appendChild(mdButton);

        // コンテナをターゲット要素の親に追加します
        targetElement.parentNode.appendChild(buttonsContainer);
    }
}

// UIを初期化します
function initUI() {
    // 外部ファイルからCSSを読み込みます
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chrome.runtime.getURL('content.css');
    document.head.appendChild(link);

    // ページ読み込み時にテーブルの確認を開始します
    window.addEventListener('load', checkForTable);

    // DOMコンテンツが読み込まれたときにも確認します（より速い応答のため）
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkForTable);
    } else {
        checkForTable();
    }

    // ページが完全に読み込まれたら再度確認します
    window.addEventListener('load', checkForTable);

    // 動的に読み込まれるコンテンツも定期的に確認します
    setInterval(checkForTable, 2000);
}

module.exports = {
    initUI
};