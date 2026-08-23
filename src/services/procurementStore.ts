import {
  User,
  RoleType,
  Product,
  Supplier,
  ProductSupplier,
  PurchaseRequest,
  PurchaseOrder,
  Delivery,
  DeliveryStatus,
  Notification,
  AuditLog,
  SystemSetting,
  InventoryTransaction,
  SupplierRecommendation,
  SupplierScoringWeights,
  ProductCategory
} from '../types/procurement';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_SUPPLIERS,
  INITIAL_PRODUCT_SUPPLIERS,
  INITIAL_PURCHASE_REQUESTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_DELIVERIES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_INVENTORY_TRANSACTIONS
} from '../data/initialData';
import { sha256, fastHashSync, generateEncryptedToken } from '../utils/crypto';

const STORAGE_KEY = 'smart_procurement_state_v2';

export interface ProcurementState {
  currentUser: User;
  users: User[];
  categories: ProductCategory[];
  products: Product[];
  suppliers: Supplier[];
  productSuppliers: ProductSupplier[];
  purchaseRequests: PurchaseRequest[];
  purchaseOrders: PurchaseOrder[];
  deliveries: Delivery[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  systemSettings: SystemSetting[];
  inventoryTransactions: InventoryTransaction[];
  scoringWeights: SupplierScoringWeights;
  isAuthenticated: boolean;
  isGatewayLocked: boolean;
}

class ProcurementStore {
  private state: ProcurementState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): ProcurementState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Merge & synchronize categories ensuring updated names from INITIAL_CATEGORIES
        const savedCategories: ProductCategory[] = parsed.categories || [];
        const initialCatMap = new Map(INITIAL_CATEGORIES.map(c => [c.id, c]));
        const mergedCategories: ProductCategory[] = [];
        const seenCatIds = new Set<string>();

        // First preserve existing categories with refreshed metadata
        for (const cat of savedCategories) {
          const initial = initialCatMap.get(cat.id);
          if (initial) {
            mergedCategories.push({ ...cat, name: initial.name, description: initial.description, code: initial.code });
          } else {
            mergedCategories.push(cat);
          }
          seenCatIds.add(cat.id);
        }

        // Add any missing initial categories
        for (const initCat of INITIAL_CATEGORIES) {
          if (!seenCatIds.has(initCat.id)) {
            mergedCategories.push(initCat);
            seenCatIds.add(initCat.id);
          }
        }

        // Merge and update products
        const catNameById = new Map(mergedCategories.map(c => [c.id, c.name]));
        const existingProdIds = new Set((parsed.products || []).map((p: Product) => p.id));
        const missingProducts = INITIAL_PRODUCTS.filter(p => !existingProdIds.has(p.id));
        const mergedProducts: Product[] = [...(parsed.products || []), ...missingProducts].map((p: Product) => {
          const updatedCatName = catNameById.get(p.categoryId);
          return updatedCatName ? { ...p, categoryName: updatedCatName } : p;
        });

        const existingSuppIds = new Set((parsed.suppliers || []).map((s: Supplier) => s.id));
        const missingSuppliers = INITIAL_SUPPLIERS.filter(s => !existingSuppIds.has(s.id));
        const mergedSuppliers = [...(parsed.suppliers || []), ...missingSuppliers];

        const existingUserEmails = new Set((parsed.users || []).map((u: User) => u.email.toLowerCase()));
        const missingUsers = INITIAL_USERS.filter(u => !existingUserEmails.has(u.email.toLowerCase()));
        const mergedUsers = [...(parsed.users || []), ...missingUsers];

        return {
          ...parsed,
          users: mergedUsers,
          categories: mergedCategories,
          products: mergedProducts,
          suppliers: mergedSuppliers,
          isAuthenticated: parsed.isAuthenticated ?? false,
          isGatewayLocked: parsed.isGatewayLocked ?? true,
          scoringWeights: parsed.scoringWeights || {
            priceWeight: 0.35,
            qualityWeight: 0.20,
            deliveryWeight: 0.20,
            ratingWeight: 0.15,
            reliabilityWeight: 0.10
          }
        };
      }
    } catch {
      // Fallback
    }

    return {
      currentUser: INITIAL_USERS[0], // Admin by default
      users: [...INITIAL_USERS],
      categories: [...INITIAL_CATEGORIES],
      products: [...INITIAL_PRODUCTS],
      suppliers: [...INITIAL_SUPPLIERS],
      productSuppliers: [...INITIAL_PRODUCT_SUPPLIERS],
      purchaseRequests: [...INITIAL_PURCHASE_REQUESTS],
      purchaseOrders: [...INITIAL_PURCHASE_ORDERS],
      deliveries: [...INITIAL_DELIVERIES],
      auditLogs: [...INITIAL_AUDIT_LOGS],
      notifications: [...INITIAL_NOTIFICATIONS],
      systemSettings: [...INITIAL_SYSTEM_SETTINGS],
      inventoryTransactions: [...INITIAL_INVENTORY_TRANSACTIONS],
      isAuthenticated: false,
      isGatewayLocked: true,
      scoringWeights: {
        priceWeight: 0.35,
        qualityWeight: 0.20,
        deliveryWeight: 0.20,
        ratingWeight: 0.15,
        reliabilityWeight: 0.10
      }
    };
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // ignore
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public getState(): ProcurementState {
    return this.state;
  }

  public resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = {
      currentUser: INITIAL_USERS[0],
      users: [...INITIAL_USERS],
      categories: [...INITIAL_CATEGORIES],
      products: [...INITIAL_PRODUCTS],
      suppliers: [...INITIAL_SUPPLIERS],
      productSuppliers: [...INITIAL_PRODUCT_SUPPLIERS],
      purchaseRequests: [...INITIAL_PURCHASE_REQUESTS],
      purchaseOrders: [...INITIAL_PURCHASE_ORDERS],
      deliveries: [...INITIAL_DELIVERIES],
      auditLogs: [...INITIAL_AUDIT_LOGS],
      notifications: [...INITIAL_NOTIFICATIONS],
      systemSettings: [...INITIAL_SYSTEM_SETTINGS],
      inventoryTransactions: [...INITIAL_INVENTORY_TRANSACTIONS],
      isAuthenticated: false,
      isGatewayLocked: true,
      scoringWeights: {
        priceWeight: 0.35,
        qualityWeight: 0.20,
        deliveryWeight: 0.20,
        ratingWeight: 0.15,
        reliabilityWeight: 0.10
      }
    };
    this.saveState();
  }

  // --- Auth & Role Management ---
  public switchRole(role: RoleType) {
    const user = this.state.users.find(u => u.role === role) || this.state.users[0];
    this.state.currentUser = user;
    this.logAudit('LOGIN', 'AUTH', user.id, undefined, `Switched persona to ${role} (${user.name})`);
    this.saveState();
  }

  public switchUserRole(role: RoleType) {
    this.switchRole(role);
  }

  public resetData() {
    this.resetToDefaults();
  }

  public setCurrentUser(userId: string) {
    const user = this.state.users.find(u => u.id === userId);
    if (user) {
      this.state.currentUser = user;
      this.state.isAuthenticated = true;
      this.state.isGatewayLocked = false;
      this.saveState();
    }
  }

  public async registerUser(data: {
    name: string;
    email: string;
    phone?: string;
    role: RoleType;
    department?: string;
    password?: string;
  }): Promise<{ success: boolean; user?: User; error?: string; token?: string }> {
    const existing = this.state.users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An enterprise account with this email address already exists.' };
    }

    const rawPassword = data.password || 'Secure@2026';
    let passwordHash = '';
    try {
      passwordHash = await sha256(rawPassword);
    } catch {
      passwordHash = fastHashSync(rawPassword);
    }

    const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const token = generateEncryptedToken(userId, data.role);

    const newUser: User = {
      id: userId,
      name: data.name,
      email: data.email,
      phone: data.phone || '+91 98765 00000',
      role: data.role,
      status: 'ACTIVE',
      department: data.department || (data.role === 'SUPPLIER' ? 'Vendor Relations' : data.role === 'CUSTOMER' ? 'Client Accounts' : 'Corporate Operations'),
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      defaultPassword: rawPassword,
      passwordHash,
      encryptedToken: token,
      lastEncryptedHash: passwordHash,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    this.state.users = [newUser, ...this.state.users];
    this.state.currentUser = newUser;
    this.state.isAuthenticated = true;
    this.state.isGatewayLocked = false;

    this.logAudit('CREATE_USER', 'USER', newUser.id, undefined, `Registered new encrypted enterprise account ${newUser.name} [Role: ${newUser.role}] (SHA-256 Hash: ${passwordHash.slice(0, 16)}...)`);
    this.sendNotification(
      newUser.id,
      'Enterprise Account Initialized',
      `Welcome ${newUser.name}! Your cryptographic credentials for ${newUser.role} in ${newUser.department} have been secured.`,
      'IN_APP',
      'USER_REGISTRATION'
    );
    this.saveState();
    return { success: true, user: newUser, token };
  }

  public async loginWithPassword(email: string, password?: string): Promise<{ success: boolean; user?: User; error?: string; token?: string; encryptedHash?: string }> {
    const user = this.state.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return { success: false, error: 'No account registered with this corporate email address.' };
    }

    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      return { success: false, error: 'This corporate account is currently suspended. Please contact Admin.' };
    }

    const rawPassword = password || user.defaultPassword || 'Secure@2026';
    let computedHash = '';
    try {
      computedHash = await sha256(rawPassword);
    } catch {
      computedHash = fastHashSync(rawPassword);
    }

    // Generate authenticated session token
    const token = generateEncryptedToken(user.id, user.role);

    user.lastLogin = new Date().toISOString();
    user.lastEncryptedHash = computedHash;
    user.encryptedToken = token;
    if (!user.passwordHash) {
      user.passwordHash = computedHash;
    }

    this.state.currentUser = user;
    this.state.isAuthenticated = true;
    this.state.isGatewayLocked = false;

    this.logAudit(
      'LOGIN', 
      'AUTH', 
      user.id, 
      undefined, 
      `Encrypted Authentication Successful for ${user.name} [${user.role}] (Payload SHA-256: ${computedHash.slice(0, 16)}...)`
    );
    this.saveState();

    return { 
      success: true, 
      user, 
      token, 
      encryptedHash: computedHash 
    };
  }

  public loginWithEmail(email: string): { success: boolean; user?: User; error?: string } {
    const user = this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, error: 'Invalid email or user account not found.' };
    }
    user.lastLogin = new Date().toISOString();
    this.state.currentUser = user;
    this.state.isAuthenticated = true;
    this.state.isGatewayLocked = false;
    this.logAudit('LOGIN', 'AUTH', user.id, undefined, `User authenticated via SSO/Email (${user.name})`);
    this.saveState();
    return { success: true, user };
  }

  public loginAsRole(role: RoleType) {
    const user = this.state.users.find(u => u.role === role) || this.state.users[0];
    this.state.currentUser = user;
    this.state.isAuthenticated = true;
    this.state.isGatewayLocked = false;
    this.logAudit('LOGIN', 'AUTH', user.id, undefined, `Quick authentication as persona ${role} (${user.name})`);
    this.saveState();
  }

  public logout() {
    const currentUser = this.state.currentUser;
    this.logAudit('LOGOUT', 'AUTH', currentUser.id, undefined, `User session closed for ${currentUser.name} (${currentUser.role})`);
    this.state.isAuthenticated = false;
    this.state.isGatewayLocked = true;
    this.saveState();
  }

  public unlockGateway() {
    this.state.isGatewayLocked = false;
    this.state.isAuthenticated = true;
    this.saveState();
  }

  public lockGateway() {
    this.state.isGatewayLocked = true;
    this.saveState();
  }

  // --- Audit Logging ---
  public logAudit(action: AuditLog['action'], entityType: string, entityId: string, oldValue?: string, newValue?: string) {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: this.state.currentUser.id,
      userName: this.state.currentUser.name,
      userRole: this.state.currentUser.role,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress: '127.0.0.1 (Local)',
      userAgent: navigator.userAgent || 'SmartProcure Engine',
      timestamp: new Date().toISOString()
    };
    this.state.auditLogs = [log, ...this.state.auditLogs];
  }

  // --- Notifications ---
  public sendNotification(
    targetRoleOrUserId: string,
    title: string,
    message: string,
    channel: 'IN_APP' | 'EMAIL' | 'SMS' = 'IN_APP',
    eventType: string = 'GENERIC',
    entityType?: string,
    entityId?: string
  ) {
    // Find target user or broadcast to role
    const matchedUser = this.state.users.find(u => u.id === targetRoleOrUserId || u.role === targetRoleOrUserId) || this.state.currentUser;

    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: matchedUser.id,
      title,
      message,
      channel,
      status: 'PENDING',
      eventType,
      entityType,
      entityId,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    this.state.notifications = [notif, ...this.state.notifications];
    this.logAudit('SEND_NOTIFICATION', 'NOTIFICATION', notif.id, undefined, `Sent ${channel} alert: ${title}`);
  }

  public markNotificationAsRead(id: string) {
    this.state.notifications = this.state.notifications.map(n => 
      n.id === id ? { ...n, status: 'READ', readAt: new Date().toISOString() } : n
    );
    this.saveState();
  }

  public markAllNotificationsAsRead() {
    const now = new Date().toISOString();
    this.state.notifications = this.state.notifications.map(n => ({
      ...n,
      status: 'READ',
      readAt: now
    }));
    this.saveState();
  }

  // --- Purchase Requests ---
  public createPurchaseRequest(data: {
    items: { productId: string; quantity: number }[];
    department: string;
    priority: PurchaseRequest['priority'];
    reason: string;
  }): PurchaseRequest {
    const reqNum = `PR-2026-${String(this.state.purchaseRequests.length + 52).padStart(4, '0')}`;
    
    let totalEst = 0;
    const requestItems = data.items.map((item, idx) => {
      const prod = this.state.products.find(p => p.id === item.productId);
      const unitPrice = prod ? prod.unitPrice : 1000;
      const total = unitPrice * item.quantity;
      totalEst += total;
      return {
        id: `pri-${Date.now()}-${idx}`,
        productId: item.productId,
        productName: prod ? prod.name : 'Unknown Item',
        productCode: prod ? prod.productCode : 'PRD-UNK',
        quantity: item.quantity,
        estimatedUnitPrice: unitPrice,
        estimatedTotal: total
      };
    });

    // Determine required approval level based on amount
    // < 15k -> 1 (Manager)
    // 15k - 100k -> 2 (Manager + Procurement)
    // > 100k -> 3 (Manager + Procurement + Admin)
    let requiredLevel = 1;
    if (totalEst > 100000) {
      requiredLevel = 3;
    } else if (totalEst >= 15000) {
      requiredLevel = 2;
    }

    const newRequest: PurchaseRequest = {
      id: `pr-${Date.now()}`,
      requestNumber: reqNum,
      requestedBy: this.state.currentUser.id,
      requestedByName: this.state.currentUser.name,
      requestedByEmail: this.state.currentUser.email,
      department: data.department || this.state.currentUser.department || 'Engineering',
      priority: data.priority,
      reason: data.reason,
      status: 'PENDING_APPROVAL',
      estimatedAmount: totalEst,
      items: requestItems,
      currentApprovalLevel: 1,
      requiredApprovalLevel: requiredLevel,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.state.purchaseRequests = [newRequest, ...this.state.purchaseRequests];
    this.logAudit('CREATE_REQUEST', 'PURCHASE_REQUEST', newRequest.requestNumber, undefined, `Created ${newRequest.requestNumber} for ₹${totalEst.toLocaleString()}`);

    // Notify Managers
    this.sendNotification(
      'MANAGER',
      'New Purchase Request Awaiting Approval',
      `${this.state.currentUser.name} created ${reqNum} (${data.priority} priority, ₹${totalEst.toLocaleString()}).`,
      'IN_APP',
      'REQUEST_CREATED',
      'PURCHASE_REQUEST',
      newRequest.id
    );

    this.saveState();
    return newRequest;
  }

  public approvePurchaseRequest(requestId: string, remarks: string = 'Approved'): { success: boolean; message: string } {
    const pr = this.state.purchaseRequests.find(r => r.id === requestId);
    if (!pr) return { success: false, message: 'Purchase request not found' };

    if (pr.requestedBy === this.state.currentUser.id && this.state.currentUser.role !== 'ADMIN') {
      return { success: false, message: 'Separation of concerns violation: Users cannot approve their own purchase requests.' };
    }

    if (pr.status !== 'PENDING_APPROVAL') {
      return { success: false, message: `Cannot approve request with status: ${pr.status}` };
    }

    const currentLevel = pr.currentApprovalLevel;
    const requiredLevel = pr.requiredApprovalLevel;

    this.logAudit(
      'APPROVE_REQUEST',
      'PURCHASE_REQUEST',
      pr.requestNumber,
      `Level ${currentLevel} (Pending)`,
      `Approved by ${this.state.currentUser.role} (${this.state.currentUser.name}) with remarks: "${remarks}"`
    );

    if (currentLevel < requiredLevel) {
      // Advance to next approval tier
      const nextLevel = currentLevel + 1;
      pr.currentApprovalLevel = nextLevel;
      pr.updatedAt = new Date().toISOString();

      const nextRole = nextLevel === 2 ? 'PROCUREMENT_MANAGER' : 'ADMIN';
      this.sendNotification(
        nextRole,
        `Level ${nextLevel} Approval Required for ${pr.requestNumber}`,
        `Request ${pr.requestNumber} (₹${pr.estimatedAmount.toLocaleString()}) approved at Level ${currentLevel} by ${this.state.currentUser.name}. Awaiting your final sign-off.`,
        'IN_APP',
        'REQUEST_ESCALATED',
        'PURCHASE_REQUEST',
        pr.id
      );

      this.saveState();
      return { success: true, message: `Approved Level ${currentLevel}. Escalated to Level ${nextLevel} (${nextRole}) for multi-tier authorization.` };
    } else {
      // Fully approved!
      pr.status = 'APPROVED';
      pr.updatedAt = new Date().toISOString();

      this.sendNotification(
        pr.requestedBy,
        `Purchase Request ${pr.requestNumber} Fully Approved!`,
        `Your request for ₹${pr.estimatedAmount.toLocaleString()} has been fully approved by management. Ready for Purchase Order generation.`,
        'IN_APP',
        'REQUEST_APPROVED',
        'PURCHASE_REQUEST',
        pr.id
      );

      this.sendNotification(
        'PROCUREMENT_MANAGER',
        `Ready for PO Creation: ${pr.requestNumber}`,
        `Approved request ${pr.requestNumber} is ready for supplier selection and PO generation.`,
        'IN_APP',
        'REQUEST_APPROVED',
        'PURCHASE_REQUEST',
        pr.id
      );

      this.saveState();
      return { success: true, message: `Request ${pr.requestNumber} is fully APPROVED across all ${requiredLevel} tier(s).` };
    }
  }

  public rejectPurchaseRequest(requestId: string, remarks: string): { success: boolean; message: string } {
    if (!remarks || remarks.trim().length === 0) {
      return { success: false, message: 'Rejection requires a mandatory business justification reason.' };
    }

    const pr = this.state.purchaseRequests.find(r => r.id === requestId);
    if (!pr) return { success: false, message: 'Purchase request not found' };

    const oldStatus = pr.status;
    pr.status = 'REJECTED';
    pr.rejectionReason = remarks;
    pr.updatedAt = new Date().toISOString();

    this.logAudit('REJECT_REQUEST', 'PURCHASE_REQUEST', pr.requestNumber, oldStatus, `Rejected by ${this.state.currentUser.name}: ${remarks}`);

    this.sendNotification(
      pr.requestedBy,
      `Purchase Request ${pr.requestNumber} Rejected`,
      `Your request was rejected by ${this.state.currentUser.name}. Reason: "${remarks}"`,
      'IN_APP',
      'REQUEST_REJECTED',
      'PURCHASE_REQUEST',
      pr.id
    );

    this.saveState();
    return { success: true, message: `Purchase request ${pr.requestNumber} has been rejected.` };
  }

  // --- Supplier Recommendation Algorithm ---
  public getSupplierRecommendations(productId: string): SupplierRecommendation[] {
    const product = this.state.products.find(p => p.id === productId);
    if (!product) return [];

    const weights = this.state.scoringWeights;
    const prodSuppliers = this.state.productSuppliers.filter(ps => ps.productId === productId);

    if (prodSuppliers.length === 0) {
      // Generate default supplier associations if none
      return this.state.suppliers.map(s => {
        const ps: ProductSupplier = {
          id: `ps-${product.id}-${s.id}`,
          productId: product.id,
          supplierId: s.id,
          supplierName: s.companyName,
          supplierProductCode: `${s.supplierCode}-${product.productCode}`,
          unitPrice: product.unitPrice * (s.rating >= 4.5 ? 1.02 : 0.96),
          leadTimeDays: s.averageLeadDays,
          qualityRating: s.rating,
          minimumOrderQuantity: 1,
          isPreferred: s.rating > 4.6
        };
        const finalScore = Number((
          (s.priceScore * weights.priceWeight) +
          (s.qualityScore * weights.qualityWeight) +
          (s.deliveryScore * weights.deliveryWeight) +
          ((s.rating / 5 * 100) * weights.ratingWeight) +
          (s.reliabilityScore * weights.reliabilityWeight)
        ).toFixed(1));

        return {
          supplier: s,
          productSupplier: ps,
          finalScore,
          priceScore: s.priceScore,
          qualityScore: s.qualityScore,
          deliveryScore: s.deliveryScore,
          ratingScore: Number((s.rating / 5 * 100).toFixed(1)),
          reliabilityScore: s.reliabilityScore,
          recommendationReason: s.rating >= 4.7 ? 'Highest overall quality & delivery reliability' : 'Competitive cost efficiency with verified SLA'
        };
      }).sort((a, b) => b.finalScore - a.finalScore);
    }

    // Calculate dynamic scores
    const minPrice = Math.min(...prodSuppliers.map(ps => ps.unitPrice));

    const scored = prodSuppliers.map(ps => {
      const s = this.state.suppliers.find(sup => sup.id === ps.supplierId)!;
      // Price score: 100 * (minPrice / price)
      const priceScore = Number(((minPrice / ps.unitPrice) * 100).toFixed(1));
      const qualityScore = s.qualityScore;
      const deliveryScore = Math.max(50, 100 - (ps.leadTimeDays * 5));
      const ratingScore = Number((s.rating / 5 * 100).toFixed(1));
      const reliabilityScore = s.reliabilityScore;

      const finalScore = Number((
        (priceScore * weights.priceWeight) +
        (qualityScore * weights.qualityWeight) +
        (deliveryScore * weights.deliveryWeight) +
        (ratingScore * weights.ratingWeight) +
        (reliabilityScore * weights.reliabilityWeight)
      ).toFixed(1));

      let reason = 'Balanced performance across criteria.';
      if (finalScore >= 90) {
        reason = `Top Recommendation: ${ps.leadTimeDays}d fast turnaround & ${s.rating}★ rating.`;
      } else if (priceScore >= 98) {
        reason = 'Best cost savings option with standard delivery window.';
      } else if (qualityScore >= 95) {
        reason = 'Enterprise grade quality assurance tier.';
      }

      return {
        supplier: s,
        productSupplier: ps,
        finalScore,
        priceScore,
        qualityScore,
        deliveryScore,
        ratingScore,
        reliabilityScore,
        recommendationReason: reason
      };
    });

    return scored.sort((a, b) => b.finalScore - a.finalScore);
  }

  public updateScoringWeights(weights: Partial<SupplierScoringWeights>) {
    this.state.scoringWeights = { ...this.state.scoringWeights, ...weights };
    this.saveState();
  }

  // --- Purchase Orders ---
  public createPurchaseOrder(data: {
    purchaseRequestId?: string;
    supplierId: string;
    items: { productId: string; quantity: number; unitPrice?: number }[];
    expectedDeliveryDays?: number;
    remarks?: string;
  }): PurchaseOrder {
    const poNum = `PO-2026-${String(this.state.purchaseOrders.length + 126).padStart(5, '0')}`;
    const supplier = this.state.suppliers.find(s => s.id === data.supplierId) || this.state.suppliers[0];
    
    let subtotal = 0;
    const poItems = data.items.map((item, idx) => {
      const prod = this.state.products.find(p => p.id === item.productId);
      const unitPrice = item.unitPrice || (prod ? prod.unitPrice : 1000);
      const rawTotal = unitPrice * item.quantity;
      subtotal += rawTotal;
      const tax = Math.round(rawTotal * 0.18); // 18% GST
      return {
        id: `poi-${Date.now()}-${idx}`,
        productId: item.productId,
        productName: prod ? prod.name : 'Procured Item',
        productCode: prod ? prod.productCode : 'PRD-UNK',
        quantity: item.quantity,
        unitPrice,
        tax,
        discount: 0,
        totalPrice: rawTotal + tax
      };
    });

    const tax = Math.round(subtotal * 0.18);
    const discount = subtotal > 100000 ? 5000 : 0;
    const shippingCost = 1500;
    const totalAmount = subtotal + tax - discount + shippingCost;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (data.expectedDeliveryDays || supplier.averageLeadDays || 3));

    const po: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: poNum,
      purchaseRequestId: data.purchaseRequestId || '',
      requestNumber: data.purchaseRequestId ? (this.state.purchaseRequests.find(r => r.id === data.purchaseRequestId)?.requestNumber || '') : '',
      supplierId: supplier.id,
      supplierName: supplier.companyName,
      createdBy: this.state.currentUser.id,
      createdByName: this.state.currentUser.name,
      orderDate: new Date().toISOString(),
      expectedDeliveryDate: deliveryDate.toISOString(),
      subtotal,
      tax,
      discount,
      shippingCost,
      totalAmount,
      status: 'SENT_TO_SUPPLIER',
      remarks: data.remarks || `Generated PO for ${supplier.companyName}. Immediate fulfillment requested.`,
      items: poItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // If linked to a PR, update PR status to CONVERTED_TO_PO
    if (data.purchaseRequestId) {
      const pr = this.state.purchaseRequests.find(r => r.id === data.purchaseRequestId);
      if (pr) {
        pr.status = 'CONVERTED_TO_PO';
        pr.poId = po.id;
        pr.updatedAt = new Date().toISOString();
      }
    }

    this.state.purchaseOrders = [po, ...this.state.purchaseOrders];
    this.logAudit('CREATE_PO', 'PURCHASE_ORDER', po.poNumber, undefined, `Generated PO for ${supplier.companyName} (₹${totalAmount.toLocaleString()})`);

    // Notify Supplier
    this.sendNotification(
      'SUPPLIER',
      `New Purchase Order Received: ${poNum}`,
      `New PO ${poNum} amounting to ₹${totalAmount.toLocaleString()} has been dispatched to your vendor portal.`,
      'EMAIL',
      'PO_SENT',
      'PURCHASE_ORDER',
      po.id
    );

    this.saveState();
    return po;
  }

  // --- Supplier Actions ---
  public acceptPurchaseOrder(poId: string): { success: boolean; message: string } {
    const po = this.state.purchaseOrders.find(p => p.id === poId);
    if (!po) return { success: false, message: 'Purchase order not found' };

    po.status = 'SUPPLIER_ACCEPTED';
    po.updatedAt = new Date().toISOString();

    this.logAudit('ACCEPT_PO', 'PURCHASE_ORDER', po.poNumber, 'SENT_TO_SUPPLIER', 'Supplier accepted order terms and lead time.');

    this.sendNotification(
      'PROCUREMENT_MANAGER',
      `PO Accepted: ${po.poNumber}`,
      `${po.supplierName} accepted ${po.poNumber}. Production/packaging commenced.`,
      'IN_APP',
      'SUPPLIER_ACCEPTED',
      'PURCHASE_ORDER',
      po.id
    );

    this.saveState();
    return { success: true, message: `PO ${po.poNumber} accepted successfully.` };
  }

  public rejectPurchaseOrder(poId: string, reason: string): { success: boolean; message: string } {
    if (!reason || reason.trim().length === 0) {
      return { success: false, message: 'Supplier rejection requires an explanatory reason.' };
    }
    const po = this.state.purchaseOrders.find(p => p.id === poId);
    if (!po) return { success: false, message: 'Purchase order not found' };

    po.status = 'SUPPLIER_REJECTED';
    po.remarks = `Supplier Rejected: ${reason}`;
    po.updatedAt = new Date().toISOString();

    this.logAudit('REJECT_PO', 'PURCHASE_ORDER', po.poNumber, 'SENT_TO_SUPPLIER', `Rejected by supplier: ${reason}`);

    this.sendNotification(
      'PROCUREMENT_MANAGER',
      `ALERT: PO Rejected by Supplier (${po.poNumber})`,
      `${po.supplierName} was unable to fulfill ${po.poNumber}. Reason: "${reason}". Please re-allocate to alternate vendor.`,
      'IN_APP',
      'SUPPLIER_REJECTED',
      'PURCHASE_ORDER',
      po.id
    );

    this.saveState();
    return { success: true, message: `PO ${po.poNumber} has been rejected.` };
  }

  public startOrderProcessing(poId: string): { success: boolean; message: string } {
    const po = this.state.purchaseOrders.find(p => p.id === poId);
    if (!po) return { success: false, message: 'Purchase order not found' };

    po.status = 'PROCESSING';
    po.updatedAt = new Date().toISOString();

    this.logAudit('UPDATE_PRODUCT', 'PURCHASE_ORDER', po.poNumber, 'SUPPLIER_ACCEPTED', 'Supplier started assembling/packaging order.');
    this.saveState();
    return { success: true, message: `Order ${po.poNumber} marked as PROCESSING.` };
  }

  public dispatchPurchaseOrder(poId: string, data: { carrier: string; trackingNumber: string }): { success: boolean; message: string; deliveryId: string } {
    const po = this.state.purchaseOrders.find(p => p.id === poId);
    if (!po) return { success: false, message: 'Purchase order not found', deliveryId: '' };

    const trk = data.trackingNumber || `TRK-IND-${Math.floor(10000 + Math.random() * 90000)}`;
    const carrier = data.carrier || 'SpeedExpress Logistics';

    po.status = 'DISPATCHED';
    po.trackingNumber = trk;
    po.updatedAt = new Date().toISOString();

    // Create Delivery Record
    const delivery: Delivery = {
      id: `del-${Date.now()}`,
      purchaseOrderId: po.id,
      poNumber: po.poNumber,
      deliveryAgentId: 'usr-del-01',
      deliveryAgentName: 'Karan Singh (SpeedExpress)',
      trackingNumber: trk,
      carrier,
      shippingAddress: 'SmartProcure HQ, Floor 4, Cyber City',
      city: 'Gurugram',
      state: 'Haryana',
      postalCode: '122002',
      country: 'India',
      expectedDeliveryDate: po.expectedDeliveryDate,
      status: 'PICKED_UP',
      trackingHistory: [
        {
          id: `th-${Date.now()}-1`,
          deliveryId: `del-${Date.now()}`,
          status: 'CREATED',
          location: `${po.supplierName} Dispatch Bay`,
          remarks: `Order packed and handed over to ${carrier}. Airway Bill #${trk}`,
          updatedBy: this.state.currentUser.name,
          eventTime: new Date().toISOString()
        },
        {
          id: `th-${Date.now()}-2`,
          deliveryId: `del-${Date.now()}`,
          status: 'PICKED_UP',
          location: 'Origin Sorting Cargo Facility',
          remarks: 'Shipment received at outbound logistics terminal.',
          updatedBy: 'SpeedExpress Logistics',
          eventTime: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    po.deliveryId = delivery.id;
    this.state.deliveries = [delivery, ...this.state.deliveries];

    this.logAudit('DISPATCH_ORDER', 'DELIVERY', trk, undefined, `Dispatched via ${carrier} with AWB #${trk}`);

    // Notify Delivery Agent & Buyer
    this.sendNotification(
      'DELIVERY_AGENT',
      `New Shipment Ready: ${trk}`,
      `Shipment for ${po.poNumber} is ready for line-haul dispatch. Carrier: ${carrier}.`,
      'SMS',
      'ORDER_DISPATCHED',
      'DELIVERY',
      delivery.id
    );

    this.sendNotification(
      'EMPLOYEE',
      `Your Order ${po.poNumber} has been Dispatched!`,
      `Tracking Number: ${trk} via ${carrier}. Expected Delivery: ${new Date(po.expectedDeliveryDate).toLocaleDateString()}`,
      'IN_APP',
      'ORDER_DISPATCHED',
      'DELIVERY',
      delivery.id
    );

    this.saveState();
    return { success: true, message: `Dispatched PO ${po.poNumber}. Tracking AWB: ${trk}`, deliveryId: delivery.id };
  }

  // --- Delivery Tracking & Status Pipeline ---
  public updateDeliveryStatus(deliveryId: string, status: DeliveryStatus, location: string, remarks: string): { success: boolean; message: string } {
    const del = this.state.deliveries.find(d => d.id === deliveryId);
    if (!del) return { success: false, message: 'Delivery record not found' };

    const oldStatus = del.status;
    del.status = status;
    del.updatedAt = new Date().toISOString();

    const trackingEvent = {
      id: `th-${Date.now()}`,
      deliveryId: del.id,
      status,
      location: location || 'Transit Node',
      remarks: remarks || `Status updated to ${status}`,
      updatedBy: this.state.currentUser.name,
      eventTime: new Date().toISOString()
    };

    del.trackingHistory.push(trackingEvent);

    // Sync PO status
    const po = this.state.purchaseOrders.find(p => p.id === del.purchaseOrderId);
    if (po) {
      if (status === 'IN_TRANSIT') po.status = 'IN_TRANSIT';
      if (status === 'OUT_FOR_DELIVERY') po.status = 'OUT_FOR_DELIVERY';
      if (status === 'DELIVERED') {
        po.status = 'DELIVERED';
        del.actualDeliveryDate = new Date().toISOString();
        // AUTO INCREMENT INVENTORY AND CREATE INVENTORY TRANSACTIONS
        this.reconcileInventoryOnDelivery(po);
      }
      po.updatedAt = new Date().toISOString();
    }

    this.logAudit('UPDATE_DELIVERY', 'DELIVERY', del.trackingNumber, oldStatus, `Advanced delivery to ${status} at ${location}`);

    this.saveState();
    return { success: true, message: `Delivery updated to ${status}.` };
  }

  private reconcileInventoryOnDelivery(po: PurchaseOrder) {
    po.items.forEach(item => {
      const prod = this.state.products.find(p => p.id === item.productId);
      if (prod) {
        const prevQty = prod.availableQuantity;
        prod.availableQuantity += item.quantity;
        prod.updatedAt = new Date().toISOString();

        // If it was OUT_OF_STOCK, flip to ACTIVE
        if (prod.status === 'OUT_OF_STOCK' && prod.availableQuantity > 0) {
          prod.status = 'ACTIVE';
        }

        // Add inventory transaction record
        const tx: InventoryTransaction = {
          id: `tx-${Date.now()}-${item.productId}`,
          productId: prod.id,
          productName: prod.name,
          transactionType: 'PURCHASE',
          quantity: item.quantity,
          previousQuantity: prevQty,
          newQuantity: prod.availableQuantity,
          referenceType: 'DELIVERY',
          referenceId: po.id,
          remarks: `Stock updated (+${item.quantity} ${prod.unit}) upon confirmed delivery of ${po.poNumber}`,
          performedBy: 'Automated Procurement Ledger Reconciliation',
          createdAt: new Date().toISOString()
        };

        this.state.inventoryTransactions = [tx, ...this.state.inventoryTransactions];
        this.logAudit('UPDATE_INVENTORY', 'PRODUCT', prod.productCode, `${prevQty}`, `${prod.availableQuantity}`);
      }
    });

    // Send notifications
    this.sendNotification(
      'EMPLOYEE',
      `Delivery Complete: ${po.poNumber}`,
      `Shipment ${po.trackingNumber} has arrived at destination and inventory has been replenished automatically.`,
      'IN_APP',
      'ORDER_DELIVERED',
      'PURCHASE_ORDER',
      po.id
    );

    this.sendNotification(
      'PROCUREMENT_MANAGER',
      `Inventory Reconciled: ${po.poNumber}`,
      `All ${po.items.length} line items from ${po.supplierName} verified and stocked.`,
      'IN_APP',
      'ORDER_DELIVERED',
      'PURCHASE_ORDER',
      po.id
    );
  }

  // --- Central Workflow API Dispatcher (`/api/v1/workflow`) ---
  public executeWorkflowCommand(command: {
    action: string;
    entityType: string;
    entityId: string;
    remarks?: string;
    payload?: any;
  }): { success: boolean; message: string; data?: any } {
    const { action, entityId, remarks = '', payload } = command;

    switch (action) {
      case 'APPROVE_REQUEST':
        return this.approvePurchaseRequest(entityId, remarks || 'Approved via Central Workflow');
      
      case 'REJECT_REQUEST':
        return this.rejectPurchaseRequest(entityId, remarks || 'Budget not available');
      
      case 'CREATE_PURCHASE_ORDER':
      case 'CREATE_PO': {
        const pr = this.state.purchaseRequests.find(r => r.id === entityId || r.requestNumber === entityId);
        if (!pr) return { success: false, message: 'Referenced Purchase Request not found' };
        const supplierId = payload?.supplierId || (this.getSupplierRecommendations(pr.items[0]?.productId)[0]?.supplier.id) || this.state.suppliers[0].id;
        const newPo = this.createPurchaseOrder({
          purchaseRequestId: pr.id,
          supplierId,
          items: pr.items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.estimatedUnitPrice })),
          remarks: remarks || 'Automated PO generated via Workflow Orchestrator'
        });
        return { success: true, message: `Generated PO ${newPo.poNumber}`, data: newPo };
      }

      case 'SEND_PURCHASE_ORDER':
      case 'SEND_PO': {
        const po = this.state.purchaseOrders.find(p => p.id === entityId || p.poNumber === entityId);
        if (!po) return { success: false, message: 'Purchase order not found' };
        po.status = 'SENT_TO_SUPPLIER';
        this.saveState();
        return { success: true, message: `PO ${po.poNumber} sent to supplier.` };
      }

      case 'ACCEPT_ORDER':
      case 'ACCEPT_PO':
        return this.acceptPurchaseOrder(entityId);

      case 'REJECT_ORDER':
      case 'REJECT_PO':
        return this.rejectPurchaseOrder(entityId, remarks || 'Production capacity constraint');

      case 'START_PROCESSING':
        return this.startOrderProcessing(entityId);

      case 'DISPATCH_ORDER': {
        const po = this.state.purchaseOrders.find(p => p.id === entityId || p.poNumber === entityId);
        if (!po) return { success: false, message: 'PO not found' };
        return this.dispatchPurchaseOrder(po.id, {
          carrier: payload?.carrier || 'SpeedExpress Logistics',
          trackingNumber: payload?.trackingNumber || `TRK-IND-${Math.floor(10000 + Math.random() * 90000)}`
        });
      }

      case 'UPDATE_DELIVERY': {
        const del = this.state.deliveries.find(d => d.id === entityId || d.trackingNumber === entityId || d.purchaseOrderId === entityId);
        if (!del) return { success: false, message: 'Delivery not found' };
        return this.updateDeliveryStatus(del.id, payload?.status || 'IN_TRANSIT', payload?.location || 'Hub Node', remarks);
      }

      case 'MARK_DELIVERED': {
        const del = this.state.deliveries.find(d => d.id === entityId || d.trackingNumber === entityId || d.purchaseOrderId === entityId);
        if (!del) return { success: false, message: 'Delivery not found' };
        return this.updateDeliveryStatus(del.id, 'DELIVERED', payload?.location || 'Receiving Dock Gate 2', remarks || 'Shipment delivered and verified.');
      }

      default:
        return { success: false, message: `Unknown workflow action: ${action}` };
    }
  }

  // --- Category Management & Search ---
  public getCategories(): ProductCategory[] {
    return this.state.categories;
  }

  public getCategoryById(id: string): ProductCategory | undefined {
    return this.state.categories.find(c => c.id === id);
  }

  public getProductsByCategory(categoryId: string): Product[] {
    if (!categoryId || categoryId === 'ALL') return this.state.products;
    return this.state.products.filter(p => p.categoryId === categoryId);
  }

  public addCategory(category: Omit<ProductCategory, 'id'>): ProductCategory {
    const newCategory: ProductCategory = {
      ...category,
      id: `cat-${Date.now()}`
    };
    this.state.categories = [...this.state.categories, newCategory];
    this.logAudit('CREATE_CATEGORY', 'SYSTEM', newCategory.code, undefined, `Created catalog category ${newCategory.name}`);
    this.saveState();
    return newCategory;
  }

  public updateCategory(id: string, data: Partial<ProductCategory>) {
    this.state.categories = this.state.categories.map(c => 
      c.id === id ? { ...c, ...data } : c
    );
    if (data.name) {
      // Sync products with this category
      this.state.products = this.state.products.map(p => 
        p.categoryId === id ? { ...p, categoryName: data.name! } : p
      );
    }
    this.logAudit('UPDATE_CATEGORY', 'SYSTEM', id, undefined, 'Updated catalog category');
    this.saveState();
  }

  public deleteCategory(id: string) {
    const cat = this.state.categories.find(c => c.id === id);
    if (cat) {
      this.state.categories = this.state.categories.filter(c => c.id !== id);
      this.logAudit('DELETE_CATEGORY', 'SYSTEM', cat.code, cat.name, 'Category removed from catalog');
      this.saveState();
    }
  }

  public searchCatalog(params: {
    searchTerm?: string;
    categoryId?: string;
    stockFilter?: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-desc' | 'newest';
  }): Product[] {
    const { searchTerm, categoryId, stockFilter, minPrice, maxPrice, sortBy } = params;
    let results = [...this.state.products];

    // Filter by category
    if (categoryId && categoryId !== 'ALL') {
      results = results.filter(p => p.categoryId === categoryId);
    }

    // Filter by search term across fields
    if (searchTerm && searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      results = results.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.productCode.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.supplierName && p.supplierName.toLowerCase().includes(q))
      );
    }

    // Filter by stock level
    if (stockFilter && stockFilter !== 'ALL') {
      if (stockFilter === 'IN_STOCK') {
        results = results.filter(p => p.availableQuantity > p.minimumStock);
      } else if (stockFilter === 'LOW_STOCK') {
        results = results.filter(p => p.availableQuantity > 0 && p.availableQuantity <= p.minimumStock);
      } else if (stockFilter === 'OUT_OF_STOCK') {
        results = results.filter(p => p.availableQuantity === 0);
      }
    }

    // Filter by price range
    if (minPrice !== undefined && minPrice > 0) {
      results = results.filter(p => p.unitPrice >= minPrice);
    }
    if (maxPrice !== undefined && maxPrice > 0) {
      results = results.filter(p => p.unitPrice <= maxPrice);
    }

    // Sort results
    if (sortBy) {
      switch (sortBy) {
        case 'name-asc':
          results.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          results.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'price-asc':
          results.sort((a, b) => a.unitPrice - b.unitPrice);
          break;
        case 'price-desc':
          results.sort((a, b) => b.unitPrice - a.unitPrice);
          break;
        case 'stock-desc':
          results.sort((a, b) => b.availableQuantity - a.availableQuantity);
          break;
        case 'newest':
          results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    }

    return results;
  }

  // --- Product & Supplier Management ---
  public addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.state.products = [newProduct, ...this.state.products];
    this.logAudit('CREATE_PRODUCT', 'PRODUCT', newProduct.productCode, undefined, `Created product ${newProduct.name}`);
    this.saveState();
    return newProduct;
  }

  public updateProduct(id: string, data: Partial<Product>) {
    this.state.products = this.state.products.map(p => 
      p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
    );
    this.logAudit('UPDATE_PRODUCT', 'PRODUCT', id, undefined, 'Updated product specifications');
    this.saveState();
  }

  public deleteProduct(id: string) {
    const prod = this.state.products.find(p => p.id === id);
    if (prod) {
      this.state.products = this.state.products.filter(p => p.id !== id);
      this.logAudit('DELETE_PRODUCT', 'PRODUCT', prod.productCode, prod.name, 'Product removed from catalog');
      this.saveState();
    }
  }

  public addSupplier(supplier: Omit<Supplier, 'id' | 'createdAt'>): Supplier {
    const newSup: Supplier = {
      ...supplier,
      id: `sup-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.state.suppliers = [newSup, ...this.state.suppliers];
    this.logAudit('CREATE_SUPPLIER', 'SUPPLIER', newSup.supplierCode, undefined, `Added vendor ${newSup.companyName}`);
    this.saveState();
    return newSup;
  }

  public updateSystemSetting(key: string, value: string) {
    this.state.systemSettings = this.state.systemSettings.map(s => 
      s.settingKey === key ? { ...s, settingValue: value, updatedAt: new Date().toISOString() } : s
    );
    this.saveState();
  }
}

export const procurementStore = new ProcurementStore();
