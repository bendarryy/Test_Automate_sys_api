# Purchase Orders and Goods Receiving - API Endpoints


## Purchase Orders

### 1. List/Create Purchase Orders

```
GET/POST /api/systems/{system_id}/purchase-orders/
```

- GET: List all purchase orders for the system
- POST: Create a new purchase order
- Required fields: supplier_id, product_id, quantity, price, order_date
- Optional fields: expected_delivery_date

### 2. Retrieve/Update/Delete Purchase Order

```
GET/PUT/PATCH/DELETE /api/systems/{system_id}/purchase-orders/{id}/
```

- GET: Get details of a specific purchase order
- PUT/PATCH: Update a purchase order
- DELETE: Delete a purchase order

### 3. List Pending Purchase Orders

```
GET /api/systems/{system_id}/purchase-orders/pending/
```

- Lists all purchase orders with 'pending' status
- Ordered by expected_delivery_date

### 4. List Partially Received Purchase Orders

```
GET /api/systems/{system_id}/purchase-orders/partially-received/
```

- Lists all purchase orders with 'partially_received' status
- Ordered by expected_delivery_date

## Goods Receiving

### 1. List/Create Goods Receiving Records

```
GET/POST /api/systems/{system_id}/goods-receiving/
```

- GET: List all goods receiving records for the system
- POST: Create a new goods receiving record
- Required fields: purchase_order_id, received_quantity, received_date
- Optional fields: expiry_date, location

### 2. Retrieve/Update/Delete Goods Receiving Record

```
GET/PUT/PATCH/DELETE /api/systems/{system_id}/goods-receiving/{id}/
```

- GET: Get details of a specific goods receiving record
- PUT/PATCH: Update a goods receiving record
- DELETE: Delete a goods receiving record

### 3. List Goods Receiving by Purchase Order

```
GET /api/systems/{system_id}/goods-receiving/by-purchase-order/?purchase_order_id=1
```

- Lists all goods receiving records for a specific purchase order
- Query parameter: purchase_order_id (required)

## Example Usage



### Create a Purchase Order

```bash
POST /api/systems/1/purchase-orders/
{
    "supplier_id": 1,
    "product_id": 5,
    "quantity": 100,
    "price": 50.00,
    "order_date": "2024-03-20"
}
```

### Create a Goods Receiving Record

```bash
POST /api/systems/1/goods-receiving/
{
    "purchase_order_id": 1,
    "received_quantity": 50,
    "received_date": "2024-03-25",
    "expiry_date": "2024-12-31",
    "location": "Warehouse A"
}
```

### Get Pending Purchase Orders

```bash
GET /api/systems/1/purchase-orders/pending/
```

### Get Goods Receiving Records for a PO

```bash
GET /api/systems/1/goods-receiving/by-purchase-order/?purchase_order_id=1
```
