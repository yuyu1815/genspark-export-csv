/**
 * GenSpark Export - Table Utilities
 * This file contains utility functions for working with tables
 */

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

    return {headers, rows};
}

// Function to trigger a download with a blob
function triggerDownload(content, filename, contentType) {
    const blob = new Blob([content], {type: contentType});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Release resources
}

module.exports = {
    extractTableData,
    triggerDownload
};