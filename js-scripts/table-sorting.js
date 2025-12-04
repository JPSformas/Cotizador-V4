// Table sorting functionality
document.addEventListener('DOMContentLoaded', function() {
    const sortableHeaders = document.querySelectorAll('.sortable-header');
    const tableBody = document.querySelector('.table tbody');
    
    if (!tableBody || sortableHeaders.length === 0) {
        return;
    }
    
    let currentSort = {
        column: null,
        direction: null // 'asc' or 'desc'
    };
    
    // Helper function to parse currency value to number
    function parseCurrency(value) {
        // Remove currency symbols, spaces, and dots (thousand separators)
        // Keep comma as decimal separator
        const cleaned = value.replace(/[$\s\.]/g, '').replace(',', '.');
        return parseFloat(cleaned) || 0;
    }
    
    // Helper function to get the highest subtotal from an item row
    function getHighestSubtotal(row) {
        const subtotalTags = row.querySelectorAll('.productSubtotal .subtotal-tag');
        if (subtotalTags.length === 0) {
            return 0;
        }
        
        let maxValue = 0;
        subtotalTags.forEach(tag => {
            const value = parseCurrency(tag.textContent.trim());
            if (value > maxValue) {
                maxValue = value;
            }
        });
        
        return maxValue;
    }
    
    // Helper function to get the lowest subtotal from an item row
    function getLowestSubtotal(row) {
        const subtotalTags = row.querySelectorAll('.productSubtotal .subtotal-tag');
        if (subtotalTags.length === 0) {
            return 0;
        }
        
        let minValue = Infinity;
        subtotalTags.forEach(tag => {
            const value = parseCurrency(tag.textContent.trim());
            if (value < minValue) {
                minValue = value;
            }
        });
        
        return minValue === Infinity ? 0 : minValue;
    }
    
    // Sort function
    function sortTable(column, direction) {
        const rows = Array.from(tableBody.querySelectorAll('tr.item-container'));
        
        rows.sort((a, b) => {
            let aValue, bValue;
            
            if (column === 'nombre') {
                // Sort alphabetically by product name
                const aName = a.querySelector('.product-name-main')?.textContent.trim() || '';
                const bName = b.querySelector('.product-name-main')?.textContent.trim() || '';
                aValue = aName.toLowerCase();
                bValue = bName.toLowerCase();
            } else if (column === 'subtotal') {
                // Sort by highest or lowest subtotal based on direction
                if (direction === 'asc') {
                    // Ascending = lowest first
                    aValue = getLowestSubtotal(a);
                    bValue = getLowestSubtotal(b);
                } else {
                    // Descending = highest first
                    aValue = getHighestSubtotal(a);
                    bValue = getHighestSubtotal(b);
                }
            }
            
            // Compare values
            if (column === 'nombre') {
                // String comparison
                if (aValue < bValue) return direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return direction === 'asc' ? 1 : -1;
                return 0;
            } else {
                // Numeric comparison
                if (aValue < bValue) return direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return direction === 'asc' ? 1 : -1;
                return 0;
            }
        });
        
        // Clear table body
        tableBody.innerHTML = '';
        
        // Append sorted rows
        rows.forEach(row => {
            tableBody.appendChild(row);
        });
    }
    
    // Add click event listeners to sortable headers
    sortableHeaders.forEach(header => {
        const sortIcon = header.querySelector('.sort-icon');
        
        header.addEventListener('click', function() {
            const sortType = this.getAttribute('data-sort');
            
            // Remove sort classes and reset icons from all headers
            sortableHeaders.forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
                const icon = h.querySelector('.sort-icon');
                if (icon) {
                    icon.className = 'fas fa-sort sort-icon';
                }
            });
            
            // Determine sort direction
            if (currentSort.column === sortType) {
                // Toggle direction if clicking the same column
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                // Default to ascending for new column
                currentSort.direction = 'asc';
            }
            
            currentSort.column = sortType;
            
            // Add sort class to current header
            this.classList.add(`sort-${currentSort.direction}`);
            
            // Update icon based on sort direction
            if (sortIcon) {
                if (currentSort.direction === 'asc') {
                    sortIcon.className = 'fas fa-sort-up sort-icon';
                } else {
                    sortIcon.className = 'fas fa-sort-down sort-icon';
                }
            }
            
            // Sort the table
            sortTable(sortType, currentSort.direction);
        });
    });
});

