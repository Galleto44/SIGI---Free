function fillProductForm({
    id = '',
    name = '',
    price = '',
    category = '',
    stock = '',
    description = ''
}) {
    document.getElementById('product_id').value = id;
    document.querySelector('input[name="name"]').value = name;
    document.querySelector('input[name="price"]').value = price;
    document.querySelector('input[name="stock"]').value = stock;
    document.querySelector('textarea[name="description"]').value = description;

    // Seleccionar categoría
    const select = document.querySelector('select[name="category"]');
    if (category) {
        select.value = category;
    } else {
        select.selectedIndex = 0;
    }

    // Título dinámico
    const title = document.getElementById('modal-product-title');
    title.textContent = id ? "Editar Producto" : "Nuevo Producto";

    document.getElementById('modal-product').showModal();
}

function handleCreateProduct() {
    fillProductForm({});
}

function handleEditProduct(button) {
    fillProductForm({
        id: button.dataset.id,
        name: button.dataset.name,
        price: button.dataset.price,
        category: button.dataset.category,
        stock: button.dataset.stock,
        description: button.dataset.description
    });
}

document.addEventListener("DOMContentLoaded", function () {

    // Crear
    const createBtn = document.getElementById("create-product-btn");
    if (createBtn) {
        createBtn.addEventListener("click", handleCreateProduct);
    }

    // Editar
    const editButtons = document.querySelectorAll(".edit-product-btn");

    editButtons.forEach(button => {
        button.addEventListener("click", function () {
            handleEditProduct(this);
        });
    });

});