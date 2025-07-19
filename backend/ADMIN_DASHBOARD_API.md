# Admin Dashboard API Endpoints

This document describes the backend API endpoints for the admin dashboard home page functionality.

## Authentication

All admin endpoints require authentication using JWT tokens. Admin login is required first:

### Admin Login
```
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Response:
```json
{
  "message": "Admin login successful",
  "token": "jwt_token_here"
}
```

## Revenue Analytics

### Get Revenue Data
```
GET /api/admin/revenue?range={7|30|365}
Authorization: Bearer {token}
```

**Parameters:**
- `range`: Time period in days (7, 30, or 365)

**Response:**
```json
{
  "totalRevenue": 1234.56,
  "totalOrders": 15,
  "averageOrderValue": 82.30,
  "timeRange": "7"
}
```

## Active Orders

### Get Active Orders
```
GET /api/admin/orders/active
Authorization: Bearer {token}
```

**Response:**
```json
{
  "activeOrders": [
    {
      "orderNumber": "ORD-1703123456-123",
      "customerName": "Test User1",
      "total": 60.84,
      "status": "processing",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Dashboard Summary

### Get Dashboard Summary
```
GET /api/admin/dashboard/summary
Authorization: Bearer {token}
```

**Response:**
```json
{
  "todayRevenue": 189.43,
  "todayOrders": 2,
  "pendingOrders": 3,
  "totalUsers": 25
}
```

## Database Queries

The endpoints use the following database tables:
- `orders`: Main order data with totals and status
- `users`: User count for summary
- `order_items`: Individual items in orders

### Revenue Calculation
Revenue is calculated from completed orders within the specified time range:
```sql
SELECT 
  COALESCE(SUM(total), 0) as total_revenue,
  COUNT(*) as total_orders,
  COALESCE(AVG(total), 0) as average_order_value
FROM orders 
WHERE created_at >= CURRENT_DATE - INTERVAL '{range} days' 
  AND payment_status = 'completed'
```

### Active Orders Query
Active orders are those with status 'processing', 'pending', or 'shipping':
```sql
SELECT 
  order_number,
  first_name,
  last_name,
  total,
  order_status,
  created_at
FROM orders 
WHERE order_status IN ('processing', 'pending', 'shipping')
ORDER BY created_at DESC 
LIMIT 10
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad request (missing parameters)
- `401`: Unauthorized (invalid token)
- `500`: Server error

Error responses include a message:
```json
{
  "error": "Failed to fetch revenue data"
}
```

## Testing

Use the provided test script to verify endpoints:
```bash
node test-admin-endpoints.js
```

Make sure the database is seeded with sample data first:
```bash
npm run setup-db
``` 