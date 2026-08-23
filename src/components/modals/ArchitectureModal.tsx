import React, { useState } from 'react';
import { 
  Layers, 
  Database, 
  ShieldCheck, 
  Lock, 
  Package, 
  Users, 
  FileText, 
  CheckCircle2, 
  ShoppingCart, 
  Truck, 
  Bell, 
  Terminal, 
  BarChart3, 
  Layout, 
  Globe, 
  Download, 
  FlaskConical, 
  Code2, 
  Container, 
  ChevronRight, 
  Check, 
  ExternalLink,
  Play
} from 'lucide-react';
import { procurementStore } from '../../services/procurementStore';
import { Role } from '../../types/procurement';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchRole: (role: Role) => void;
  onOpenSwagger: () => void;
  onOpenWorkflow: () => void;
  onOpenZip: () => void;
}

interface StepDetail {
  id: number;
  code: string;
  title: string;
  category: string;
  iconName: string;
  summary: string;
  techDetails: {
    layer: string;
    files: string[];
    endpoints?: string[];
    schemaTables?: string[];
    keyHighlights: string[];
  };
  sampleCodeSnippet: string;
  interactiveActionLabel?: string;
  onExecute?: () => string;
}

export const ArchitectureModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSwitchRole,
  onOpenSwagger,
  onOpenWorkflow,
  onOpenZip
}) => {
  const [selectedStepId, setSelectedStepId] = useState<number>(1);
  const [executionResult, setExecutionResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const STEPS: StepDetail[] = [
    {
      id: 1,
      code: 'STEP 01',
      title: 'Create Spring Boot Project',
      category: 'Foundation & Scaffolding',
      iconName: 'Code2',
      summary: 'Bootstrap Java 17/21 enterprise microservice with Spring Boot 3.3.x, Maven dependencies, Jakarta Validation, and Lombok.',
      techDetails: {
        layer: 'Build Configuration & Runtime Environment',
        files: ['backend/pom.xml', 'backend/src/main/java/com/smartprocure/ProcurementApplication.java'],
        keyHighlights: [
          'Spring Boot 3.3.2 starter dependencies for Web, Data JPA, Security, and Validation',
          'SpringDoc OpenAPI 2.6.0 for automatic OpenAPI 3.0 & Swagger UI generation',
          'Flyway core & PostgreSQL driver for zero-downtime versioned database migrations'
        ]
      },
      sampleCodeSnippet: `// backend/src/main/java/com/smartprocure/ProcurementApplication.java
package com.smartprocure;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
public class ProcurementApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProcurementApplication.class, args);
    }
}`
    },
    {
      id: 2,
      code: 'STEP 02',
      title: 'Configure PostgreSQL',
      category: 'Database & Persistence',
      iconName: 'Database',
      summary: 'Configure HikariCP high-performance connection pool, Flyway versioned DDL migrations with 26 relational tables, UUID PKs, and indexes.',
      techDetails: {
        layer: 'Relational Database / Flyway DDL',
        files: ['backend/src/main/resources/application.yml', 'backend/src/main/resources/db/migration/V1__init_schema.sql'],
        schemaTables: ['users', 'roles', 'products', 'suppliers', 'purchase_requests', 'purchase_orders', 'deliveries', 'audit_logs'],
        keyHighlights: [
          'HikariCP pool with maximum-pool-size: 20 and connection-timeout: 30000ms',
          'Flyway migration baseline with foreign keys, composite indexes, and timestamp triggers',
          'PostgreSQL UUID generator extension (uuid-ossp) for distributed identifier safety'
        ]
      },
      sampleCodeSnippet: `-- V1__init_schema.sql (PostgreSQL Relational Schema)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(64) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0),
    available_quantity INT NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
    minimum_stock INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);`
    },
    {
      id: 3,
      code: 'STEP 03',
      title: 'Create User + Role Entities',
      category: 'Domain & RBAC Modeling',
      iconName: 'Users',
      summary: 'Model User, Role Enum (7 enterprise personas), Department, and AuditLog JPA entities with versioning and auditing metadata.',
      techDetails: {
        layer: 'Domain Model (JPA / Hibernate)',
        files: ['backend/src/main/java/com/smartprocure/model/User.java', 'backend/src/main/java/com/smartprocure/model/Role.java', 'backend/src/main/java/com/smartprocure/model/AuditLog.java'],
        keyHighlights: [
          'Role Enum supporting: EMPLOYEE, MANAGER, PROCUREMENT_OFFICER, SUPPLIER, DELIVERY_PERSONNEL, CUSTOMER, ADMIN',
          'Spring Data JPA Auditing via @CreatedDate, @LastModifiedDate, and @CreatedBy',
          'Immutable AuditLog entity tracking user actor, role, action, target entity, and payload'
        ]
      },
      sampleCodeSnippet: `// backend/src/main/java/com/smartprocure/model/User.java
package com.smartprocure.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import java.time.Instant;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Role role;

    private String department;
    private String phoneNumber;
    private boolean active = true;

    @CreatedDate
    private Instant createdAt;
}`
    },
    {
      id: 4,
      code: 'STEP 04',
      title: 'Signup / Login API',
      category: 'Authentication & Session',
      iconName: 'Lock',
      summary: 'Build REST endpoints for user authentication, password hashing with BCrypt (12 rounds), and payload validation.',
      techDetails: {
        layer: 'REST Controller & Service Layer',
        files: ['backend/src/main/java/com/smartprocure/controller/AuthController.java', 'backend/src/main/java/com/smartprocure/service/AuthService.java'],
        endpoints: ['POST /api/v1/auth/login', 'POST /api/v1/auth/register', 'GET /api/v1/auth/me'],
        keyHighlights: [
          'BCryptPasswordEncoder with salt strength 12',
          'Jakarta Validation (@NotBlank, @Email, @Size) for clean error response payload',
          'Generates standard HS256 JWT access token with role claims'
        ]
      },
      sampleCodeSnippet: `// AuthController.java
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }
}`
    },
    {
      id: 5,
      code: 'STEP 05',
      title: 'JWT Security & Filter Chain',
      category: 'Security & Authorization',
      iconName: 'ShieldCheck',
      summary: 'Implement stateless Spring Security 6 filter chain, JJWT token validation, and @PreAuthorize fine-grained RBAC.',
      techDetails: {
        layer: 'Spring Security Configuration',
        files: ['backend/src/main/java/com/smartprocure/security/SecurityConfig.java', 'backend/src/main/java/com/smartprocure/security/JwtAuthenticationFilter.java', 'backend/src/main/java/com/smartprocure/security/JwtTokenProvider.java'],
        keyHighlights: [
          'Stateless session management (SessionCreationPolicy.STATELESS)',
          'Bearer token extraction and SecurityContextHolder authentication population',
          'CORS preflight handling and strict endpoint authorization rules'
        ]
      },
      sampleCodeSnippet: `// SecurityConfig.java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}`
    },
    {
      id: 6,
      code: 'STEP 06',
      title: 'Product & Inventory APIs',
      category: 'Inventory Subsystem',
      iconName: 'Package',
      summary: 'Manage catalog, paginated inventory search, minimum stock threshold alerts, and automated reorder recommendation calculation.',
      techDetails: {
        layer: 'Product Catalog & Inventory Service',
        files: ['backend/src/main/java/com/smartprocure/controller/ProductController.java', 'backend/src/main/java/com/smartprocure/service/ProductService.java', 'backend/src/main/java/com/smartprocure/repository/ProductRepository.java'],
        endpoints: ['GET /api/v1/products', 'POST /api/v1/products', 'GET /api/v1/procurement/recommendations'],
        keyHighlights: [
          'Dynamic JPA Specification for filtering by category, search term, and low-stock flag',
          'Automatic reorder recommendation when availableQuantity <= minimumStock',
          'Optimistic locking (@Version) on inventory updates to prevent concurrent overselling'
        ]
      },
      sampleCodeSnippet: `// ProductService.java
@Service
@Transactional(readOnly = true)
public class ProductService {
    @Autowired private ProductRepository productRepo;

    public List<ReorderRecommendation> getLowStockRecommendations() {
        return productRepo.findLowStockProducts()
            .stream()
            .map(p -> new ReorderRecommendation(
                p, 
                p.getMinimumStock() * 2 - p.getAvailableQuantity(),
                "Stock below threshold (" + p.getAvailableQuantity() + " <= " + p.getMinimumStock() + ")"
            ))
            .collect(Collectors.toList());
    }
}`
    },
    {
      id: 7,
      code: 'STEP 07',
      title: 'Supplier APIs & Algorithmic Scoring',
      category: 'Vendor Intelligence',
      iconName: 'BarChart3',
      summary: 'Supplier onboarding, catalog mapping, and multi-factor weighted scoring formula: (35% Price + 20% Quality + 20% Lead Time + 15% Rating + 10% Reliability).',
      techDetails: {
        layer: 'Vendor Management & Recommendation Engine',
        files: ['backend/src/main/java/com/smartprocure/controller/SupplierController.java', 'backend/src/main/java/com/smartprocure/service/SupplierScoringService.java'],
        endpoints: ['GET /api/v1/suppliers', 'POST /api/v1/suppliers', 'GET /api/v1/suppliers/recommendation?productId={id}'],
        keyHighlights: [
          'Weighted multi-objective ranking algorithm normalizing price and delivery metrics',
          'Vendor performance metrics updated automatically upon verified delivery',
          'Direct supplier product quote mapping with bulk discount tiers'
        ]
      },
      sampleCodeSnippet: `// SupplierScoringService.java
public SupplierScore calculateScore(Supplier s, Product p) {
    double priceScore = (1.0 - (s.getQuotedPrice(p) / p.getUnitPrice())) * 100.0;
    double qualityScore = s.getQualityRating() * 20.0;
    double leadTimeScore = Math.max(0, 100.0 - (s.getAverageDeliveryDays() * 10.0));
    double ratingScore = (s.getRating() / 5.0) * 100.0;
    double reliabilityScore = s.getOnTimeDeliveryRate() * 100.0;

    double compositeScore = (0.35 * priceScore) + (0.20 * qualityScore) 
                          + (0.20 * leadTimeScore) + (0.15 * ratingScore) + (0.10 * reliabilityScore);
    return new SupplierScore(s, compositeScore);
}`
    },
    {
      id: 8,
      code: 'STEP 08',
      title: 'Purchase Request APIs & Tier Calculation',
      category: 'Requisition Lifecycle',
      iconName: 'FileText',
      summary: 'Requisition submission, estimated total calculation, and dynamic approval tier assignment (<15k = Tier 1, 15k-100k = Tier 2, >100k = Tier 3).',
      techDetails: {
        layer: 'Requisition Management',
        files: ['backend/src/main/java/com/smartprocure/controller/PurchaseRequestController.java', 'backend/src/main/java/com/smartprocure/service/PurchaseRequestService.java'],
        endpoints: ['GET /api/v1/purchase-requests', 'POST /api/v1/purchase-requests', 'GET /api/v1/purchase-requests/{id}'],
        keyHighlights: [
          'Automatic requisition numbering (PR-YYYY-XXXXX)',
          'Tier 1 (Manager), Tier 2 (Manager + Procurement), Tier 3 (Manager + Procurement + Executive Admin)',
          'Cascade line-item creation with SKU lookup and cost verification'
        ]
      },
      sampleCodeSnippet: `// PurchaseRequestService.java
public PurchaseRequest createRequest(CreatePRDto dto, User requester) {
    double total = dto.getItems().stream()
        .mapToDouble(i -> i.getQuantity() * productRepo.findById(i.getProductId()).orElseThrow().getUnitPrice())
        .sum();

    int requiredTier = (total < 15000) ? 1 : (total <= 100000) ? 2 : 3;

    PurchaseRequest pr = PurchaseRequest.builder()
        .requestNumber("PR-" + Year.now().getValue() + "-" + System.currentTimeMillis() % 100000)
        .requester(requester)
        .department(requester.getDepartment())
        .estimatedAmount(total)
        .requiredApprovalLevel(requiredTier)
        .currentApprovalLevel(1)
        .status(PRStatus.PENDING_APPROVAL)
        .build();
    return prRepo.save(pr);
}`
    },
    {
      id: 9,
      code: 'STEP 09',
      title: 'Approval & Rejection APIs',
      category: 'Governance & State Machine',
      iconName: 'CheckCircle2',
      summary: 'Multi-level hierarchical approval sign-off, automatic tier escalation, SLA breach countdowns, and mandatory rejection audit logging.',
      techDetails: {
        layer: 'Approval Engine',
        files: ['backend/src/main/java/com/smartprocure/controller/ApprovalController.java', 'backend/src/main/java/com/smartprocure/service/ApprovalService.java'],
        endpoints: ['POST /api/v1/approvals/{id}/approve', 'POST /api/v1/approvals/{id}/reject', 'GET /api/v1/approvals/pending'],
        keyHighlights: [
          'Validates signer authority against current required tier level',
          'Automatic escalation to next tier until required tier is satisfied (then transitions to APPROVED)',
          'Mandatory rejection comment recorded to permanent immutable audit trail'
        ]
      },
      sampleCodeSnippet: `// ApprovalService.java
@Transactional
public PurchaseRequest approve(String prId, User approver, String remarks) {
    PurchaseRequest pr = prRepo.findById(prId).orElseThrow();
    validateApproverAuthority(pr, approver);

    auditLog(pr, approver, "APPROVED_TIER_" + pr.getCurrentApprovalLevel(), remarks);

    if (pr.getCurrentApprovalLevel() >= pr.getRequiredApprovalLevel()) {
        pr.setStatus(PRStatus.APPROVED);
    } else {
        pr.setCurrentApprovalLevel(pr.getCurrentApprovalLevel() + 1);
        notifyNextTierApprovers(pr);
    }
    return prRepo.save(pr);
}`
    },
    {
      id: 10,
      code: 'STEP 10',
      title: 'Purchase Order APIs & GST Calculation',
      category: 'Commercial Contracts',
      iconName: 'ShoppingCart',
      summary: 'Convert approved requisitions or low-stock triggers into legal Purchase Orders with 18% GST calculation, SLA terms, and vendor dispatch.',
      techDetails: {
        layer: 'Purchase Order Service',
        files: ['backend/src/main/java/com/smartprocure/controller/PurchaseOrderController.java', 'backend/src/main/java/com/smartprocure/service/PurchaseOrderService.java'],
        endpoints: ['GET /api/v1/purchase-orders', 'POST /api/v1/purchase-orders', 'POST /api/v1/purchase-orders/{id}/send'],
        keyHighlights: [
          'PO numbering (PO-YYYY-XXXXX) with subtotal, 18% GST tax, and total amount calculation',
          'Direct supplier notification and contractual delivery SLA assignment',
          'Automatic tracking delivery entity generation'
        ]
      },
      sampleCodeSnippet: `// PurchaseOrderService.java
public PurchaseOrder createPO(CreatePODto dto) {
    double subtotal = calculateSubtotal(dto.getItems());
    double tax = subtotal * 0.18; // 18% GST
    double total = subtotal + tax;

    PurchaseOrder po = PurchaseOrder.builder()
        .poNumber("PO-" + Year.now().getValue() + "-" + System.currentTimeMillis() % 100000)
        .supplier(supplierRepo.findById(dto.getSupplierId()).orElseThrow())
        .subtotal(subtotal)
        .taxAmount(tax)
        .totalAmount(total)
        .status(POStatus.DRAFT)
        .build();
    return poRepo.save(po);
}`
    },
    {
      id: 11,
      code: 'STEP 11',
      title: 'Delivery APIs & Stock Reconciliation',
      category: 'Logistics & Warehouse Sync',
      iconName: 'Truck',
      summary: 'Track carrier airway bills (TRK-IND-XXXXX), advance transit milestones, and automatically increment warehouse stock upon DELIVERED.',
      techDetails: {
        layer: 'Logistics & Inventory Sync',
        files: ['backend/src/main/java/com/smartprocure/controller/DeliveryController.java', 'backend/src/main/java/com/smartprocure/service/DeliveryService.java'],
        endpoints: ['GET /api/v1/deliveries', 'PUT /api/v1/deliveries/{id}/status', 'GET /api/v1/deliveries/track/{trackingNumber}'],
        keyHighlights: [
          'Transit milestone engine: CREATED -> PICKED_UP -> IN_TRANSIT -> OUT_FOR_DELIVERY -> DELIVERED',
          'Automatic stock increment in products table when milestone reaches DELIVERED',
          'Generates immutable receiving audit slip and closes PO lifecycle'
        ]
      },
      sampleCodeSnippet: `// DeliveryService.java
@Transactional
public Delivery updateStatus(String deliveryId, DeliveryStatus status, String location, String remarks) {
    Delivery del = deliveryRepo.findById(deliveryId).orElseThrow();
    del.setStatus(status);
    del.getMilestones().add(new Milestone(status, location, remarks, Instant.now()));

    if (status == DeliveryStatus.DELIVERED) {
        // Automatic stock reconciliation
        del.getPo().getItems().forEach(item -> {
            productRepo.incrementStock(item.getProduct().getId(), item.getQuantity());
        });
        del.getPo().setStatus(POStatus.COMPLETED);
    }
    return deliveryRepo.save(del);
}`
    },
    {
      id: 12,
      code: 'STEP 12',
      title: 'Notification APIs',
      category: 'Event Notifications',
      iconName: 'Bell',
      summary: 'In-app notification feed, real-time unread badges, and integration hooks for SendGrid email and Twilio SMS triggers.',
      techDetails: {
        layer: 'Notification Subsystem',
        files: ['backend/src/main/java/com/smartprocure/controller/NotificationController.java', 'backend/src/main/java/com/smartprocure/service/NotificationService.java'],
        endpoints: ['GET /api/v1/notifications', 'PUT /api/v1/notifications/{id}/read', 'PUT /api/v1/notifications/read-all'],
        keyHighlights: [
          'Asynchronous notification dispatch using @Async Spring task executor',
          'Role-targeted broadcasts (e.g. notify all Tier 2 officers on high-value PR)',
          'Multi-channel templates for Approval Requests, PO Issuance, Dispatches, and Receipts'
        ]
      },
      sampleCodeSnippet: `// NotificationService.java
@Async
public void sendNotification(String userId, String title, String message, String type) {
    Notification n = Notification.builder()
        .userId(userId)
        .title(title)
        .message(message)
        .type(type)
        .read(false)
        .createdAt(Instant.now())
        .build();
    notifRepo.save(n);
}`
    },
    {
      id: 13,
      code: 'STEP 13',
      title: 'Central Multi-Task Workflow API',
      category: 'Unified Orchestration',
      iconName: 'Terminal',
      summary: 'POST /api/v1/workflow unified enterprise command gateway executing cross-module state transitions in a single idempotent endpoint.',
      techDetails: {
        layer: 'Central Workflow Orchestrator',
        files: ['backend/src/main/java/com/smartprocure/controller/WorkflowController.java', 'backend/src/main/java/com/smartprocure/service/WorkflowOrchestratorService.java'],
        endpoints: ['POST /api/v1/workflow'],
        keyHighlights: [
          'Universal command payload: { action, entityType, entityId, payload, remarks }',
          'Supported actions: APPROVE_REQUEST, CREATE_PO, DISPATCH_ORDER, MARK_DELIVERED, REJECT_REQUEST',
          'Single integration point for RPA bots, mobile apps, and external ERP systems'
        ]
      },
      sampleCodeSnippet: `// WorkflowController.java
@RestController
@RequestMapping("/api/v1/workflow")
public class WorkflowController {
    @Autowired private WorkflowOrchestratorService orchestrator;

    @PostMapping
    public ResponseEntity<WorkflowResponse> executeCommand(@Valid @RequestBody WorkflowCommand cmd, @AuthenticationPrincipal User user) {
        WorkflowResponse res = orchestrator.execute(cmd, user);
        return ResponseEntity.ok(res);
    }
}`
    },
    {
      id: 14,
      code: 'STEP 14',
      title: 'Admin Governance & Telemetry APIs',
      category: 'Governance & Analytics',
      iconName: 'Layout',
      summary: 'System metrics, approval policy thresholds, spend velocity analytics, tenant settings, and forensic audit log queries.',
      techDetails: {
        layer: 'Administration & Governance',
        files: ['backend/src/main/java/com/smartprocure/controller/AdminController.java', 'backend/src/main/java/com/smartprocure/service/AdminService.java'],
        endpoints: ['GET /api/v1/admin/metrics', 'GET /api/v1/admin/audit-logs', 'PUT /api/v1/admin/policies'],
        keyHighlights: [
          'Real-time spend velocity, PO volume, and approval bottleneck diagnostics',
          'Dynamic reconfiguration of Tier 1/2/3 approval value thresholds without code redeployment',
          'Append-only immutable audit trail filtering by actor, date range, and action type'
        ]
      },
      sampleCodeSnippet: `// AdminController.java
@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    @Autowired private AdminService adminService;

    @GetMapping("/metrics")
    public ResponseEntity<AdminMetricsDto> getMetrics() {
        return ResponseEntity.ok(adminService.calculateMetrics());
    }
}`
    },
    {
      id: 15,
      code: 'STEP 15',
      title: 'Frontend Role Dashboards',
      category: 'Client Presentation',
      iconName: 'Globe',
      summary: '7 distinct role views (Employee, Manager, Procurement Officer, Supplier, Logistics Courier, Customer, Admin) in editorial aesthetic.',
      techDetails: {
        layer: 'React UI Presentation',
        files: ['src/components/dashboard/*.tsx', 'src/types/procurement.ts'],
        keyHighlights: [
          'Editorial aesthetic with Newsreader Serif, Plus Jakarta Sans, and high-contrast borders',
          'Live KPI metrics, requisition lists, approval queues, vendor scoring tables, and shipment timelines',
          'Zero-latency role switcher for instant multi-persona testing in single session'
        ]
      },
      sampleCodeSnippet: `// src/types/procurement.ts
export type Role = 
  | 'EMPLOYEE'
  | 'MANAGER'
  | 'PROCUREMENT_OFFICER'
  | 'SUPPLIER'
  | 'DELIVERY_PERSONNEL'
  | 'CUSTOMER'
  | 'ADMIN';`
    },
    {
      id: 16,
      code: 'STEP 16',
      title: 'Connect Frontend → REST APIs',
      category: 'API Client & State Store',
      iconName: 'Code2',
      summary: 'Reactive state store, persistent localStorage sync, optimistic UI updates, and REST API client contract integration.',
      techDetails: {
        layer: 'Client State & Data Access Layer',
        files: ['src/services/procurementStore.ts', 'src/data/initialData.ts'],
        keyHighlights: [
          'Pub/sub reactive store with automatic subscriber notification and localStorage persistence',
          'Guarantees 100% data consistency across mock state store and backend REST endpoints',
          'Optimistic updates for instant UI feedback during approval transitions'
        ]
      },
      sampleCodeSnippet: `// src/services/procurementStore.ts
export class ProcurementStore {
  private state: ProcurementState;
  private listeners: Set<() => void> = new Set();

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}`
    },
    {
      id: 17,
      code: 'STEP 17',
      title: 'Postman Collection & Environment',
      category: 'API Testing & Tooling',
      iconName: 'Download',
      summary: 'Export ready-to-use Postman collection v2.1.0 and environment with all endpoints pre-configured with Bearer JWT tokens.',
      techDetails: {
        layer: 'Developer Tooling & Postman Export',
        files: ['Smart-Procurement.postman_collection.json', 'Smart-Procurement.postman_environment.json'],
        keyHighlights: [
          'Exportable from Swagger / REST API modal directly in browser',
          'Pre-configured request headers, request bodies, and environment variables (baseUrl, jwtToken)',
          'Complete coverage across Auth, Products, Suppliers, PRs, Approvals, POs, and Deliveries'
        ]
      },
      sampleCodeSnippet: `// Postman Collection snippet
{
  "info": {
    "name": "Smart Procurement & Purchase Order Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  }
}`
    },
    {
      id: 18,
      code: 'STEP 18',
      title: 'Automated Testing Suite',
      category: 'Quality Assurance',
      iconName: 'FlaskConical',
      summary: 'JUnit 5, Mockito unit tests, and MockMvc integration tests verifying tier routing, vendor scoring, and stock reconciliation.',
      techDetails: {
        layer: 'Automated Test Suite',
        files: ['backend/src/test/java/com/smartprocure/ProcurementApplicationTests.java', 'backend/src/test/java/com/smartprocure/service/ApprovalServiceTest.java'],
        keyHighlights: [
          'Approval tier threshold verification (<15k = T1, 15k-100k = T2, >100k = T3)',
          'Delivery status transition triggers product quantity increment in database',
          'Security integration tests verifying 401 Unauthorized and 403 Forbidden scenarios'
        ]
      },
      sampleCodeSnippet: `// ApprovalServiceTest.java
@SpringBootTest
class ApprovalServiceTest {
    @Test
    void highValueRequestRequiresTier3Approval() {
        PurchaseRequest pr = service.createRequest(new CreatePRDto(item, 500000), employee);
        assertEquals(3, pr.getRequiredApprovalLevel());
        assertEquals(PRStatus.PENDING_APPROVAL, pr.getStatus());
    }
}`
    },
    {
      id: 19,
      code: 'STEP 19',
      title: 'OpenAPI & Swagger Documentation',
      category: 'API Documentation',
      iconName: 'Code2',
      summary: 'SpringDoc OpenAPI 3.0 configuration with JWT security schema, DTO schema definitions, and live /swagger-ui.html explorer.',
      techDetails: {
        layer: 'OpenAPI Specification & Swagger UI',
        files: ['backend/src/main/java/com/smartprocure/config/OpenApiConfig.java', 'src/components/api/ApiExplorerModal.tsx'],
        keyHighlights: [
          'Interactive Swagger UI with in-browser request executor and response viewer',
          'JWT Bearer security definition automatically applied across authenticated routes',
          'Detailed request/response model schemas with validation constraint documentation'
        ]
      },
      sampleCodeSnippet: `// OpenApiConfig.java
@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info().title("Smart Procurement API").version("1.0.0"))
            .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
            .components(new Components().addSecuritySchemes("BearerAuth",
                new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")));
    }
}`
    },
    {
      id: 20,
      code: 'STEP 20',
      title: 'Docker & Production Deployment',
      category: 'DevOps & Containerization',
      iconName: 'Container',
      summary: 'Multi-stage Dockerfile build for Spring Boot backend and docker-compose.yml for one-command local/cloud deployment.',
      techDetails: {
        layer: 'DevOps / Container Orchestration',
        files: ['backend/Dockerfile', 'docker-compose.yml', '.env.example'],
        keyHighlights: [
          'Multi-stage Docker build utilizing Eclipse Temurin 21 Alpine JRE for lightweight container image (<180MB)',
          'Docker Compose with PostgreSQL 16 health check dependency and named persistent volume',
          'Ready for Cloud Run, Kubernetes, or AWS ECS container deployment'
        ]
      },
      sampleCodeSnippet: `# backend/Dockerfile
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`
    }
  ];

  const selectedStep = STEPS.find(s => s.id === selectedStepId) || STEPS[0];

  const handleStepClick = (stepId: number) => {
    setSelectedStepId(stepId);
    setExecutionResult(null);
  };

  return (
    <div className="fixed inset-0 bg-[#121212]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#F9F7F2] border border-[#121212] max-w-6xl w-full p-8 shadow-2xl space-y-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-[#121212]/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Enterprise Architecture Blueprint</span>
              <span className="px-2 py-0.5 border border-[#121212] bg-[#121212] text-[#F9F7F2] text-[9px] font-mono uppercase font-medium">
                20-Step Full-Stack Engine
              </span>
            </div>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-1">20-Step Architectural Implementation Matrix</h3>
            <p className="text-xs font-serif italic text-[#121212]/60 mt-0.5">
              Comprehensive breakdown of backend Spring Boot 3.3.x, PostgreSQL Flyway schemas, JWT security, REST APIs, and React frontend
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenSwagger();
              }}
              className="px-3.5 py-2 bg-white hover:bg-[#F4F0E8] text-[#121212] border border-[#121212]/30 text-[10px] font-sans uppercase tracking-[0.15em] font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition"
            >
              <Code2 className="w-3.5 h-3.5" />
              Swagger API
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenZip();
              }}
              className="px-3.5 py-2 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] border border-[#121212] text-[10px] font-sans uppercase tracking-[0.15em] font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download Spring Boot ZIP
            </button>
            <button 
              onClick={onClose} 
              className="text-2xl text-[#121212]/50 hover:text-[#121212] cursor-pointer leading-none ml-2"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content Body: Left Step Nav (20 Steps) + Right Step Details & Code */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
          {/* Step Selector Sidebar */}
          <div className="md:col-span-4 bg-white border border-[#121212]/20 overflow-y-auto max-h-[60vh] divide-y divide-[#121212]/10 text-xs font-sans">
            {STEPS.map(step => {
              const isSelected = step.id === selectedStep.id;
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className={`w-full p-3 text-left transition flex items-center justify-between cursor-pointer ${
                    isSelected ? 'bg-[#121212] text-[#F9F7F2]' : 'hover:bg-[#F9F7F2] text-[#121212]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 border text-[9px] font-mono uppercase font-semibold ${
                        isSelected 
                          ? 'border-white/40 text-[#F9F7F2]' 
                          : 'border-[#121212]/30 text-[#121212]'
                      }`}>
                        {step.code}
                      </span>
                      <span className="font-medium text-[11px] truncate">{step.title}</span>
                    </div>
                    <p className={`text-[10px] truncate mt-1 ${isSelected ? 'text-[#F9F7F2]/75' : 'text-[#121212]/50'}`}>
                      {step.category}
                    </p>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#F9F7F2]' : 'text-[#121212]/40'}`} />
                </button>
              );
            })}
          </div>

          {/* Step Detail Viewer */}
          <div className="md:col-span-8 bg-white border border-[#121212]/20 p-6 flex flex-col justify-between overflow-y-auto max-h-[60vh] space-y-5">
            <div className="space-y-4 font-sans text-xs">
              {/* Header Info */}
              <div className="flex justify-between items-start border-b border-[#121212]/10 pb-3">
                <div>
                  <span className="px-2 py-0.5 border border-[#121212] text-[9px] font-mono uppercase font-semibold bg-[#121212] text-[#F9F7F2]">
                    {selectedStep.code} • {selectedStep.category}
                  </span>
                  <h4 className="text-xl font-serif text-[#121212] mt-1.5">{selectedStep.title}</h4>
                </div>
                <span className="text-[10px] font-mono text-[#121212]/50">Phase {selectedStep.id} of 20</span>
              </div>

              {/* Summary */}
              <p className="text-[#121212]/80 leading-relaxed text-xs">
                {selectedStep.summary}
              </p>

              {/* Technical Specifications Matrix */}
              <div className="bg-[#F9F7F2] border border-[#121212]/20 p-4 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#121212]/50 block font-semibold">Architectural Layer</span>
                    <span className="font-mono text-[#121212]">{selectedStep.techDetails.layer}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#121212]/50 block font-semibold">Associated Source Files</span>
                    <span className="font-mono text-[#121212] text-[10px]">{selectedStep.techDetails.files.join(', ')}</span>
                  </div>
                </div>

                {selectedStep.techDetails.endpoints && (
                  <div className="pt-2 border-t border-[#121212]/10">
                    <span className="text-[9px] uppercase tracking-wider text-[#121212]/50 block font-semibold">REST Endpoints</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedStep.techDetails.endpoints.map((ep, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border border-[#121212]/30 font-mono text-[10px] text-[#121212]">
                          {ep}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedStep.techDetails.schemaTables && (
                  <div className="pt-2 border-t border-[#121212]/10">
                    <span className="text-[9px] uppercase tracking-wider text-[#121212]/50 block font-semibold">PostgreSQL Relational Tables</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedStep.techDetails.schemaTables.map((tbl, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border border-[#121212]/30 font-mono text-[10px] text-[#121212]">
                          {tbl}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Highlights */}
                <div className="pt-2 border-t border-[#121212]/10">
                  <span className="text-[9px] uppercase tracking-wider text-[#121212]/50 block font-semibold mb-1">Key Implementation Rules</span>
                  <ul className="space-y-1">
                    {selectedStep.techDetails.keyHighlights.map((hl, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px] text-[#121212]/80">
                        <Check className="w-3.5 h-3.5 text-[#121212] shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sample Code Snippet */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-[#121212]/70 font-semibold">
                    Production Code Snippet ({selectedStep.code})
                  </span>
                </div>
                <pre className="p-3.5 bg-[#121212] text-[#F9F7F2] text-[11px] font-mono overflow-x-auto max-h-48 overflow-y-auto border border-[#121212]">
{selectedStep.sampleCodeSnippet}
                </pre>
              </div>

              {/* Bottom Quick Navigation */}
              <div className="flex justify-between items-center pt-2 border-t border-[#121212]/10">
                <button
                  disabled={selectedStep.id === 1}
                  onClick={() => handleStepClick(selectedStep.id - 1)}
                  className={`px-3 py-1.5 border text-[10px] uppercase tracking-wider font-medium cursor-pointer ${
                    selectedStep.id === 1 
                      ? 'border-[#121212]/20 text-[#121212]/30 cursor-not-allowed' 
                      : 'border-[#121212]/40 text-[#121212] hover:bg-[#F9F7F2]'
                  }`}
                >
                  &larr; Previous Step
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSwagger();
                    }}
                    className="px-3.5 py-1.5 bg-[#121212] text-[#F9F7F2] text-[10px] uppercase tracking-wider font-medium cursor-pointer hover:bg-[#2A2A2A]"
                  >
                    Test in Swagger API
                  </button>
                  <button
                    disabled={selectedStep.id === 20}
                    onClick={() => handleStepClick(selectedStep.id + 1)}
                    className={`px-3 py-1.5 border text-[10px] uppercase tracking-wider font-medium cursor-pointer ${
                      selectedStep.id === 20 
                        ? 'border-[#121212]/20 text-[#121212]/30 cursor-not-allowed' 
                        : 'border-[#121212]/40 text-[#121212] hover:bg-[#F9F7F2]'
                    }`}
                  >
                    Next Step &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
