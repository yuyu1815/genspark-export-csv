// Default separator value (space)
const DEFAULT_SEPARATOR = ' ';

// DOM elements
const cellSeparatorInput = document.getElementById('cellSeparator');
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
  chrome.storage.sync.get({ cellSeparator: DEFAULT_SEPARATOR }, function(items) {
    // If the saved separator is a space, show an empty input but with a placeholder
    if (items.cellSeparator === ' ') {
      cellSeparatorInput.value = '';
      cellSeparatorInput.placeholder = '例: | (現在: スペース)';
    } else {
      cellSeparatorInput.value = items.cellSeparator;
      cellSeparatorInput.placeholder = '例: |';
    }
  });
}

/**
 * Save settings to Chrome storage
 */
function saveSettings() {
  // Get the value from the input
  let separator = cellSeparatorInput.value;
  
  // If empty, use the default space separator
  if (separator === '') {
    separator = DEFAULT_SEPARATOR;
  }
  
  // Save to Chrome storage
  chrome.storage.sync.set({ cellSeparator: separator }, function() {
    // Show success message
    showStatus('設定を保存しました！', 'success');
    
    // Update the placeholder to reflect the current setting
    if (separator === ' ') {
      cellSeparatorInput.value = '';
      cellSeparatorInput.placeholder = '例: | (現在: スペース)';
    }
  });
}

/**
 * Reset settings to default values
 */
function resetSettings() {
  // Reset to default separator
  chrome.storage.sync.set({ cellSeparator: DEFAULT_SEPARATOR }, function() {
    // Clear the input and update placeholder
    cellSeparatorInput.value = '';
    cellSeparatorInput.placeholder = '例: | (現在: スペース)';
    
    // Show success message
    showStatus('設定をリセットしました！', 'success');
  });
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