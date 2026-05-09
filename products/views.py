from django.shortcuts import render, redirect
from django.core.exceptions import ValidationError
from .models import Category, Product

# Create your views here.
def home(request):
    products = Product.objects.all()
    return render(request, 'home.html', {'products': products})

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