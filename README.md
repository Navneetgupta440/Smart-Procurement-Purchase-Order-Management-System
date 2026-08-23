# Smart Procurement & Purchase Order Management System

An enterprise-grade, multi-tenant procurement and purchase order orchestration platform featuring role-based workflows, dynamic multi-tier approval hierarchies, algorithmic supplier evaluation, shipment tracking, and automated inventory reconciliation.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture & Tech Stack](#system-architecture--tech-stack)
- [Role-Based Access Matrix](#role-based-access-matrix)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)
- [API & Workflow Orchestration](#api--workflow-orchestration)
- [Git Version Control & Workflow](#git-version-control--workflow)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The **Smart Procurement & Purchase Order Management System** streamlines end-to-end organizational purchasing. It automates every step from initial purchase requisition (PR) creation through multi-level approval routing, vendor selection via weighted scoring, purchase order (PO) generation, carrier tracking, and inventory synchronization upon delivery.

Designed with an **Editorial Aesthetic**, the system features a high-contrast layout, tactile card surfaces, typography pairing (Newsreader Serif and Plus Jakarta Sans), and clear data visualization.

---

## Key Features

1. **Multi-Tier Dynamic Approvals**:
   - **Tier 1 (< ₹15,000)**: Department Manager authorization.
   - **Tier 2 (₹15,000 – ₹1,00,000)**: Department Manager &rarr; Procurement Officer.
   - **Tier 3 (> ₹1,00,000)**: Department Manager &rarr; Procurement Officer &rarr; Executive Admin.
   - Real-time SLA breach countdowns, budget utilization checks, and mandatory rejection audit logging.

2. **Algorithmic Supplier Scoring & Selection**:
   - Multi-factor evaluation:
     $$\text{Score} = (0.35 \times \text{Price}) + (0.20 \times \text{Quality}) + (0.20 \times \text{Lead Time}) + (0.15 \times \text{Rating}) + (0.10 \times \text{Reliability})$$
   - Automated ranking and instant supplier comparison matrix.

3. **Purchase Order & Vendor Portal**:
   - Automated tax calculation (18% GST), freight estimates, and enterprise volume discounts.
   - Vendor portal for order acceptance, packaging, airway bill generation, and courier handover.

4. **Logistics & Delivery Milestone Tracking**:
   - Real-time tracking numbers (`TRK-IND-XXXXX`), carrier assignments, and custody timelines.
   - Automated inventory increment and reconciliation when an order status reaches `DELIVERED`.

5. **Forensic Audit Logging & Governance**:
   - Immutable audit trail capturing every transaction, actor, role, timestamp, and state transition.
   - Configurable policy thresholds and executive telemetry dashboards.

6. **Interactive Simulation & Project ZIP Export**:
   - Built-in 7-stage interactive demo walkthrough simulating complete requisition-to-inventory lifecycles.
   - One-click export bundling Spring Boot 3.3.x backend code, PostgreSQL Flyway migrations (26 tables), Docker configurations, and Postman collections.

---

## System Architecture & Tech Stack

### Frontend & Core Engine
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4 with custom editorial typography and styling
- **Icons**: Lucide React
- **Data Visualizations**: Recharts (spend velocity and status distribution)
- **Animations & Effects**: Motion & Canvas Confetti
- **Export Engine**: JSZip for client-side package compilation

### Design Specifications
- **Background**: `#F9F7F2` (Parchment)
- **Surface / Cards**: `#FFFFFF` (Crisp Paper)
- **Primary Ink / Borders**: `#121212` (Carbon)
- **Table Headers & Accents**: `#F4F0E8` (Warm Neutral)
- **Typography**: Serif headlines with sans-serif body copy and monospace code/data badges

---

## Role-Based Access Matrix

| Role | Persona | Permissions & Scope |
| :--- | :--- | :--- |
| **Employee** | Sarah Jenkins | Initiate purchase requests, view catalog, track own requisitions |
| **Manager** | Marcus Vance | Departmental budget oversight, Tier 1 approvals, cost justification |
| **Procurement Officer** | Priya Sharma | Vendor scoring, PO generation, supplier dispatch, Tier 2 approvals |
| **Supplier / Vendor** | ABC Tech Innovations | Accept/reject POs, manage production queue, dispatch consignments |
| **Delivery Personnel** | Rajesh Kumar (SpeedExpress) | Update transit milestones, confirm dock handovers, barcode waybills |
| **Customer / Store** | Ananya Sharma | Browse products, create restock requisitions, view receipt logs |
| **Executive Admin** | Alexander Wright | Governance telemetry, Tier 3 approval sign-offs, system policies, audit trail |

---

## Installation & Setup

### Prerequisites
- **Node.js**: Version 18.x or higher
- **npm** / **yarn** / **pnpm** / **bun**
- **Git**

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd smart-procurement-system
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

5. **Type Checking & Linting**:
   ```bash
   npm run lint
   ```

6. **Build for Production**:
   ```bash
   npm run build
   ```

---

## Usage Guide

### 1. Switching Roles
Click the **Role Selector** in the navigation bar to immediately toggle between any of the 7 enterprise personas. The dashboard dynamically adapts to present tools, metrics, and workflows specific to that role.

### 2. Submitting a Purchase Requisition
- As an **Employee**, click **"+ New Purchase Request"**.
- Select items from the catalog, specify quantities, department, and priority level.
- The system automatically calculates total estimated cost and displays the required approval tier level.

### 3. Processing Approvals
- Switch to **Department Manager**, **Procurement Officer**, or **Executive Admin**.
- Review pending requisitions, check line-item breakdowns, and click **"Approve Requisition"** or **"Reject"** with mandatory justification.
- When all required tiers sign off, the status transitions to `APPROVED`.

### 4. Creating & Issuing Purchase Orders
- As a **Procurement Officer**, navigate to approved requests and click **"Generate Purchase Order"**.
- View algorithmic supplier recommendations ranked by lead time, price, and quality.
- Confirm quantities and pricing with automated 18% GST calculation.

### 5. Vendor Dispatch & Delivery
- As a **Supplier**, accept incoming orders, initiate processing, and dispatch with tracking numbers.
- As **Delivery Personnel**, advance shipment waybills (`IN_TRANSIT` &rarr; `OUT_FOR_DELIVERY` &rarr; `DELIVERED`).
- Marking an item as `DELIVERED` automatically increments warehouse stock levels.

### 6. Interactive 7-Stage Demo
Click **"7-Stage Interactive Walkthrough"** in the top navigation bar to run an automated simulation through all approval, procurement, vendor, and delivery stages.

---

## API & Workflow Orchestration

The system includes a **REST API Explorer** and **Central Workflow Orchestration** engine (`POST /api/v1/workflow`):

### Central Workflow Endpoint
```http
POST /api/v1/workflow
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "action": "APPROVE_REQUEST",
  "entityType": "PURCHASE_REQUEST",
  "entityId": "pr-01",
  "remarks": "Approved via central workflow command"
}
```

### Supported Commands
- `APPROVE_REQUEST` / `REJECT_REQUEST`
- `CREATE_PO` / `SEND_PO`
- `ACCEPT_ORDER` / `REJECT_ORDER`
- `START_PROCESSING` / `DISPATCH_ORDER`
- `UPDATE_DELIVERY` / `MARK_DELIVERED`

Export ready-to-use Postman collections directly from the **REST API Explorer** modal inside the application.

---

## Git Version Control & Workflow

This project is version-controlled with Git. Follow these best practices for version management and future commits.

### Initial Setup
```bash
# 1. Initialize repository (if not already done)
git init

# 2. Check staged/unstaged files
git status

# 3. Add files to staging
git add .

# 4. Create initial commit
git commit -m "feat: initial commit - Smart Procurement & Purchase Order Management System"
```

### Making Future Commits

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
# Check modified files
git status

# Stage specific changes or all updated files
git add <file-path>
# or stage all modified files:
git add .

# Commit with a descriptive conventional commit message
git commit -m "<type>(<scope>): <short description>"
```

#### Commit Types:
- `feat`: A new feature (e.g., `feat(approvals): add automated email notifications on Tier 3 sign-off`)
- `fix`: A bug fix (e.g., `fix(tax): correct GST rounding calculation on multi-item POs`)
- `docs`: Documentation changes (e.g., `docs: update API workflow contract in README`)
- `style`: Formatting, missing semi-colons, style fixes (no code changes)
- `refactor`: Refactoring production code without changing behavior
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates, build configurations

### Branching Strategy
```bash
# Create and switch to a new feature branch
git checkout -b feature/supplier-rating-update

# Work on changes, stage, and commit
git add .
git commit -m "feat(suppliers): enhance rating weight in scoring matrix"

# Switch back to main branch
git checkout main

# Merge feature branch
git merge feature/supplier-rating-update
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository** on GitHub.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit your Changes** using standard commit conventions.
4. **Verify TypeScript & Linting**:
   ```bash
   npm run lint
   npm run build
   ```
5. **Push to the Branch**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request** with a detailed description of your changes and motivation.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
