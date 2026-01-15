"""Serializers for sales management."""
from rest_framework import serializers


class SaleSerializer(serializers.Serializer):
    """Serializer for Sale data."""
    id = serializers.IntegerField(read_only=True)
    product_id = serializers.IntegerField()
    product_name = serializers.CharField(read_only=True, required=False)
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    cost_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, required=False)
    profit = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, required=False)
    sale_date = serializers.DateField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)


class SaleCreateSerializer(serializers.Serializer):
    """Serializer for creating a sale."""
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class BulkSaleSerializer(serializers.Serializer):
    """Serializer for bulk sale (cart checkout)."""
    items = SaleCreateSerializer(many=True)


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics."""
    today_sales = serializers.DecimalField(max_digits=12, decimal_places=2)
    today_profit = serializers.DecimalField(max_digits=12, decimal_places=2)
    today_items_sold = serializers.IntegerField()
    low_stock_count = serializers.IntegerField()
    total_products = serializers.IntegerField()


class BestSellerSerializer(serializers.Serializer):
    """Serializer for best seller products."""
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    category = serializers.CharField()
    total_sold = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)


class DailySalesSerializer(serializers.Serializer):
    """Serializer for daily sales trend."""
    date = serializers.DateField()
    total_sales = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_profit = serializers.DecimalField(max_digits=12, decimal_places=2)
    items_sold = serializers.IntegerField()
