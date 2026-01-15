"""
Sales models - Using raw SQL to work with Supabase tables.
Django models here are for reference only.
"""
from django.db import models


class Sale(models.Model):
    """Sale model - mirrors Supabase sales table."""
    
    product_id = models.IntegerField()
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    profit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    sale_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'sales'
        managed = False
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Sale #{self.id} - ₹{self.total_price}"
