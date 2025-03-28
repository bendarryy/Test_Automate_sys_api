# Automated_Sys_tmp



## API_Documentation
#graduatoin


### Account Managment 

**POST** `/api/core/register/`

**Request Body:**

```json
	{
	"username":  "user80",
	"password": "password"   
	}
```
**Responses:**

- **201 Created**: User registered successfully.
- **400 Bad Request**: Errors with the registration data.

---

**POST** `/api/core/login/`

**Request Body:**

```json
	{
	"username":  "user80",
	"password": "password"   
	}
```

**Responses:**

- **200 OK**: Login successful.
- **400 Bad Request**: Errors related to credentials.

---

**GET** `/api/core/logout/`

**Responses:**

- **200 OK**:    Logged out successfully

---

**GET** `/admin/`

**Description:**  
This endpoint provides a custom admin panel for each user to manage their resources 

---

**POST** `/api/core/create-system/`

**Request Body:**
- *==Don't touch its Under Development==*   
```json
# Don't touch its Under Devolpment 
{
    "name": "new_systemmm",
    "category": "restaurant"
}
```

**Responses:**

- **201 Created**: System created successfully.
- **400 Bad Request**: Missing required fields.

---

### System 
 
- GET  ` /api/core/systems`   → List all systems


### Menu Items

- GET   ` /api/restaurant/{system_id}/menu-items/  `       → List all menu items
	- ` /api/restaurant/{system_id}/menu-items/?category=food ` → filter menu based on (food or drink or soups or dessert)
- POST    `/api/restaurant/{system_id}/menu-items/  `         → Create a new menu item
- GET     ` /api/restaurant/{system_id}/menu-items/{id}/`     → Retrieve a specific item
- PUT    ` /api/restaurant/{system_id}/menu-items/{id}/`     → Update an item
- PATCH  ` /api/restaurant/{system_id}/menu-items/{id}/`     → Partially update an item
- DELETE  ` /api/restaurant/{system_id}/menu-items/{id}/`     → Delete an item



### Ordering


| Method      | Purpose                                                  | Endpoint                                                         |
| ----------- | -------------------------------------------------------- | ---------------------------------------------------------------- |
| `GET`       | List all orders                                          | `/api/restaurant/{system_id}/orders/`                            |
| `POST`      | Create a new order.                                      | `/api/restaurant/{system_id}/orders/`                            |
| `GET`       | Get a specific order.                                    | `/api/restaurant/{system_id}/orders/{order_id}/`                 |
| `PUT/PATCH` | Update order (e.g. change status).                       | `/api/restaurant/{system_id}/orders/{order_id}/`                 |
| `DELETE`    | Cancel or delete an order.                               | `/api/restaurant/{system_id}/orders/{order_id}/`                 |
| `GET`       | List items in an order.                                  | `/api/restaurant/{system_id}/orders/{order_id}/items/`           |
| `POST`      | Add a menu item to an order.                             | `/api/restaurant/{system_id}/orders/{order_id}/items/`           |
| `DELETE`    | Remove a menu item from an order.                        | `/api/restaurant/{system_id}/orders/{order_id}/items/{item_id}


 **Create Order (POST)** 
- Open New Order
```json
POST /api/restaurant/5/orders/
{
    "customer_name": "Ahmed Mohamed",
    "table_number": "12",
    "waiter": 3,   // Optional Waiter / casher  Logged in 
    "status": "pending"   // Optional  by default pending
}

```

**Add one Item to Order (POST)** 
```json
POST /api/restaurant/5/orders/10/items/
{ "menu_item": 1, "quantity": 1 }
```

**📌 Example Order Multiple Items at Once!**
```json
POST /api/restaurant/5/orders/6/items/
[
    { "menu_item": 1, "quantity": 50 },
    { "menu_item": 3, "quantity": 50 },
    { "menu_item": 1, "quantity": 50 }
]
```



**Change Order Status Using Patch**
 - pending
 - preparing
 - ready
 - completed
 - canceled
    
```json
PATCH api/restaurant/5/orders/6/

  {"status": "completed"}

```

**GET Order Details (To do the bills)**
- Example 
```json
GET /api/restaurant/5/orders/6/

    "id": 6,
    "system": 5,
    "customer_name": "kaka",
    "table_number": "1",
    "waiter": null,
    "total_price": "321.00",
    "status": "pending",
    "order_items": [
        {
            "id": 7,
            "menu_item": 1,
            "menu_item_name": "Manga",
            "quantity": 1
        },
        ...............................
    ],
    "created_at": "2025-03-25T22:28:32.042890Z",
    "updated_at": "2025-03-25T23:01:53.508999Z"
```