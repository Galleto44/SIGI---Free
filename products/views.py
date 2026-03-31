from django.shortcuts import render, redirect
from .models import Category, Product

# Create your views here.
def home(request):
    products = Product.objects.all()
    return render(request, 'home.html', {'products': products})

def category(request):
    if request.method == 'POST':
        name = request.POST.get('name')

        if name and not Category.objects.filter(name__iexact=name).exists():
            Category.objects.create(name=name)

        return redirect('category')

    categories = Category.objects.all()
    return render(request, 'category.html', {
        'categories': categories
    })

def product(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        category_id = request.POST.get('category')
        stock = request.POST.get('stock')

        if name and category_id:
            category = Category.objects.get(id=category_id)
            Product.objects.create(
                name=name,
                category=category,
                stock=stock or 0
            )

        return redirect('product')

    products = Product.objects.select_related('category').all()
    categories = Category.objects.all()

    return render(request, 'product.html', {
        'products': products,
        'categories': categories
    })