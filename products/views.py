from django.shortcuts import render, redirect
from django.utils import timezone
from django.db.models import Sum, Count
from django.core.exceptions import ValidationError
from .models import Category, Product
from sales.models import Sale, SaleDetail

import calendar
import json
from datetime import datetime, date
from django.db.models.functions import TruncDate

# Create your views here.
def home(request):
    today = timezone.localdate()

    # Mes seleccionado en el filtro; por defecto, el mes actual.
    month_value = request.GET.get("month", today.strftime("%Y-%m"))

    try:
        selected_month = datetime.strptime(
            month_value, "%Y-%m"
        ).date().replace(day=1)
    except ValueError:
        selected_month = today.replace(day=1)

    year = selected_month.year
    month = selected_month.month
    month_value = selected_month.strftime("%Y-%m")

    days_in_month = calendar.monthrange(year, month)[1]

    # Ventas activas del mes seleccionado.
    monthly_sales = (
        Sale.objects.filter(
            is_active=True,
            date__year=year,
            date__month=month
        ).aggregate(total=Sum("total"))["total"] or 0
    )

    # Ventas de hoy: conserva el significado del KPI original.
    today_sales = (
        Sale.objects.filter(
            is_active=True,
            date__date=today
        ).aggregate(total=Sum("total"))["total"] or 0
    )

    monthly_details = SaleDetail.objects.filter(
        sale__is_active=True,
        sale__date__year=year,
        sale__date__month=month
    )

    # KPI: producto más vendido durante el mes seleccionado.
    top_product = (
        monthly_details
        .values("product__name")
        .annotate(total_quantity=Sum("quantity"))
        .order_by("-total_quantity")
        .first()
    )

    # KPI: categoría con más unidades vendidas en el mes.
    top_category = (
        monthly_details
        .values("product__category__name")
        .annotate(total_quantity=Sum("quantity"))
        .order_by("-total_quantity")
        .first()
    )

    # 1. Pastel: importe vendido por categoría.
    category_data = list(
        monthly_details
        .values("product__category__name")
        .annotate(total=Sum("subtotal"))
        .order_by("-total")
    )

    category_labels = [
        item["product__category__name"] or "Sin categoría"
        for item in category_data
    ]

    category_values = [
        float(item["total"] or 0)
        for item in category_data
    ]

    # 2. Líneas: importe vendido por día.
    daily_data = (
        monthly_details
        .annotate(day=TruncDate("sale__date"))
        .values("day")
        .annotate(total=Sum("subtotal"))
        .order_by("day")
    )

    daily_totals = {
        item["day"].day: float(item["total"] or 0)
        for item in daily_data
        if item["day"] is not None
    }

    line_labels = [
        str(day)
        for day in range(1, days_in_month + 1)
    ]

    line_values = [
        daily_totals.get(day, 0)
        for day in range(1, days_in_month + 1)
    ]

    # 3. Barras: cinco productos con mayor importe vendido.
    # Las barras mostrarán unidades; el importe será complementario.
    top_products_data = list(
        monthly_details
        .values("product__name")
        .annotate(
            units=Sum("quantity"),
            revenue=Sum("subtotal")
        )
        .order_by("-revenue")[:5]
    )

    bar_labels = [
        item["product__name"]
        for item in top_products_data
    ]

    bar_units = [
        int(item["units"] or 0)
        for item in top_products_data
    ]

    bar_revenue = [
        float(item["revenue"] or 0)
        for item in top_products_data
    ]

    return render(request, "home.html", {
        "monthly_sales": monthly_sales,
        "today_sales": today_sales,
        "top_product": top_product,
        "top_category": top_category,
        "selected_month": month_value,

        "category_labels": category_labels,
        "category_values": category_values,

        "line_labels": line_labels,
        "line_values": line_values,

        "bar_labels": bar_labels,
        "bar_units": bar_units,
        "bar_revenue": bar_revenue,
    })

def category(request):

    if request.method == 'POST':

        # ELIMINAR (soft delete)
        delete_id = request.POST.get('delete_category_id')

        if delete_id:
            category = Category.objects.filter(id=delete_id, is_active=True).first()

            if category:

                # bloquear si tiene productos activos
                if category.products.filter(is_active=True).exists():
                    return redirect('/category/?error=has_products')

                category.is_active = False
                category.save()

            return redirect('category')

        # CREAR / EDITAR
        category_id = request.POST.get('category_id')
        name = request.POST.get('name')
        description = request.POST.get('description')

        try:
            if category_id:
                # EDITAR
                category = Category.objects.filter(id=category_id, is_active=True).first()

                if category:
                    category.name = name
                    category.description = description
                    category.save()

            else:
                # CREAR
                Category.objects.create(
                    name=name,
                    description=description
                )

        except ValidationError as e:
            categories = Category.objects.filter(is_active=True)

            return render(request, 'category.html', {
                'categories': categories,
                'errors': e.message_dict
            })

        return redirect('category')

    # LISTADO
    categories = Category.objects.filter(is_active=True)

    return render(request, 'category.html', {
        'categories': categories
    })

def product(request):
    if request.method == 'POST':

        # SOFT DELETE
        delete_id = request.POST.get('delete_product_id')
        if delete_id:
            product = Product.objects.filter(id=delete_id).first()
            if product:
                product.is_active = False
                product.save()
            return redirect('product')
        
        # EDITAR / CREAR
        
        product_id = request.POST.get('product_id')
        name = request.POST.get('name')
        price = request.POST.get('price')
        category_id = request.POST.get('category')
        stock = request.POST.get('stock')
        description = request.POST.get('description')

        if category_id:
            category = Category.objects.filter(id=category_id).first()

            if product_id:
                # EDITAR
                product = Product.objects.filter(id=product_id).first()
                if product and category:
                    product.name = name
                    product.price = price or 0
                    product.category = category
                    product.stock = stock or 0
                    product.description = description
                    product.save()
            else:
                # CREAR
                if name and category:
                    Product.objects.create(
                        name=name,
                        price=price or 0,
                        category=category,
                        stock=stock or 0,
                        description=description
                    )

        return redirect('product')

    products = Product.objects.filter(is_active=True)
    categories = Category.objects.filter(is_active=True)

    return render(request, 'product.html', {
        'products': products,
        'categories': categories
    })