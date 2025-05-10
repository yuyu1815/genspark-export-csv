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
        'icons/icon128.png'
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

        // For icon files, create a placeholder if they don't exist
        if (file.startsWith('icons/icon') && file.endsWith('.png')) {
            console.log(`Creating placeholder for ${file}...`);
            createPlaceholderIcon(distPath);
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

console.log('Build completed successfully!');
console.log(`Extension files are in the ${config.distDir} directory.`);
console.log('To install the extension in Chrome:');
console.log('1. Open chrome://extensions/');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked" and select the dist directory');
