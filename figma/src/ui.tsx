// This file contains the React code for the plugin's UI

// Since we're not using React as a dependency (to keep the plugin simple),
// we'll use plain JavaScript/TypeScript to manipulate the DOM

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the UI
  initializeUI();
});

function initializeUI() {
  const app = document.getElementById('app');
  if (!app) return;

  // Create the UI elements
  app.innerHTML = `
    <h1>HTML to Figma Converter</h1>

    <div class="tabs">
      <div class="tab active" data-tab="html-input">HTML Input</div>
      <div class="tab" data-tab="about">About</div>
    </div>

    <div class="tab-content active" id="html-input">
      <p>Paste your HTML code below to convert it to Figma designs:</p>
      <textarea id="html-code" placeholder="Paste your HTML code here..."></textarea>

      <div class="button-container">
        <button class="secondary" id="cancel-button">Cancel</button>
        <button class="primary" id="convert-button">Convert to Figma</button>
      </div>

      <div class="status hidden" id="status-message"></div>
    </div>

    <div class="tab-content" id="about">
      <p>HTML to Figma Plugin v1.0.0</p>
      <p>This plugin converts HTML code to Figma designs using the html-to-figma-lib library.</p>
      <p>Usage:</p>
      <ol>
        <li>Paste your HTML code in the text area</li>
        <li>Click "Convert to Figma"</li>
        <li>The plugin will create a new page with the converted design</li>
      </ol>
      <p>Limitations:</p>
      <ul>
        <li>Complex layouts may not convert perfectly</li>
        <li>Some CSS properties are not supported</li>
        <li>External resources like images may not load correctly</li>
      </ul>

      <div class="button-container">
        <button class="secondary" id="back-button">Back</button>
      </div>
    </div>
  `;

  // Add event listeners
  setupEventListeners();
}

function setupEventListeners() {
  // Tab switching
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and tab contents
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      const tabId = tab.getAttribute('data-tab');
      if (tabId) {
        const tabContent = document.getElementById(tabId);
        if (tabContent) {
          tabContent.classList.add('active');
        }

        // Send message to plugin code when About tab is clicked
        if (tabId === 'about') {
          parent.postMessage({ pluginMessage: { type: 'about' } }, '*');
        }
      }
    });
  });

  // Convert button
  const convertButton = document.getElementById('convert-button');
  if (convertButton) {
    convertButton.addEventListener('click', () => {
      const htmlCode = (document.getElementById('html-code') as HTMLTextAreaElement)?.value;
      if (!htmlCode) {
        showStatus('Please enter some HTML code', 'error');
        return;
      }

      // Send message to the plugin code
      parent.postMessage({ pluginMessage: { type: 'convert-html', html: htmlCode } }, '*');

      // Show loading status
      showStatus('Converting HTML to Figma...', 'info');
    });
  }

  // Cancel button
  const cancelButton = document.getElementById('cancel-button');
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
    });
  }

  // Back button
  const backButton = document.getElementById('back-button');
  if (backButton) {
    backButton.addEventListener('click', () => {
      // Switch back to the HTML input tab
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      const htmlTab = document.querySelector('[data-tab="html-input"]');
      if (htmlTab) {
        htmlTab.classList.add('active');
        const htmlContent = document.getElementById('html-input');
        if (htmlContent) {
          htmlContent.classList.add('active');
        }
      }
    });
  }

  // Listen for messages from the plugin code
  window.onmessage = (event) => {
    const message = event.data.pluginMessage;
    if (!message) return;

    if (message.type === 'conversion-complete') {
      if (message.success) {
        showStatus(message.message, 'success');
      } else {
        showStatus(message.message, 'error');
      }
    } else if (message.type === 'about-info') {
      // Update the about tab with the received information
      const aboutContent = document.getElementById('about');
      if (aboutContent) {
        // Create HTML content from the about info
        let featuresHtml = '<ul>';
        message.features.forEach((feature: string) => {
          featuresHtml += `<li>${feature}</li>`;
        });
        featuresHtml += '</ul>';

        // Update the about tab content
        aboutContent.innerHTML = `
          <h2>HTML to Figma Plugin v${message.version}</h2>
          <p>${message.description}</p>

          <h3>Features:</h3>
          ${featuresHtml}

          <p><strong>Author:</strong> ${message.author}</p>
          <p><strong>Last Updated:</strong> ${message.lastUpdated}</p>

          <div class="button-container">
            <button class="secondary" id="back-button">Back</button>
          </div>
        `;

        // Re-attach event listener to the back button
        const backButton = document.getElementById('back-button');
        if (backButton) {
          backButton.addEventListener('click', () => {
            // Switch back to the HTML input tab
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            const htmlTab = document.querySelector('[data-tab="html-input"]');
            if (htmlTab) {
              htmlTab.classList.add('active');
              const htmlContent = document.getElementById('html-input');
              if (htmlContent) {
                htmlContent.classList.add('active');
              }
            }
          });
        }
      }
    } else if (message.type === 'fetch-image') {
      // Handle image fetch request
      fetchImage(message.url, message.requestId);
    }
  };

  // Function to fetch an image and send the data back to the plugin
  async function fetchImage(url: string, requestId: string) {
    try {
      // Fetch the image
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      // Get the image data as an ArrayBuffer
      const arrayBuffer = await response.arrayBuffer();

      // Convert ArrayBuffer to Uint8Array
      const uint8Array = new Uint8Array(arrayBuffer);

      // Send the image data back to the plugin
      parent.postMessage({
        pluginMessage: {
          type: 'fetch-image-result',
          requestId,
          success: true,
          data: uint8Array
        }
      }, '*');
    } catch (error) {
      console.error('Error fetching image:', error);

      // Send error back to the plugin
      parent.postMessage({
        pluginMessage: {
          type: 'fetch-image-result',
          requestId,
          success: false,
          error: error.message
        }
      }, '*');
    }
  }
}

function showStatus(message: string, type: 'success' | 'error' | 'info') {
  const statusElement = document.getElementById('status-message');
  if (!statusElement) return;

  statusElement.textContent = message;
  statusElement.classList.remove('hidden', 'success', 'error');

  if (type === 'success') {
    statusElement.classList.add('success');
  } else if (type === 'error') {
    statusElement.classList.add('error');
  }
}
