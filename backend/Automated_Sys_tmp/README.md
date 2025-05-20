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
### Change Password

**POST** `/api/core/change-password/`

- **Description:**
  Endpoint to change the current user's password. Requires the old password and the new password. The user must be authenticated.

- **Request Example:**
```json
{
    "old_password": "current_password",
    "new_password": "new_secure_password"
}
```

- **New Password Requirements:**
  - Must be at least 8 characters long.

- **Response Examples:**
    - **Success:**
    ```json
    {
        "message": "Password changed successfully"
    }
    ```
    - **Failure (incorrect old password):**
    ```json
    {
        "error": "Old password is incorrect"
    }
    ```
    - **Failure (new password too short):**
    ```json
    {
        "error": "New password must be at least 8 characters long"
    }
    ```
    - **Failure (missing fields):**
    ```json
    {
        "error": "Both old_password and new_password are required"
    }
    ```
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
| `DELETE`    | Remove a menu item from an order.                        | `/api/restaurant/{system_id}/orders/{order_id}/items/{item_id}`


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

Description: Update order status to preparing or ready.

Example Request Body:

```json

{
  "status": "ready"
}
```

---
# 📊 Finances Dashboard API Documentation

## 1. Total Profit Overview
### Endpoint

GET /api/restaurant/<system_id>/orders/analytics/profit-summary/

### Response Example
json
{
  "day_profit": 2450,
  "day_change": 12.5,
  "week_profit": 15780,
  "week_change": 8.2,
  "month_profit": 64320,
  "month_change": -2.4
}

- *day_profit*: Current day's profit.
- *day_change*: Change percentage compared to yesterday.
- *week_profit*: This week's profit.
- *week_change*: Change percentage compared to last week.
- *month_profit*: This month's profit.
- *month_change*: Change percentage compared to last month.

---

## 2. Profit Trend (Line Chart)
### Endpoint

GET /api/restaurant/<system_id>/orders/analytics/profit-trend/?view=daily
GET /api/restaurant/<system_id>/orders/analytics/profit-trend/?view=monthly

- *view=daily*: Daily profits for last 30 days (default).
- *view=monthly*: Monthly profits for last 12 months.

### Response Example
json
[
  {"date": "2025-04-01", "profit": 320.50},
  {"date": "2025-04-02", "profit": 420.20}
]

---

## 3. Order Count (KPI Cards)
### Endpoint

GET /api/restaurant/<system_id>/orders/analytics/order-summary/

### Response Example
json
{
  "today_orders": 45,
  "today_change": 10.5,
  "week_orders": 230,
  "week_change": -3.2,
  "month_orders": 812,
  "month_change": 5.7
}

- *today_orders*: Number of orders today.
- *today_change*: Change percentage compared to yesterday.
- *week_orders*: Number of orders this week.
- *week_change*: Change percentage compared to last week.
- *month_orders*: Number of orders this month.
- *month_change*: Change percentage compared to last month.

---

## 4. Top Waiters (Table)
### Endpoint

GET /api/restaurant/<system_id>/orders/analytics/waiters/?range=day
GET /api/restaurant/<system_id>/orders/analytics/waiters/?range=week
GET /api/restaurant/<system_id>/orders/analytics/waiters/?range=month

- *range*: Filter by day, week, or month (day, week, month).

### Response Example
json
[
  {"waiter": "Ali Hassan", "orders": 34},
  {"waiter": "Sara Nabil", "orders": 29}
]

---

# 🔒 Permissions
- All endpoints require authentication.
- Roles: System Owner (owner), Manager (manager), Cashier (cashier).

---

# ⚡ Notes
- All financial values are based only on completed orders (status='completed').
- If no data appears for certain periods, ensure there are completed orders in those periods.

## 🧑‍🍳 Waiter Display System (WDS)

**Description:**
A dedicated interface for waiters to view and manage active orders in the restaurant.

### Main Endpoints:
- **List all active orders:**
  `GET /api/restaurant/{system_id}/waiter/orders/`
- **Get table status:**
  `GET /api/restaurant/{system_id}/waiter/orders/tables/`
- **Update order status:**
  `PATCH /api/restaurant/{system_id}/waiter/orders/{order_id}/`
- **Get order details:**
  `GET /api/restaurant/{system_id}/waiter/orders/{order_id}/`
- **Create new order:**
  `POST /api/restaurant/{system_id}/waiter/orders/`
- **Add item to order:**
  `POST /api/restaurant/{system_id}/waiter/orders/{order_id}/items/`
- **Remove item from order:**
  `DELETE /api/restaurant/{system_id}/waiter/orders/{order_id}/items/{item_id}/`

---

## 🚚 Delivery System

**Description:**
APIs for managing delivery orders from the restaurant to customers outside the restaurant.

### Main Endpoints:
- **List all delivery orders:**
  `GET /api/restaurant/{system_id}/delivery/orders/`
- **Create new delivery order:**
  `POST /api/restaurant/{system_id}/delivery/orders/`
- **Update delivery order status:**
  `PATCH /api/restaurant/{system_id}/delivery/orders/{order_id}/`
- **Get delivery order details:**
  `GET /api/restaurant/{system_id}/delivery/orders/{order_id}/`

---

**Notes:**
- All endpoints require authentication.
- You can customize responses as needed (success, error, etc).

#update profile by ali
### Update Profile

**PATCH** `/api/core/profile/update/`

- **Description:**
  Endpoint to update the authenticated user's profile information. Requires the current password for verification. Allows updating username, email, first name, last name, and phone number.

- **Request Example:**
```json
{
    "current_password": "your_current_password",
    "username": "new_username",
    "email": "new_email@example.com",
    "first_name": "New First Name",
    "last_name": "New Last Name",
    "phone": "1234567890"
}
```

- **Notes:**
  - All fields except `current_password` are optional. Send only the fields you want to update.
  - Username and email must be unique (excluding the current user).
  - If the user is an employee, the phone number in their employee profile will also be updated.

- **Response Examples:**
    - **Success:**
    ```json
    // Returns the updated profile data (similar to GET /api/core/profile/)
    {
        "user": {
            "username": "new_username",
            "email": "new_email@example.com",
            "first_name": "New First Name",
            "last_name": "New Last Name",
            "date_joined": "..."
        },
        "role": "...",
        "systems": "..."
    }
    ```
    - **Failure (incorrect current password):**
    ```json
    {
        "current_password": [
            "Current password is incorrect"
        ]
    }
    ```
    - **Failure (username already taken):**
    ```json
    {
        "username": [
            "Username already taken"
        ]
    }
    ```
    - **Failure (email already taken):**
    ```json
    {
        "email": [
            "Email already taken"
        ]
    }
    ```
    - **Failure (missing current password):**
    ```json
    {
        "current_password": [
            "This field is required."
        ]
    }
    ```

---
