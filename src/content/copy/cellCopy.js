/**
 * GenSpark Export - セルコピー
 * このファイルにはセル内容をコピーする機能が含まれています
 */

const config = require('../../common/config');

// 選択メニューにコピーボタンを追加する関数
function addCopyButtonToSelectionMenu(selectionMenu) {
    // このメニューにコピーボタンが既に存在するか確認します
    if (selectionMenu.querySelector('.copy-cell-button')) {
        return;
    }

    // コピーボタンを作成します
    const copyButton = document.createElement('div');
    copyButton.className = 'button copy-cell-button';
    copyButton.setAttribute('data-v-555ccef1', '');
    copyButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.3332 6H7.33317C6.59679 6 5.99984 6.59695 5.99984 7.33333V13.3333C5.99984 14.0697 6.59679 14.6667 7.33317 14.6667H13.3332C14.0696 14.6667 14.6665 14.0697 14.6665 13.3333V7.33333C14.6665 6.59695 14.0696 6 13.3332 6Z" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M3.33317 10.0003H2.6665C2.31288 10.0003 1.97374 9.85981 1.72369 9.60976C1.47365 9.35971 1.33317 9.02057 1.33317 8.66695V2.66695C1.33317 2.31333 1.47365 1.97419 1.72369 1.72414C1.97374 1.47409 2.31288 1.33362 2.6665 1.33362H8.6665C9.02012 1.33362 9.35926 1.47409 9.60931 1.72414C9.85936 1.97419 9.99984 2.31333 9.99984 2.66695V3.33362" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        ${config.copyButtonText}
    `;

    // コピーボタンにクリックイベントリスナーを追加します
    copyButton.addEventListener('click', function (event) {
        // デフォルトのアクションを防ぎ、イベントの伝播を停止します
        event.preventDefault();
        event.stopPropagation();

        // 選択されたすべてのセルを検索します
        const selectedCells = document.querySelectorAll('td.selected');
        if (selectedCells && selectedCells.length > 0) {
            // 選択されたすべてのセルのテキスト内容を取得します
            let cellText = '';

            // セルを行ごとに整理するためのマップを作成します
            const rowMap = new Map();

            // 親行ごとにセルをグループ化します
            selectedCells.forEach(cell => {
                const row = cell.parentElement;
                if (!rowMap.has(row)) {
                    rowMap.set(row, []);
                }

                // セルのテキスト内容を取得し、トリミングします
                let cellText = cell.textContent.trim();

                // 置換が設定されている場合は改行を置換します
                if (config.lineBreakReplacement !== '') {
                    cellText = cellText.replace(/\n/g, config.lineBreakReplacement);
                }

                rowMap.get(row).push(cellText);
            });

            // マップを行の配列に変換します
            const rows = Array.from(rowMap.entries()).map(([_, cells]) => cells.join(config.cellSeparator));

            // 行を改行で結合します
            cellText = rows.join('\n');

            // デバッグ用に選択の詳細をログに記録します
            console.log(`GenSpark Export: ${selectedCells.length}個の選択されたセルが${rowMap.size}行で見つかりました`);
            console.log('GenSpark Export: コピーするフォーマット済みテキスト:', cellText);

            // テキストをクリップボードにコピーします
            navigator.clipboard.writeText(cellText)
                .then(() => {
                    console.log('GenSpark Export: セルの内容がクリップボードに正常にコピーされました');

                    // オプション: 簡単な成功メッセージを表示します
                    copyButton.textContent = 'コピーしました!';
                    setTimeout(() => {
                        // data-v-555ccef1 属性が保持されるようにします
                        copyButton.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.3332 6H7.33317C6.59679 6 5.99984 6.59695 5.99984 7.33333V13.3333C5.99984 14.0697 6.59679 14.6667 7.33317 14.6667H13.3332C14.0696 14.6667 14.6665 14.0697 14.6665 13.3333V7.33333C14.6665 6.59695 14.0696 6 13.3332 6Z" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path>
                                <path d="M3.33317 10.0003H2.6665C2.31288 10.0003 1.97374 9.85981 1.72369 9.60976C1.47365 9.35971 1.33317 9.02057 1.33317 8.66695V2.66695C1.33317 2.31333 1.47365 1.97419 1.72369 1.72414C1.97374 1.47409 2.31288 1.33362 2.6665 1.33362H8.6665C9.02012 1.33362 9.35926 1.47409 9.60931 1.72414C9.85936 1.97419 9.99984 2.31333 9.99984 2.66695V3.33362" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path>
                            </svg>
                            ${config.copyButtonText}
                        `;
                        // data-v-555ccef1 属性が設定されていることを確認します
                        copyButton.setAttribute('data-v-555ccef1', '');
                    }, 1500);
                })
                .catch(err => {
                    console.error('GenSpark Export: テキストをコピーできませんでした:', err);
                });
        } else {
            console.log('GenSpark Export: 選択されたセルが見つかりませんでした');
        }
    });

    // コピーボタンを選択メニューに追加します
    selectionMenu.appendChild(copyButton);
}

// DOM に選択メニューが追加されたことを検出するための MutationObserver を設定します
function setupCellCopyObserver() {
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1) { // 要素ノード
                        // 追加されたノードが選択メニューかどうかを確認します
                        if (node.classList && node.classList.contains('selection-operation-menu')) {
                            console.log('GenSpark Export: 選択メニューが検出されました');
                            addCopyButtonToSelectionMenu(node);
                        }

                        // 追加されたノード内の選択メニューも確認します
                        const selectionMenus = node.querySelectorAll(config.selectionMenuSelector);
                        selectionMenus.forEach(function (menu) {
                            console.log('GenSpark Export: 追加されたノード内で選択メニューが検出されました');
                            addCopyButtonToSelectionMenu(menu);
                        });
                    }
                });
            }
        });
    });

    // ドキュメント本文の変更の監視を開始します
    observer.observe(document.body, {childList: true, subtree: true});
}

module.exports = {
    setupCellCopyObserver
};
