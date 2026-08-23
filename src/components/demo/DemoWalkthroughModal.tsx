import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  PackageCheck,
  Building,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { procurementStore } from '../../services/procurementStore';
import { Role } from '../../types/procurement';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchRole: (role: Role) => void;
}

interface Step {
  stepNumber: number;
  role: Role;
  roleTitle: string;
  title: string;
  description: string;
  actionText: string;
  execute: () => string;
}

export const DemoWalkthroughModal: React.FC<Props> = ({ isOpen, onClose, onSwitchRole }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [lastLog, setLastLog] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const steps: Step[] = [
    {
      stepNumber: 1,
      role: 'EMPLOYEE',
      roleTitle: 'Employee (Requester)',
      title: '1. Create High-Priority Purchase Requisition',
      description: 'Employee Sarah Jenkins needs 10x MacBook Pro M3 Max (₹2,50,000 each = ₹25,00,000) for the engineering team. Submitting this high-value requisition automatically calculates Tier 3 approval.',
      actionText: 'Submit Purchase Request (₹25,00,000)',
      execute: () => {
        onSwitchRole('EMPLOYEE');
        const res = procurementStore.createPurchaseRequest({
          items: [{ productId: 'prod-01', quantity: 10 }],
          department: 'Product Engineering',
          priority: 'URGENT',
          reason: 'Critical hardware onboarding for incoming batch of backend engineers.'
        });
        return `Created ${res.requestNumber} for ₹${res.estimatedAmount.toLocaleString()} (Tier ${res.requiredApprovalLevel} Approval required)`;
      }
    },
    {
      stepNumber: 2,
      role: 'MANAGER',
      roleTitle: 'Department Manager',
      title: '2. Tier 1 Approval (Department Manager)',
      description: 'Department Manager Marcus Vance reviews the business justification. Requisition value exceeds ₹1,00,000, so approving here will automatically escalate it to Tier 2 (Procurement Manager).',
      actionText: 'Approve as Department Manager',
      execute: () => {
        onSwitchRole('MANAGER');
        const state = procurementStore.getState();
        const pending = state.purchaseRequests.find(r => r.status === 'PENDING_APPROVAL');
        if (pending) {
          const res = procurementStore.approvePurchaseRequest(pending.id, 'Department budget verified and approved.');
          return res.message;
        }
        return 'Requisition approved.';
      }
    },
    {
      stepNumber: 3,
      role: 'PROCUREMENT_OFFICER',
      roleTitle: 'Procurement Officer',
      title: '3. Tier 2 Approval (Procurement Officer)',
      description: 'Procurement Officer Priya Sharma checks supplier lead times and pricing compliance. Requisition value exceeds ₹1,00,000, so approving here advances it to Tier 3 (Executive Admin).',
      actionText: 'Approve as Procurement Officer',
      execute: () => {
        onSwitchRole('PROCUREMENT_OFFICER');
        const state = procurementStore.getState();
        const pending = state.purchaseRequests.find(r => r.status === 'PENDING_APPROVAL');
        if (pending) {
          const res = procurementStore.approvePurchaseRequest(pending.id, 'Procurement terms verified and approved.');
          return res.message;
        }
        return 'Procurement approval complete.';
      }
    },
    {
      stepNumber: 4,
      role: 'ADMIN',
      roleTitle: 'Executive Admin',
      title: '4. Tier 3 Final Executive Approval',
      description: 'Executive Admin Alexander Wright conducts the final executive review for this > ₹1,00,000 capital expenditure and grants full sign-off.',
      actionText: 'Grant Final Executive Sign-off',
      execute: () => {
        onSwitchRole('ADMIN');
        const state = procurementStore.getState();
        const pending = state.purchaseRequests.find(r => r.status === 'PENDING_APPROVAL');
        if (pending) {
          const res = procurementStore.approvePurchaseRequest(pending.id, 'Executive capital expenditure signed off.');
          confetti({ particleCount: 60, spread: 50 });
          return res.message;
        }
        return 'Final approval granted.';
      }
    },
    {
      stepNumber: 5,
      role: 'PROCUREMENT_OFFICER',
      roleTitle: 'Procurement Officer',
      title: '5. AI Multi-Factor Supplier Scoring & PO Issuance',
      description: 'Procurement selects the top recommendation based on weighted formula (35% Price + 20% Quality + 20% Lead Time + 15% Rating + 10% Reliability) and issues Purchase Order with 18% GST.',
      actionText: 'Issue Purchase Order to Top Vendor',
      execute: () => {
        onSwitchRole('PROCUREMENT_OFFICER');
        const state = procurementStore.getState();
        const approved = state.purchaseRequests.find(r => r.status === 'APPROVED');
        const res = procurementStore.createPurchaseOrder({
          purchaseRequestId: approved?.id,
          supplierId: 'sup-01',
          items: [{ productId: 'prod-01', quantity: 10, unitPrice: 250000 }],
          expectedDeliveryDays: 3,
          remarks: 'Standard institutional terms. High priority air cargo fulfillment.'
        });
        return `Issued Purchase Order ${res.poNumber} for ₹${res.totalAmount.toLocaleString()} to ${res.supplierName}`;
      }
    },
    {
      stepNumber: 6,
      role: 'SUPPLIER',
      roleTitle: 'Vendor (ABC Tech Innovations)',
      title: '6. Supplier Acceptance & Warehouse Dispatch',
      description: 'Supplier ABC Tech Innovations logs into their vendor portal, confirms inventory availability, accepts the order, and dispatches the consignment with carrier Airway Bill.',
      actionText: 'Accept PO & Dispatch with Tracking #',
      execute: () => {
        onSwitchRole('SUPPLIER');
        const state = procurementStore.getState();
        const po = state.purchaseOrders.find(p => p.status === 'SENT_TO_SUPPLIER');
        if (po) {
          procurementStore.acceptPurchaseOrder(po.id);
          procurementStore.startOrderProcessing(po.id);
          const res = procurementStore.dispatchPurchaseOrder(po.id, {
            carrier: 'SpeedExpress Logistics',
            trackingNumber: `TRK-IND-${Math.floor(10000 + Math.random() * 90000)}`
          });
          return res.message;
        }
        return 'Order dispatched.';
      }
    },
    {
      stepNumber: 7,
      role: 'DELIVERY_PERSONNEL',
      roleTitle: 'Logistics Courier Agent',
      title: '7. Courier Transit & Automatic Inventory Reconciliation',
      description: 'Delivery personnel advances consignment through transit checkpoints. Handing over at receiving dock (DELIVERED) automatically triggers warehouse stock increment!',
      actionText: 'Deliver Shipment & Auto-Increment Inventory',
      execute: () => {
        onSwitchRole('DELIVERY_PERSONNEL');
        const state = procurementStore.getState();
        const activeDel = state.deliveries.find(d => d.status !== 'DELIVERED');
        if (activeDel) {
          procurementStore.updateDeliveryStatus(activeDel.id, 'IN_TRANSIT', 'Gurugram Express Hub', 'Sorting complete');
          procurementStore.updateDeliveryStatus(activeDel.id, 'OUT_FOR_DELIVERY', 'Cyber City Dock Route', 'With courier van');
          const res = procurementStore.updateDeliveryStatus(
            activeDel.id, 
            'DELIVERED', 
            'Receiving Dock Gate 2', 
            'Package verified and warehouse inventory stock reconciled.'
          );
          confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
          return res.message;
        }
        return 'Delivery completed and stock reconciled.';
      }
    }
  ];

  const currentStep = steps[currentStepIdx];

  const handleNext = () => {
    const msg = currentStep.execute();
    setLastLog(msg);
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      setIsDone(true);
    }
  };

  const handleRestart = () => {
    setCurrentStepIdx(0);
    setIsDone(false);
    setLastLog(null);
    onSwitchRole('EMPLOYEE');
  };

  return (
    <div className="fixed inset-0 bg-[#121212]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#F9F7F2] border border-[#121212] max-w-2xl w-full p-8 shadow-2xl space-y-6">
        <div className="flex justify-between items-start border-b border-[#121212]/20 pb-4">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Interactive Simulation</span>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">7-Stage Procurement Walkthrough</h3>
            <p className="text-xs font-serif italic text-[#121212]/60 mt-1">Live demonstration of the complete end-to-end requisition cycle</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-2xl text-[#121212]/50 hover:text-[#121212] cursor-pointer leading-none"
          >
            &times;
          </button>
        </div>

        {/* Progress Stepper */}
        <div className="grid grid-cols-7 gap-2">
          {steps.map((st, i) => (
            <div key={i} className="text-center space-y-1">
              <div className={`h-1.5 transition-colors border ${
                i < currentStepIdx || isDone 
                  ? 'bg-[#121212] border-[#121212]' 
                  : i === currentStepIdx 
                    ? 'bg-[#57534E] border-[#121212]' 
                    : 'bg-[#EAE5D9] border-[#121212]/20'
              }`} />
              <span className="text-[9px] font-mono font-medium text-[#121212]/60">0{i+1}</span>
            </div>
          ))}
        </div>

        {/* Step Card */}
        {!isDone ? (
          <div className="p-6 bg-white border border-[#121212]/20 space-y-4 font-sans">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2 py-0.5 border border-[#121212]/20 bg-[#F9F7F2] text-[#121212] text-[9px] font-sans uppercase tracking-wider">
                  Persona: {currentStep.roleTitle}
                </span>
                <h4 className="text-xl font-serif font-normal text-[#121212] mt-2">{currentStep.title}</h4>
              </div>
              <span className="text-xs font-mono text-[#121212]/50">Stage {currentStepIdx + 1} / {steps.length}</span>
            </div>

            <p className="text-xs text-[#121212]/75 leading-relaxed">{currentStep.description}</p>

            {lastLog && (
              <div className="p-3.5 bg-[#F9F7F2] border border-[#121212]/20 text-xs text-[#121212] flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-[#121212] shrink-0" />
                <span>{lastLog}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] text-[10px] uppercase tracking-[0.2em] font-medium border border-[#121212] flex items-center gap-2 shadow-xs cursor-pointer transition"
              >
                <span>{currentStep.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-white border border-[#121212] text-center space-y-4 font-sans">
            <div className="w-12 h-12 bg-[#121212] text-[#F9F7F2] flex items-center justify-center mx-auto border border-[#121212]">
              <Check className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h4 className="text-2xl font-serif text-[#121212]">Procurement Lifecycle Complete!</h4>
              <p className="text-xs text-[#121212]/75 max-w-md mx-auto mt-2 leading-relaxed">
                You have walked through the entire end-to-end flow: from requisition through 3-tier approvals, vendor scoring, PO issuance, logistics dispatch, and automatic warehouse inventory reconciliation!
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-3">
              <button
                onClick={handleRestart}
                className="px-4 py-2.5 bg-white border border-[#121212]/30 hover:bg-[#F4F0E8] text-[#121212] text-[10px] uppercase tracking-[0.15em] font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Run Again
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] border border-[#121212] text-[10px] uppercase tracking-[0.2em] font-medium cursor-pointer"
              >
                Explore Applet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
