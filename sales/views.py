import json
from django.shortcuts import render
from django.http import JsonResponse
from django.db import transaction
from django.contrib.auth.decorators import login_required
from functools import wraps

from products.models import Product
from .models import Sale, SaleDetail


# =========================
# HELPERS DE ROLES
# =========================

def role_required(*allowed_roles):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):

            if not request.user.is_authenticated:
                return JsonResponse({'error': 'No autenticado'}, status=401)

            user_roles = set(
                request.user.groups.values_list('name', flat=True)
            )

            # ADMINISTRATOR = acceso total
            if "administrator" in user_roles:
                return view_func(request, *args, **kwargs)

            # validación normal para otros roles
            if not user_roles.intersection(set(allowed_roles)):
                return JsonResponse({'error': 'Sin permisos'}, status=403)

            return view_func(request, *args, **kwargs)

        return wrapper
    return decorator


def is_admin(user):
    return user.is_authenticated and user.groups.filter(name="administrator").exists()


# =========================
# LISTADO DE VENTAS
# =========================

@login_required
@role_required("seller")
def sales(request):
    sales = Sale.objects.filter(is_active=True).order_by('-date')
    return render(request, 'sales.html', {'sales': sales})


# =========================
# CREAR VENTA - PAGINA
# =========================

@login_required
@role_required("seller")
def create_sale_page(request):

    products = Product.objects.filter(is_active=True)

    products_json = json.dumps([
        {
            "id": p.id,
            "name": p.name,
            "price": float(p.price),
            "stock": p.stock
        }
        for p in products
    ])

    return render(request, 'create_sale.html', {
        'products_json': products_json
    })


# =========================
# CREAR VENTA (API)
# =========================

@login_required
@role_required("seller")
def create_sale(request):

    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        data = json.loads(request.body)
        items = data.get('items', [])

        if not items:
            return JsonResponse({'error': 'Carrito vacío'}, status=400)

        total = 0

        with transaction.atomic():

            sale = Sale.objects.create(total=0)

            for item in items:
                product_id = item.get('product_id')
                quantity = int(item.get('quantity', 0))

                if quantity <= 0:
                    raise Exception("Cantidad inválida")

                product = Product.objects.filter(
                    id=product_id,
                    is_active=True
                ).first()

                if not product:
                    raise Exception("Producto no encontrado")

                if product.stock < quantity:
                    raise Exception(f"Stock insuficiente para {product.name}")

                price = product.price
                subtotal = price * quantity

                SaleDetail.objects.create(
                    sale=sale,
                    product=product,
                    quantity=quantity,
                    price=price,
                    subtotal=subtotal
                )

                product.stock -= quantity
                product.save()

                total += subtotal

            sale.total = total
            sale.save()

        return JsonResponse({'success': True})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


# =========================
# DETALLE DE VENTA
# =========================

@login_required
@role_required("seller")
def get_sale_detail(request, sale_id):

    try:
        sale = Sale.objects.get(id=sale_id, is_active=True)

        details = SaleDetail.objects.filter(
            sale=sale
        ).select_related('product')

        items = []

        for d in details:
            items.append({
                'product': d.product.name,
                'quantity': d.quantity,
                'price': float(d.price),
                'subtotal': float(d.subtotal)
            })

        return JsonResponse({
            'id': sale.id,
            'date': sale.date.strftime("%d/%m/%Y"),
            'total': float(sale.total),
            'items': items
        })

    except Sale.DoesNotExist:
        return JsonResponse({'error': 'Venta no encontrada'}, status=404)


# =========================
# CANCELAR VENTA (SOLO ADMIN)
# =========================

@login_required
@role_required("admin")
def cancel_sale(request, sale_id):

    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        with transaction.atomic():

            sale = Sale.objects.select_related().prefetch_related(
                'details__product'
            ).filter(id=sale_id, is_active=True).first()

            if not sale:
                return JsonResponse({'error': 'Venta no encontrada'}, status=404)

            for detail in sale.details.all():
                product = detail.product
                product.stock += detail.quantity
                product.save()

            sale.is_active = False
            sale.save()

        return JsonResponse({'success': True})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)