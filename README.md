# GenSpark Export Chrome Extension

## Overview
This Chrome extension adds export functionality to the GenSpark AI application. It allows users to export table data from the GenSpark platform to CSV format (compatible with Excel) with a single click.

## Features
- Automatically detects GenSpark pages (URLs containing "https://www.genspark.ai/agents?")
- Adds two export buttons to the table view:
  - "Export to CSV/Excel" - exports all tabs to a single CSV file
  - "Export to Excel with Tabs" - exports each tab as a separate sheet in a proper Excel file
- Supports multiple tabs - exports data from all available tabs
- Exports table data in CSV format optimized for Excel compatibility
- Includes UTF-8 BOM (Byte Order Mark) for proper character encoding in Excel
- Excel export using xlsx-populate library for proper Excel file generation
- Each tab's data is exported as a separate sheet in the Excel file
- Adds a "セルをコピー" (Copy cell) button to the selection menu that appears when clicking on a table cell
- Allows users to quickly copy the content of a selected cell to the clipboard
- Provides a settings popup to customize the separator character used when copying multiple cells (space, pipe, comma, etc.)
- Simple and intuitive user interface

## Requirements
- Google Chrome browser
- GenSpark account with access to the agents page

## Installation
1. Clone this repository
2. Run the build script: `build.bat`
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" (toggle in the top-right corner)
5. Click "Load unpacked" and select the `dist` directory created by the build script
6. The extension is now installed and ready to use

## Usage
1. Navigate to any GenSpark page containing a data table (URL must include "https://www.genspark.ai/agents?")
2. The extension will automatically add two export buttons to the table view:
   - "Export to CSV/Excel"
   - "Export to Excel with Tabs"
3. Choose the export option that best suits your needs:
   - **Export to CSV/Excel**: Click this button to download all table data as a single CSV file
     - If multiple tabs are present, all tabs' data will be combined into one CSV file with clear tab separation
     - This is ideal for simple viewing or when you want all data in a single sheet
   - **Export to Excel with Tabs**: Click this button to download data as a proper Excel file (.xlsx)
     - Each tab's data will be exported as a separate sheet in the Excel file
     - The Excel file is generated using the xlsx-populate library for maximum compatibility
     - When opened in Excel, each tab will appear as a separate worksheet
     - This is ideal for complex data analysis or when you need to work with each tab separately
4. For both export options, the extension will:
   - Automatically detect all available tabs
   - Switch to each tab to collect its data
   - Return to the originally active tab after export is complete
5. To copy cell content:
   - Click on a cell or select multiple cells in the table
   - Click the "セルをコピー" (Copy cell) button in the popup menu
   - The content will be copied to your clipboard
6. To customize the cell separator:
   - Click on the extension icon in the Chrome toolbar
   - In the popup, enter your preferred separator character (e.g., "|", ",", or "tab")
   - Click "保存" (Save) to apply the changes
   - Leave the field empty to use the default space separator
   - Your preference will be saved and used for all future cell copying operations

## Development
This extension is built using:
- JavaScript
- Chrome Extension API
- Node.js for build process
- webpack for bundling
- xlsx-populate for Excel file generation

## Project Structure
- `src/`: Source code
  - `manifest.json`: Extension configuration
  - `content.js`: Content script that runs on GenSpark pages
  - `background.js`: Background script for the extension
  - `popup.html`: Settings popup HTML
  - `popup.css`: Styles for the settings popup
  - `popup.js`: JavaScript for the settings popup
  - `content.css`: Styles for the content script
  - `icons/`: Extension icons
- `build.bat`: Build script to package the extension
- `build.js`: Node.js build script
- `webpack.config.js`: Webpack configuration
- `dist/`: Output directory for the built extension (created by build script)

## Build Process
1. Install dependencies: `npm install`
2. Run the build script: `npm run build`
   - This will run webpack to bundle the JavaScript files with dependencies
   - Then it will copy the manifest.json and icons to the dist directory
3. The extension files will be in the `dist` directory
4. Load the extension in Chrome as described in the Installation section

## License
See the LICENSE file for details.
