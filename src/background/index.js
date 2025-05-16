/**
 * GenSpark Export - バックグラウンドスクリプト
 * このスクリプトはバックグラウンドで実行され、拡張機能の状態を管理します
 */

// インストールをリッスンします
chrome.runtime.onInstalled.addListener(function () {
    console.log('GenSpark Export拡張機能がインストールされました');
});

// コンテンツスクリプトからのメッセージをリッスンします
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'log') {
        console.log('コンテンツスクリプトログ:', request.message);
    }

    // 非同期応答のために常にtrueを返します
    return true;
});
