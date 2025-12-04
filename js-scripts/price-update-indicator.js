// Handle price update indicators when toggle is on
document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('actualizarPreciosToggle');
    const priceIndicators = document.querySelectorAll('.price-change-indicator');
    
    if (!toggle) {
        return;
    }
    
    // Format currency (Argentine format: $12.500,00)
    function formatCurrency(value) {
        return '$' + value.toLocaleString('es-AR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    }
    
    // Calculate and update price change percentage and PVP Actual
    function updatePriceIndicators() {
        const productPvps = document.querySelectorAll('.product-pvp[data-original-price]');
        
        productPvps.forEach(pvp => {
            const originalPrice = parseFloat(pvp.dataset.originalPrice) || 0;
            const currentPrice = parseFloat(pvp.dataset.currentPrice) || 0;
            const pvpActual = pvp.nextElementSibling;
            
            if (!pvpActual || !pvpActual.classList.contains('pvp-actual')) return;
            
            const indicator = pvpActual.querySelector('.price-change-indicator');
            const percentSpan = pvpActual.querySelector('.price-change-percent');
            const icon = pvpActual.querySelector('.price-change-indicator i');
            const warningIcon = pvp.querySelector('.pvp-warning-icon');
            const checkIcon = pvp.querySelector('.pvp-check-icon');
            
            if (!indicator || !percentSpan) return;
            
            // Update the actual price value
            const priceValueElement = pvpActual.querySelector('.detail-value');
            if (priceValueElement) {
                priceValueElement.textContent = formatCurrency(currentPrice);
            }
            
            // Calculate percentage change
            let percentChange = 0;
            if (originalPrice > 0) {
                percentChange = ((currentPrice - originalPrice) / originalPrice) * 100;
            }
            
            // Round to 1 decimal place
            percentChange = Math.round(percentChange * 10) / 10;
            
            // Update percentage text
            const sign = percentChange > 0 ? '+' : '';
            percentSpan.textContent = `${sign}${percentChange.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
            
            // Update icon and styling based on change
            indicator.classList.remove('price-down', 'price-up', 'price-neutral');
            
            if (percentChange < 0) {
                // Price decreased (good for buyer)
                indicator.classList.add('price-down');
                if (icon) {
                    icon.className = 'fas fa-arrow-down';
                }
            } else if (percentChange > 0) {
                // Price increased (bad for buyer)
                indicator.classList.add('price-up');
                if (icon) {
                    icon.className = 'fas fa-arrow-up';
                }
            } else {
                // No change
                indicator.classList.add('price-neutral');
                if (icon) {
                    icon.className = 'fas fa-minus';
                }
            }
        });
    }
    
    // Enable/disable refresh buttons based on toggle state
    function toggleRefreshButtons() {
        const isChecked = toggle.checked; // ON = prices updated
        const refreshButtons = document.querySelectorAll('.refresh-icon-btn, .refresh-btn-mobile');
        
        refreshButtons.forEach(button => {
            if (isChecked) {
                // Toggle ON: Disable refresh buttons
                button.disabled = true;
                button.classList.add('disabled');
            } else {
                // Toggle OFF: Enable refresh buttons
                button.disabled = false;
                button.classList.remove('disabled');
            }
        });
    }
    
    // Show/hide PVP Actual and icons based on toggle state
    function togglePvpDisplay() {
        const isChecked = toggle.checked; // ON = prices updated
        const pvpActuals = document.querySelectorAll('.pvp-actual');
        const productPvps = document.querySelectorAll('.product-pvp[data-original-price]');
        
        productPvps.forEach(pvp => {
            const originalPrice = parseFloat(pvp.dataset.originalPrice) || 0;
            const currentPrice = parseFloat(pvp.dataset.currentPrice) || 0;
            const warningIcon = pvp.querySelector('.pvp-warning-icon');
            const checkIcon = pvp.querySelector('.pvp-check-icon');
            const pvpValue = pvp.querySelector('.detail-value');
            
            // Calculate if there's a variation
            let percentChange = 0;
            if (originalPrice > 0) {
                percentChange = ((currentPrice - originalPrice) / originalPrice) * 100;
            }
            percentChange = Math.round(percentChange * 10) / 10;
            const hasVariation = percentChange !== 0;
            
            if (isChecked) {
                // Toggle ON: Show PVP with actual price and check icon
                if (pvpValue) {
                    pvpValue.textContent = formatCurrency(currentPrice);
                }
                if (warningIcon) warningIcon.style.display = 'none';
                if (checkIcon) {
                    // Always show check when toggle is ON
                    checkIcon.style.display = 'inline-block';
                }
            } else {
                // Toggle OFF: Show PVP with original price
                if (pvpValue) {
                    pvpValue.textContent = formatCurrency(originalPrice);
                }
                // Show warning icon (if variation), or check (if no variation)
                if (hasVariation) {
                    // Has variation: show warning icon
                    if (warningIcon) warningIcon.style.display = 'inline-block';
                    if (checkIcon) checkIcon.style.display = 'none';
                } else {
                    // No variation: always show check (regardless of toggle state)
                    if (warningIcon) warningIcon.style.display = 'none';
                    if (checkIcon) checkIcon.style.display = 'inline-block';
                }
            }
        });
        
        // Show/hide PVP Actual (inverted: show when toggle is OFF)
        pvpActuals.forEach(pvpActual => {
            if (isChecked) {
                pvpActual.style.display = 'none';
            } else {
                pvpActual.style.display = 'flex';
            }
        });
    }
    
    // Initial update
    updatePriceIndicators();
    
    // Toggle change handler
    toggle.addEventListener('change', function() {
        togglePvpDisplay();
        toggleRefreshButtons();
        updatePriceIndicators();
    });
    
    // Initial state
    togglePvpDisplay();
    toggleRefreshButtons();
    
    // Simulate price updates (mockup - in real implementation this would come from API)
    // This is just for demonstration purposes
    setInterval(function() {
        // Always update indicators regardless of toggle state
        updatePriceIndicators();
        togglePvpDisplay();
    }, 5000); // Update every 5 seconds (mockup)
});

