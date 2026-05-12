document.addEventListener("DOMContentLoaded", () => {
    const selectAll = document.getElementById("selectAllCotizacionItems");
    const tbody = document.querySelector("table.table tbody");
    const bulkDeleteBtn = document.getElementById("btnEliminarItemsSeleccionados");

    if (!selectAll || !tbody || !tbody.querySelector("tr.item-container")) return;

    function getRowCheckboxes() {
        return Array.from(tbody.querySelectorAll("tr.item-container .item-row-checkbox"));
    }

    function updateBulkDeleteEnabled() {
        if (!bulkDeleteBtn) return;
        bulkDeleteBtn.disabled = !getRowCheckboxes().some((cb) => cb.checked);
    }

    function syncSelectAllState() {
        const boxes = getRowCheckboxes();
        if (boxes.length === 0) {
            selectAll.checked = false;
            selectAll.indeterminate = false;
            updateBulkDeleteEnabled();
            return;
        }
        const checkedCount = boxes.filter((cb) => cb.checked).length;
        selectAll.checked = checkedCount === boxes.length;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < boxes.length;
        updateBulkDeleteEnabled();
    }

    selectAll.addEventListener("change", () => {
        const checked = selectAll.checked;
        getRowCheckboxes().forEach((cb) => {
            cb.checked = checked;
        });
        syncSelectAllState();
    });

    tbody.addEventListener("change", (e) => {
        const target = e.target;
        if (target && target.classList && target.classList.contains("item-row-checkbox")) {
            syncSelectAllState();
        }
    });

    syncSelectAllState();
});
