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
A dedicated interface for waiters to view and manage active orders in the restaurant. This system allows waiters to:
- View all active orders in the restaurant
- Check the status of all tables
- Update the status of orders

### API Endpoints

#### GET Endpoints
1. **List Active Orders**
   ```http
   GET /api/restaurant/{system_id}/waiter/orders/
   ```
   - Returns a list of all active orders in the restaurant
   - Orders are filtered to show only those with status "ready" or "served"
   - Response includes order details, customer info, and items

2. **Get Table Status**
   ```http
   GET /api/restaurant/{system_id}/waiter/orders/tables/
   ```
   - Returns the current status of all tables in the restaurant
   - Shows which tables are occupied and their current order status
   - Response format:
     ```json
     {
       "table_number": {
         "status": "ready|served",
         "current_order": {
           "id": 123,
           "customer_name": "John Doe",
           "status": "ready"
         }
       }
     }
     ```

#### PATCH Endpoint
1. **Update Order Status**
   ```http
   PATCH /api/restaurant/{system_id}/waiter/orders/{order_id}/
   ```
   - Updates the status of a specific order
   - Required body:
     ```json
     {
       "status": "pending|preparing|ready|served|completed|canceled"
     }
     ```
   - Returns the updated order details
   - Only authorized roles (waiter, cashier, manager) can update status

## 🚚 Delivery System

**Description:**
APIs for managing delivery orders from the restaurant to customers outside the restaurant. This system allows delivery drivers to:
- View all active delivery orders
- Update the status of delivery orders

### API Endpoints

#### GET Endpoints
1. **List Active Delivery Orders**
   ```http
   GET /api/restaurant/{system_id}/delivery/orders/
   ```
   - Returns a list of all active delivery orders
   - Orders are filtered to show only those with status "ready" or "out_for_delivery"
   - Response includes order details, customer info, and items
   - Example Response:
     ```json
     [
       {
         "id": 123,
         "customer_name": "John Doe",
         "status": "ready",
         "order_items": [
           {
             "id": 1,
             "menu_item_name": "Pizza",
             "quantity": 2
           }
         ],
         "total_price": "50.00",
         "created_at": "2025-04-27T14:00:00Z"
       }
     ]
     ```

2. **Get Active Orders**
   ```http
   GET /api/restaurant/{system_id}/delivery/orders/active/
   ```
   - Returns only orders with status "ready" or "out_for_delivery"
   - Same response format as list endpoint

3. **Get Completed Orders**
   ```http
   GET /api/restaurant/{system_id}/delivery/orders/completed/
   ```
   - Returns all completed delivery orders
   - Same response format as list endpoint

4. **Get Canceled Orders**
   ```http
   GET /api/restaurant/{system_id}/delivery/orders/canceled/
   ```
   - Returns all canceled delivery orders
   - Same response format as list endpoint

#### PATCH Endpoint
1. **Update Delivery Order Status**
   ```http
   PATCH /api/restaurant/{system_id}/delivery/orders/{order_id}/
   ```
   - Updates the status of a specific delivery order
   - Required body:
     ```json
     {
       "status": "pending|preparing|ready|out_for_delivery|completed|canceled"
     }
     ```
   - Returns the updated order details
   - Only authorized roles (delivery_driver, manager) can update status

### Authentication & Permissions
- All endpoints require authentication
- Roles with access:
  - System Owner: Full access
  - Delivery Driver: Can view orders and update status
  - Manager: Full access
  - Cashier: Can view orders only

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

### Table and Order Management

This section documents the endpoints related to managing tables and creating orders, including the new table status endpoint and the validation for occupied tables.

#### GET /api/restaurant/{system_id}/tables/

- **Description:** Retrieves the current status of all tables in a specific restaurant system, indicating whether each table is occupied by an active in-house order and providing details of the order if occupied.
- **Authentication:** Required.
- **Permissions:** Accessible by users with 'waiter', 'cashier', or 'manager' roles, as well as the system owner.
- **URL Example:** `/api/restaurant/5/tables/` (for system with ID 5)
- **Response Example:**
```json
[
    {
        "table_number": "1",
        "is_occupied": true,
        "current_order": {
            "order_id": 123,
            "status": "preparing",
            "customer_name": "أحمد",
            "waiter": "محمد",
            "created_at": "2024-03-20T15:30:00Z"
        }
    },
    {
        "table_number": "2",
        "is_occupied": false,
        "current_order": null
    }
    // ... other tables
]
```

#### POST /api/restaurant/{system_id}/orders/

- **Description:** Creates a new order for a specific restaurant system. Includes validation to prevent creating a new in-house order on a table that is already occupied by an active order.
- **Authentication:** Required.
- **Permissions:** Accessible by users with 'waiter', 'cashier', or 'manager' roles, as well as the system owner.
- **URL Example:** `/api/restaurant/5/orders/` (for system with ID 5)
- **Request Body Example:** (See OrderSerializer fields for full details)
```json
{
    "table_number": "5",
    "customer_name": "Example Customer",
    "waiter": 1, 
    "order_type": "in_house", 
    "status": "pending", 
    "order_items": [
        {
            "menu_item": 1, 
            "quantity": 2
        }
    ]
}
```
- **Table Occupancy Check:** If an attempt is made to create an `in_house` order for a `table_number` that is currently associated with another active order (status 'pending', 'preparing', 'ready', or 'served') within the same system, the request will be rejected.
- **Error Response (Table Conflict):** In case of a table conflict, the API will return a `409 Conflict` status code with a JSON response similar to this:
```json
{
    "detail": "Table [Table Number] is already occupied by order #[Order ID]"
}
```

---

# 📊 Supermarket Analytics Dashboard API Documentation

## Overview
This section documents the analytics endpoints for the supermarket system, providing insights into order counts, trends, and performance metrics.

## Authentication
- All endpoints require authentication (Token Authentication)
- Accessible by system owners, managers, and cashiers

## Endpoints

### 1. Order Summary
**GET** `/api/supermarket/{system_id}/orders/analytics/order-summary/`

Returns a summary of order counts for different time periods with change percentages.

**Response Example:**
```json
{
    "day_orders": 45,
    "day_change": 10.5,
    "week_orders": 230,
    "week_change": -3.2,
    "month_orders": 812,
    "month_change": 5.7
}
```

**Fields Description:**
- `day_orders`: Number of orders today
- `day_change`: Percentage change compared to yesterday
- `week_orders`: Number of orders this week
- `week_change`: Percentage change compared to last week
- `month_orders`: Number of orders this month
- `month_change`: Percentage change compared to last month

---

### 2. Order Trend
**GET** `/api/supermarket/{system_id}/orders/analytics/order-trend/?view=daily|monthly`

Returns order trend data for either daily (last 30 days) or monthly (last 12 months) view.

**Query Parameters:**
- `view`: Type of view (default: 'daily')
  - `daily`: Shows last 30 days of data
  - `monthly`: Shows last 12 months of data

**Response Example (Daily):**
```json
[
    {
        "date": "2025-04-01",
        "orders": 32
    },
    {
        "date": "2025-04-02",
        "orders": 42
    }
]
```

**Response Example (Monthly):**
```json
[
    {
        "date": "2025-01",
        "orders": 1250
    },
    {
        "date": "2025-02",
        "orders": 1380
    }
]
```

---

### 3. Top Cashiers
**GET** `/api/supermarket/{system_id}/orders/analytics/cashiers/?range=day|week|month`

Returns a list of top 10 cashiers by order count for different time ranges.

**Query Parameters:**
- `range`: Time range for analysis (default: 'day')
  - `day`: Today's data
  - `week`: Last 7 days
  - `month`: Last 30 days

**Response Example:**
```json
[
    {
        "cashier": "Ali Hassan",
        "orders": 34
    },
    {
        "cashier": "Sara Nabil",
        "orders": 29
    }
]
```

---

### 4. Peak Hours
**GET** `/api/supermarket/{system_id}/orders/analytics/peak-hours/`

Returns order count by hour for the last 7 days, helping identify peak business hours.

**Response Example:**
```json
[
    {
        "hour": "09:00",
        "orders": 15
    },
    {
        "hour": "10:00",
        "orders": 25
    },
    {
        "hour": "11:00",
        "orders": 30
    }
]
```

## Error Responses

All endpoints may return the following error responses:

**401 Unauthorized:**
```json
{
    "detail": "Authentication credentials were not provided."
}
```

**400 Bad Request:**
```json
{
    "error": "Error message describing the issue"
}
```

## Notes
- All order counts are based on completed sales
- Percentages are rounded to one decimal place
- Dates are returned in ISO format (YYYY-MM-DD)
- Time is in 24-hour format (HH:00)
- Cashier names are based on their usernames
- Peak hours analysis includes data from the last 7 days only

## Implementation Details
- Created by: Ali
- Last Updated: [Current Date]
- Dependencies: Django REST Framework, Django
- Database: Uses existing Sale and SaleItem models

---
