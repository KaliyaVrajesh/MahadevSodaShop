"""Serializers for inventory management."""
from rest_framework import serializers


class ProductSerializer(serializers.Serializer):
    """Serializer for Product data."""
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=255)
    category = serializers.ChoiceField(
        choices=['Bakery', 'Chips', 'Cold Drink', 'Tobacco Items', 'Fast Food', 'Grocery', 'Ice Cream', 'Chocolates', 'Battery', 'Other'],
        default='Other'
    )
    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    cost_price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0, required=False, allow_null=True)
    stock = serializers.IntegerField(min_value=0, default=0)
    min_stock = serializers.IntegerField(min_value=0, default=10)
    image_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    is_active = serializers.BooleanField(default=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    # Computed fields
    profit_margin = serializers.SerializerMethodField()
    is_low_stock = serializers.SerializerMethodField()
    
    def get_profit_margin(self, obj):
        if isinstance(obj, dict):
            price = float(obj.get('price', 0))
            cost = float(obj.get('cost_price', 0) or 0)
        else:
            price = float(obj.price) if obj.price else 0
            cost = float(obj.cost_price) if obj.cost_price else 0
        
        if cost > 0 and price > 0:
            return round(((price - cost) / price) * 100, 2)
        return 0
    
    def get_is_low_stock(self, obj):
        if isinstance(obj, dict):
            stock = obj.get('stock', 0)
            min_stock = obj.get('min_stock', 10)
        else:
            stock = obj.stock if hasattr(obj, 'stock') else 0
            min_stock = obj.min_stock if hasattr(obj, 'min_stock') else 10
        return stock < min_stock


class StockAdjustmentSerializer(serializers.Serializer):
    """Serializer for stock adjustment."""
    adjustment = serializers.IntegerField()
    reason = serializers.CharField(max_length=255, required=False, allow_blank=True)
