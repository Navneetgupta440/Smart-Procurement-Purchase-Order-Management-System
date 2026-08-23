# Database Architecture & Technical Specification

## Project: Smart Procurement & Purchase Order Management System
**Database Engine**: PostgreSQL 16 (Relational OLTP)  
**ORM / Data Access**: Spring Data JPA / Hibernate 6.x  
**Migration Framework**: Flyway 10.x  
**Connection Pool**: HikariCP (High-Performance JDBC Pool)

---

## 1. Overview & Core Tenets

The **Smart Procurement & Purchase Order Management System** uses a relational PostgreSQL database to ensure strict ACID compliance across procurement workflows, financial transactions, multi-tier approvals, inventory state machines, and immutable audit logs.

### Key Architectural Tenets:
1. **Strict Zero-Loss Schema Control**: Hibernate auto-generation (`ddl-auto: create` or `create-drop`) is strictly forbidden. All schema transformations occur through versioned, forward-only **Flyway migrations** (`V1__...`, `V2__...`).
2. **Deterministic Identifiers (UUID PKs)**: Primary keys use RFC 4122 standard UUIDv4 identifiers generated in PostgreSQL using `uuid-ossp` (`uuid_generate_v4()`), preventing ID enumeration attacks.
3. **Audit Immutability**: Historical event streams (e.g., `approval_history`, `delivery_tracking`, `inventory_transactions`, and `audit_logs`) are append-only.
4. **Monetary Precision**: All currency, tax, and quote calculations use `NUMERIC(19, 4)` to eliminate floating-point rounding errors.
5. **Optimistic Locking**: Inventory items enforce concurrency control via a `@Version` column (`version BIGINT NOT NULL DEFAULT 0`) to prevent overselling or race conditions.

---

## 2. PostgreSQL Installation & Setup

### A. Local Installation (Native Package)
- **Ubuntu/Debian**:
  ```bash
  sudo apt update && sudo apt install -y postgresql postgresql-contrib
  sudo systemctl enable --now postgresql
  ```
- **macOS (Homebrew)**:
  ```bash
  brew install postgresql@16
  brew services start postgresql@16
  ```
- **Windows**:
  Download and install PostgreSQL 16 from the official [PostgreSQL EnterpriseDB Installer](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads).

### B. Database Creation via CLI (`psql`)
```sql
-- Connect as postgres superuser
psql -U postgres -h localhost -p 5432

-- Create dedicated database
CREATE DATABASE smart_procurement;

-- Create application user (least-privilege principle)
CREATE USER smartprocure_user WITH ENCRYPTED PASSWORD 'your_secure_password';

-- Grant required permissions
GRANT ALL PRIVILEGES ON DATABASE smart_procurement TO smartprocure_user;
\c smart_procurement
GRANT ALL ON SCHEMA public TO smartprocure_user;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### C. Connection via pgAdmin / DBeaver / GUI
- **Host**: `localhost` (or Docker container IP)
- **Port**: `5432`
- **Maintenance Database**: `smart_procurement`
- **Username**: `smartprocure_user` (or `postgres`)
- **Password**: `<configured_password>`
- **SSL Mode**: `Prefer` (Local Dev) / `Require` (Production)

---

## 3. Environment Variables & Secret Management

All connection parameters are managed via environment variables. Plaintext secrets are strictly excluded from version control.

### `.env.example`
```env
# Database Connection Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_procurement
DB_USERNAME=postgres
DB_PASSWORD=

# HikariCP Pool Parameters (Optional overrides)
DB_POOL_MAX_SIZE=20
DB_POOL_MIN_IDLE=5
DB_POOL_TIMEOUT=30000

# Security & JWT Tokens
JWT_SECRET=
JWT_EXPIRATION=86400000

# Third-Party Notifications
EMAIL_API_KEY=
SMS_API_KEY=
```

### Spring Boot Datasource Mapping (`application.yml`)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:smart_procurement}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: ${DB_POOL_MAX_SIZE:20}
      minimum-idle: ${DB_POOL_MIN_IDLE:5}
      connection-timeout: ${DB_POOL_TIMEOUT:30000}
      idle-timeout: 600000
      max-lifetime: 1800000
      pool-name: SmartProcureHikariPool

  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        jdbc:
          time_zone: UTC

  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration
```

---

## 4. Docker Container Orchestration

A multi-container setup is defined in `docker-compose.yml` with health checks and persistent storage volumes:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: smartprocure-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME:-smart_procurement}
      POSTGRES_USER: ${DB_USERNAME:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME:-postgres} -d ${DB_NAME:-smart_procurement}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - smartprocure-net

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: smartprocure-backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME:-smart_procurement}
      DB_USERNAME: ${DB_USERNAME:-postgres}
      DB_PASSWORD: ${DB_PASSWORD:-postgres}
      JWT_SECRET: ${JWT_SECRET:-404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}
    ports:
      - "8080:8080"
    networks:
      - smartprocure-net

volumes:
  postgres_data:
    name: smartprocure_postgres_volume

networks:
  smartprocure-net:
    driver: bridge
```

### Docker Quickstart:
```bash
# Start PostgreSQL daemon in the background
docker compose up -d postgres

# Check database container status & health
docker compose ps

# View database initialization logs
docker compose logs -f postgres
```

---

## 5. Schema & Entity Relationship Model

The schema consists of **26 normalized relational tables** categorized across 9 core business domains:

```
[Users] <─── [User Roles] ───> [Roles] <─── [Role Permissions] ───> [Permissions]
   │
   ├──> [Employees] (Hierarchical reporting via manager_id)
   ├──> [Customers] (B2B Billing & shipping profile)
   ├──> [Notifications] & [Notification Preferences]
   └──> [Audit Logs] (Immutable system-wide ledger)

[Categories] ───> [Products] <─── [Product Suppliers] ───> [Suppliers]
                     │
                     ├──> [Inventory] ───> [Inventory Transactions]
                     │
                     ├──> [Purchase Request Items] <─── [Purchase Requests]
                     │                                         │
                     │                                         └──> [Approvals] ───> [Approval History]
                     │                                                   │
                     └──> [Purchase Order Items] <─── [Purchase Orders] ──┘
                                                             │
                                                             ├──> [Supplier Orders] (Vendor portal state)
                                                             └──> [Deliveries] ───> [Delivery Tracking]
```

---

## 6. Table Catalog & Constraint Rules

### 1. RBAC & Identity Subsystem
* `roles` (`id`, `name UNIQUE`, `description`, `created_at`, `updated_at`)
* `permissions` (`id`, `name UNIQUE`, `description`, `created_at`, `updated_at`)
* `users` (`id`, `name`, `email UNIQUE`, `password_hash`, `phone`, `status`, `profile_image`, `last_login`, `created_at`, `updated_at`)
* `user_roles` (`user_id`, `role_id`) &mdash; Composite PK `(user_id, role_id)` with cascading foreign keys.
* `role_permissions` (`role_id`, `permission_id`) &mdash; Composite PK `(role_id, permission_id)`.
* `customers` (`id`, `user_id UNIQUE`, `customer_code UNIQUE`, `company_name`, `billing_address`, `shipping_address`, `city`, `state`, `postal_code`, `country`).
* `employees` (`id`, `user_id UNIQUE`, `employee_code UNIQUE`, `department`, `designation`, `manager_id REFERENCES employees(id)`).

### 2. Catalog, Products & Suppliers
* `categories` (`id`, `name UNIQUE`, `description`, `status`, `parent_category_id REFERENCES categories(id)`).
* `suppliers` (`id`, `supplier_code UNIQUE`, `company_name`, `contact_person`, `email`, `phone`, `address`, `city`, `state`, `country`, `postal_code`, `gst_number`, `tax_id`, `rating NUMERIC(3,2)`, `status`).
* `products` (`id`, `product_code UNIQUE`, `name`, `description`, `category_id`, `unit_price NUMERIC(19,4)`, `quantity`, `minimum_stock`, `maximum_stock`, `unit`, `image_url`, `status`).
* `product_suppliers` (`id`, `product_id`, `supplier_id`, `supplier_product_code`, `unit_price NUMERIC(19,4)`, `lead_time_days`, `quality_rating NUMERIC(3,2)`, `minimum_order_quantity`, `preferred BOOLEAN`) &mdash; `UNIQUE(product_id, supplier_id)`.

### 3. Requisitions & Approval Governance
* `purchase_requests` (`id`, `request_number UNIQUE`, `requested_by REFERENCES users(id)`, `department`, `priority`, `reason`, `status`, `estimated_amount NUMERIC(19,4)`, `required_approval_level`, `current_approval_level`, `submitted_at`).
* `purchase_request_items` (`id`, `purchase_request_id REFERENCES purchase_requests(id) ON DELETE CASCADE`, `product_id`, `quantity CHECK(quantity > 0)`, `estimated_unit_price NUMERIC(19,4)`, `estimated_total NUMERIC(19,4)`).
* `approvals` (`id`, `purchase_request_id REFERENCES purchase_requests(id) ON DELETE CASCADE`, `approver_id REFERENCES users(id)`, `approval_level`, `status`, `remarks`, `acted_at`).
* `approval_history` (`id`, `approval_id REFERENCES approvals(id) ON DELETE CASCADE`, `action`, `performed_by REFERENCES users(id)`, `remarks`, `performed_at`).

### 4. Purchase Orders & Commercial Fulfillment
* `purchase_orders` (`id`, `po_number UNIQUE`, `purchase_request_id REFERENCES purchase_requests(id)`, `supplier_id REFERENCES suppliers(id)`, `created_by REFERENCES users(id)`, `order_date`, `expected_delivery_date`, `subtotal NUMERIC(19,4)`, `tax NUMERIC(19,4)`, `discount NUMERIC(19,4)`, `shipping_cost NUMERIC(19,4)`, `total_amount NUMERIC(19,4)`, `status`, `remarks`).
* `purchase_order_items` (`id`, `purchase_order_id REFERENCES purchase_orders(id) ON DELETE CASCADE`, `product_id`, `quantity CHECK(quantity > 0)`, `unit_price NUMERIC(19,4)`, `tax NUMERIC(19,4)`, `discount NUMERIC(19,4)`, `total_price NUMERIC(19,4)`).
* `supplier_orders` (`id`, `purchase_order_id UNIQUE REFERENCES purchase_orders(id) ON DELETE CASCADE`, `supplier_id REFERENCES suppliers(id)`, `status`, `accepted_at`, `rejected_at`, `rejection_reason`, `processing_started_at`, `ready_for_dispatch_at`, `dispatched_at`).

### 5. Logistics, Deliveries & Real-Time Tracking
* `deliveries` (`id`, `purchase_order_id UNIQUE REFERENCES purchase_orders(id) ON DELETE CASCADE`, `delivery_agent_id REFERENCES users(id)`, `tracking_number UNIQUE`, `carrier`, `shipping_address`, `city`, `state`, `postal_code`, `country`, `expected_delivery_date`, `actual_delivery_date`, `status`).
* `delivery_tracking` (`id`, `delivery_id REFERENCES deliveries(id) ON DELETE CASCADE`, `status`, `location`, `remarks`, `updated_by REFERENCES users(id)`, `event_time`).

### 6. Inventory Synchronization & Ledger
* `inventory` (`id`, `product_id REFERENCES products(id) ON DELETE CASCADE`, `warehouse`, `available_quantity CHECK(available_quantity >= 0)`, `reserved_quantity CHECK(reserved_quantity >= 0)`, `minimum_stock`, `maximum_stock`, `version BIGINT DEFAULT 0`, `last_updated`, `CONSTRAINT uq_inventory_product_warehouse UNIQUE (product_id, warehouse)`).
* `inventory_transactions` (`id`, `inventory_id REFERENCES inventory(id) ON DELETE CASCADE`, `product_id REFERENCES products(id)`, `transaction_type`, `quantity`, `reference_type`, `reference_id`, `remarks`, `performed_by REFERENCES users(id)`).

### 7. Notification & System Infrastructure
* `notifications` (`id`, `user_id REFERENCES users(id) ON DELETE CASCADE`, `title`, `message`, `channel`, `status`, `event_type`, `failure_reason`, `retry_count`, `sent_at`, `read_at`).
* `notification_preferences` (`id`, `user_id UNIQUE REFERENCES users(id) ON DELETE CASCADE`, `email_enabled`, `sms_enabled`, `in_app_enabled`, `order_updates`, `approval_updates`, `delivery_updates`, `low_stock_alerts`).
* `audit_logs` (`id`, `user_id REFERENCES users(id) ON DELETE SET NULL`, `action`, `entity_type`, `entity_id`, `old_value`, `new_value`, `ip_address`, `user_agent`, `created_at`).
* `system_settings` (`id`, `setting_key UNIQUE`, `setting_value`, `description`, `category`, `is_sensitive`).

---

## 7. Migration Strategy (Flyway)

Migrations are located in `src/main/resources/db/migration/` and execute sequentially during application startup:

1. `V1__initial_database_setup.sql`: Baselines extension enablement (`uuid-ossp`) and initial core tables.
2. `V2__create_core_domain_schema.sql`: Establishes all 26 relational tables, check constraints, foreign key indexes, and timestamp triggers.
3. `V3__seed_initial_data.sql` *(Optional Dev Profile)*: Populates role catalogs, standard categories, initial product catalog, and verified vendor test data.

### Golden Rules for Database Migrations:
- **Never Modify Existing Migration Scripts**: Once a migration has been applied or committed, it must never be altered. Schema adjustments must be introduced in a new incremental migration (e.g., `V4__add_supplier_compliance_cert.sql`).
- **No Manual DDL in Production**: All changes must be codified in SQL scripts checked into version control.
- **Transactional Migrations**: PostgreSQL executes DDL inside transactions, ensuring atomic rollbacks if a migration fails midway.

---

## 8. Indexing Strategy & Performance Optimization

To guarantee sub-millisecond query execution on high-traffic endpoints, composite and targeted B-Tree indexes are configured:

| Target Table | Index Name | Indexed Columns | Justification |
| :--- | :--- | :--- | :--- |
| `users` | `idx_users_email` | `(email)` | Instant user lookup during JWT login & token validation |
| `users` | `idx_users_status` | `(status)` | Filtering active/inactive users |
| `products` | `idx_products_code` | `(product_code)` | Fast SKU lookups during order entry |
| `products` | `idx_products_category`| `(category_id)` | Efficient category filtering in product catalog |
| `purchase_requests` | `idx_pr_status` | `(status)` | Pending approval queue queries |
| `purchase_requests` | `idx_pr_requested_by`| `(requested_by)` | "My Requisitions" dashboard query |
| `approvals` | `idx_approvals_pr` | `(purchase_request_id)` | Loading approval tier chains for a given request |
| `purchase_orders` | `idx_po_supplier` | `(supplier_id)` | Supplier portal assigned order lookups |
| `purchase_orders` | `idx_po_status` | `(status)` | Filtering POs by state (e.g., `SENT_TO_SUPPLIER`, `DISPATCHED`) |
| `deliveries` | `idx_deliveries_tracking`| `(tracking_number)` | Waybill tracking number lookups |
| `audit_logs` | `idx_audit_logs_entity`| `(entity_type, entity_id)`| Audit trail queries for specific business entities |
| `audit_logs` | `idx_audit_logs_created`| `(created_at DESC)` | Chronological audit log exports & forensic queries |

---

## 9. Backup, Restore & Disaster Recovery

### A. Logical Backup via `pg_dump`
```bash
# Export compressed binary custom-format dump
pg_dump -h localhost -p 5432 -U postgres -F c -b -v -f "smart_procurement_backup_$(date +%Y%m%d_%H%M%S).dump" smart_procurement

# Export plain SQL text schema & data
pg_dump -h localhost -p 5432 -U postgres --schema=public -f "smart_procurement_backup.sql" smart_procurement
```

### B. Database Restore via `pg_restore`
```bash
# Restore into an existing database
pg_restore -h localhost -p 5432 -U postgres -d smart_procurement -v "smart_procurement_backup_20260821_120000.dump"

# Clean and recreate schema during restore
pg_restore -h localhost -p 5432 -U postgres -d smart_procurement --clean --if-exists -v "smart_procurement_backup_20260821_120000.dump"
```

---

## 10. Database Health Verification Queries

Run these verification queries in `psql` or pgAdmin to confirm schema integrity:

```sql
-- 1. Verify all 26 tables are present
SELECT count(*) AS total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 2. List all foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';

-- 3. Check low-stock inventory items
SELECT p.product_code, p.name, i.available_quantity, i.minimum_stock, i.warehouse
FROM inventory i
JOIN products p ON i.product_id = p.id
WHERE i.available_quantity <= i.minimum_stock;
```
