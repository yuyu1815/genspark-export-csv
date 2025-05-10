# GenSpark Export Chrome Extension - Implementation Details

## Project Overview

This Chrome extension adds export functionality to the GenSpark AI application. It detects when a user is on a GenSpark page (URLs containing "https://www.genspark.ai/agents?") and adds an "export" button that allows users to download table data in CSV format optimized for Excel compatibility.

## Implementation Details

### Project Structure

```
genspark-export-csv/
├── src/                      # Source code
│   ├── manifest.json         # Extension configuration
│   ├── content.js            # Content script for GenSpark pages
│   ├── background.js         # Background script
│   └── icons/                # Extension icons
│       ├── icon16.png        # 16x16 icon
│       ├── icon48.png        # 48x48 icon
│       └── icon128.png       # 128x128 icon
├── test/                     # Test files
│   ├── index.html            # Test page simulating GenSpark UI
│   └── README.md             # Test instructions
├── build.js                  # Node.js build script
├── build.bat                 # Windows batch file for building
├── package.json              # Node.js project configuration
├── README.md                 # Project documentation
└── LICENSE                   # License information
```

### Key Components

1. **manifest.json**: Defines the extension's metadata, permissions, and behavior.
2. **content.js**: The main script that runs on GenSpark pages. It:
   - Detects when a user is on a GenSpark page with a table
   - Adds an "export" button next to the existing UI elements
   - Extracts table data and converts it to CSV format optimized for Excel when the button is clicked
   - Adds a BOM (Byte Order Mark) for proper character encoding in Excel
   - Creates a download link for the CSV file
3. **background.js**: A simple background script that logs installation events and listens for messages from the content script.
4. **build.js**: A Node.js script that copies the necessary files to the dist directory for distribution.
5. **build.bat**: A Windows batch file that runs the build script and handles dependencies.

### How It Works

1. When a user navigates to a GenSpark page (URL containing "https://www.genspark.ai/agents?"), the content script is automatically injected into the page.
2. The content script checks for the presence of a table and the target element where the export button will be added.
3. If both elements are found, the script adds an "export" button next to the existing UI elements.
4. When the user clicks the button, the script:
   - Extracts the headers from the table
   - Extracts the data from each row
   - Formats the data as CSV with proper quoting for Excel compatibility
   - Adds a BOM (Byte Order Mark) for proper character encoding in Excel
   - Creates a Blob with the CSV content
   - Creates a download link and triggers the download

### Technical Decisions

1. **Content Script Approach**: We use a content script rather than a browser action because we want the functionality to be automatically available on GenSpark pages without requiring the user to click an extension icon.
2. **CSS Matching**: We use CSS selectors to find the target elements in the GenSpark UI. This approach is more resilient to minor UI changes than using fixed coordinates or DOM traversal.
3. **Periodic Checking**: The content script periodically checks for the table element to handle dynamically loaded content and single-page application navigation.
4. **CSV Formatting**: We properly escape and quote all CSV fields to handle special characters and ensure Excel compatibility. We also add a BOM (Byte Order Mark) to ensure proper character encoding in Excel.
5. **Node.js Build Process**: We use Node.js for the build process to make it easy to add more complex build steps in the future if needed.

## Testing

The extension includes a test page that simulates the GenSpark UI structure. This allows developers to test the extension locally without having to access the actual GenSpark website. See the test/README.md file for instructions on how to use the test page.

## Future Enhancements

Possible future enhancements to consider:

1. **Options Page**: Add an options page to allow users to customize the export format, filename, etc.
2. **Multiple Table Support**: Enhance the extension to handle multiple tables on the same page.
3. **Localization**: Add support for multiple languages.
4. **UI Customization**: Allow users to customize the appearance of the export button.
5. **Direct XLSX Export**: Add support for exporting directly to XLSX format in addition to Excel-compatible CSV.

## Conclusion

This Chrome extension provides a simple and effective way to export table data from the GenSpark AI application to CSV format optimized for Excel compatibility. It's designed to be unobtrusive, easy to use, and resilient to minor UI changes in the GenSpark application.
