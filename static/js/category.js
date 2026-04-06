function fillCategoryForm({ id = '', name = '', description = '' }) {
    document.getElementById('category_id').value = id;
    document.querySelector('input[name="name"]').value = name;
    document.querySelector('textarea[name="description"]').value = description;

    const title = document.getElementById('modal-title');

    if (id) {
        title.textContent = "Editar categoría";
    } else {
        title.textContent = "Nueva categoría";
    }

    document.getElementById('modal-category').showModal();
}

function handleCreateCategory() {
    fillCategoryForm({});
}

function handleEditCategory(button) {
    const id = button.dataset.id;
    const name = button.dataset.name;
    const description = button.dataset.description;

    fillCategoryForm({ id, name, description });
}

document.addEventListener("DOMContentLoaded", function () {

    // Botón crear
    const createBtn = document.getElementById("create-category-btn");
    if (createBtn) {
        createBtn.addEventListener("click", handleCreateCategory);
    }

    // Botones editar
    const editButtons = document.querySelectorAll(".edit-category-btn");

    editButtons.forEach(button => {
        button.addEventListener("click", function () {
            handleEditCategory(this);
        });
    });

});