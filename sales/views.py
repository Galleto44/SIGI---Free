import json
from django.core.serializers.json import DjangoJSONEncoder
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction

from products.models import Product, Category
from .models import Sale, SaleDetail

# Create your views here.
def sales(request):
    sales = Sale.objects.filter(is_active=True).order_by('-date')
    return render(request, 'sales.html', {'sales':sales})

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

                product = Product.objects.filter(id=product_id, is_active=True).first()

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

                # descontar stock
                product.stock -= quantity
                product.save()

                total += subtotal

            sale.total = total
            sale.save()

        return JsonResponse({'success': True})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    

def get_sale_detail(request, sale_id):
    try:
        sale = Sale.objects.get(id=sale_id)

        details = SaleDetail.objects.filter(sale=sale).select_related('product')

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
    

def cancel_sale(request, sale_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        with transaction.atomic():

            sale = Sale.objects.select_related().prefetch_related('details__product').filter(id=sale_id).first()

            if not sale:
                return JsonResponse({'error': 'Venta no encontrada'}, status=404)

            if not sale.is_active:
                return JsonResponse({'error': 'La venta ya fue anulada'}, status=400)

            # devolver stock
            for detail in sale.details.all():
                product = detail.product
                product.stock += detail.quantity
                product.save()

            # marcar como inactiva
            sale.is_active = False
            sale.save()

        return JsonResponse({'success': True})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)