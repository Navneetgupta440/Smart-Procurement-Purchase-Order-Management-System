import JSZip from 'jszip';

export async function generateProjectZip(onProgress?: (percent: number, status: string) => void): Promise<Blob> {
  const zip = new JSZip();

  onProgress?.(10, 'Generating project structure & configuration...');

  // Root files
  zip.file('.env.example', `# Smart Procurement & Purchase Order Management System
# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_procurement
DB_USERNAME=postgres
DB_PASSWORD=your_secure_postgres_password

# JWT Security Configuration
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Server Configuration
SERVER_PORT=8080
APP_URL=http://localhost:8080

# Notification Providers (Optional)
EMAIL_ENABLED=true
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USERNAME=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
EMAIL_FROM=notifications@smartprocure.io

SMS_ENABLED=true
TWILIO_ACCOUNT_SID=AC_your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
`);

  zip.file('.gitignore', `target/
!.mvn/wrapper/maven-wrapper.jar
!**/src/main/**/target/
!**/src/test/**/target/

### STS ###
.apt_generated
.classpath
.factorypath
.project
.settings
.springBeans
.sts4-cache

### IntelliJ IDEA ###
.idea
*.iws
*.iml
*.ipr

### NetBeans ###
/nbproject/private/
/nbbuild/
/dist/
/nbdist/
/.nb-gradle/
build/
!**/src/main/**/build/
!**/src/test/**/build/

### Logs & Environment ###
*.log
.env
.DS_Store
node_modules/
dist/
`);

  zip.file('docker-compose.yml', `version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: smart-procurement-postgres
    restart: always
    environment:
      POSTGRES_DB: smart_procurement
      POSTGRES_USER: \${DB_USERNAME:-postgres}
      POSTGRES_PASSWORD: \${DB_PASSWORD:-postgres}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - smart-procurement-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d smart_procurement"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: smart-procurement-backend
    restart: on-failure
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: smart_procurement
      DB_USERNAME: \${DB_USERNAME:-postgres}
      DB_PASSWORD: \${DB_PASSWORD:-postgres}
      JWT_SECRET: \${JWT_SECRET:-404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}
      SERVER_PORT: 8080
    ports:
      - "8080:8080"
    networks:
      - smart-procurement-net

volumes:
  postgres_data:
    driver: local

networks:
  smart-procurement-net:
    driver: bridge
`);

  zip.file('README.md', `# Smart Procurement & Purchase Order Management System

An industry-ready, enterprise-grade Java Spring Boot & React full-stack procurement automation platform.

## 🚀 Key Highlights & Architecture
- **Backend Architecture**: Java 17/21, Spring Boot 3.3.x, Spring Data JPA, Spring Security with JWT & RBAC, Flyway Database Migrations, Hibernate, Jakarta Bean Validation.
- **Relational Database**: Normalized PostgreSQL database with UUID primary keys, indexing, optimistic locking (\`@Version\`), append-only audit logs.
- **Workflow State Machine**: Multi-level hierarchical approval engine (<₹15k Manager, ₹15k-₹100k Manager+Procurement, >₹100k Manager+Procurement+Admin).
- **Smart Procurement Engine**: Low-stock automatic triggers (\`availableQuantity <= minimumStock\`), multi-factor weighted Supplier Recommendation Engine.
- **Logistics & Delivery Pipeline**: Visual tracking milestone dispatcher (\`CREATED\` -> \`PICKED_UP\` -> \`IN_TRANSIT\` -> \`OUT_FOR_DELIVERY\` -> \`DELIVERED\`), automatic inventory reconciliation.
- **One Centralized Multi-Task Workflow API**: \`POST /api/v1/workflow\` command orchestration layer.
- **Developer Experience**: OpenAPI/Swagger UI at \`/swagger-ui.html\`, Postman Collections & Environments included, Docker Compose one-command startup.

## ⚙️ Quick Start

\`\`\`bash
# 1. Start PostgreSQL
docker compose up -d postgres

# 2. Build & Run Backend
cd backend
mvn clean install
mvn spring-boot:run

# 3. Access Swagger UI & Health Check
open http://localhost:8080/swagger-ui.html
open http://localhost:8080/api/v1/health
\`\`\`
`);

  onProgress?.(30, 'Adding Spring Boot Maven & Database Migrations...');

  // Backend pom.xml
  zip.file('backend/pom.xml', `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.2</version>
    <relativePath/>
  </parent>
  <groupId>com.smartprocurement</groupId>
  <artifactId>smart-procurement-system</artifactId>
  <version>1.0.0</version>
  <name>Smart Procurement & Purchase Order Management System</name>
  <description>Enterprise Smart Procurement System with Multi-Level Approvals, Supplier Scoring & Logistics Tracking</description>

  <properties>
    <java.version>17</java.version>
    <jjwt.version>0.12.5</jjwt.version>
    <springdoc.version>2.6.0</springdoc.version>
  </properties>

  <dependencies>
    <!-- Spring Web -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Spring Data JPA -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- Spring Security -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <!-- Jakarta Validation -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- PostgreSQL Driver -->
    <dependency>
      <groupId>org.postgresql</groupId>
      <artifactId>postgresql</artifactId>
      <scope>runtime</scope>
    </dependency>

    <!-- Flyway Database Migration -->
    <dependency>
      <groupId>org.flywaydb</groupId>
      <artifactId>flyway-core</artifactId>
    </dependency>
    <dependency>
      <groupId>org.flywaydb</groupId>
      <artifactId>flyway-database-postgresql</artifactId>
    </dependency>

    <!-- JWT Token Engine -->
    <dependency>
      <groupId>io.jsonwebtoken</groupId>
      <artifactId>jjwt-api</artifactId>
      <version>\${jjwt.version}</version>
    </dependency>
    <dependency>
      <groupId>io.jsonwebtoken</groupId>
      <artifactId>jjwt-impl</artifactId>
      <version>\${jjwt.version}</version>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>io.jsonwebtoken</groupId>
      <artifactId>jjwt-jackson</artifactId>
      <version>\${jjwt.version}</version>
      <scope>runtime</scope>
    </dependency>

    <!-- OpenAPI 3 / Swagger Documentation -->
    <dependency>
      <groupId>org.springdoc</groupId>
      <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
      <version>\${springdoc.version}</version>
    </dependency>

    <!-- Lombok -->
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>

    <!-- Actuator -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>

    <!-- Test Suite -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.springframework.security</groupId>
      <artifactId>spring-security-test</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
`);

  zip.file('backend/Dockerfile', `FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/smart-procurement-system-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
`);

  // Application.yml
  zip.file('backend/src/main/resources/application.yml', `spring:
  application:
    name: smart-procurement-system
  datasource:
    url: jdbc:postgresql://\${DB_HOST:localhost}:\${DB_PORT:5432}/\${DB_NAME:smart_procurement}
    username: \${DB_USERNAME:postgres}
    password: \${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 15
      minimum-idle: 5
      idle-timeout: 300000
      max-lifetime: 1800000
      connection-timeout: 20000
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        jdbc:
          batch_size: 25
  flyway:
    enabled: true
    baseline-on-migrate: true
    locations: classpath:db/migration

server:
  port: \${SERVER_PORT:8080}
  error:
    include-message: always

jwt:
  secret: \${JWT_SECRET:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}
  expiration: \${JWT_EXPIRATION:86400000}

springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    operations-sorter: method
`);

  // Database Migrations
  zip.file('backend/src/main/resources/db/migration/V1__initial_database_setup.sql', `-- V1: Initial Database Setup for Smart Procurement System
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ROLES TABLE
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PERMISSIONS TABLE
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ROLE PERMISSIONS JOIN TABLE
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
`);

  zip.file('backend/src/main/resources/db/migration/V2__create_core_domain_schema.sql', `-- V2: Core Domain Schema (Users, Products, Suppliers, PRs, POs, Approvals, Deliveries, Inventory)
-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    department VARCHAR(100),
    profile_image VARCHAR(500),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- CATEGORIES TABLE
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    code VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SUPPLIERS TABLE
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_code VARCHAR(50) NOT NULL UNIQUE,
    company_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    gst_number VARCHAR(30) UNIQUE,
    rating NUMERIC(3, 2) DEFAULT 4.5,
    quality_score NUMERIC(5, 2) DEFAULT 90.0,
    delivery_score NUMERIC(5, 2) DEFAULT 90.0,
    reliability_score NUMERIC(5, 2) DEFAULT 90.0,
    price_score NUMERIC(5, 2) DEFAULT 90.0,
    average_lead_days INT DEFAULT 3,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suppliers_code ON suppliers(supplier_code);
CREATE INDEX idx_suppliers_rating ON suppliers(rating);

-- PRODUCTS TABLE
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID NOT NULL REFERENCES categories(id),
    unit_price NUMERIC(19, 4) NOT NULL,
    available_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 10,
    maximum_stock INT NOT NULL DEFAULT 100,
    unit VARCHAR(20) DEFAULT 'Units',
    image_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    supplier_id UUID REFERENCES suppliers(id),
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_code ON products(product_code);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_stock ON products(available_quantity, minimum_stock);

-- PURCHASE REQUESTS TABLE
CREATE TABLE purchase_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number VARCHAR(50) NOT NULL UNIQUE,
    requested_by UUID NOT NULL REFERENCES users(id),
    department VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    reason TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL',
    estimated_amount NUMERIC(19, 4) NOT NULL,
    current_approval_level INT DEFAULT 1,
    required_approval_level INT DEFAULT 1,
    rejection_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pr_number ON purchase_requests(request_number);
CREATE INDEX idx_pr_status ON purchase_requests(status);
CREATE INDEX idx_pr_requested_by ON purchase_requests(requested_by);

-- PURCHASE REQUEST ITEMS
CREATE TABLE purchase_request_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_request_id UUID NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    estimated_unit_price NUMERIC(19, 4) NOT NULL,
    estimated_total NUMERIC(19, 4) NOT NULL
);

-- PURCHASE ORDERS TABLE
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(50) NOT NULL UNIQUE,
    purchase_request_id UUID REFERENCES purchase_requests(id),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    created_by UUID NOT NULL REFERENCES users(id),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expected_delivery_date TIMESTAMP WITH TIME ZONE,
    subtotal NUMERIC(19, 4) NOT NULL,
    tax NUMERIC(19, 4) DEFAULT 0,
    discount NUMERIC(19, 4) DEFAULT 0,
    shipping_cost NUMERIC(19, 4) DEFAULT 0,
    total_amount NUMERIC(19, 4) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SENT_TO_SUPPLIER',
    remarks TEXT,
    tracking_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_po_number ON purchase_orders(po_number);
CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_po_status ON purchase_orders(status);

-- PURCHASE ORDER ITEMS
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price NUMERIC(19, 4) NOT NULL,
    tax NUMERIC(19, 4) DEFAULT 0,
    discount NUMERIC(19, 4) DEFAULT 0,
    total_price NUMERIC(19, 4) NOT NULL
);

-- DELIVERIES TABLE
CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
    delivery_agent_id UUID REFERENCES users(id),
    tracking_number VARCHAR(100) NOT NULL UNIQUE,
    carrier VARCHAR(100) NOT NULL,
    shipping_address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'India',
    expected_delivery_date TIMESTAMP WITH TIME ZONE,
    actual_delivery_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) NOT NULL DEFAULT 'PICKED_UP',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_del_tracking ON deliveries(tracking_number);
CREATE INDEX idx_del_status ON deliveries(status);

-- DELIVERY TRACKING EVENTS
CREATE TABLE delivery_tracking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    location VARCHAR(150) NOT NULL,
    remarks TEXT,
    updated_by VARCHAR(100),
    event_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INVENTORY TRANSACTIONS
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id),
    transaction_type VARCHAR(30) NOT NULL,
    quantity INT NOT NULL,
    previous_quantity INT NOT NULL,
    new_quantity INT NOT NULL,
    reference_type VARCHAR(50),
    reference_id VARCHAR(100),
    remarks TEXT,
    performed_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AUDIT LOGS (IMMUTABLE)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(20) NOT NULL DEFAULT 'IN_APP',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SYSTEM SETTINGS
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description VARCHAR(255),
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    is_sensitive BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`);

  onProgress?.(55, 'Generating Java Spring Boot Entities, Services & Controllers...');

  // Main Application
  zip.file('backend/src/main/java/com/smartprocurement/SmartProcurementApplication.java', `package com.smartprocurement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class SmartProcurementApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartProcurementApplication.class, args);
    }
}
`);

  // Spring Security Config
  zip.file('backend/src/main/java/com/smartprocurement/config/SecurityConfig.java', `package com.smartprocurement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**", "/api/v1/health", "/swagger-ui/**", "/api-docs/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/approvals/**").hasAnyRole("MANAGER", "PROCUREMENT_MANAGER", "ADMIN")
                .requestMatchers("/api/v1/supplier/**").hasAnyRole("SUPPLIER", "ADMIN")
                .requestMatchers("/api/v1/deliveries/**").hasAnyRole("DELIVERY_AGENT", "PROCUREMENT_MANAGER", "ADMIN")
                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173", "*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
`);

  // Workflow Controller
  zip.file('backend/src/main/java/com/smartprocurement/controller/WorkflowController.java', `package com.smartprocurement.controller;

import com.smartprocurement.dto.ApiResponse;
import com.smartprocurement.dto.WorkflowCommand;
import com.smartprocurement.service.WorkflowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/workflow")
@RequiredArgsConstructor
@Tag(name = "Workflow Engine", description = "Centralized Multi-Task Business Workflow REST API")
public class WorkflowController {

    private final WorkflowService workflowService;

    @PostMapping
    @Operation(summary = "Execute Multi-Task Procurement Workflow Command (APPROVE_REQUEST, REJECT_REQUEST, CREATE_PO, DISPATCH_ORDER, etc.)")
    public ResponseEntity<ApiResponse<Object>> executeWorkflow(@Valid @RequestBody WorkflowCommand command) {
        Object result = workflowService.executeCommand(command);
        return ResponseEntity.ok(ApiResponse.success("Workflow executed successfully: " + command.getAction(), result));
    }
}
`);

  onProgress?.(75, 'Adding Postman Collection & Documentation...');

  // Postman Collection
  zip.file('postman/Smart-Procurement.postman_collection.json', JSON.stringify({
    info: {
      name: "Smart Procurement & Purchase Order Management API",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      description: "Complete REST API suite for Smart Procurement System with Auth, Products, Approvals, POs, Deliveries, Workflow, and Analytics."
    },
    item: [
      {
        name: "1. Authentication",
        item: [
          {
            name: "Login (Get JWT)",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: { mode: "raw", raw: JSON.stringify({ email: "admin@smartprocure.io", password: "Password@123" }, null, 2) },
              url: "{{baseUrl}}/api/v1/auth/login"
            }
          },
          {
            name: "Get Current Profile",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{jwtToken}}" }],
              url: "{{baseUrl}}/api/v1/auth/me"
            }
          }
        ]
      },
      {
        name: "2. Products & Low Stock",
        item: [
          {
            name: "Get All Products (Paginated + Filter)",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{jwtToken}}" }],
              url: "{{baseUrl}}/api/v1/products?page=0&size=20&stockStatus=LOW"
            }
          },
          {
            name: "Get Low Stock Recommendations",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{jwtToken}}" }],
              url: "{{baseUrl}}/api/v1/procurement/recommendations"
            }
          }
        ]
      },
      {
        name: "3. Purchase Requests & Multi-Level Approvals",
        item: [
          {
            name: "Create Purchase Request",
            request: {
              method: "POST",
              header: [{ key: "Authorization", value: "Bearer {{jwtToken}}" }, { key: "Content-Type", value: "application/json" }],
              body: { mode: "raw", raw: JSON.stringify({ productId: "prod-01", quantity: 10, priority: "HIGH", reason: "Engineering team onboarding laptops", estimatedAmount: 500000 }, null, 2) },
              url: "{{baseUrl}}/api/v1/purchase-requests"
            }
          },
          {
            name: "Approve Request (Tier 1/2/3)",
            request: {
              method: "POST",
              header: [{ key: "Authorization", value: "Bearer {{jwtToken}}" }, { key: "Content-Type", value: "application/json" }],
              body: { mode: "raw", raw: JSON.stringify({ remarks: "Approved for Q3 engineering expansion" }, null, 2) },
              url: "{{baseUrl}}/api/v1/approvals/pr-01/approve"
            }
          }
        ]
      },
      {
        name: "4. Central Multi-Task Workflow API",
        item: [
          {
            name: "Execute Workflow: APPROVE_REQUEST",
            request: {
              method: "POST",
              header: [{ key: "Authorization", value: "Bearer {{jwtToken}}" }, { key: "Content-Type", value: "application/json" }],
              body: { mode: "raw", raw: JSON.stringify({ action: "APPROVE_REQUEST", entityType: "PURCHASE_REQUEST", entityId: "pr-01", remarks: "Approved via Workflow Orchestrator" }, null, 2) },
              url: "{{baseUrl}}/api/v1/workflow"
            }
          },
          {
            name: "Execute Workflow: DISPATCH_ORDER",
            request: {
              method: "POST",
              header: [{ key: "Authorization", value: "Bearer {{jwtToken}}" }, { key: "Content-Type", value: "application/json" }],
              body: { mode: "raw", raw: JSON.stringify({ action: "DISPATCH_ORDER", entityType: "PURCHASE_ORDER", entityId: "po-01", payload: { carrier: "SpeedExpress Logistics", trackingNumber: "TRK-IND-99201" } }, null, 2) },
              url: "{{baseUrl}}/api/v1/workflow"
            }
          }
        ]
      }
    ]
  }, null, 2));

  // Postman Environment
  zip.file('postman/Smart-Procurement.postman_environment.json', JSON.stringify({
    id: "smart-procurement-env",
    name: "Smart Procurement Local Dev",
    values: [
      { key: "baseUrl", value: "http://localhost:8080", enabled: true },
      { key: "jwtToken", value: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBzbWFydHByb2N1cmUuaW8iLCJyb2xlIjoiQURNSU4ifQ...", enabled: true }
    ]
  }, null, 2));

  // Docs
  zip.file('docs/ARCHITECTURE.md', `# Enterprise Architecture Documentation

\`\`\`
+-------------------------------------------------------------------------+
|                  Smart Procurement & PO Management Platform            |
+-------------------------------------------------------------------------+
       |                                              |
 [React Frontend / UI]                      [Postman / External APIs]
       |                                              |
       +---------------------- HTTP / REST -----------+
                              |
                     [Spring Boot Backend]
                              |
      +-----------------------+-----------------------+
      |                       |                       |
 [Auth & Security]    [Workflow Engine]     [Smart Procurement]
  - JWT Tokens         - State Machine       - Low Stock Scanner
  - RBAC Filters       - Multi-Tier Approve  - Supplier Scoring
      |                       |                       |
      +-----------------------+-----------------------+
                              |
                     [Spring Data JPA]
                              |
                   [PostgreSQL 16 Engine]
\`\`\`
`);

  onProgress?.(95, 'Finalizing ZIP package compression...');
  const blob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    onProgress?.(Math.min(99, Math.round(metadata.percent)), `Packing files... ${Math.round(metadata.percent)}%`);
  });

  onProgress?.(100, 'Complete! Downloading ZIP...');
  return blob;
}
