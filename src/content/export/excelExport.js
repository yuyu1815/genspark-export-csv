/**
 * GenSpark Export - Excel Export
 * This file contains functions for exporting data to Excel format
 */

const XlsxPopulate = require('xlsx-populate');
const config = require('../../common/config');
const {extractTableData, triggerDownload} = require('../utils/tableUtils');

// Function to export data from all tabs to Excel format
async function exportAllTabsToExcel(tableElement) {
    // Find all tabs
    const tabs = document.querySelectorAll(config.tabSelector);
    if (!tabs || tabs.length === 0) {
        console.log('GenSpark Export: No tabs found');
        // If no tabs found, just export the current table as CSV
        const {exportTableToCSV} = require('./csvExport');
        exportTableToCSV(tableElement);
        return;
    }

    console.log(`GenSpark Export: Found ${tabs.length} tabs for Excel export`);

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

        console.log(`GenSpark Export: Processing tab "${tabName}" (${i + 1}/${tabs.length}) for Excel`);

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
            console.log(`GenSpark Export: Successfully extracted data from tab "${tabName}" for Excel`);
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

    // Create Excel file with tab separation
    if (allTabsData.length > 0) {
        console.log(`GenSpark Export: Creating Excel file with ${allTabsData.length} tabs`);
        downloadExcelCompatibleCSV(allTabsData);
    } else {
        console.log('GenSpark Export: No data found in any tab for Excel export');
    }
}

// Function to create a proper Excel file using xlsx-populate
async function downloadExcelCompatibleCSV(allTabsData) {
    try {
        console.log('GenSpark Export: Creating Excel file with xlsx-populate');

        // Create a new workbook
        const workbook = await XlsxPopulate.fromBlankAsync();

        // 各タブのデータを個別のシートとして処理
        allTabsData.forEach((tabData, index) => {
            // Create a sheet for this tab (use the tab name or a default name)
            const sheetName = tabData.tabName.replace(/[\[\]\\\/\?\*:]/g, '') || `Sheet${index + 1}`;

            // Get or add the sheet (use Sheet1 for the first tab, add new sheets for others)
            const sheet = index === 0 ?
                workbook.sheet(0).name(sheetName) :
                workbook.addSheet(sheetName);

            // Add headers to the first row
            tabData.headers.forEach((header, colIndex) => {
                sheet.cell(1, colIndex + 1).value(header);
            });

            // Add data rows
            tabData.rows.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    sheet.cell(rowIndex + 2, colIndex + 1).value(cell);
                });
            });
        });

        // Generate the Excel file as a blob
        const blob = await workbook.outputAsync();

        // Create a URL for the blob and trigger download
        triggerDownload(blob, config.excelFileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        console.log('GenSpark Export: Excel file created successfully');
    } catch (error) {
        console.error('GenSpark Export: Error creating Excel file:', error);

        // Fallback to the old CSV method if xlsx-populate fails
        alert('Error creating Excel file. Please try again or use the CSV export option.');
    }
}

module.exports = {
    exportAllTabsToExcel
};