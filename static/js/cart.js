const productsElement = document.getElementById("products-data");

const products = productsElement ? JSON.parse(productsElement.textContent) : [];

if (products.length === 0) {
    showAlert("No hay productos disponibles");
}

function resetCart() {
    const tbody = document.getElementById("cart-body");

    tbody.innerHTML = "";
    renderOneRow();
    updateProductOptions();
    updateCartSummary();
}

function updateRowNumbers() {
    const rows = document.querySelectorAll("#cart-body tr");

    rows.forEach((row, index) => {
        row.children[0].textContent = index + 1;
    });
}

function getProductById(productId) {
    return products.find(p => p.id == productId);
}

function createProductSelect() {
    let options = `<option value="">Selecciona un producto</option>`;

    products.forEach(product => {
        options += `
            <option value="${product.id}">
                ${product.name}
            </option>
        `;
    });

    return `<select class="product-select w-full border rounded px-2 py-1">
                ${options}
            </select>`;
}

function getSelectedProductIds() {
    const selects = document.querySelectorAll(".product-select");

    const selected = [];

    selects.forEach(select => {
        if (select.value) {
            selected.push(select.value);
        }
    });

    return selected;
}

function updateProductOptions() {
    const selectedIds = getSelectedProductIds();

    const selects = document.querySelectorAll(".product-select");

    selects.forEach(currentSelect => {

        const currentValue = currentSelect.value;

        currentSelect.querySelectorAll("option").forEach(option => {

            if (!option.value) return;

            // deshabilitar si ya está seleccionado en otro lado
            option.disabled =
                selectedIds.includes(option.value) &&
                option.value !== currentValue;
        });

    });
}

function updateCartSummary() {
    const rows = document.querySelectorAll("#cart-body tr");

    let total = 0;
    let items = 0;

    rows.forEach(row => {
        const subtotalText = row.querySelector(".subtotal").textContent;

        const value = parseFloat(subtotalText.replace("$", "")) || 0;

        const quantityInput = row.querySelector(".quantity-input");
        const quantity = parseInt(quantityInput.value) || 0;

        items += quantity;

        total += value;
    });

    document.getElementById("total-items").textContent = items;
    document.getElementById("total-amount").textContent = `$${total.toFixed(2)}`;
}

function renderOneRow() {
    const tbody = document.getElementById("cart-body");

    const rowCount = tbody.children.length + 1;

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${rowCount}</td>

        <td>
            ${createProductSelect()}
        </td>

        <td class="text-center">
            <input type="number" value="1" min="1"
                class="quantity-input w-16 text-center border rounded">
        </td>

        <td class="text-center price">$0.00</td>

        <td class="text-center subtotal">$0.00</td>

        <td class="text-center">
            <button type="button"
                    class="remove-btn p-2 border border-gray-300 rounded-md
                        hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer">
                <i data-lucide="trash" class="w-4 h-4"></i>
            </button>
        </td>
    `;

    tbody.appendChild(row);
    if (window.lucide) {
        lucide.createIcons();
    }

    const select = row.querySelector(".product-select");
    const quantityInput = row.querySelector(".quantity-input");
    const priceCell = row.querySelector(".price");
    const subtotalCell = row.querySelector(".subtotal");

    // selecciona producto
    select.addEventListener("change", () => {

        const product = getProductById(select.value);

        // Caso 1: vuelve a "Selecciona un producto"
        if (!product) {
            quantityInput.value = 1;
            priceCell.textContent = "$0.00";
            subtotalCell.textContent = "$0.00";

            updateProductOptions();
            updateCartSummary();
            return;
        }

        // Caso 2: selecciona un producto válido
        quantityInput.value = 1; // reset cantidad SIEMPRE

        const price = product.price;
        const quantity = 1;

        priceCell.textContent = `$${price.toFixed(2)}`;
        subtotalCell.textContent = `$${(price * quantity).toFixed(2)}`;

        updateProductOptions();
        updateCartSummary();
    });

    // cambia cantidad
    quantityInput.addEventListener("input", () => {
        const product = getProductById(select.value);

        if (!product) return;

        let quantity = parseInt(quantityInput.value);

        if (isNaN(quantity) || quantity < 1) {
            quantity = 1;
            quantityInput.value = 1;
        }

        if (quantity > product.stock) {
            quantity = product.stock;
            quantityInput.value = quantity;

            showAlert(`Stock máximo disponible: ${product.stock}`);
        }
        const subtotal = product.price * quantity;

        subtotalCell.textContent = `$${subtotal.toFixed(2)}`;
        updateCartSummary();
    });

    const removeBtn = row.querySelector(".remove-btn");

    removeBtn.addEventListener("click", () => {
        row.remove();

        const tbody = document.getElementById("cart-body");

        if (tbody.children.length === 0) {
            renderOneRow();
        }

        updateRowNumbers();
        updateProductOptions();
        updateCartSummary();
    });
    updateProductOptions();
}

function buildCartPayload() {
    const rows = document.querySelectorAll("#cart-body tr");

    const items = [];

    rows.forEach(row => {
        const select = row.querySelector(".product-select");
        const quantityInput = row.querySelector(".quantity-input");

        const productId = select.value;
        const quantity = parseInt(quantityInput.value) || 0;

        if (!productId || quantity <= 0) return;

        items.push({
            product_id: productId,
            quantity: quantity
        });
    });

    return items;
}

function showAlert(message) {
    const modal = document.getElementById("alertModal");
    const messageEl = document.getElementById("alertMessage");

    if (!modal || !messageEl) {
        console.warn(message);
        return;
    }

    if (modal.open) modal.close();

    messageEl.textContent = message;
    modal.showModal();
}

function getCSRFToken() {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}

document.addEventListener("DOMContentLoaded", () => {

    const resetBtn = document.getElementById("reset-cart-btn");
    const modal = document.getElementById("resetCartModal");

    resetBtn.addEventListener("click", () => {
        modal.showModal();
    });

    const confirmResetBtn = document.getElementById("confirm-reset-btn");

    confirmResetBtn.addEventListener("click", () => {
        resetCart();
        modal.close();
    });

    const addBtn = document.getElementById("add-product-btn");

    addBtn.addEventListener("click", () => {
        renderOneRow();
    });

    renderOneRow();
    updateCartSummary();

    const confirmBtn = document.getElementById("confirm-sale-btn");

    let isSubmitting = false;

    confirmBtn.addEventListener("click", async () => {

        if (isSubmitting) return;

        const items = buildCartPayload();

        if (items.length === 0) {
            showAlert("Debes añadir al menos un producto");
            return;
        }

        isSubmitting = true;

        try {
            const response = await fetch("/sales/store/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken()
                },
                body: JSON.stringify({ items })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert("Venta registrada correctamente");

                const modal = document.getElementById("alertModal");

                modal.addEventListener("close", () => {
                    window.location.href = "/sales/";
                }, { once: true });

            } else {
                showAlert(data.error || "Error al registrar la venta");
                isSubmitting = false;
            }

        } catch (error) {
            console.error(error);
            showAlert("Error de conexión");
            isSubmitting = false;
        }
    });
});