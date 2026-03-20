from django.shortcuts import render, redirect
from .models import Categoria, Producto

# Create your views here.
def home(request):
    productos = Producto.objects.all()
    return render(request, 'home.html', {'productos': productos})

def categoria(request):
    return render(request, 'categoria.html')

def producto(request):
    categorias = Categoria.objects.all()
    return render(request, 'producto.html', {'categorias': categorias})

def crear_producto(request):
    categorias = Categoria.objects.all()
    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        categoria_id = request.POST.get('categoria')
        stock = request.POST.get('stock')

        categoria = Categoria.objects.get(id=categoria_id)

        Producto.objects.create(
            nombre=nombre,
            categoria=categoria,
            stock=stock
        )

        return redirect('home')

    return render(request, 'producto.html', {
        'categorias': categorias
    })

def crear_categoria(request):
    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        Categoria.objects.create(nombre=nombre)
        return redirect('home')

    return render(request, 'categoria.html')