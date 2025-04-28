# Automated_Sys_tmp



## API_Documentation
#graduatoin


### Account Managment 
#### Owner 

**POST** `/api/core/register/`

```json
	{
	"username":  "user11",
	"password": "password" ,
  "email":"user1+1@sys.com"
	}
```

**POST** `/api/core/login/`

```json
	{
	"username":  "user80",
	"password": "password"   
	}
```

---

**GET** `/api/core/logout/`
- Logout from Owner && Employee 

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
---


#### Employee 
Onwer Can invite Employee (Creating Employee and join him to his system )

Invite an Employee
`POST /api/core/5/invite/`
```
{
    "name": "Mohamed Ali",
    "role": "waiter",
    "phone": "01012345678",
    "email": "mohamed@restaurant.com",
    "password": "strongpassword"
}

```

Login as Employee
`POST /api/core/employee/login/`
```
{
    "email": "mohamed@restaurant.com",
    "password": "strongpassword"
}

```

| Endpoint              | Method  | URL Example                | Request Body Example              | Description                                                      |
|------------------------|---------|-----------------------------|-----------------------------------|------------------------------------------------------------------|
| List Employees         | GET     | `/api/core/5/employees/`     | None                              | Get all employees for system with ID 5.                         |
| Get Employee Detail    | GET     | `/api/core/5/employees/8/`   | None                              | Get details of employee with ID 8 under system 5.               |
| Update Employee        | PUT     | `/api/core/5/employees/8/`   | `{ "phone": "01123456789" }`       | Update one or more fields of an employee (e.g., phone only, passowrd only ..etc).     |
| Delete Employee        | DELETE  | `/api/core/5/employees/8/`   | None                              | Delete employee with ID 8 under system 5. Also deletes their user account. |


`PUT /api/core/5/employees/8/`
```json
{
  "phone": "01123456789",
  "email": "newemail@example.com",
  "password": "NewStrongPassword123!"
}
 or on feild (its flixable even one feild can be updated)
{
  "password": "OnlyPasswordChange123!"
}

```
---
---
---

### View All User information  ownere && Employee 
`GET /api/core/profile/`

```json
{
    "user": {
        "username": "user80",
        "email": "",
        "first_name": "",
        "last_name": "",
        "date_joined": "2025-03-25T00:04:50Z"
    },
    "role": "owner",
    "systems": [
        {
            "name": "new_system",
            "category": "restaurant",
            "id": 2
        },
        {
            "name": "belan",
            "category": "restaurant",
            "id": 5
        }
    ]
}
```

```json
{
    "user": {
        "username": "koko@email.com",
        "email": "koko@email.com",
        "first_name": "",
        "last_name": "",
        "date_joined": "2025-04-28T12:39:20.808281Z"
    },
    "role": "waiter",
    "systems": 5
}
```

---
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
## 🍽️ Kitchen Management


### Authentication:
- Required (Token Authentication)

---

### 🔹 Retrieve Pending and Preparing Orders
**GET** `/api/restaurant/{system_id}/kitchen/orders/`

- **Description:**  
  Returns all orders with status `pending` or `preparing` for a specific restaurant system.

- **Sample Response:**
```json
[
  {
    "id": 12,
    "table_number": 5,
    "status": "pending",
    "order_items": [
      {
        "id": 1,
        "menu_item_name": "Pizza",
        "quantity": 2
      }
    ],
    "created_at": "2025-04-27T14:00:00Z"
  }
]
```

**To Update the status** 

`PATCH /api/restaurant/{system-id}/kitchen/orders/{id}/	`

Description: تحديث حالة الطلب لـ preparing أو ready.

Example Request Body:

```json

{
  "status": "ready"
}
```

---
