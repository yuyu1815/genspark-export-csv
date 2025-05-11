// HTML to Figma Background Script
// This script runs in the background of the extension

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('Background script received message:', request);

    // Handle the convertHtml action
    if (request.action === 'convertHtml') {
        // Get the active tab
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            if (!tabs || !tabs[0]) {
                sendResponse({error: 'Could not find active tab'});
                return;
            }

            const activeTab = tabs[0];

            // Check if we're on Figma
            if (!activeTab.url || !activeTab.url.includes('figma.com')) {
                sendResponse({error: 'This extension only works on Figma.com'});
                return;
            }

            // Forward the message to the content script
            chrome.tabs.sendMessage(activeTab.id, request, function (response) {
                // Forward the response back to the popup
                sendResponse(response);
            });
        });

        return true; // Keep the message channel open for async response
    }
});

// Listen for installation
chrome.runtime.onInstalled.addListener(function (details) {
    console.log('HTML to Figma extension installed:', details);

    // Show a welcome page or instructions on first install
    if (details.reason === 'install') {
        chrome.tabs.create({
            url: 'https://www.figma.com/community'
        });
    }
});

// Log that the background script has loaded
console.log('HTML to Figma extension background script loaded');