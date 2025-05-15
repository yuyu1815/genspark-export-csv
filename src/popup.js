// Default values
const DEFAULT_SEPARATOR = ' ';
const DEFAULT_LINE_BREAK_REPLACEMENT = '';

// DOM elements
const cellSeparatorInput = document.getElementById('cellSeparator');
const lineBreakReplacementInput = document.getElementById('lineBreakReplacement');
const saveButton = document.getElementById('saveButton');
const resetButton = document.getElementById('resetButton');
const statusElement = document.getElementById('status');

// Load saved settings when popup opens
document.addEventListener('DOMContentLoaded', loadSettings);

// Add event listeners
saveButton.addEventListener('click', saveSettings);
resetButton.addEventListener('click', resetSettings);

/**
 * Load settings from Chrome storage
 */
function loadSettings() {
    chrome.storage.sync.get(
        {
            cellSeparator: DEFAULT_SEPARATOR,
            lineBreakReplacement: DEFAULT_LINE_BREAK_REPLACEMENT
        },
        function (items) {
            // If the saved separator is a space, show an empty input but with a placeholder
            if (items.cellSeparator === ' ') {
                cellSeparatorInput.value = '';
                cellSeparatorInput.placeholder = '例: | (現在: スペース)';
            } else {
                cellSeparatorInput.value = items.cellSeparator;
                cellSeparatorInput.placeholder = '例: |';
            }

            // Set the line break replacement input value
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
 * Save settings to Chrome storage
 */
function saveSettings() {
    // Get the values from the inputs
  let separator = cellSeparatorInput.value;
    let lineBreakReplacement = lineBreakReplacementInput.value;

  // If empty, use the default space separator
  if (separator === '') {
    separator = DEFAULT_SEPARATOR;
  }

  // Save to Chrome storage
    chrome.storage.sync.set(
        {
            cellSeparator: separator,
            lineBreakReplacement: lineBreakReplacement
        },
        function () {
            // Show success message
            showStatus('設定を保存しました！', 'success');

            // Update the placeholders to reflect the current settings
            if (separator === ' ') {
                cellSeparatorInput.value = '';
                cellSeparatorInput.placeholder = '例: | (現在: スペース)';
            }

            if (lineBreakReplacement === '') {
                lineBreakReplacementInput.placeholder = '例: \\n (現在: 置換なし)';
            }

            // Reload GenSpark tabs if they are open
            reloadGenSparkTabs();
        }
    );
}

/**
 * Reload all GenSpark tabs
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
 * Reset settings to default values
 */
function resetSettings() {
    // Reset to default values
    chrome.storage.sync.set(
        {
            cellSeparator: DEFAULT_SEPARATOR,
            lineBreakReplacement: DEFAULT_LINE_BREAK_REPLACEMENT
        },
        function () {
            // Clear the inputs and update placeholders
            cellSeparatorInput.value = '';
            cellSeparatorInput.placeholder = '例: | (現在: スペース)';

            lineBreakReplacementInput.value = '';
            lineBreakReplacementInput.placeholder = '例: \\n (現在: 置換なし)';

            // Show success message
            showStatus('設定をリセットしました！', 'success');

            // Reload GenSpark tabs if they are open
            reloadGenSparkTabs();
        }
    );
}

/**
 * Show status message
 * @param {string} message - The message to display
 * @param {string} type - The type of message ('success' or 'error')
 */
function showStatus(message, type) {
  statusElement.textContent = message;
  statusElement.className = 'status ' + type;

    // Hide the status message after 3 seconds
  setTimeout(function() {
    statusElement.className = 'status';
  }, 3000);
}
