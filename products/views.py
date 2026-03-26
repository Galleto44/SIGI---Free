from django.shortcuts import render, redirect
from .models import Categories, Products

# Create your views here.
def home(request):
    products = Products.objects.all()
    return render(request, 'home.html', {'products': products})

def category(request):
    categories = Categories.objects.all()
    return render(request, 'category.html', {'categories': categories})

def product(request):
    categories = Categories.objects.all()
    return render(request, 'product.html', {'categories': categories})

def add_product(request):
    categories = Categories.objects.all()
    if request.method == 'POST':
        name = request.POST.get('name')
        category_id = request.POST.get('category')
        stock = request.POST.get('stock')

        category_id = Categories.objects.get(id=category_id)

        Products.objects.create(
            name=name,
            category=category_id,
            stock=stock
        )

        return redirect('home')

    return render(request, 'product.html', {
        'categories': categories
    })

def add_category(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        Categories.objects.create(name=name)
        return redirect('home')

    return render(request, 'categoriy.html')