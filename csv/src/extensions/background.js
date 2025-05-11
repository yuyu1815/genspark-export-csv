/**
 * GenSpark Export - Background Script
 * This script runs in the background and manages the extension's state
 */

// Listen for installation
chrome.runtime.onInstalled.addListener(function () {
    console.log('GenSpark Export extension installed');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'log') {
        console.log('Content script log:', request.message);
    }

    // Always return true for asynchronous response
    return true;
});
