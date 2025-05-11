// HTML to Figma Popup Script

document.addEventListener('DOMContentLoaded', function () {
    const convertBtn = document.getElementById('convertBtn');
    const captureBtn = document.getElementById('captureBtn');
    const htmlInput = document.getElementById('htmlInput');
    const statusDiv = document.getElementById('status');

    // Function to show status messages
    function showStatus(message, isError = false) {
        statusDiv.textContent = message;
        statusDiv.className = isError ? 'error' : 'success';
    }

    // Convert HTML button click handler
    convertBtn.addEventListener('click', function () {
        const html = htmlInput.value.trim();

        if (!html) {
            showStatus('Please enter some HTML code', true);
            return;
        }

        showStatus('Converting HTML to Figma...');

        // Send message to background script
        chrome.runtime.sendMessage({
            action: 'convertHtml',
            html: html
        }, function (response) {
            if (response && response.success) {
                showStatus('HTML converted successfully! Check Figma.');
            } else {
                showStatus('Error: ' + (response?.error || 'Failed to convert HTML'), true);
            }
        });
    });

    // Capture current page button click handler
    captureBtn.addEventListener('click', function () {
        showStatus('Capturing current page...');

        // Query for the active tab
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            if (!tabs || !tabs[0]) {
                showStatus('Error: Could not find active tab', true);
                return;
            }

            // Send message to content script in the active tab
            chrome.tabs.sendMessage(tabs[0].id, {action: 'captureHtml'}, function (response) {
                if (response && response.html) {
                    // Set the captured HTML in the textarea
                    htmlInput.value = response.html;
                    showStatus('HTML captured! Click "Convert to Figma" to proceed.');
                } else {
                    showStatus('Error: Failed to capture HTML from page', true);
                }
            });
        });
    });

    // Check if we're on Figma
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes('figma.com')) {
            showStatus('Ready to convert HTML to Figma');
        } else {
            showStatus('Warning: This extension works best on Figma.com', true);
        }
    });
});