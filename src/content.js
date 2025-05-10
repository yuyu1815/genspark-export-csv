/**
 * GenSpark Export - Content Script
 * This script runs on GenSpark pages and adds export functionality
 */

// Import xlsx-populate
const XlsxPopulate = require('xlsx-populate');

(function() {
    'use strict';

    // Configuration
    const config = {
        buttonText: 'CSV/Excel',
        buttonClass: 'genspark-export-csv-button',
        excelButtonText: 'Excel with Tabs',
        excelButtonClass: 'genspark-export-excel-button',
        targetSelector: '.present-and-export, .flex.flex-row.items-center.ml-\\[16px\\].flex-shrink-0', // The element where we'll add our button
        tableSelector: '.dataset-table-container table', // The table we want to export
        tabSelector: '.sheets-bar-item', // Selector for tabs
        activeTabClass: 'active', // Class for the active tab
        fileName: 'genspark_export.csv',
        excelFileName: 'genspark_export.xlsx'
    };

    // Add CSS styling for the present-and-export element and our buttons
    const style = document.createElement('style');
    style.textContent = `
    .present-and-export[data-v-1803aa4e] {
        align-items: center;
        background-color: #fff;
        border: 1px solid #eaeaea;
        border-radius: 16px;
        cursor: pointer;
        display: flex;
        flex-shrink: 0;
        gap: 4px;
        height: 32px;
        justify-content: center;
        margin-left: 16px;
        padding: 0 16px;
        transition: all .3s ease;
        width: -moz-fit-content;
        width: fit-content;
    }
    .genspark-buttons-container {
        display: flex;
        justify-content: flex-end;
        margin-left: auto;
    }
    .button.genspark-export-csv-button,
    .button.genspark-export-excel-button {
        align-items: center;
        background-color: #fff;
        border: 1px solid #eaeaea;
        border-radius: 16px;
        color: #000;
        cursor: pointer;
        display: flex;
        flex-shrink: 0;
        gap: 4px;
        height: 32px;
        justify-content: center;
        margin-left: 16px;
        padding: 0 16px;
        transition: all .3s ease;
        width: -moz-fit-content;
        width: fit-content;
    }
    .present-and-export-text {
        color: #000;
    }
    .button.genspark-export-excel-button {
        background-color: #e6f7e6;
    }
    `;
    document.head.appendChild(style);

    // Check if we're on a GenSpark page with a table
    function checkForTable() {
        // Special case for www.genspark.ai/agents? URL
        if (window.location.href.includes('www.genspark.ai/agents')) {
            const topElement = document.querySelector('div.top');
            const tableElement = document.querySelector(config.tableSelector);

            if (topElement && tableElement) {
                console.log('GenSpark Export: Found table and top element for agents page');
                addExportButtons(topElement, tableElement, true);
            } else {
                // If elements aren't found, try again after a short delay
                setTimeout(checkForTable, 1000);
            }
        } else {
            // Original behavior for other URLs
            const targetElement = document.querySelector(config.targetSelector);
            const tableElement = document.querySelector(config.tableSelector);

            if (targetElement && tableElement) {
                console.log('GenSpark Export: Found table and target element');
                addExportButtons(targetElement, tableElement, false);
            } else {
                // If elements aren't found, try again after a short delay
                setTimeout(checkForTable, 1000);
            }
        }
    }

    // Add the export buttons to the page
    function addExportButtons(targetElement, tableElement, isAgentsPage) {
        // Check if buttons already exist
        if (document.querySelector('.' + config.buttonClass)) {
            return;
        }

        // Create the CSV button
        const csvButton = document.createElement('div');
        csvButton.className = 'button ' + config.buttonClass;
        csvButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 13.1111V15.4444C17 15.857 16.8361 16.2527 16.5444 16.5444C16.2527 16.8361 15.857 17 15.4444 17H4.55556C4.143 17 3.74733 16.8361 3.45561 16.5444C3.16389 16.2527 3 15.857 3 15.4444V4.55556C3 4.143 3.16389 3.74733 3.45561 3.45561C3.74733 3.16389 4.143 3 4.55556 3H6.88889" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                <path d="M8 8L10 10L12 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M10 3V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <div class="present-and-export-text">${config.buttonText}</div>
        `;

        // Add click event listener for CSV button
        csvButton.addEventListener('click', function() {
            exportAllTabsToCSV(tableElement);
        });

        // Create the Excel button
        const excelButton = document.createElement('div');
        excelButton.className = 'button ' + config.excelButtonClass;
        excelButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 13.1111V15.4444C17 15.857 16.8361 16.2527 16.5444 16.5444C16.2527 16.8361 15.857 17 15.4444 17H4.55556C4.143 17 3.74733 16.8361 3.45561 16.5444C3.16389 16.2527 3 15.857 3 15.4444V4.55556C3 4.143 3.16389 3.74733 3.45561 3.45561C3.74733 3.16389 4.143 3 4.55556 3H6.88889" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                <path d="M8 8L10 10L12 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M10 3V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <div class="present-and-export-text">${config.excelButtonText}</div>
        `;

        // Add click event listener for Excel button
        excelButton.addEventListener('click', function() {
            exportAllTabsToExcel(tableElement);
        });

        if (isAgentsPage) {
            // For agents page, add buttons directly to the div.top element
            targetElement.appendChild(csvButton);
            targetElement.appendChild(excelButton);
        } else {
            // For other pages, use the container approach
            // Create a container for the buttons
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'genspark-buttons-container';

            // Add the buttons to the container
            buttonsContainer.appendChild(csvButton);
            buttonsContainer.appendChild(excelButton);

            // Add the container to the target element's parent
            targetElement.parentNode.appendChild(buttonsContainer);
        }
    }

    // Function to export data from all tabs
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
            const tabName = tab.querySelector('.sheets-bar-item-name')?.textContent.trim() || `Tab ${i+1}`;

            console.log(`GenSpark Export: Processing tab "${tabName}" (${i+1}/${tabs.length})`);

            // If this tab is not active, click it
            if (!tab.classList.contains(config.activeTabClass)) {
                console.log(`GenSpark Export: Clicking on tab "${tabName}"`);

                // Use a more direct approach to trigger the click
                try {
                    tab.dispatchEvent(new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    }));

                    // Wait for the table to update - longer wait time to ensure content loads
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // Verify the tab was actually activated
                    if (!tab.classList.contains(config.activeTabClass)) {
                        console.log(`GenSpark Export: Tab "${tabName}" was not activated, trying again`);
                        tab.click(); // Try a direct click as fallback
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                } catch (error) {
                    console.error(`GenSpark Export: Error clicking tab "${tabName}":`, error);
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

    // Extract data from a table
    function extractTableData(tableElement) {
        // Get table headers
        const headers = [];
        const headerCells = tableElement.querySelectorAll('thead th');

        if (!headerCells || headerCells.length <= 1) {
            console.log('GenSpark Export: No headers found in table');
            return null;
        }

        // Skip the first header (index column)
        for (let i = 1; i < headerCells.length; i++) {
            const headerText = headerCells[i].textContent.trim();
            headers.push(headerText);
        }

        // Get table rows
        const rows = [];
        const tableRows = tableElement.querySelectorAll('tbody tr');

        tableRows.forEach(row => {
            const rowData = [];
            const cells = row.querySelectorAll('td');

            // Skip the first cell (index column)
            for (let i = 1; i < cells.length; i++) {
                const cellText = cells[i].textContent.trim();
                rowData.push(cellText);
            }

            rows.push(rowData);
        });

        return { headers, rows };
    }

    // Combine data from all tabs and download as CSV
    function downloadCombinedCSV(allTabsData) {
        // Add BOM (Byte Order Mark) for Excel compatibility with UTF-8
        const BOM = '\uFEFF';
        let csvContent = BOM;

        // Process each tab's data
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

        // Create a Blob with the CSV content
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        // Create a link to download the CSV file
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', config.fileName);
        link.style.display = 'none';

        // Add the link to the page, click it, and remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

        // Create a Blob with the CSV content
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        // Create a link to download the CSV file
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', config.fileName);
        link.style.display = 'none';

        // Add the link to the page, click it, and remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Start checking for the table when the page loads
    window.addEventListener('load', checkForTable);

    // Also check when the DOM content is loaded (for faster response)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkForTable);
    } else {
        checkForTable();
    }

    // Check again when the page is fully loaded
    window.addEventListener('load', checkForTable);

    // Function to export data from all tabs to Excel format
    async function exportAllTabsToExcel(tableElement) {
        // Find all tabs
        const tabs = document.querySelectorAll(config.tabSelector);
        if (!tabs || tabs.length === 0) {
            console.log('GenSpark Export: No tabs found');
            // If no tabs found, just export the current table
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
            const tabName = tab.querySelector('.sheets-bar-item-name')?.textContent.trim() || `Tab ${i+1}`;

            console.log(`GenSpark Export: Processing tab "${tabName}" (${i+1}/${tabs.length}) for Excel`);

            // If this tab is not active, click it
            if (!tab.classList.contains(config.activeTabClass)) {
                console.log(`GenSpark Export: Clicking on tab "${tabName}"`);

                // Use a more direct approach to trigger the click
                try {
                    tab.dispatchEvent(new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    }));

                    // Wait for the table to update - longer wait time to ensure content loads
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // Verify the tab was actually activated
                    if (!tab.classList.contains(config.activeTabClass)) {
                        console.log(`GenSpark Export: Tab "${tabName}" was not activated, trying again`);
                        tab.click(); // Try a direct click as fallback
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                } catch (error) {
                    console.error(`GenSpark Export: Error clicking tab "${tabName}":`, error);
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

        // Create Excel-compatible CSV with tab separation
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

            // Process each tab's data as a separate sheet
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

            // Create a URL for the blob
            const url = URL.createObjectURL(blob);

            // Create a link to download the Excel file
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', config.excelFileName);
            link.style.display = 'none';

            // Add the link to the page, click it, and remove it
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('GenSpark Export: Excel file created successfully');
        } catch (error) {
            console.error('GenSpark Export: Error creating Excel file:', error);

            // Fallback to the old CSV method if xlsx-populate fails
            alert('Error creating Excel file. Please try again or use the CSV export option.');
        }
    }

    // Also check periodically for dynamically loaded content
    setInterval(checkForTable, 2000);
})();
