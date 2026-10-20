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
    return `
        <div class="product-combobox relative w-full">
            <input
                type="text"
                class="product-search input input-bordered w-full"
                placeholder="Buscar producto..."
                autocomplete="off"
                role="combobox"
                aria-expanded="false"
                aria-autocomplete="list"
            >

            <span
                class="product-dropdown-icon absolute right-3 top-1/2
                       -translate-y-1/2 pointer-events-none
                       text-base-content/60"
            >
                <i data-lucide="chevron-down" class="w-4 h-4"></i>
            </span>

            <div
                class="product-options hidden absolute left-0 top-full mt-1
                    w-full max-h-52 overflow-y-auto rounded-box
                    border border-base-300 bg-base-100 shadow-lg z-50"
                role="listbox"
            ></div>

            <select class="product-select hidden">
                <option value="" selected>Selecciona un producto</option>
                ${products.map(product => `
                    <option value="${product.id}"></option>
                `).join("")}
            </select>
        </div>
    `;
}


function renderProductDropdown(select) {
    const wrapper = select.closest(".product-combobox");
    if (!wrapper) return;

    const input = wrapper.querySelector(".product-search");
    const dropdown = wrapper.querySelector(".product-options");

    dropdown.innerHTML = "";

    const query = input.value.trim().toLowerCase();

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(query)
    );

    filteredProducts.forEach(product => {
        const option = select.querySelector(
            `option[value="${product.id}"]`
        );

        const button = document.createElement("button");

        button.type = "button";
        button.className =
            "block w-full text-left px-3 py-2 text-xs " +
            "hover:bg-base-200 disabled:opacity-40 " +
            "disabled:cursor-not-allowed";

        button.innerHTML = `
            <div class="font-semibold text-xs">
                ${product.name}
            </div>
            <div class="mt-1 text-[11px] leading-snug text-base-content/60 whitespace-normal break-words">
                ${product.description || "Sin descripción"}
            </div>
        `;

        button.disabled = !option || option.disabled;

        button.setAttribute("role", "option");
        button.setAttribute(
            "aria-selected",
            select.value == product.id ? "true" : "false"
        );

        button.addEventListener("click", () => {
            select.value = String(product.id);

            input.value = product.name;
            wrapper.dataset.open = "false";
            input.setAttribute("aria-expanded", "false");

            dropdown.classList.add("hidden");

            select.dispatchEvent(
                new Event("change", { bubbles: true })
            );
        });

        dropdown.appendChild(button);
    });

    if (filteredProducts.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.className =
            "px-3 py-3 text-sm text-gray-500";

        emptyMessage.textContent = "No se encontraron productos";

        dropdown.appendChild(emptyMessage);
    }

    const isOpen = wrapper.dataset.open === "true";

    dropdown.classList.toggle("hidden", !isOpen);
    input.setAttribute("aria-expanded", String(isOpen));
}


function setKeyboardActiveOption(wrapper, options, index) {
    options.forEach(option => {
        option.classList.remove("keyboard-active");
        option.classList.remove("bg-base-200");
        option.setAttribute("aria-selected", "false");
    });

    const activeOption = options[index];

    if (!activeOption) return;

    activeOption.classList.add("keyboard-active", "bg-base-200");
    activeOption.setAttribute("aria-selected", "true");

    activeOption.scrollIntoView({
        block: "nearest"
    });
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

            option.disabled =
                selectedIds.includes(option.value) &&
                option.value !== currentValue;
        });

        renderProductDropdown(currentSelect);
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

        <td class="min-w-56">
            ${createProductSelect()}
        </td>

        <td>
            <input type="number" value="1" min="1"
                class="quantity-input input input-bordered w-20 text-center">
        </td>

        <td class="price">$0.00</td>

        <td class="subtotal">$0.00</td>

        <td>
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

    const wrapper = row.querySelector(".product-combobox");
    const searchInput = wrapper.querySelector(".product-search");

    searchInput.addEventListener("focus", () => {
        wrapper.dataset.open = "true";
        renderProductDropdown(select);
    });

    searchInput.addEventListener("input", () => {
        wrapper.dataset.open = "true";
        renderProductDropdown(select);
    });

    searchInput.addEventListener("keydown", event => {
        const optionsContainer = wrapper.querySelector(".product-options");

        // Obtener únicamente los productos visibles y habilitados
        const options = Array.from(
            optionsContainer.querySelectorAll("button:not(:disabled)")
        );

        const activeIndex = options.findIndex(
            option => option === wrapper.querySelector(".keyboard-active")
        );

        if (event.key === "ArrowDown") {
            event.preventDefault();

            wrapper.dataset.open = "true";
            renderProductDropdown(select);

            const visibleOptions = Array.from(
                optionsContainer.querySelectorAll("button:not(:disabled)")
            );

            if (visibleOptions.length === 0) return;

            const nextIndex = activeIndex < visibleOptions.length - 1
                ? activeIndex + 1
                : 0;

            setKeyboardActiveOption(wrapper, visibleOptions, nextIndex);
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();

            wrapper.dataset.open = "true";
            renderProductDropdown(select);

            const visibleOptions = Array.from(
                optionsContainer.querySelectorAll("button:not(:disabled)")
            );

            if (visibleOptions.length === 0) return;

            const nextIndex = activeIndex > 0
                ? activeIndex - 1
                : visibleOptions.length - 1;

            setKeyboardActiveOption(wrapper, visibleOptions, nextIndex);
        }

        if (event.key === "Enter") {
            const activeOption = wrapper.querySelector(".keyboard-active");

            if (activeOption) {
                event.preventDefault();
                activeOption.click();
            }
        }

        if (event.key === "Escape") {
            wrapper.dataset.open = "false";
            renderProductDropdown(select);
        }
    });

    searchInput.addEventListener("blur", () => {
        setTimeout(() => {
            if (!wrapper.contains(document.activeElement)) {
                wrapper.dataset.open = "false";
                renderProductDropdown(select);
            }
        }, 150);
    });

    wrapper.addEventListener("focusout", () => {
        setTimeout(() => {
            if (!wrapper.contains(document.activeElement)) {
                wrapper.dataset.open = "false";

                const searchInput = wrapper.querySelector(".product-search");
                const dropdown = wrapper.querySelector(".product-options");

                searchInput?.setAttribute("aria-expanded", "false");
                dropdown?.classList.add("hidden");
            }
        }, 0);
    });

    const priceCell = row.querySelector(".price");
    const subtotalCell = row.querySelector(".subtotal");

    console.log("Celdas:", priceCell, subtotalCell);

    // selecciona producto
    select.addEventListener("change", () => {
        const product = getProductById(select.value);

        searchInput.value = product ? product.name : "";

        // Si no se seleccionó ningún producto.
        if (!product) {
            quantityInput.value = 1;
            priceCell.textContent = "$0.00";
            subtotalCell.textContent = "$0.00";

            updateProductOptions();
            updateCartSummary();
            return;
        }

        // Producto seleccionado.
        quantityInput.value = 1;

        const price = Number(product.price);
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

function showAlert(message, type = "error") {
    const modal = document.getElementById("alertModal");
    const alertMessage = document.getElementById("alertMessage");
    const alertTitle = document.getElementById("alertTitle");
    const alertIcon = document.getElementById("alertIcon");

    alertMessage.textContent = message;

    if (type === "success") {
        alertTitle.textContent = "Operación exitosa";

        alertIcon.className =
            "mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100";

        alertIcon.innerHTML = `
            <span class="flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                <i data-lucide="check" class="h-8 w-8 text-white"></i>
            </span>
        `;
    } else {
        alertTitle.textContent = "Ha ocurrido un error";

        alertIcon.className =
            "mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100";

        alertIcon.innerHTML = `
            <span class="flex h-16 w-16 items-center justify-center rounded-full bg-red-500">
                <i data-lucide="x" class="h-8 w-8 text-white"></i>
            </span>
        `;
    }

    if (window.lucide) {
        lucide.createIcons();
    }

    if (!modal.open) {
        modal.showModal();
    }
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
        const notes = document.getElementById("sale-notes").value.trim();

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
                body: JSON.stringify({
                    notes: notes,
                    items: items
                })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert("Venta registrada correctamente", "success");

                const modal = document.getElementById("alertModal");

                modal.addEventListener("close", () => {
                    window.location.href = "/sales/";
                }, { once: true });

            } else {
                showAlert(data.error || "Error al registrar la venta", "error");
                isSubmitting = false;
            }

        } catch (error) {
            console.error(error);
            showAlert("Error de conexión");
            isSubmitting = false;
        }
    });
});