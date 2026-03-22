from django.db import models

# Create your models here.
class Categories(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Products(models.Model):
    name = models.CharField(max_length=150)
    category = models.ForeignKey(Categories, on_delete=models.CASCADE)
    stock = models.IntegerField(default=0)

    def __str__(self):
        return self.name