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
        excelFileName: 'genspark_export.xlsx',
        selectionMenuSelector: '.selection-operation-menu', // Selector for the selection menu
        copyButtonText: 'セルをコピー', // Text for the copy button
        cellSeparator: ' ' // Default separator for cells when copying
    };

    // Load user preferences from storage
    chrome.storage.sync.get({ cellSeparator: ' ' }, function(items) {
        config.cellSeparator = items.cellSeparator;
        console.log('GenSpark Export: Loaded cell separator from storage:', config.cellSeparator);
    });

    // Load CSS from external file
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chrome.runtime.getURL('content.css');
    document.head.appendChild(link);

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

    // Function to add a copy button to the selection menu
    function addCopyButtonToSelectionMenu(selectionMenu) {
        // Check if the copy button already exists in this menu
        if (selectionMenu.querySelector('.copy-cell-button')) {
            return;
        }

        // Create the copy button
        const copyButton = document.createElement('div');
        copyButton.className = 'button copy-cell-button';
        copyButton.setAttribute('data-v-555ccef1', '');
        copyButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.3332 6H7.33317C6.59679 6 5.99984 6.59695 5.99984 7.33333V13.3333C5.99984 14.0697 6.59679 14.6667 7.33317 14.6667H13.3332C14.0696 14.6667 14.6665 14.0697 14.6665 13.3333V7.33333C14.6665 6.59695 14.0696 6 13.3332 6Z" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M3.33317 10.0003H2.6665C2.31288 10.0003 1.97374 9.85981 1.72369 9.60976C1.47365 9.35971 1.33317 9.02057 1.33317 8.66695V2.66695C1.33317 2.31333 1.47365 1.97419 1.72369 1.72414C1.97374 1.47409 2.31288 1.33362 2.6665 1.33362H8.6665C9.02012 1.33362 9.35926 1.47409 9.60931 1.72414C9.85936 1.97419 9.99984 2.31333 9.99984 2.66695V3.33362" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            ${config.copyButtonText}
        `;

        // Add click event listener for the copy button
        copyButton.addEventListener('click', function(event) {
            // Prevent the default action and stop event propagation
            event.preventDefault();
            event.stopPropagation();

            // Find all selected cells
            const selectedCells = document.querySelectorAll('td.selected');
            if (selectedCells && selectedCells.length > 0) {
                // Get the text content of all selected cells
                let cellText = '';

                // Create a map to organize cells by their row
                const rowMap = new Map();

                // Group cells by their parent row
                selectedCells.forEach(cell => {
                    const row = cell.parentElement;
                    if (!rowMap.has(row)) {
                        rowMap.set(row, []);
                    }
                    rowMap.get(row).push(cell.textContent.trim());
                });

                // Convert the map to an array of rows
                const rows = Array.from(rowMap.entries()).map(([_, cells]) => cells.join(config.cellSeparator));

                // Join rows with newlines
                cellText = rows.join('\n');

                // Log the selection details for debugging
                console.log(`GenSpark Export: Found ${selectedCells.length} selected cells in ${rowMap.size} rows`);
                console.log('GenSpark Export: Formatted text to copy:', cellText);

                // Copy the text to clipboard
                navigator.clipboard.writeText(cellText)
                    .then(() => {
                        console.log('GenSpark Export: Cell content copied to clipboard successfully');

                        // Optional: Show a brief success message
                        copyButton.textContent = 'コピーしました!';
                        setTimeout(() => {
                            // Ensure the data-v-555ccef1 attribute is preserved
                            copyButton.innerHTML = `
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.3332 6H7.33317C6.59679 6 5.99984 6.59695 5.99984 7.33333V13.3333C5.99984 14.0697 6.59679 14.6667 7.33317 14.6667H13.3332C14.0696 14.6667 14.6665 14.0697 14.6665 13.3333V7.33333C14.6665 6.59695 14.0696 6 13.3332 6Z" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M3.33317 10.0003H2.6665C2.31288 10.0003 1.97374 9.85981 1.72369 9.60976C1.47365 9.35971 1.33317 9.02057 1.33317 8.66695V2.66695C1.33317 2.31333 1.47365 1.97419 1.72369 1.72414C1.97374 1.47409 2.31288 1.33362 2.6665 1.33362H8.6665C9.02012 1.33362 9.35926 1.47409 9.60931 1.72414C9.85936 1.97419 9.99984 2.31333 9.99984 2.66695V3.33362" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                                ${config.copyButtonText}
                            `;
                            // Ensure the data-v-555ccef1 attribute is set
                            copyButton.setAttribute('data-v-555ccef1', '');
                        }, 1500);
                    })
                    .catch(err => {
                        console.error('GenSpark Export: Could not copy text:', err);
                    });
            } else {
                console.log('GenSpark Export: No selected cell found');
            }
        });

        // Add the copy button to the selection menu
        selectionMenu.appendChild(copyButton);
    }

    // Set up a mutation observer to detect when the selection menu is added to the DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Check if the added node is the selection menu
                        if (node.classList && node.classList.contains('selection-operation-menu')) {
                            console.log('GenSpark Export: Selection menu detected');
                            addCopyButtonToSelectionMenu(node);
                        }

                        // Also check for selection menu within the added node
                        const selectionMenus = node.querySelectorAll(config.selectionMenuSelector);
                        selectionMenus.forEach(function(menu) {
                            console.log('GenSpark Export: Selection menu detected within added node');
                            addCopyButtonToSelectionMenu(menu);
                        });
                    }
                });
            }
        });
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
})();
