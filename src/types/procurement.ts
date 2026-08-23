// Types and Interfaces for Smart Procurement & Purchase Order Management System

export type RoleType = 
  | 'ADMIN' 
  | 'PROCUREMENT_MANAGER' 
  | 'MANAGER' 
  | 'EMPLOYEE' 
  | 'SUPPLIER' 
  | 'DELIVERY_AGENT' 
  | 'CUSTOMER'
  | 'PROCUREMENT_OFFICER'
  | 'DELIVERY_PERSONNEL';

export type Role = RoleType;

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: RoleType;
  status: UserStatus;
  department?: string;
  avatar?: string;
  passwordHash?: string;
  defaultPassword?: string;
  encryptedToken?: string;
  lastEncryptedHash?: string;
  createdAt: string;
  lastLogin?: string;
}

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK';

export type ProductTier = 'LUXURY' | 'HEAVY_EQUIPMENT' | 'HIGH_VALUE' | 'PREMIUM' | 'STANDARD';

export type ProductBadgeType = 
  | 'LUXURY_CAR' 
  | 'EQUIPMENT' 
  | 'SUPERBIKE' 
  | 'HIGH_VALUE' 
  | 'FLAGSHIP' 
  | 'PREMIUM' 
  | 'STANDARD';

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  code: string;
}

export interface Product {
  id: string;
  productCode: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  unitPrice: number;
  availableQuantity: number;
  reservedQuantity: number;
  minimumStock: number;
  maximumStock: number;
  unit: string;
  imageUrl: string;
  status: ProductStatus;
  supplierId: string;
  supplierName: string;
  badge?: string;
  badgeType?: ProductBadgeType;
  tier?: ProductTier;
  isHighValue?: boolean;
  highValueTag?: string;
  createdAt: string;
  updatedAt: string;
}

export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export interface Supplier {
  id: string;
  supplierCode: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  gstNumber: string;
  rating: number; // 1 to 5
  qualityScore: number; // 0 to 100
  deliveryScore: number; // 0 to 100
  reliabilityScore: number; // 0 to 100
  priceScore: number; // calculated relative score
  averageLeadDays: number;
  status: SupplierStatus;
  createdAt: string;
}

export interface ProductSupplier {
  id: string;
  productId: string;
  supplierId: string;
  supplierName: string;
  supplierProductCode: string;
  unitPrice: number;
  leadTimeDays: number;
  qualityRating: number;
  minimumOrderQuantity: number;
  isPreferred: boolean;
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type PurchaseRequestStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'CANCELLED' 
  | 'CONVERTED_TO_PO';

export interface PurchaseRequestItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  estimatedUnitPrice: number;
  estimatedTotal: number;
}

export interface PurchaseRequest {
  id: string;
  requestNumber: string;
  requestedBy: string; // User ID
  requestedByName: string;
  requestedByEmail: string;
  department: string;
  priority: Priority;
  reason: string;
  status: PurchaseRequestStatus;
  estimatedAmount: number;
  items: PurchaseRequestItem[];
  currentApprovalLevel: number; // 1: Manager, 2: Procurement Manager, 3: Admin
  requiredApprovalLevel: number;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  poId?: string;
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';

export interface Approval {
  id: string;
  purchaseRequestId: string;
  requestNumber: string;
  approverId: string;
  approverName: string;
  approverRole: RoleType;
  approvalLevel: number; // 1, 2, 3
  status: ApprovalStatus;
  remarks?: string;
  actedAt?: string;
  createdAt: string;
}

export interface ApprovalHistory {
  id: string;
  approvalId: string;
  purchaseRequestId: string;
  action: 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'RETURNED';
  performedBy: string;
  performedByName: string;
  performedByRole: RoleType;
  remarks: string;
  performedAt: string;
}

export type PurchaseOrderStatus = 
  | 'DRAFT' 
  | 'APPROVED' 
  | 'SENT_TO_SUPPLIER' 
  | 'SUPPLIER_ACCEPTED' 
  | 'SUPPLIER_REJECTED' 
  | 'PROCESSING' 
  | 'DISPATCHED' 
  | 'IN_TRANSIT' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  discount: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  purchaseRequestId: string;
  requestNumber: string;
  supplierId: string;
  supplierName: string;
  createdBy: string;
  createdByName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  subtotal: number;
  tax: number;
  discount: number;
  shippingCost: number;
  totalAmount: number;
  status: PurchaseOrderStatus;
  remarks?: string;
  items: PurchaseOrderItem[];
  trackingNumber?: string;
  deliveryId?: string;
  createdAt: string;
  updatedAt: string;
}

export type SupplierOrderStatus = 
  | 'PENDING' 
  | 'ACCEPTED' 
  | 'REJECTED' 
  | 'PROCESSING' 
  | 'READY_FOR_DISPATCH' 
  | 'DISPATCHED';

export interface SupplierOrder {
  id: string;
  purchaseOrderId: string;
  poNumber: string;
  supplierId: string;
  status: SupplierOrderStatus;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  processingStartedAt?: string;
  readyForDispatchAt?: string;
  dispatchedAt?: string;
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
}

export type DeliveryStatus = 
  | 'CREATED' 
  | 'PICKED_UP' 
  | 'IN_TRANSIT' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'FAILED' 
  | 'RETURNED';

export interface DeliveryTracking {
  id: string;
  deliveryId: string;
  status: DeliveryStatus;
  location: string;
  remarks: string;
  updatedBy: string;
  eventTime: string;
}

export interface Delivery {
  id: string;
  purchaseOrderId: string;
  poNumber: string;
  deliveryAgentId: string;
  deliveryAgentName: string;
  trackingNumber: string;
  carrier: string;
  shippingAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  status: DeliveryStatus;
  trackingHistory: DeliveryTracking[];
  createdAt: string;
  updatedAt: string;
}

export type InventoryTransactionType = 
  | 'PURCHASE' 
  | 'SALE' 
  | 'RETURN' 
  | 'ADJUSTMENT' 
  | 'RESERVATION' 
  | 'RELEASE';

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  transactionType: InventoryTransactionType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  referenceType: 'PURCHASE_ORDER' | 'MANUAL_ADJUSTMENT' | 'DELIVERY';
  referenceId: string;
  remarks: string;
  performedBy: string;
  createdAt: string;
}

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'READ';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  eventType: string;
  entityType?: string;
  entityId?: string;
  sentAt: string;
  readAt?: string;
  createdAt: string;
}

export type AuditAction = 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'CREATE_USER'
  | 'CREATE_PRODUCT' 
  | 'UPDATE_PRODUCT' 
  | 'DELETE_PRODUCT' 
  | 'CREATE_CATEGORY'
  | 'UPDATE_CATEGORY'
  | 'DELETE_CATEGORY'
  | 'CREATE_SUPPLIER' 
  | 'UPDATE_SUPPLIER' 
  | 'CREATE_REQUEST' 
  | 'SUBMIT_REQUEST' 
  | 'APPROVE_REQUEST' 
  | 'REJECT_REQUEST' 
  | 'CREATE_PO' 
  | 'SEND_PO' 
  | 'ACCEPT_PO' 
  | 'REJECT_PO' 
  | 'DISPATCH_ORDER' 
  | 'UPDATE_DELIVERY' 
  | 'MARK_DELIVERED' 
  | 'UPDATE_INVENTORY' 
  | 'SEND_NOTIFICATION';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: RoleType;
  action: AuditAction;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface SystemSetting {
  id: string;
  settingKey: string;
  settingValue: string;
  description: string;
  category: 'GENERAL' | 'APPROVAL' | 'SCORING' | 'NOTIFICATION';
  isSensitive: boolean;
  updatedAt: string;
}

export interface SupplierScoringWeights {
  priceWeight: number; // default 0.35
  qualityWeight: number; // default 0.20
  deliveryWeight: number; // default 0.20
  ratingWeight: number; // default 0.15
  reliabilityWeight: number; // default 0.10
}

export interface SupplierRecommendation {
  supplier: Supplier;
  productSupplier: ProductSupplier;
  finalScore: number;
  priceScore: number;
  qualityScore: number;
  deliveryScore: number;
  ratingScore: number;
  reliabilityScore: number;
  recommendationReason: string;
}
