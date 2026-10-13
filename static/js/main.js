(function () {
    const inventoryMenu = document.getElementById("inventory-menu");

    if (inventoryMenu) {
        inventoryMenu.addEventListener("toggle", () => {
            const state = inventoryMenu.open ? "true" : "false";

            document.cookie =
                `sigi_inventory_menu_open=${state}; path=/; max-age=31536000; SameSite=Lax`;
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    });
})();