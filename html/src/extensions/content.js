// HTML to Figma Content Script
// This script runs in the context of the web page

// No external libraries needed for this simplified version

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('Content script received message:', request);

    // Handle the captureHtml action
    if (request.action === 'captureHtml') {
        try {
            // Get the HTML of the current page
            const html = document.documentElement.outerHTML;
            sendResponse({html: html});
        } catch (error) {
            console.error('Error capturing HTML:', error);
            sendResponse({error: error.message});
        }
        return true; // Keep the message channel open for async response
    }

    // Handle the convertHtml action
    if (request.action === 'convertHtml') {
        try {
            // Check if we're on Figma
            if (!window.location.href.includes('figma.com')) {
                sendResponse({error: 'This extension only works on Figma.com'});
                return true;
            }

            // Create a temporary container to parse the HTML
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '-9999px';
            container.innerHTML = request.html;
            document.body.appendChild(container);

            // Convert the HTML to Figma
            convertHtmlToFigma(container)
                .then(result => {
                    // Clean up
                    document.body.removeChild(container);
                    sendResponse({success: true, result: result});
                })
                .catch(error => {
                    // Clean up
                    document.body.removeChild(container);
                    console.error('Error converting HTML to Figma:', error);
                    sendResponse({error: error.message});
                });

            return true; // Keep the message channel open for async response
        } catch (error) {
            console.error('Error in convertHtml action:', error);
            sendResponse({error: error.message});
            return true;
        }
    }
});

// Function to convert HTML to Figma
async function convertHtmlToFigma(element) {
    try {
        // Check if the Figma plugin API is available
        if (!window.figma) {
            throw new Error('Figma plugin API not available. Make sure you are on Figma.com and in a design file.');
        }

        // This is a simplified version that demonstrates the concept
        // In a real implementation, we would use the Figma Plugin API to create nodes

        // Create a notification to inform the user
        const notification = document.createElement('div');
        notification.className = 'html-to-figma-notification success';
        notification.textContent = 'HTML to Figma conversion initiated. In a real implementation, this would create Figma nodes.';
        document.body.appendChild(notification);

        // Remove the notification after 5 seconds
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 5000);

        // Return a mock result
        return {
            message: 'HTML conversion demonstration completed',
            nodeCount: 1
        };
    } catch (error) {
        console.error('Error in convertHtmlToFigma:', error);
        throw error;
    }
}

// Inject a message to indicate the extension is loaded
console.log('HTML to Figma extension content script loaded');
