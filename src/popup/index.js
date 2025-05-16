// デフォルト値
const DEFAULT_SEPARATOR = ' ';
const DEFAULT_LINE_BREAK_REPLACEMENT = '';

// DOM要素
const cellSeparatorInput = document.getElementById('cellSeparator');
const lineBreakReplacementInput = document.getElementById('lineBreakReplacement');
const saveButton = document.getElementById('saveButton');
const resetButton = document.getElementById('resetButton');
const statusElement = document.getElementById('status');

// ポップアップが開いたときに保存された設定を読み込みます
document.addEventListener('DOMContentLoaded', loadSettings);

// イベントリスナーを追加します
saveButton.addEventListener('click', saveSettings);
resetButton.addEventListener('click', resetSettings);

/**
 * Chromeストレージから設定を読み込みます
 */
function loadSettings() {
    chrome.storage.sync.get(
        {
            cellSeparator: DEFAULT_SEPARATOR,
            lineBreakReplacement: DEFAULT_LINE_BREAK_REPLACEMENT
        },
        function (items) {
            // 保存された区切り文字がスペースの場合、空の入力を表示しますが、プレースホルダーを表示します
            if (items.cellSeparator === ' ') {
                cellSeparatorInput.value = '';
                cellSeparatorInput.placeholder = '例: | (現在: スペース)';
            } else {
                cellSeparatorInput.value = items.cellSeparator;
                cellSeparatorInput.placeholder = '例: |';
            }

            // 改行置換入力値を設定します
            lineBreakReplacementInput.value = items.lineBreakReplacement;
            if (items.lineBreakReplacement === '') {
                lineBreakReplacementInput.placeholder = '例: \\n (現在: 置換なし)';
            } else {
                lineBreakReplacementInput.placeholder = '例: \\n';
            }
        }
    );
}

/**
 * 設定をChromeストレージに保存します
 */
function saveSettings() {
    // 入力から値を取得します
    let separator = cellSeparatorInput.value;
    let lineBreakReplacement = lineBreakReplacementInput.value;

    // 空の場合は、デフォルトのスペース区切り文字を使用します
    if (separator === '') {
        separator = DEFAULT_SEPARATOR;
    }

    // Chromeストレージに保存します
    chrome.storage.sync.set(
        {
            cellSeparator: separator,
            lineBreakReplacement: lineBreakReplacement
        },
        function () {
            // 成功メッセージを表示します
            showStatus('設定を保存しました！', 'success');

            // 現在の設定を反映するようにプレースホルダーを更新します
            if (separator === ' ') {
                cellSeparatorInput.value = '';
                cellSeparatorInput.placeholder = '例: | (現在: スペース)';
            }

            if (lineBreakReplacement === '') {
                lineBreakReplacementInput.placeholder = '例: \\n (現在: 置換なし)';
            }

            // GenSparkタブが開いている場合はリロードします
            reloadGenSparkTabs();
        }
    );
}

/**
 * すべてのGenSparkタブをリロードします
 */
function reloadGenSparkTabs() {
    chrome.tabs.query({url: "*://www.genspark.ai/*"}, function (tabs) {
        if (tabs.length > 0) {
            tabs.forEach(function (tab) {
                chrome.tabs.reload(tab.id);
            });
        }
    });
}

/**
 * 設定をデフォルト値にリセットします
 */
function resetSettings() {
    // デフォルト値にリセットします
    chrome.storage.sync.set(
        {
            cellSeparator: DEFAULT_SEPARATOR,
            lineBreakReplacement: DEFAULT_LINE_BREAK_REPLACEMENT
        },
        function () {
            // 入力をクリアし、プレースホルダーを更新します
            cellSeparatorInput.value = '';
            cellSeparatorInput.placeholder = '例: | (現在: スペース)';

            lineBreakReplacementInput.value = '';
            lineBreakReplacementInput.placeholder = '例: \\n (現在: 置換なし)';

            // 成功メッセージを表示します
            showStatus('設定をリセットしました！', 'success');

            // GenSparkタブが開いている場合はリロードします
            reloadGenSparkTabs();
        }
    );
}

/**
 * ステータスメッセージを表示します
 * @param {string} message - 表示するメッセージ
 * @param {string} type - メッセージのタイプ（'success'または'error'）
 */
function showStatus(message, type) {
    statusElement.textContent = message;
    statusElement.className = 'status ' + type;

    // 3秒後にステータスメッセージを非表示にします
    setTimeout(function () {
        statusElement.className = 'status';
    }, 3000);
}