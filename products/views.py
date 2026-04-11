from django.shortcuts import render, redirect
from .models import Category, Product

# Create your views here.
def home(request):
    products = Product.objects.all()
    return render(request, 'home.html', {'products': products})

def category(request):
    if request.method == 'POST':
        category_id = request.POST.get('category_id')
        name = request.POST.get('name')
        description = request.POST.get('description')

        if category_id:
            category = Category.objects.filter(id=category_id).first()

            if category:
                if not Category.objects.filter(name__iexact=name).exclude(id=category_id).exists():
                    category.name = name
                    category.description = description
                    category.save()

        else:
            if name and not Category.objects.filter(name__iexact=name).exists():
                Category.objects.create(
                    name=name,
                    description=description
                )

        return redirect('category')

    categories = Category.objects.all()
    return render(request, 'category.html', {
        'categories': categories
    })

def product(request):
    if request.method == 'POST':
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

    products = Product.objects.select_related('category').all()
    categories = Category.objects.all()

    return render(request, 'product.html', {
        'products': products,
        'categories': categories
    })