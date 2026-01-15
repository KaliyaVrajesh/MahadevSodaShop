"""Inventory API views."""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import connection
from accounts.permissions import IsAdminOrReadOnly
from .serializers import ProductSerializer, StockAdjustmentSerializer


def dict_fetchall(cursor):
    """Return all rows from a cursor as a list of dicts."""
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def dict_fetchone(cursor):
    """Return one row from a cursor as a dict."""
    columns = [col[0] for col in cursor.description]
    row = cursor.fetchone()
    return dict(zip(columns, row)) if row else None


@api_view(['GET', 'POST'])
@permission_classes([IsAdminOrReadOnly])
def product_list(request):
    """List all products or create a new product."""
    
    if request.method == 'GET':
        # Get query params for filtering
        category = request.query_params.get('category')
        search = request.query_params.get('search')
        low_stock = request.query_params.get('low_stock')
        is_active = request.query_params.get('is_active', 'true')
        
        query = "SELECT * FROM products WHERE 1=1"
        params = []
        
        if is_active.lower() == 'true':
            query += " AND is_active = true"
        
        if category:
            query += " AND category = %s"
            params.append(category)
        
        if search:
            query += " AND name ILIKE %s"
            params.append(f'%{search}%')
        
        if low_stock and low_stock.lower() == 'true':
            query += " AND stock < min_stock"
        
        query += " ORDER BY name"
        
        try:
            with connection.cursor() as cursor:
                cursor.execute(query, params)
                products = dict_fetchall(cursor)
            
            serializer = ProductSerializer(products, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    elif request.method == 'POST':
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            try:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        INSERT INTO products (name, category, price, cost_price, stock, min_stock, image_url, is_active)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING *
                        """,
                        [
                            data['name'],
                            data.get('category', 'Other'),
                            data['price'],
                            data.get('cost_price'),
                            data.get('stock', 0),
                            data.get('min_stock', 10),
                            data.get('image_url'),
                            data.get('is_active', True)
                        ]
                    )
                    product = dict_fetchone(cursor)
                
                return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminOrReadOnly])
def product_detail(request, pk):
    """Retrieve, update or delete a product."""
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM products WHERE id = %s", [pk])
            product = dict_fetchone(cursor)
        
        if not product:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    if request.method == 'GET':
        return Response(ProductSerializer(product).data)
    
    elif request.method == 'PUT':
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            try:
                with connection.cursor() as cursor:
                    cursor.execute(
                        """
                        UPDATE products 
                        SET name = %s, category = %s, price = %s, cost_price = %s, 
                            stock = %s, min_stock = %s, image_url = %s, is_active = %s,
                            updated_at = NOW()
                        WHERE id = %s
                        RETURNING *
                        """,
                        [
                            data['name'],
                            data.get('category', 'Other'),
                            data['price'],
                            data.get('cost_price'),
                            data.get('stock', 0),
                            data.get('min_stock', 10),
                            data.get('image_url'),
                            data.get('is_active', True),
                            pk
                        ]
                    )
                    updated_product = dict_fetchone(cursor)
                
                return Response(ProductSerializer(updated_product).data)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        try:
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM products WHERE id = %s", [pk])
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH'])
@permission_classes([IsAdminOrReadOnly])
def adjust_stock(request, pk):
    """Adjust product stock (increment/decrement)."""
    serializer = StockAdjustmentSerializer(data=request.data)
    
    if serializer.is_valid():
        adjustment = serializer.validated_data['adjustment']
        
        try:
            with connection.cursor() as cursor:
                # Check current stock
                cursor.execute("SELECT stock FROM products WHERE id = %s", [pk])
                row = cursor.fetchone()
                
                if not row:
                    return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
                
                current_stock = row[0]
                new_stock = current_stock + adjustment
                
                if new_stock < 0:
                    return Response(
                        {'error': f'Insufficient stock. Current: {current_stock}, Adjustment: {adjustment}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                cursor.execute(
                    """
                    UPDATE products SET stock = %s, updated_at = NOW()
                    WHERE id = %s
                    RETURNING *
                    """,
                    [new_stock, pk]
                )
                product = dict_fetchone(cursor)
            
            return Response(ProductSerializer(product).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def categories(request):
    """Get all product categories."""
    categories = ['Bakery', 'Chips', 'Cold Drink', 'Tobacco Items', 'Fast Food', 'Grocery', 'Ice Cream', 'Chocolates', 'Battery', 'Other']
    return Response(categories)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def low_stock_products(request):
    """Get products with low stock."""
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT * FROM products 
                WHERE stock < min_stock AND is_active = true
                ORDER BY stock ASC
                """
            )
            products = dict_fetchall(cursor)
        
        return Response(ProductSerializer(products, many=True).data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
