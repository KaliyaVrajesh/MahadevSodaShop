"""Sales API views."""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import connection, transaction
from datetime import date, timedelta
from .serializers import (
    SaleSerializer, SaleCreateSerializer, BulkSaleSerializer,
    DashboardStatsSerializer, BestSellerSerializer, DailySalesSerializer
)


def dict_fetchall(cursor):
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def dict_fetchone(cursor):
    columns = [col[0] for col in cursor.description]
    row = cursor.fetchone()
    return dict(zip(columns, row)) if row else None


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sale_list(request):
    """List sales with optional date filtering."""
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    product_id = request.query_params.get('product_id')
    
    query = """
        SELECT s.*, p.name as product_name, p.category
        FROM sales s
        LEFT JOIN products p ON s.product_id = p.id
        WHERE 1=1
    """
    params = []
    
    if start_date:
        query += " AND s.sale_date >= %s"
        params.append(start_date)
    
    if end_date:
        query += " AND s.sale_date <= %s"
        params.append(end_date)
    
    if product_id:
        query += " AND s.product_id = %s"
        params.append(product_id)
    
    query += " ORDER BY s.created_at DESC LIMIT 100"
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            sales = dict_fetchall(cursor)
        
        return Response(sales)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_sale(request):
    """Create a single sale."""
    serializer = SaleCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data['quantity']
        
        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    # Get product details
                    cursor.execute(
                        "SELECT id, name, price, cost_price, stock FROM products WHERE id = %s",
                        [product_id]
                    )
                    product = dict_fetchone(cursor)
                    
                    if not product:
                        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
                    
                    if product['stock'] < quantity:
                        return Response(
                            {'error': f"Insufficient stock. Available: {product['stock']}"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Calculate sale values
                    unit_price = float(product['price'])
                    total_price = unit_price * quantity
                    cost_price = float(product['cost_price']) if product['cost_price'] else 0
                    profit = total_price - (cost_price * quantity)
                    
                    # Insert sale (stock deduction handled by trigger)
                    cursor.execute(
                        """
                        INSERT INTO sales (product_id, quantity, unit_price, total_price, cost_price, profit, sale_date)
                        VALUES (%s, %s, %s, %s, %s, %s, CURRENT_DATE)
                        RETURNING *
                        """,
                        [product_id, quantity, unit_price, total_price, cost_price, profit]
                    )
                    sale = dict_fetchone(cursor)
                    sale['product_name'] = product['name']
                
                return Response(sale, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_sale(request):
    """Create multiple sales (cart checkout)."""
    serializer = BulkSaleSerializer(data=request.data)
    
    if serializer.is_valid():
        items = serializer.validated_data['items']
        created_sales = []
        
        try:
            with transaction.atomic():
                with connection.cursor() as cursor:
                    for item in items:
                        product_id = item['product_id']
                        quantity = item['quantity']
                        
                        # Get product
                        cursor.execute(
                            "SELECT id, name, price, cost_price, stock FROM products WHERE id = %s",
                            [product_id]
                        )
                        product = dict_fetchone(cursor)
                        
                        if not product:
                            raise ValueError(f"Product {product_id} not found")
                        
                        if product['stock'] < quantity:
                            raise ValueError(f"Insufficient stock for {product['name']}. Available: {product['stock']}")
                        
                        # Calculate values
                        unit_price = float(product['price'])
                        total_price = unit_price * quantity
                        cost_price = float(product['cost_price']) if product['cost_price'] else 0
                        profit = total_price - (cost_price * quantity)
                        
                        # Insert sale
                        cursor.execute(
                            """
                            INSERT INTO sales (product_id, quantity, unit_price, total_price, cost_price, profit, sale_date)
                            VALUES (%s, %s, %s, %s, %s, %s, CURRENT_DATE)
                            RETURNING *
                            """,
                            [product_id, quantity, unit_price, total_price, cost_price, profit]
                        )
                        sale = dict_fetchone(cursor)
                        sale['product_name'] = product['name']
                        created_sales.append(sale)
            
            return Response({
                'message': f'Successfully created {len(created_sales)} sales',
                'sales': created_sales,
                'total': sum(float(s['total_price']) for s in created_sales)
            }, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics."""
    try:
        with connection.cursor() as cursor:
            # Today's stats
            cursor.execute(
                """
                SELECT 
                    COALESCE(SUM(total_price), 0) as today_sales,
                    COALESCE(SUM(profit), 0) as today_profit,
                    COALESCE(SUM(quantity), 0) as today_items_sold
                FROM sales
                WHERE sale_date = CURRENT_DATE
                """
            )
            today_stats = dict_fetchone(cursor)
            
            # Low stock count
            cursor.execute(
                "SELECT COUNT(*) as count FROM products WHERE stock < min_stock AND is_active = true"
            )
            low_stock = cursor.fetchone()[0]
            
            # Total products
            cursor.execute("SELECT COUNT(*) FROM products WHERE is_active = true")
            total_products = cursor.fetchone()[0]
        
        return Response({
            'today_sales': float(today_stats['today_sales']),
            'today_profit': float(today_stats['today_profit']),
            'today_items_sold': int(today_stats['today_items_sold']),
            'low_stock_count': low_stock,
            'total_products': total_products
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def best_sellers(request):
    """Get top 5 best-selling products."""
    days = int(request.query_params.get('days', 30))
    limit = int(request.query_params.get('limit', 5))
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT 
                    p.id as product_id,
                    p.name as product_name,
                    p.category,
                    COALESCE(SUM(s.quantity), 0) as total_sold,
                    COALESCE(SUM(s.total_price), 0) as total_revenue
                FROM products p
                LEFT JOIN sales s ON p.id = s.product_id 
                    AND s.sale_date >= CURRENT_DATE - INTERVAL '%s days'
                WHERE p.is_active = true
                GROUP BY p.id, p.name, p.category
                ORDER BY total_sold DESC
                LIMIT %s
                """,
                [days, limit]
            )
            best_sellers = dict_fetchall(cursor)
        
        return Response(best_sellers)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def daily_sales_trend(request):
    """Get daily sales trend for last N days."""
    days = int(request.query_params.get('days', 7))
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT 
                    sale_date as date,
                    COALESCE(SUM(total_price), 0) as total_sales,
                    COALESCE(SUM(profit), 0) as total_profit,
                    COALESCE(SUM(quantity), 0) as items_sold
                FROM sales
                WHERE sale_date >= CURRENT_DATE - INTERVAL '%s days'
                GROUP BY sale_date
                ORDER BY sale_date ASC
                """,
                [days]
            )
            trend = dict_fetchall(cursor)
        
        # Fill in missing dates with zeros
        date_map = {str(d['date']): d for d in trend}
        result = []
        for i in range(days, -1, -1):
            d = date.today() - timedelta(days=i)
            d_str = str(d)
            if d_str in date_map:
                result.append(date_map[d_str])
            else:
                result.append({
                    'date': d_str,
                    'total_sales': 0,
                    'total_profit': 0,
                    'items_sold': 0
                })
        
        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profit_loss_report(request):
    """Get profit/loss report by category."""
    days = int(request.query_params.get('days', 30))
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT 
                    p.category,
                    COALESCE(SUM(s.total_price), 0) as total_revenue,
                    COALESCE(SUM(s.profit), 0) as total_profit,
                    COALESCE(SUM(s.quantity), 0) as items_sold,
                    COUNT(DISTINCT s.id) as transactions
                FROM products p
                LEFT JOIN sales s ON p.id = s.product_id 
                    AND s.sale_date >= CURRENT_DATE - INTERVAL '%s days'
                WHERE p.is_active = true
                GROUP BY p.category
                ORDER BY total_profit DESC
                """,
                [days]
            )
            report = dict_fetchall(cursor)
        
        return Response(report)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
