# Tarkeeb - Multi-Tenancy Business Management Platform

[![Django](https://img.shields.io/badge/Django-5.0.2-green.svg)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/DRF-3.14.0-blue.svg)](https://www.django-rest-framework.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-yellow.svg)](https://www.python.org/)
[![Portfolio](https://img.shields.io/badge/Portfolio-Project-orange.svg)](https://github.com/bendarryy)

A comprehensive Django-based multi-tenancy SaaS platform that demonstrates advanced web development skills and architectural patterns. This project showcases the implementation of a business management system that enables different types of businesses (restaurants, supermarkets, workshops) to operate through dedicated subdomains with complete data isolation.

## 🚀 Project Overview

This portfolio project demonstrates expertise in:
- **Multi-Tenancy Architecture**: Subdomain-based tenant isolation (`*.public.platform.com`)
- **Business Logic Implementation**: Complete restaurant and supermarket management systems
- **API Design**: RESTful APIs with JWT authentication and role-based access control
- **Database Design**: Complex relational models with proper foreign key relationships
- **Security Implementation**: Two-factor authentication, rate limiting, and data isolation
- **Real-world Business Features**: Order management, inventory tracking, POS systems

## 🏗️ Technical Architecture

### Core Platform Features
- **Multi-Tenancy Architecture**: Subdomain-based tenant isolation (`*.public.platform.com`)
- **Business Type Support**: Restaurants, Supermarkets, Workshops, and more
- **Role-Based Access Control**: Owner, Manager, Chef, Waiter, Delivery, Cashier roles
- **Offline-First Support**: Local data caching and synchronization for mobile/desktop
- **RESTful API**: Complete API for both web and mobile applications
- **Public Profiles**: Customizable public-facing business profiles
- **Real-time Updates**: Live order tracking and status updates

### Restaurant Management System
- **Menu Management**: Categories, pricing, discounts, special offers
- **Order Processing**: In-house and delivery orders with real-time tracking
- **Kitchen Display System (KDS)**: Real-time order management for kitchen staff
- **Table Management**: Multi-table restaurant operations
- **Inventory Tracking**: Ingredient and stock management
- **Payment Processing**: Multiple payment methods support

### Supermarket Management System
- **Product Catalog**: Barcode support, categories, pricing
- **Inventory Management**: Stock tracking, expiry dates, batch management
- **Point of Sale (POS)**: Sales transactions, receipts, discounts
- **Supplier Management**: Purchase orders, goods receiving
- **Stock Alerts**: Low stock notifications and expiry warnings
- **Sales Analytics**: Profit tracking and reporting

### Security & Authentication
- **JWT Authentication**: Secure token-based authentication
- **Two-Factor Authentication**: Enhanced security with email codes
- **Role-Based Permissions**: Granular access control per business type
- **Data Isolation**: Complete tenant data separation
- **Rate Limiting**: API protection against abuse

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Multi-Tenancy Platform                   │
├─────────────────────────────────────────────────────────────┤
│  Core App (Users, Auth, System Management)                 │
│  ├── System Model (Tenant Isolation)                       │
│  ├── User Management & Roles                               │
│  ├── Subdomain Middleware                                  │
│  └── Shared Utilities                                      │
├─────────────────────────────────────────────────────────────┤
│  Business Apps (Per Tenant Type)                           │
│  ├── Restaurant App                                        │
│  │   ├── Menu Items                                        │
│  │   ├── Orders & Payments                                 │
│  │   ├── Kitchen Display                                   │
│  │   └── Inventory                                         │
│  ├── Supermarket App                                       │
│  │   ├── Products & Barcodes                               │
│  │   ├── Sales & POS                                       │
│  │   ├── Suppliers & Orders                                │
│  │   └── Stock Management                                  │
│  └── Workshop App (Future)                                 │
├─────────────────────────────────────────────────────────────┤
│  Public App (Customer-Facing)                              │
│  ├── Public Business Profiles                              │
│  ├── Menu Display                                          │
│  └── Order Placement                                       │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Backend Development
- **Django 5.0.2**: Web framework with advanced ORM
- **Django REST Framework 3.14.0**: API development with serializers
- **Django CORS Headers**: Cross-origin resource sharing
- **DRF Simple JWT**: JWT authentication implementation
- **Django Rate Limit**: API protection and throttling
- **Cloudinary**: Cloud image storage and management
- **Pillow**: Image processing and manipulation

### Database & Infrastructure
- **SQLite/PostgreSQL**: Database with configurable backends
- **Gunicorn**: Production WSGI server
- **WhiteNoise**: Static file serving
- **Nginx**: Reverse proxy for production deployment
- **Docker**: Containerization and deployment

### Development & Documentation
- **DRF YASG**: API documentation with Swagger/OpenAPI
- **Python-dotenv**: Environment management
- **DJ Database URL**: Database configuration management

## 📁 Project Structure

```
tarkeeb-platform/
├── automation_system/          # Main Django project
│   ├── settings.py            # Django settings configuration
│   ├── urls.py               # Main URL routing
│   └── wsgi.py               # WSGI application entry point
├── core/                      # Core application
│   ├── models.py             # System, User, Employee models
│   ├── views.py              # Authentication & user management
│   ├── serializers.py        # API serializers
│   ├── permissions.py        # Role-based permissions
│   └── role_actions.json     # Role definitions and permissions
├── restaurant/               # Restaurant business app
│   ├── models.py             # Menu, Orders, Payments models
│   ├── views.py              # Restaurant API views
│   └── serializers.py        # Restaurant serializers
├── supermarket/              # Supermarket business app
│   ├── models.py             # Products, Sales, Inventory models
│   ├── views.py              # Supermarket API views
│   └── serializers.py        # Supermarket serializers
├── public/                   # Public-facing app
│   ├── views.py              # Public business profiles
│   └── urls.py               # Public URL routing
├── middleware/               # Custom middleware
│   └── subdomain.py          # Subdomain extraction logic
├── workshop/                 # Workshop business app (future)
├── requirements.txt          # Python dependencies
├── manage.py                 # Django management script
└── README.md                 # Project documentation
```

## 🔧 Key Implementation Features

### Multi-Tenancy Implementation
- **Subdomain-based isolation**: Each business gets a unique subdomain
- **Data separation**: Complete isolation between tenant data
- **Middleware handling**: Custom middleware for subdomain extraction
- **Role-based access**: Different permissions per business type

### Business Logic Examples

#### Restaurant Order Management
```python
# Order creation with real-time status tracking
class Order(models.Model):
    system = models.ForeignKey(System, on_delete=models.CASCADE)
    customer_name = models.CharField(max_length=100)
    order_type = models.CharField(choices=[("in_house", "In-House"), ("delivery", "Delivery")])
    status = models.CharField(choices=STATUS_CHOICES, default="pending")
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
```

#### Supermarket Inventory Management
```python
# Product batch tracking with expiry dates
class ProductBatch(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    expiry_date = models.DateField()
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE)
```

### API Design Patterns
- **RESTful endpoints**: Consistent API design across all business types
- **JWT authentication**: Secure token-based authentication
- **Role-based permissions**: Granular access control
- **Rate limiting**: API protection against abuse

## 🚀 Demo Features

### Business Registration Flow
1. **User Registration**: Create account with email verification
2. **Business Type Selection**: Choose restaurant, supermarket, or workshop
3. **System Configuration**: Set up business details, logo, and settings
4. **Subdomain Access**: Business available at `yourbusiness.public.platform.com`

### API Endpoints Showcase

#### Authentication System
```bash
# JWT Token Authentication
POST /api/token/
{
    "username": "your_username",
    "password": "your_password"
}
```

#### Restaurant Operations
```bash
# Menu Management
GET /api/restaurant/menu/
Headers: {"X-Subdomain": "yourbusiness"}

# Order Processing
POST /api/restaurant/orders/
Headers: {"X-Subdomain": "yourbusiness"}
{
    "customer_name": "John Doe",
    "order_type": "in_house",
    "order_items": [...]
}
```

#### Supermarket Operations
```bash
# Product Management
GET /api/supermarket/products/
Headers: {"X-Subdomain": "yourbusiness"}

# Sales Processing
POST /api/supermarket/sales/
Headers: {"X-Subdomain": "yourbusiness"}
{
    "payment_type": "cash",
    "items": [...]
}
```

### Public API Access
```bash
# Public business profiles (no authentication required)
GET /public/
Headers: {"X-Subdomain": "yourbusiness"}

# Product lookup by barcode
GET /public/barcode/{barcode}/
Headers: {"X-Subdomain": "yourbusiness"}
```

## 🎯 Technical Achievements

### Database Design
- **Complex relationships**: Proper foreign key relationships between models
- **Multi-tenancy**: System-based data isolation
- **Audit trails**: Created/updated timestamps on all models
- **Data integrity**: Proper constraints and validations

### Security Implementation
- **JWT tokens**: Secure authentication with refresh tokens
- **Two-factor authentication**: Email-based 2FA implementation
- **Role-based access**: Granular permissions per business type
- **Data isolation**: Complete tenant separation

### Performance Considerations
- **Database indexing**: Optimized queries with proper indexes
- **Image optimization**: Cloudinary integration for efficient image handling
- **API caching**: Rate limiting and response optimization
- **Static file serving**: WhiteNoise for production static files

## 📊 Business Logic Complexity

### Restaurant Management
- **Order lifecycle**: From creation to completion with status tracking
- **Menu management**: Categories, pricing, discounts, special offers
- **Kitchen operations**: Real-time order display for kitchen staff
- **Payment processing**: Multiple payment methods and transaction tracking

### Supermarket Management
- **Inventory tracking**: Stock levels, expiry dates, batch management
- **POS system**: Sales transactions, receipts, discount handling
- **Supplier management**: Purchase orders, goods receiving
- **Analytics**: Profit tracking, sales reporting, stock alerts

## 🔐 Security Features

- **Multi-tenant isolation**: Complete data separation between businesses
- **JWT authentication**: Secure token-based authentication
- **Two-factor authentication**: Enhanced security with email verification
- **Role-based permissions**: Granular access control
- **Rate limiting**: API protection against abuse
- **CORS configuration**: Proper cross-origin resource sharing

## 📱 Mobile & Desktop Support

- **Offline-first architecture**: Local data caching and synchronization
- **RESTful APIs**: Complete API for mobile and web applications
- **Real-time updates**: Live order tracking and status updates
- **Responsive design**: Support for various screen sizes

## 🚀 Deployment Ready

### Production Configuration
- **Environment variables**: Secure configuration management
- **Database support**: PostgreSQL for production, SQLite for development
- **Static file serving**: WhiteNoise for production static files
- **WSGI server**: Gunicorn for production deployment
- **Containerization**: Docker support for easy deployment

### Scalability Features
- **Multi-tenant architecture**: Designed for horizontal scaling
- **Database optimization**: Proper indexing and query optimization
- **Image optimization**: Cloudinary integration for efficient media handling
- **API optimization**: Rate limiting and response caching

## 📞 Contact & Portfolio

This project demonstrates advanced Django development skills, including:
- Multi-tenancy architecture implementation
- Complex business logic development
- RESTful API design and implementation
- Security best practices
- Database design and optimization
- Production-ready deployment configuration

**For more information about this project or to discuss collaboration opportunities, please reach out through the contact information in my portfolio.**

---

**Built with ❤️🤓 to showcase advanced Django development capabilities**
