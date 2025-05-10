# GenSpark Export CSV Test Page

This directory contains a test page that simulates the GenSpark UI structure to help you test the Chrome extension locally without having to access the actual GenSpark website.

## Using the Test Page

1. Build the extension using the build.bat script in the root directory
2. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top-right corner)
   - Click "Load unpacked" and select the `dist` directory created by the build script
3. Open the test page in Chrome:
   - Right-click on `index.html` and select "Open with Chrome"
   - Or drag and drop the file into a Chrome window

## Testing with Local Files

By default, Chrome extensions can't run on local file URLs (`file://`). To test with the local test page, you need to modify the manifest.json file to allow the extension to run on local files:

1. Open `src/manifest.json`
2. Add `"file://*"` to the `matches` array in the `content_scripts` section:

```json
"content_scripts": [
  {
    "matches": ["*://www.genspark.ai/agents?*", "file://*"],
    "js": ["content.js"]
  }
]
```

3. Rebuild the extension using the build.bat script
4. Reload the extension in Chrome's extension management page

## Expected Behavior

When you open the test page in Chrome with the extension installed:

1. The extension should detect the page structure
2. An "Export to CSV" button should appear next to the "表示" button
3. Clicking the "Export to CSV" button should download a CSV file containing the table data

If the button doesn't appear, check the browser console for any error messages.

## Troubleshooting

- Make sure you've rebuilt the extension after any changes to the source code
- Check that the extension is enabled in Chrome's extension management page
- Verify that you've added the `file://*` pattern to the manifest.json if testing with local files
- Open Chrome's developer tools (F12) and check the console for any error messages