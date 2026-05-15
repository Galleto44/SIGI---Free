from functools import wraps

from django.shortcuts import render, redirect
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseForbidden

from .models import Category, Product


# =========================
# HELPERS DE ROLES
# =========================

def is_admin(user):
    return (
        user.is_authenticated and
        user.groups.filter(name="administrator").exists()
    )


def is_seller(user):
    return (
        user.is_authenticated and
        user.groups.filter(name="seller").exists()
    )


def role_required(*allowed_roles):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):

            if not request.user.is_authenticated:
                return redirect('login')

            user_roles = set(
                request.user.groups.values_list('name', flat=True)
            )

            # ADMINISTRATOR tiene acceso total
            if "administrator" in user_roles:
                return view_func(request, *args, **kwargs)

            # validar otros roles
            if not user_roles.intersection(set(allowed_roles)):
                return HttpResponseForbidden(
                    "No tienes permisos para acceder a esta sección"
                )

            return view_func(request, *args, **kwargs)

        return wrapper
    return decorator


# =========================
# AUTH
# =========================

def login_view(request):

    if request.user.is_authenticated:
        return redirect('home')

    error = None

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user is not None:
            login(request, user)
            return redirect('home')

        error = "Usuario o contraseña incorrectos"

    return render(request, 'login.html', {'error': error})


def logout_view(request):
    logout(request)
    return redirect('login')


# =========================
# HOME (ADMIN + SELLER)
# =========================

@role_required("administrator", "seller")
def home(request):
    products = Product.objects.filter(is_active=True)
    return render(request, 'home.html', {'products': products})


# =========================
# CATEGORY (SOLO ADMIN)
# =========================

@role_required("administrator")
def category(request):

    if request.method == 'POST':

        delete_id = request.POST.get('delete_category_id')

        if delete_id:
            category = Category.objects.filter(
                id=delete_id,
                is_active=True
            ).first()

            if category:

                if category.products.filter(is_active=True).exists():
                    return redirect('/category/?error=has_products')

                category.is_active = False
                category.save()

            return redirect('category')

        category_id = request.POST.get('category_id')
        name = request.POST.get('name')
        description = request.POST.get('description')

        try:
            if category_id:
                category = Category.objects.filter(
                    id=category_id,
                    is_active=True
                ).first()

                if category:
                    category.name = name
                    category.description = description
                    category.save()

            else:
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

    categories = Category.objects.filter(is_active=True)

    return render(request, 'category.html', {
        'categories': categories
    })


# =========================
# PRODUCT (SOLO ADMIN)
# =========================

@role_required("administrator")
def product(request):

    if request.method == 'POST':

        delete_id = request.POST.get('delete_product_id')

        if delete_id:
            product = Product.objects.filter(
                id=delete_id,
                is_active=True
            ).first()

            if product:
                product.is_active = False
                product.save()

            return redirect('product')

        product_id = request.POST.get('product_id')
        name = request.POST.get('name')
        price = request.POST.get('price')
        category_id = request.POST.get('category')
        stock = request.POST.get('stock')
        description = request.POST.get('description')

        category_obj = (
            Category.objects.filter(
                id=category_id,
                is_active=True
            ).first()
            if category_id else None
        )

        if product_id:
            product = Product.objects.filter(
                id=product_id,
                is_active=True
            ).first()

            if product and category_obj:
                product.name = name
                product.price = price or 0
                product.category = category_obj
                product.stock = stock or 0
                product.description = description
                product.save()

        else:
            if name and category_obj:
                Product.objects.create(
                    name=name,
                    price=price or 0,
                    category=category_obj,
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


# =========================
# ADMIN ONLY VIEW (EJEMPLO)
# =========================

@role_required("administrator")
def admin_only_view(request):
    return render(request, 'admin_panel.html')