/**
 * GenSpark Export - Markdownエクスポート
 * このファイルには、データをMarkdown形式にエクスポートするための関数が含まれています
 */

const config = require('../../common/config');
const {extractTableData, triggerDownload} = require('../utils/tableUtils');

// 全てのタブのデータをMarkdown形式にエクスポートする関数
async function exportAllTabsToMarkdown(tableElement) {
    // 全てのタブを検索
    const tabs = document.querySelectorAll(config.tabSelector);
    if (!tabs || tabs.length === 0) {
        console.log('GenSpark Export: タブが見つかりません');
        // タブが見つからない場合は、現在のテーブルのみをエクスポートします
        exportTableToMarkdown(tableElement);
        return;
    }

    console.log(`GenSpark Export: Markdownエクスポート用に ${tabs.length} 個のタブが見つかりました`);

    // 全てのタブのデータを保存
    const allTabsData = [];

    // 元々アクティブだったタブを記憶
    const originalActiveTab = document.querySelector(config.tabSelector + '.' + config.activeTabClass);
    let originalActiveTabIndex = -1;

    // 元々アクティブだったタブのインデックスを検索
    for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].classList.contains(config.activeTabClass)) {
            originalActiveTabIndex = i;
            break;
        }
    }

    console.log(`GenSpark Export: 元のアクティブなタブのインデックス: ${originalActiveTabIndex}`);

    // 各タブを処理
    for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        const tabName = tab.querySelector('.sheets-bar-item-name')?.textContent.trim() || `Tab ${i + 1}`;

        console.log(`GenSpark Export: Markdown用にタブ "${tabName}" (${i + 1}/${tabs.length}) を処理中`);

        // このタブがアクティブでない場合はクリックします
        if (!tab.classList.contains(config.activeTabClass)) {
            console.log(`GenSpark Export: タブ "${tabName}" をクリックしています`);

            // より直接的なアプローチでクリックをトリガーします
            try {
                // 最初の試行: MouseEventを使用
                tab.dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                }));

                // テーブルが更新されるのを待機します - コンテンツが読み込まれるように長めの待機時間
                await new Promise(resolve => setTimeout(resolve, 2000));

                // タブが実際にアクティブになったことを確認
                if (!tab.classList.contains(config.activeTabClass)) {
                    console.log(`GenSpark Export: タブ "${tabName}" はアクティブになりませんでした。直接クリックを試みます`);

                    // 2番目の試行: フォールバックとして直接クリックを試みます
                    tab.click();
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // タブがまだアクティブでない場合は、長めの待機時間でもう一度試します
                    if (!tab.classList.contains(config.activeTabClass)) {
                        console.log(`GenSpark Export: タブ "${tabName}" はまだアクティブになっていません。もう一度試みます`);

                        // 3番目の試行: 長めの待機時間で再度クリックを試みます
                        tab.click();
                        await new Promise(resolve => setTimeout(resolve, 3000));

                        // 3回試行してもタブがアクティブにならない場合は、エラーをログに記録して続行します
                        if (!tab.classList.contains(config.activeTabClass)) {
                            console.error(`GenSpark Export: 複数回試行してもタブ "${tabName}" をアクティブにできませんでした。このタブをスキップします。`);
                            continue; // 次のタブへスキップ
                        }
                    }
                }

                console.log(`GenSpark Export: タブ "${tabName}" のアクティブ化に成功しました`);
            } catch (error) {
                console.error(`GenSpark Export: タブ "${tabName}" のクリック中にエラーが発生しました:`, error);
                console.log(`GenSpark Export: エラーのためタブ "${tabName}" をスキップします`);
                continue; // Skip to the next tab
            }
        }

        // 現在のテーブルを取得
        const currentTable = document.querySelector(config.tableSelector);
        if (!currentTable) {
            console.log(`GenSpark Export: タブ "${tabName}" にテーブルが見つかりません`);
            continue;
        }

        // このタブからデータを抽出
        const tabData = extractTableData(currentTable);
        if (tabData) {
            tabData.tabName = tabName;
            allTabsData.push(tabData);
            console.log(`GenSpark Export: Markdown用にタブ "${tabName}" からのデータ抽出に成功しました`);
        } else {
            console.log(`GenSpark Export: タブ "${tabName}" からデータは抽出されませんでした`);
        }
    }

    // 元のアクティブなタブを復元
    if (originalActiveTabIndex >= 0 && originalActiveTabIndex < tabs.length) {
        const tabToRestore = tabs[originalActiveTabIndex];
        if (!tabToRestore.classList.contains(config.activeTabClass)) {
            console.log(`GenSpark Export: 元のアクティブなタブを復元しています`);
            tabToRestore.click();
            // タブが復元されるのを待機
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // タブ区切りでMarkdownファイルを作成
    if (allTabsData.length > 0) {
        console.log(`GenSpark Export: ${allTabsData.length} 個のタブを持つMarkdownファイルを作成しています`);
        downloadMarkdown(allTabsData);
    } else {
        console.log('GenSpark Export: Markdownエクスポート用のデータがどのタブにも見つかりませんでした');
    }
}

// 単一のテーブルをMarkdownにエクスポートする関数
function exportTableToMarkdown(tableElement) {
    const tabData = extractTableData(tableElement);
    if (!tabData) {
        console.log('GenSpark Export: テーブルにデータが見つかりません');
        return;
    }

    // 単一テーブル用のMarkdownコンテンツを作成
    const mdContent = createMarkdownTable(tabData.headers, tabData.rows);

    // Markdownファイルをダウンロード
    downloadSingleMarkdown(mdContent);
}

// ヘッダーと行からMarkdownテーブルを作成する関数
function createMarkdownTable(headers, rows) {
    // ヘッダー行を作成
    let mdTable = '| ' + headers.join(' | ') + ' |\n';

    // 区切り行を作成
    mdTable += '| ' + headers.map(() => '---').join(' | ') + ' |\n';

    // データ行を作成
    rows.forEach(row => {
        mdTable += '| ' + row.map(cell => String(cell).replace(/\|/g, '\\|')).join(' | ') + ' |\n';
    });

    return mdTable;
}

// 単一のMarkdownテーブルをダウンロードする関数
function downloadSingleMarkdown(mdContent) {
    // triggerDownloadヘルパー関数を使用
    triggerDownload(mdContent, config.mdFileName, 'text/markdown;charset=utf-8;');

    console.log('GenSpark Export: Markdownファイルが正常に作成されました');
}

// 全てのタブから結合されたMarkdownテーブルをダウンロードする関数
function downloadMarkdown(allTabsData) {
    let mdContent = '';

    // 各タブのデータを処理
    allTabsData.forEach((tabData, index) => {
        // タブ名をヘッダーとして追加
        mdContent += `## ${tabData.tabName}\n\n`;

        // Markdownテーブルを追加
        mdContent += createMarkdownTable(tabData.headers, tabData.rows);

        // タブ間に空白行を追加（最後のタブの後を除く）
        if (index < allTabsData.length - 1) {
            mdContent += '\n\n';
        }
    });

    // triggerDownloadヘルパー関数を使用
    triggerDownload(mdContent, config.mdFileName, 'text/markdown;charset=utf-8;');

    console.log('GenSpark Export: 複数タブを持つMarkdownファイルが正常に作成されました');
}

module.exports = {
    exportAllTabsToMarkdown,
    exportTableToMarkdown
};