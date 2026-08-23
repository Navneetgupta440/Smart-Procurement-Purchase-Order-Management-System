import React, { useState } from 'react';
import { Play, Check, AlertCircle, RefreshCw, Layers, Terminal, Sparkles } from 'lucide-react';
import { procurementStore } from '../../services/procurementStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [action, setAction] = useState('APPROVE_REQUEST');
  const [entityType, setEntityType] = useState('PURCHASE_REQUEST');
  const [entityId, setEntityId] = useState('pr-01');
  const [remarks, setRemarks] = useState('Approved via Central Workflow REST API');
  const [payloadJson, setPayloadJson] = useState('{\n  "carrier": "SpeedExpress Logistics"\n}');
  const [response, setResponse] = useState<any | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  if (!isOpen) return null;

  const handleActionChange = (newAction: string) => {
    setAction(newAction);
    if (newAction.includes('REQUEST')) {
      setEntityType('PURCHASE_REQUEST');
      setEntityId('pr-01');
      setRemarks(newAction === 'REJECT_REQUEST' ? 'Budget not available this quarter' : 'Approved via Central Workflow');
    } else if (newAction.includes('PO') || newAction.includes('ORDER')) {
      setEntityType('PURCHASE_ORDER');
      setEntityId('po-01');
      setRemarks('Order processed via workflow orchestrator');
    } else if (newAction.includes('DELIVERY') || newAction === 'MARK_DELIVERED') {
      setEntityType('DELIVERY');
      setEntityId('del-01');
      setRemarks('Shipment custody advanced');
    }
  };

  const handleExecute = () => {
    setIsExecuting(true);
    let parsedPayload: any = {};
    try {
      if (payloadJson.trim()) {
        parsedPayload = JSON.parse(payloadJson);
      }
    } catch {
      // ignore
    }

    const res = procurementStore.executeWorkflowCommand({
      action,
      entityType,
      entityId,
      remarks,
      payload: parsedPayload
    });

    setResponse({
      timestamp: new Date().toISOString(),
      endpoint: 'POST /api/v1/workflow',
      status: res.success ? 200 : 400,
      body: {
        success: res.success,
        message: res.message,
        data: res.data || { action, entityType, entityId, timestamp: new Date().toISOString() }
      }
    });

    setIsExecuting(false);
  };

  return (
    <div className="fixed inset-0 bg-[#121212]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#F9F7F2] border border-[#121212] max-w-2xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-[#121212]/20 pb-4">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#121212]/50">Orchestration Interface</span>
            <h3 className="text-2xl font-serif font-normal text-[#121212] mt-0.5">Central Workflow Command API</h3>
            <p className="text-xs font-mono font-medium text-[#121212] mt-1">POST /api/v1/workflow</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-2xl text-[#121212]/50 hover:text-[#121212] cursor-pointer leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-4 bg-white border border-[#121212]/20 text-xs font-sans text-[#121212]/75 space-y-1">
          <p className="font-semibold text-[#121212]">Command-based Cross-Module Orchestration:</p>
          <p className="leading-relaxed">This single endpoint routes and executes all high-level business actions dynamically across approval, PO, supplier, delivery, and inventory services.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          {/* Action Selector */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#121212]/70 block mb-1">Workflow Command Action</label>
            <select
              value={action}
              onChange={e => handleActionChange(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-[#121212]/30 text-[#121212] bg-white cursor-pointer"
            >
              <option value="APPROVE_REQUEST">APPROVE_REQUEST (Tier Approval)</option>
              <option value="REJECT_REQUEST">REJECT_REQUEST (Reject with reason)</option>
              <option value="CREATE_PO">CREATE_PO (Generate Purchase Order)</option>
              <option value="SEND_PO">SEND_PO (Dispatch to Supplier)</option>
              <option value="ACCEPT_ORDER">ACCEPT_ORDER (Supplier Accept)</option>
              <option value="REJECT_ORDER">REJECT_ORDER (Supplier Reject)</option>
              <option value="START_PROCESSING">START_PROCESSING (Assemble/Pack)</option>
              <option value="DISPATCH_ORDER">DISPATCH_ORDER (Carrier Handover)</option>
              <option value="UPDATE_DELIVERY">UPDATE_DELIVERY (Transit Checkpoint)</option>
              <option value="MARK_DELIVERED">MARK_DELIVERED (Auto Stock Increment)</option>
            </select>
          </div>

          {/* Entity Type */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#121212]/70 block mb-1">Target Entity Type</label>
            <input
              type="text"
              value={entityType}
              onChange={e => setEntityType(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-[#121212]/30 text-[#121212] font-mono bg-white"
            />
          </div>

          {/* Entity ID */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#121212]/70 block mb-1">Target Entity ID</label>
            <input
              type="text"
              value={entityId}
              onChange={e => setEntityId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-[#121212]/30 text-[#121212] font-mono bg-white"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#121212]/70 block mb-1">Audit Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-[#121212]/30 text-[#121212] bg-white"
            />
          </div>
        </div>

        {/* JSON Request Payload */}
        <div className="space-y-1.5 text-xs font-sans">
          <label className="text-[10px] uppercase tracking-wider text-[#121212]/70">JSON Request Body (POST /api/v1/workflow)</label>
          <pre className="p-4 bg-[#121212] text-[#F9F7F2] text-xs font-mono overflow-x-auto border border-[#121212]">
{JSON.stringify({
  action,
  entityType,
  entityId,
  remarks
}, null, 2)}
          </pre>
        </div>

        {/* Execute Button */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs font-serif italic text-[#121212]/60">Executes directly into the unified state machine</span>
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="px-6 py-3 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] text-[10px] font-sans uppercase tracking-[0.2em] font-medium border border-[#121212] flex items-center gap-2 cursor-pointer transition shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-[#F9F7F2]" />
            Dispatch Command
          </button>
        </div>

        {/* Response */}
        {response && (
          <div className="space-y-2 pt-3 border-t border-[#121212]/20 text-xs font-sans">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#121212]">HTTP Server Response:</span>
              <span className="px-2 py-0.5 border border-[#121212] font-mono text-[10px] font-medium bg-white text-[#121212]">
                HTTP {response.status} {response.status === 200 ? 'OK' : 'BAD REQUEST'}
              </span>
            </div>
            <pre className="p-4 bg-[#121212] text-[#F9F7F2] text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto border border-[#121212]">
{JSON.stringify(response.body, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
