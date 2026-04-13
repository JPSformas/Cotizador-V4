document.addEventListener('DOMContentLoaded', function () {
    const formatCurrency = (value) =>
        '$' + value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const toggle = document.getElementById('actualizarPreciosToggle');

    if (toggle) {
        // Calculate and update price change percentage and PVP Actual
        function updatePriceIndicators() {
            const productPvps = document.querySelectorAll('.product-pvp[data-original-price]');

            productPvps.forEach((pvp) => {
                const originalPrice = parseFloat(pvp.dataset.originalPrice) || 0;
                const currentPrice = parseFloat(pvp.dataset.currentPrice) || 0;
                const pvpActual = pvp.nextElementSibling;

                if (!pvpActual || !pvpActual.classList.contains('pvp-actual')) return;

                const indicator = pvpActual.querySelector('.price-change-indicator');
                const percentSpan = pvpActual.querySelector('.price-change-percent');
                const icon = pvpActual.querySelector('.price-change-indicator i');

                if (!indicator || !percentSpan) return;

                const priceValueElement = pvpActual.querySelector('.detail-value');
                if (priceValueElement) {
                    priceValueElement.textContent = formatCurrency(currentPrice);
                }

                let percentChange = 0;
                if (originalPrice > 0) {
                    percentChange = ((currentPrice - originalPrice) / originalPrice) * 100;
                }
                percentChange = Math.round(percentChange * 10) / 10;

                const sign = percentChange > 0 ? '+' : '';
                percentSpan.textContent = `${sign}${percentChange.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

                indicator.classList.remove('price-down', 'price-up', 'price-neutral');

                if (percentChange < 0) {
                    indicator.classList.add('price-down');
                    if (icon) icon.className = 'fas fa-arrow-down';
                } else if (percentChange > 0) {
                    indicator.classList.add('price-up');
                    if (icon) icon.className = 'fas fa-arrow-up';
                } else {
                    indicator.classList.add('price-neutral');
                    if (icon) icon.className = 'fas fa-minus';
                }
            });
        }

        function toggleRefreshButtons() {
            const isChecked = toggle.checked;
            const refreshButtons = document.querySelectorAll('.refresh-icon-btn, .refresh-btn-mobile');
            refreshButtons.forEach((button) => {
                button.disabled = isChecked;
                button.classList.toggle('disabled', isChecked);
            });
        }

        function togglePvpDisplay() {
            const isChecked = toggle.checked;
            const pvpActuals = document.querySelectorAll('.pvp-actual');
            const productPvps = document.querySelectorAll('.product-pvp[data-original-price]');

            productPvps.forEach((pvp) => {
                const originalPrice = parseFloat(pvp.dataset.originalPrice) || 0;
                const currentPrice = parseFloat(pvp.dataset.currentPrice) || 0;
                const warningIcon = pvp.querySelector('.pvp-warning-icon');
                const checkIcon = pvp.querySelector('.pvp-check-icon');
                const pvpValue = pvp.querySelector('.detail-value');
                const refreshBtn = pvp.querySelector('.refresh-icon-btn');

                let percentChange = 0;
                if (originalPrice > 0) {
                    percentChange = ((currentPrice - originalPrice) / originalPrice) * 100;
                }
                percentChange = Math.round(percentChange * 10) / 10;
                const hasVariation = percentChange !== 0;

                if (isChecked) {
                    if (pvpValue) pvpValue.textContent = formatCurrency(currentPrice);
                    if (warningIcon) warningIcon.style.display = 'none';
                    if (checkIcon) checkIcon.style.display = 'inline-block';
                    if (refreshBtn) refreshBtn.style.display = 'none';
                } else if (hasVariation) {
                    if (pvpValue) pvpValue.textContent = formatCurrency(originalPrice);
                    if (warningIcon) warningIcon.style.display = 'inline-block';
                    if (checkIcon) checkIcon.style.display = 'none';
                    if (refreshBtn) refreshBtn.style.display = '';
                } else {
                    if (pvpValue) pvpValue.textContent = formatCurrency(originalPrice);
                    if (warningIcon) warningIcon.style.display = 'none';
                    if (checkIcon) checkIcon.style.display = 'inline-block';
                    if (refreshBtn) refreshBtn.style.display = 'none';
                }
            });

            pvpActuals.forEach((pvpActual) => {
                pvpActual.style.display = isChecked ? 'none' : 'flex';
            });
        }

        updatePriceIndicators();
        togglePvpDisplay();
        toggleRefreshButtons();

        toggle.addEventListener('change', function () {
            togglePvpDisplay();
            toggleRefreshButtons();
            updatePriceIndicators();
        });

        setInterval(function () {
            updatePriceIndicators();
            togglePvpDisplay();
        }, 5000);
    }

    // Reusable editItem mock behavior
    const refreshBtn = document.getElementById('refreshBtn');
    const pvpInput = document.getElementById('PVP');
    const pvpWarningIcon = document.getElementById('pvpWarningIcon');
    const pvpCheckIcon = document.getElementById('pvpCheckIcon');
    const pvpActualValue = document.getElementById('pvpActualValue');
    const pvpChangeIndicator = document.getElementById('pvpChangeIndicator');
    const pvpChangePercent = document.getElementById('pvpChangePercent');
    const pvpActualIndicator = document.getElementById('pvpActualIndicator');

    if (!refreshBtn || !pvpInput || !pvpWarningIcon || !pvpCheckIcon || !pvpActualValue || !pvpChangeIndicator || !pvpChangePercent) {
        return;
    }

    const originalPvp = 12500;
    const updatedPvp = 11800;
    let alreadyUpdated = false;

    pvpInput.value = originalPvp.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    pvpActualValue.textContent = formatCurrency(updatedPvp);
    pvpChangePercent.textContent = '-5,6%';
    pvpChangeIndicator.classList.remove('price-up', 'price-neutral');
    pvpChangeIndicator.classList.add('price-down');
    pvpChangeIndicator.querySelector('i').className = 'fas fa-arrow-down';
    pvpWarningIcon.style.display = 'inline-block';
    pvpCheckIcon.style.display = 'none';

    refreshBtn.addEventListener('click', () => {
        if (alreadyUpdated) return;
        pvpInput.value = updatedPvp.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        pvpWarningIcon.style.display = 'none';
        pvpCheckIcon.style.display = 'inline-block';
        if (pvpActualIndicator) pvpActualIndicator.style.display = 'none';
        alreadyUpdated = true;
    });
});

