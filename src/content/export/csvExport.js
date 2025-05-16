/**
 * GenSpark Export - CSV Export
 * This file contains functions for exporting data to CSV format
 */

const config = require('../../common/config');
const {extractTableData, triggerDownload} = require('../utils/tableUtils');

// Function to export data from all tabs to CSV
async function exportAllTabsToCSV(tableElement) {
    // Find all tabs
    const tabs = document.querySelectorAll(config.tabSelector);
    if (!tabs || tabs.length === 0) {
        console.log('GenSpark Export: No tabs found');
        // If no tabs found, just export the current table
        exportTableToCSV(tableElement);
        return;
    }

    console.log(`GenSpark Export: Found ${tabs.length} tabs`);

    // Store data from all tabs
    const allTabsData = [];

    // Remember which tab was originally active
    const originalActiveTab = document.querySelector(config.tabSelector + '.' + config.activeTabClass);
    let originalActiveTabIndex = -1;

    // Find the index of the original active tab
    for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].classList.contains(config.activeTabClass)) {
            originalActiveTabIndex = i;
            break;
        }
    }

    console.log(`GenSpark Export: Original active tab index: ${originalActiveTabIndex}`);

    // Process each tab
    for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        const tabName = tab.querySelector('.sheets-bar-item-name')?.textContent.trim() || `Tab ${i + 1}`;

        console.log(`GenSpark Export: Processing tab "${tabName}" (${i + 1}/${tabs.length})`);

        // If this tab is not active, click it
        if (!tab.classList.contains(config.activeTabClass)) {
            console.log(`GenSpark Export: Clicking on tab "${tabName}"`);

            // Use a more direct approach to trigger the click
            try {
                // First attempt: Use MouseEvent
                tab.dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                }));

                // Wait for the table to update - longer wait time to ensure content loads
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Verify the tab was actually activated
                if (!tab.classList.contains(config.activeTabClass)) {
                    console.log(`GenSpark Export: Tab "${tabName}" was not activated, trying direct click`);

                    // Second attempt: Try a direct click as fallback
                    tab.click();
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // If tab is still not active, try one more time with a longer wait
                    if (!tab.classList.contains(config.activeTabClass)) {
                        console.log(`GenSpark Export: Tab "${tabName}" still not activated, trying one more time`);

                        // Third attempt: Try clicking again with a longer wait
                        tab.click();
                        await new Promise(resolve => setTimeout(resolve, 3000));

                        // If tab is still not active after three attempts, log an error and continue
                        if (!tab.classList.contains(config.activeTabClass)) {
                            console.error(`GenSpark Export: Tab "${tabName}" could not be activated after multiple attempts. Skipping this tab.`);
                            continue; // Skip to the next tab
                        }
                    }
                }

                console.log(`GenSpark Export: Successfully activated tab "${tabName}"`);
            } catch (error) {
                console.error(`GenSpark Export: Error clicking tab "${tabName}":`, error);
                console.log(`GenSpark Export: Skipping tab "${tabName}" due to error`);
                continue; // Skip to the next tab
            }
        }

        // Get the current table
        const currentTable = document.querySelector(config.tableSelector);
        if (!currentTable) {
            console.log(`GenSpark Export: No table found in tab "${tabName}"`);
            continue;
        }

        // Extract data from this tab
        const tabData = extractTableData(currentTable);
        if (tabData) {
            tabData.tabName = tabName;
            allTabsData.push(tabData);
            console.log(`GenSpark Export: Successfully extracted data from tab "${tabName}"`);
        } else {
            console.log(`GenSpark Export: No data extracted from tab "${tabName}"`);
        }
    }

    // Restore the original active tab
    if (originalActiveTabIndex >= 0 && originalActiveTabIndex < tabs.length) {
        const tabToRestore = tabs[originalActiveTabIndex];
        if (!tabToRestore.classList.contains(config.activeTabClass)) {
            console.log(`GenSpark Export: Restoring original active tab`);
            tabToRestore.click();
            // Wait for the tab to be restored
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // Combine data from all tabs and download
    if (allTabsData.length > 0) {
        console.log(`GenSpark Export: Downloading data from ${allTabsData.length} tabs`);
        downloadCombinedCSV(allTabsData);
    } else {
        console.log('GenSpark Export: No data found in any tab');
    }
}

// Combine data from all tabs and download as CSV
function downloadCombinedCSV(allTabsData) {
    // Add BOM (Byte Order Mark) for Excel compatibility with UTF-8
    const BOM = '\uFEFF';
    let csvContent = BOM;

    // 各タブのデータを処理
    allTabsData.forEach((tabData, index) => {
        // Add tab name as a header
        csvContent += `"Tab: ${tabData.tabName.replace(/"/g, '""')}"\n`;

        // Add headers
        const headerRow = tabData.headers.map(header => `"${header.replace(/"/g, '""')}"`).join(',');
        csvContent += headerRow + '\n';

        // Add rows
        tabData.rows.forEach(row => {
            const formattedRow = row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',');
            csvContent += formattedRow + '\n';
        });

        // Add a blank line between tabs (except after the last tab)
        if (index < allTabsData.length - 1) {
            csvContent += '\n';
        }
    });

    // Create a Blob with the CSV content and trigger download
    triggerDownload(csvContent, config.fileName, 'text/csv;charset=utf-8;');
}

// Original export function (for backward compatibility)
function exportTableToCSV(tableElement) {
    const tabData = extractTableData(tableElement);
    if (!tabData) {
        console.log('GenSpark Export: No data found in table');
        return;
    }

    // Combine headers and rows into CSV content
    let csvContent = tabData.headers.map(header => `"${header.replace(/"/g, '""')}"`).join(',') + '\n';
    tabData.rows.forEach(row => {
        const formattedRow = row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',');
        csvContent += formattedRow + '\n';
    });

    // Add BOM (Byte Order Mark) for Excel compatibility with UTF-8
    const BOM = '\uFEFF';
    csvContent = BOM + csvContent;

    // Create a Blob with the CSV content and trigger download
    triggerDownload(csvContent, config.fileName, 'text/csv;charset=utf-8;');
}

module.exports = {
    exportAllTabsToCSV,
    exportTableToCSV
};