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
    sales = Sale.objects.filter(is_active=True)
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