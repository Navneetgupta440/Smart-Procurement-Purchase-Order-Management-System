import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  procurementStore, 
  ProcurementState 
} from './services/procurementStore';
import { 
  Role, 
  Product, 
  PurchaseRequest, 
  PurchaseOrder, 
  Delivery,
  User
} from './types/procurement';

// Layout & Navigation
import { Navbar, NavTab } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';

// Pages
import { HomePage } from './components/pages/HomePage';
import { CatalogPage } from './components/pages/CatalogPage';
import { AboutPage } from './components/pages/AboutPage';
import { ContactPage } from './components/pages/ContactPage';

// Dashboards (Workspaces)
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';
import { ManagerDashboard } from './components/dashboard/ManagerDashboard';
import { ProcurementDashboard } from './components/dashboard/ProcurementDashboard';
import { SupplierDashboard } from './components/dashboard/SupplierDashboard';
import { DeliveryDashboard } from './components/dashboard/DeliveryDashboard';
import { CustomerDashboard } from './components/dashboard/CustomerDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';

// Modals
import { AuthModal } from './components/auth/AuthModal';
import { LoginPage } from './components/auth/LoginPage';
import { CreateRequestModal } from './components/modals/CreateRequestModal';
import { CreatePOModal } from './components/modals/CreatePOModal';
import { RejectModal } from './components/modals/RejectModal';
import { TrackingModal } from './components/modals/TrackingModal';
import { WorkflowModal } from './components/modals/WorkflowModal';
import { ApiExplorerModal } from './components/api/ApiExplorerModal';
import { ZipDownloadModal } from './components/modals/ZipDownloadModal';
import { DemoWalkthroughModal } from './components/demo/DemoWalkthroughModal';
import { ArchitectureModal } from './components/modals/ArchitectureModal';

export default function App() {
  const [state, setState] = useState<ProcurementState>(procurementStore.getState());
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  
  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [isApiExplorerOpen, setIsApiExplorerOpen] = useState(false);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);

  // Selected item states for modals
  const [selectedProductForRequest, setSelectedProductForRequest] = useState<Product | undefined>(undefined);
  const [selectedPRForPO, setSelectedPRForPO] = useState<PurchaseRequest | undefined>(undefined);
  const [selectedProductIdForPO, setSelectedProductIdForPO] = useState<string | undefined>(undefined);
  const [selectedPRForReject, setSelectedPRForReject] = useState<PurchaseRequest | null>(null);
  const [selectedPOForReject, setSelectedPOForReject] = useState<PurchaseOrder | null>(null);
  const [selectedDeliveryForTracking, setSelectedDeliveryForTracking] = useState<Delivery | null>(null);
  const [selectedPOForTracking, setSelectedPOForTracking] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    return procurementStore.subscribe(() => {
      setState(procurementStore.getState());
    });
  }, []);

  const handleRoleChange = useCallback((role: Role) => {
    procurementStore.switchUserRole(role);
  }, []);

  const handleResetData = useCallback(() => {
    procurementStore.resetData();
  }, []);

  const handleOpenAuthModal = useCallback((mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  // Handlers from subcomponents
  const handleOpenNewRequest = useCallback((prod?: Product) => {
    setSelectedProductForRequest(prod);
    setIsRequestModalOpen(true);
  }, []);

  const handleOpenCreatePO = useCallback((pr?: PurchaseRequest, prodId?: string) => {
    setSelectedPRForPO(pr);
    setSelectedProductIdForPO(prodId);
    setIsPOModalOpen(true);
  }, []);

  const handleRejectPR = useCallback((pr: PurchaseRequest) => {
    setSelectedPRForReject(pr);
    setSelectedPOForReject(null);
    setIsRejectModalOpen(true);
  }, []);

  const handleRejectPO = useCallback((po: PurchaseOrder) => {
    setSelectedPOForReject(po);
    setSelectedPRForReject(null);
    setIsRejectModalOpen(true);
  }, []);

  const handleViewDelivery = useCallback((del: Delivery) => {
    setSelectedDeliveryForTracking(del);
    setSelectedPOForTracking(null);
    setIsTrackingModalOpen(true);
  }, []);

  const handleViewPO = useCallback((po: PurchaseOrder) => {
    const d = state.deliveries.find(del => del.poId === po.id);
    if (d) {
      setSelectedDeliveryForTracking(d);
    } else {
      setSelectedPOForTracking(po);
    }
    setIsTrackingModalOpen(true);
  }, [state.deliveries]);

  // Memoized Role Dashboard Component with Framer Motion fade-in transition
  const roleWorkspaceContent = useMemo(() => {
    const role = state.currentUser.role;
    let content: React.ReactNode;
    switch (role) {
      case 'EMPLOYEE':
        content = <EmployeeDashboard onNewRequest={() => handleOpenNewRequest()} />;
        break;
      case 'MANAGER':
        content = <ManagerDashboard onRejectRequest={handleRejectPR} />;
        break;
      case 'PROCUREMENT_OFFICER':
      case 'PROCUREMENT_MANAGER':
        content = (
          <ProcurementDashboard 
            onCreatePO={handleOpenCreatePO} 
            onRejectRequest={handleRejectPR}
            onViewPO={handleViewPO}
          />
        );
        break;
      case 'SUPPLIER':
        content = (
          <SupplierDashboard 
            onViewPO={handleViewPO} 
            onRejectPO={handleRejectPO} 
          />
        );
        break;
      case 'DELIVERY_PERSONNEL':
      case 'DELIVERY_AGENT':
        content = <DeliveryDashboard onViewDelivery={handleViewDelivery} />;
        break;
      case 'CUSTOMER':
        content = (
          <CustomerDashboard 
            onRequestProduct={prod => handleOpenNewRequest(prod)} 
            onViewPO={handleViewPO} 
          />
        );
        break;
      case 'ADMIN':
        content = <AdminDashboard />;
        break;
      default:
        content = <EmployeeDashboard onNewRequest={() => handleOpenNewRequest()} />;
        break;
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={role}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="w-full"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    );
  }, [
    state.currentUser.role,
    handleOpenNewRequest,
    handleRejectPR,
    handleOpenCreatePO,
    handleViewPO,
    handleRejectPO,
    handleViewDelivery
  ]);

  // Gatekeeper: Show dedicated Login Page before entering application
  if (state.isGatewayLocked && !state.isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={(user: User) => {
          if (user.role === 'CUSTOMER') {
            setActiveTab('catalog');
          } else if (user.role === 'ADMIN' || user.role === 'EMPLOYEE' || user.role === 'MANAGER') {
            setActiveTab('workspace');
          } else {
            setActiveTab('home');
          }
        }}
        onBypassToDemo={() => {
          procurementStore.unlockGateway();
        }}
      />
    );
  }

  return (
    <div id="smart-procure-root" className="min-h-screen bg-[#F9F7F2] text-[#121212] flex flex-col font-sans antialiased selection:bg-[#121212] selection:text-[#F9F7F2]">
      {/* Top Navbar & Header */}
      <Navbar
        state={state}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRoleChange={handleRoleChange}
        onResetData={handleResetData}
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
        onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
        onOpenApiExplorer={() => setIsApiExplorerOpen(true)}
        onOpenWorkflow={() => setIsWorkflowModalOpen(true)}
        onOpenZip={() => setIsZipModalOpen(true)}
        onOpenNotificationDrawer={() => setIsNotificationDrawerOpen(true)}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={() => {
          procurementStore.logout();
        }}
      />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: HOME OVERVIEW & LAUNCHPAD */}
        {activeTab === 'home' && (
          <HomePage
            state={state}
            onNavigateTab={setActiveTab}
            onSelectRole={handleRoleChange}
            onOpenNewRequest={handleOpenNewRequest}
            onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
            onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
            onOpenApiExplorer={() => setIsApiExplorerOpen(true)}
            onOpenWorkflow={() => setIsWorkflowModalOpen(true)}
            onOpenZip={() => setIsZipModalOpen(true)}
            onOpenAuthModal={() => handleOpenAuthModal('signin')}
          />
        )}

        {/* TAB 2: ROLE WORKSPACE DASHBOARDS */}
        {activeTab === 'workspace' && (
          <DashboardLayout
            state={state}
            onSelectRole={handleRoleChange}
            onOpenNewRequest={handleOpenNewRequest}
            onOpenCreatePO={handleOpenCreatePO}
            onOpenAuthModal={handleOpenAuthModal}
            onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
            onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
            onOpenApiExplorer={() => setIsApiExplorerOpen(true)}
            onOpenWorkflow={() => setIsWorkflowModalOpen(true)}
            onOpenZip={() => setIsZipModalOpen(true)}
            onNavigateTab={setActiveTab}
          >
            {roleWorkspaceContent}
          </DashboardLayout>
        )}

        {/* TAB 3: PRODUCT CATALOG */}
        {activeTab === 'catalog' && (
          <CatalogPage
            state={state}
            onOpenNewRequest={handleOpenNewRequest}
            onCreatePO={handleOpenCreatePO}
          />
        )}

        {/* TAB 4: ABOUT ARCHITECTURE & SYSTEM */}
        {activeTab === 'about' && (
          <AboutPage
            onNavigateTab={setActiveTab}
            onSelectRole={handleRoleChange}
            onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
          />
        )}

        {/* TAB 5: CONTACT & SUPPORT */}
        {activeTab === 'contact' && (
          <ContactPage />
        )}
      </main>

      {/* Footer */}
      <Footer
        onTabChange={setActiveTab}
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
        onOpenApiExplorer={() => setIsApiExplorerOpen(true)}
        onOpenWorkflow={() => setIsWorkflowModalOpen(true)}
        onOpenZip={() => setIsZipModalOpen(true)}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Auth Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={user => {
          setActiveTab('workspace');
        }}
      />

      {/* Notification Slide-out Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={state.notifications}
        onSelectAction={notif => {
          setIsNotificationDrawerOpen(false);
          setActiveTab('workspace');
        }}
      />

      {/* Modal Dialogs */}
      <CreateRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => {
          setIsRequestModalOpen(false);
          setSelectedProductForRequest(undefined);
        }}
        products={state.products}
        preselectedProduct={selectedProductForRequest}
      />

      <CreatePOModal
        isOpen={isPOModalOpen}
        onClose={() => {
          setIsPOModalOpen(false);
          setSelectedPRForPO(undefined);
          setSelectedProductIdForPO(undefined);
        }}
        purchaseRequest={selectedPRForPO}
        preselectedProductId={selectedProductIdForPO}
      />

      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedPRForReject(null);
          setSelectedPOForReject(null);
        }}
        purchaseRequest={selectedPRForReject}
        purchaseOrder={selectedPOForReject}
      />

      <TrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => {
          setIsTrackingModalOpen(false);
          setSelectedDeliveryForTracking(null);
          setSelectedPOForTracking(null);
        }}
        delivery={selectedDeliveryForTracking}
        purchaseOrder={selectedPOForTracking}
      />

      <WorkflowModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
      />

      <ApiExplorerModal
        isOpen={isApiExplorerOpen}
        onClose={() => setIsApiExplorerOpen(false)}
      />

      <ZipDownloadModal
        isOpen={isZipModalOpen}
        onClose={() => setIsZipModalOpen(false)}
      />

      <DemoWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
        onSwitchRole={role => {
          handleRoleChange(role);
          setActiveTab('workspace');
        }}
      />

      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
        onSwitchRole={role => {
          handleRoleChange(role);
          setActiveTab('workspace');
        }}
        onOpenSwagger={() => setIsApiExplorerOpen(true)}
        onOpenWorkflow={() => setIsWorkflowModalOpen(true)}
        onOpenZip={() => setIsZipModalOpen(true)}
      />
    </div>
  );
}
