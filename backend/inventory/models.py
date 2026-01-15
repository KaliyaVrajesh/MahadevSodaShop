"""
Inventory models - Using raw SQL to work with Supabase tables.
Django models here are for reference/admin only.
"""
from django.db import models


class Product(models.Model):
    """Product model - mirrors Supabase products table."""
    
    CATEGORY_CHOICES = [
        ('Bakery', 'Bakery'),
        ('Chips', 'Chips'),
        ('Cold Drink', 'Cold Drink'),
        ('Tobacco Items', 'Tobacco Items'),
        ('Fast Food', 'Fast Food'),
        ('Grocery', 'Grocery'),
        ('Ice Cream', 'Ice Cream'),
        ('Chocolates', 'Chocolates'),
        ('Battery', 'Battery'),
        ('Other', 'Other'),
    ]
    
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Other')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.IntegerField(default=0)
    min_stock = models.IntegerField(default=10)
    image_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        managed = False  # Don't let Django manage this table
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - ₹{self.price}"
    
    @property
    def profit_margin(self):
        if self.cost_price and self.cost_price > 0:
            return ((self.price - self.cost_price) / self.price) * 100
        return 0
    
    @property
    def is_low_stock(self):
        return self.stock < self.min_stock
