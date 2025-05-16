/**
 * Build script for GenSpark Export Chrome Extension
 * This script copies necessary files to the dist directory
 * Note: content.js and background.js are now bundled by webpack
 */

const fs = require('fs-extra');
const path = require('path');

// Configuration
const config = {
    srcDir: 'src',
    distDir: 'dist',
    filesToCopy: [
        'manifest.json',
        'icons/icon16.png',
        'icons/icon48.png',
        'icons/icon128.png',
        'content/index.css',
        'popup/index.html',
        'popup/index.css',
        'popup/index.js'
        // Files below are now bundled by webpack and should not be copied directly
        // 'background/index.js',
        // 'content/index.js',
        // 'content/ui.js',
        // 'content/utils/tableUtils.js',
        // 'content/export/csvExport.js',
        // 'content/export/excelExport.js',
        // 'content/export/markdownExport.js',
        // 'content/copy/cellCopy.js',
        // 'common/config.js'
    ]
};

// Create dist directory if it doesn't exist
console.log(`Creating ${config.distDir} directory...`);
fs.ensureDirSync(config.distDir);

// Copy files
console.log('Copying files...');
config.filesToCopy.forEach(file => {
    const srcPath = path.join(config.srcDir, file);
    const distPath = path.join(config.distDir, file);

    // Check if source file exists
    if (fs.existsSync(srcPath)) {
        // Create directory if needed
        const distDir = path.dirname(distPath);
        fs.ensureDirSync(distDir);

        // Copy file
        fs.copySync(srcPath, distPath);
        console.log(`Copied: ${file}`);
    } else {
        console.warn(`Warning: ${srcPath} does not exist. Skipping.`);

        // For icon files, create a placeholder if they don't exist, but only in development mode
        if (process.env.NODE_ENV !== 'production' && file.startsWith('icons/icon') && file.endsWith('.png')) {
            console.log(`Creating placeholder for ${file}...`);
            createPlaceholderIcon(distPath);
        } else if (process.env.NODE_ENV === 'production' && file.startsWith('icons/icon') && file.endsWith('.png')) {
            console.warn(`Warning: Missing icon file ${file} in production build. 
            Please add the icon file to the src/icons directory before building for production.
            Chrome extensions require icons to be properly displayed in the browser.
            You can create your own icon or use a placeholder during development.`);

            // Create a default icon instead of exiting
            console.log(`Creating default icon for ${file} to allow build to continue...`);
            createDefaultIcon(distPath);
        }
    }
});

// Create placeholder icons if needed
function createPlaceholderIcon(filePath) {
    // Ensure the directory exists
    const dir = path.dirname(filePath);
    fs.ensureDirSync(dir);

    // Create a simple text file as a placeholder
    fs.writeFileSync(
        filePath + '.txt', 
        'This is a placeholder for the icon file.\n' +
        'Please replace with an actual PNG image file.\n' +
        'See src/icons/README.md for instructions.'
    );
    console.log(`Created placeholder: ${filePath}.txt`);
}

// Create a default icon for production builds when icon is missing
function createDefaultIcon(filePath) {
    // Ensure the directory exists
    const dir = path.dirname(filePath);
    fs.ensureDirSync(dir);

    try {
        // For simplicity, we'll create a very basic 1x1 transparent PNG
        // In a real-world scenario, you might want to use a proper icon generator
        // or copy a default icon from a resources directory
        const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
        fs.writeFileSync(filePath, transparentPixel);
        console.log(`Created default icon: ${filePath}`);
    } catch (error) {
        console.warn(`Failed to create default icon: ${error.message}`);
        // Even if we fail to create the icon, we'll continue the build
    }
}

console.log('Build completed successfully!');
console.log(`Extension files are in the ${config.distDir} directory.`);
console.log('To install the extension in Chrome:');
console.log('1. Open chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked" and select the dist directory');
