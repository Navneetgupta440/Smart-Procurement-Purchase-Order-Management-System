import React from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Clock, 
  FileText, 
  Package, 
  CheckCircle, 
  AlertTriangle,
  Send,
  Trash2
} from 'lucide-react';
import { procurementStore } from '../../services/procurementStore';
import { Notification } from '../../types/procurement';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onSelectAction?: (notif: Notification) => void;
}

export function NotificationDrawer({ 
  isOpen, 
  onClose, 
  notifications,
  onSelectAction
}: NotificationDrawerProps) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => n.status === 'PENDING').length;

  const handleMarkAll = () => {
    procurementStore.markAllNotificationsAsRead();
  };

  const handleMarkOne = (id: string) => {
    procurementStore.markNotificationAsRead(id);
  };

  const getIcon = (eventType: string) => {
    switch (eventType) {
      case 'PO_CREATED':
      case 'PO_APPROVED':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'PR_SUBMITTED':
      case 'PR_APPROVED':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'DELIVERY_DISPATCHED':
      case 'DELIVERY_DELIVERED':
        return <Package className="w-4 h-4 text-amber-600" />;
      case 'LOW_STOCK':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <Send className="w-4 h-4 text-[#121212]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#121212]/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#F9F7F2] border-l border-[#121212] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#121212] text-[#F9F7F2] p-5 flex items-center justify-between border-b border-[#121212]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none border border-[#F9F7F2]/30 bg-[#F9F7F2]/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-[#F9F7F2]" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-[#F9F7F2] leading-tight">System Notifications</h2>
              <p className="text-[11px] font-sans text-[#F9F7F2]/60">
                {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''} across channels
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#F9F7F2]/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-5 py-3 bg-[#F2EDE4] border-b border-[#121212]/15 flex items-center justify-between text-xs">
          <span className="font-sans uppercase tracking-[0.1em] text-[11px] font-semibold text-[#121212]/70">
            Real-time Feed
          </span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="text-[11px] text-[#121212] hover:underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-[#121212]/50 space-y-2">
              <Bell className="w-8 h-8 mx-auto stroke-1" />
              <p className="font-serif text-sm">No notification alerts currently</p>
              <p className="text-xs font-sans">New workflow dispatches and approval events will appear here</p>
            </div>
          ) : (
            notifications.map(item => {
              const isUnread = item.status === 'PENDING';
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    handleMarkOne(item.id);
                    if (onSelectAction) onSelectAction(item);
                  }}
                  className={`p-3.5 border transition cursor-pointer flex gap-3 ${
                    isUnread
                      ? 'bg-white border-[#121212] shadow-xs'
                      : 'bg-[#F4F0E8] border-[#121212]/15 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <div className="w-7 h-7 bg-[#121212]/5 border border-[#121212]/20 flex items-center justify-center">
                      {getIcon(item.eventType)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className="text-xs font-semibold text-[#121212] truncate">
                        {item.title}
                      </h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-[#121212]/75 line-clamp-2 leading-relaxed mb-1.5">
                      {item.message}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#121212]/50">
                      <span className="font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="px-1.5 py-0.2 bg-[#121212]/5 border border-[#121212]/20 uppercase tracking-wider font-sans font-medium">
                        {item.channel}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F2EDE4] border-t border-[#121212]/15 flex items-center justify-between">
          <span className="text-[11px] text-[#121212]/60 font-serif">
            WebSocket & Event-Triggered Dispatch
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] text-xs font-sans uppercase tracking-[0.1em] font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
