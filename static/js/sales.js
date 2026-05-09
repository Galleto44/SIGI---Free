let selectedSaleId = null;

function getCSRFToken() {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}


document.addEventListener("DOMContentLoaded", () => {

    const detailModal = document.getElementById("saleDetailModal");
    const tbody = document.getElementById("sale-detail-body");
    const totalEl = document.getElementById("sale-total");
    const dateEl = document.getElementById("sale-date");

    const viewButtons = document.querySelectorAll(".view-sale-btn");

    viewButtons.forEach(btn => {
        btn.addEventListener("click", async () => {

            const saleId = btn.dataset.id;  

            try {
                const response = await fetch(`/sales/${saleId}/detail/`);
                const data = await response.json();

                if (!response.ok) {
                    console.error(data.error);
                    alert(data.error || "Error al cargar detalle");
                    return; 
                }

                // limpiar tabla
                tbody.innerHTML = "";

                // renderizar items
                data.items.forEach(item => {
                    const row = document.createElement("tr");

                    row.innerHTML = `
                        <td>${item.product}</td>
                        <td class="text-center">${item.quantity}</td>
                        <td class="text-center">$${item.price.toFixed(2)}</td>
                        <td class="text-center">$${item.subtotal.toFixed(2)}</td>
                    `;

                    tbody.appendChild(row);
                });

                // actualizar info general
                totalEl.textContent = data.total.toFixed(2);
                dateEl.textContent = `Fecha: ${data.date}`;

                // abrir modal
                detailModal.showModal();

            } catch (error) {
                console.error(error);
                alert("Error de conexión");
            }
        });
    });

    const cancelModal = document.getElementById("cancelSaleModal");
    const confirmCancelBtn = document.getElementById("confirm-cancel-btn");

    const cancelButtons = document.querySelectorAll(".cancel-sale-btn");

    cancelButtons.forEach(btn => {
        btn.addEventListener("click", () => {

            // evitar anular si ya está deshabilitado visualmente
            if (btn.classList.contains("cursor-not-allowed")) return;

            selectedSaleId = btn.dataset.id;
            cancelModal.showModal();
        });
    });

    confirmCancelBtn.addEventListener("click", async () => {

        if (!selectedSaleId) return;

        try {
            const response = await fetch(`/sales/${selectedSaleId}/cancel/`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken()
                }
            });

            const data = await response.json();

            if (response.ok) {
                cancelModal.close();

                // opción segura: recargar vista
                window.location.reload();

            } else {
                alert(data.error || "Error al anular la venta");
            }

        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        }
    });

});