from django.db import models
from django.core.exceptions import ValidationError

# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def clean(self):
        cleaned_name = self.name.strip()

        if Category.objects.filter(name__iexact=cleaned_name).exclude(pk=self.pk).exists():
            raise ValidationError({
                "name": "Esta categoría ya existe"
            })

    def save(self, *args, **kwargs):
        self.name = self.name.strip().title()
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=150)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    stock = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name