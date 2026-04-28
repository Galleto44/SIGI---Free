"""
URL configuration for SIGI project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from products import views as products_views
from sales import views as sales_views

urlpatterns = [
    path('__reload__/', include('django_browser_reload.urls')),
    path('admin/', admin.site.urls),
    path('', products_views.home, name='home'),
    path('category/', products_views.category, name='category'),
    path('product/', products_views.product, name='product'),
    path('sales/', sales_views.sales, name='sales'),
    path('sales/create/', sales_views.create_sale_page, name='create_sale_page'),
    path('sales/store/', sales_views.create_sale, name='create_sale'),
]
