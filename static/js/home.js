document.addEventListener("DOMContentLoaded", function () {
    const readData = (id) =>
        JSON.parse(document.getElementById(id).textContent);

    const categoryLabels = readData("category-labels-data");
    const categoryValues = readData("category-values-data");
    const lineLabels = readData("line-labels-data");
    const lineValues = readData("line-values-data");
    const barLabels = readData("bar-labels-data");
    const barUnits = readData("bar-units-data");
    const barRevenue = readData("bar-revenue-data");

    const money = (value) =>
        "$ " + Number(value).toLocaleString("es-NI", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    // Pastel: ingresos por categoría.
    new Chart(document.getElementById("categoryChart"), {
        type: "pie",
        data: {
            labels: categoryLabels,
            datasets: [{
                data: categoryValues
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const total = context.dataset.data
                                .reduce((sum, value) => sum + value, 0);

                            const value = context.raw;
                            const percentage = total
                                ? (value / total * 100).toFixed(1)
                                : "0.0";

                            return `${context.label}: ${money(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Líneas: ingresos por día.
    new Chart(document.getElementById("salesLineChart"), {
        type: "line",
        data: {
            labels: lineLabels,
            datasets: [{
                label: "Importe vendido",
                data: lineValues,
                tension: 0.3,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Día del mes"
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => money(value)
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => money(context.raw)
                    }
                }
            }
        }
    });

    // Barras: unidades de los cinco productos con mayor importe.
    new Chart(document.getElementById("topProductsChart"), {
        type: "bar",
        data: {
            labels: barLabels,
            datasets: [{
                label: "Importe vendido",
                data: barRevenue
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Importe vendido (C$)"
                    },
                    ticks: {
                        callback: (value) =>
                            "C$ " + Number(value).toLocaleString("es-NI", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2
                            })
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const index = context.dataIndex;

                            return [
                                "Importe: C$ " +
                                    Number(barRevenue[index]).toLocaleString("es-NI", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }),
                                "Unidades vendidas: " + barUnits[index]
                            ];
                        }
                    }
                }
            }
        }
    });
});