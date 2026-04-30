/**
 * ORDER MANAGER COMPONENT (ELITE MINIMALIST EDITION)
 * Designed for pure effortless luxury. 
 * Strips away the boxy structure for a sleek, horizontal horizontal list flow.
 * High-performance, ultra-clean, and scanner-friendly.
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ShoppingBag, 
  Trash2, 
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronRight,
  Box,
  Circle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

interface OrderManagerProps {
  orders: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  highlightedId: string | null;
  onRefresh: () => void;
  isArchived?: boolean;
}

const OrderManager: React.FC<OrderManagerProps> = ({
  orders,
  searchTerm,
  setSearchTerm,
  highlightedId,
  onRefresh,
  isArchived = false
}) => {
  const { t } = useTranslation();
  const { request } = useApi();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteValue, setTempNoteValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [showBlacklisted, setShowBlacklisted] = useState(false);

  const formatDate = (dateString: any) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "---" : date.toLocaleDateString();
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await request(`/orders/${id}/status`, {
        method: 'PATCH',
        body: { status }
      });
      toast.success(t("dashboard.orders.update_status"));
      onRefresh();
    } catch (err) {}
  };

  const toggleBlacklist = async (userId: string, orderId: string) => {
    if (!userId) return;
    setActionLoadingId(orderId);
    try {
      await request(`/users/${userId}/blacklist`, { method: 'PATCH' });
      toast.success(t("dashboard.orders.update_status"));
      onRefresh();
    } catch (err) {
      toast.error(t("boutique.form.error"));
    } finally {
      setActionLoadingId(null);
    }
  };

  const updateNote = async (id: string, notes: string) => {
    try {
      await request(`/orders/${id}/notes`, {
        method: 'PATCH',
        body: { notes }
      });
      toast.success(t("dashboard.orders.note_saved"));
      setEditingNoteId(null);
      onRefresh();
    } catch (err) {}
  };

  const archiveOrder = async (id: string) => {
    try {
      await request(`/orders/${id}/archive`, { method: 'PATCH' });
      toast.success(t("dashboard.orders.archive_success"));
      onRefresh();
    } catch (err) {}
  };

  const deleteOrder = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette commande ?")) return;
    try {
      await request(`/orders/${id}`, { method: 'DELETE' });
      toast.success("Commande supprimée");
      onRefresh();
    } catch (err) {}
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (!showBlacklisted && o.user_id?.is_blacklisted) return false;

      const searchStr = `${o._id} ${o.tracking_code || ''} ${o.user_id?.first_name} ${o.user_id?.last_name} ${o.user_id?.phone} ${o.user_id?.email}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
      const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [orders, searchTerm, statusFilter, showBlacklisted]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
            <input
              type="text"
              placeholder={t("dashboard.orders.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-secondary/30 rounded-2xl text-sm border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/40"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button 
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-4 h-11 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                statusFilter === "all" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              )}
            >
              {t("dashboard.orders.filter_all")}
            </button>
            {[
              { id: 'pending', label: t("dashboard.orders.status_pending") },
              { id: 'in-progress', label: t("dashboard.orders.status_in_progress") },
              { id: 'completed', label: t("dashboard.orders.status_completed") },
              { id: 'delivered', label: t("dashboard.orders.status_delivered") }
            ].map(status => (
              <button 
                key={status.id}
                onClick={() => setStatusFilter(status.id)}
                className={cn(
                  "px-4 h-11 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                  statusFilter === status.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                )}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setShowBlacklisted(!showBlacklisted)}
          className={cn(
             "h-11 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
             showBlacklisted ? "bg-red-500 text-white shadow-xl shadow-red-500/20" : "bg-secondary/50 text-muted-foreground/60 border border-border/50"
          )}
        >
          {showBlacklisted ? t("dashboard.orders.hide_blacklisted") : t("dashboard.orders.show_blacklisted")}
        </button>
      </div>

      {/* Pure List View */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredOrders.length === 0 ? (
            <div className="py-24 text-center">
               <Box className="w-12 h-12 text-muted-foreground/10 mx-auto mb-6" />
               <p className="text-sm font-medium text-muted-foreground italic">{t("dashboard.orders.empty")}</p>
            </div>
          ) : (
            filteredOrders.map(o => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={o._id}
                className={cn(
                  "bg-[#EFEEE7] dark:bg-zinc-900/50 border border-border p-8 rounded-[2.5rem] transition-all relative group",
                  o.user_id?.is_blacklisted && "opacity-60 grayscale-[0.5]"
                )}
              >
                {/* Top Bar: REF & Status */}
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      REF: #{(o.tracking_code || o._id).slice(-6).toUpperCase()}
                    </p>
                    <h3 className="text-2xl font-bold text-foreground">
                      {o.user_id?.first_name} {o.user_id?.last_name}
                    </h3>
                    <p className="text-xs text-muted-foreground/60 font-medium">
                      {formatDate(o.created_at)}
                    </p>
                  </div>
                  <div className={cn(
                    "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                    o.status === 'delivered' ? "bg-emerald-500/10 text-emerald-600" : 
                    o.status === 'pending' ? "bg-amber-500/10 text-amber-600" : 
                    o.status === 'cancelled' ? "bg-red-500/10 text-red-600" :
                    "bg-primary/10 text-primary"
                  )}>
                    {t(`dashboard.orders.status_${o.status}`)}
                  </div>
                </div>

                {/* Middle Section: Details & Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* User Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                      <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-primary/40">
                        <Circle className="w-3 h-3 fill-current" />
                      </div>
                      <span className="font-sans">{o.user_id?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                      <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-primary/40">
                         <Circle className="w-3 h-3 fill-current" />
                      </div>
                      <span className="font-sans">{o.user_id?.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-primary">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                         <Circle className="w-3 h-3 fill-current" />
                      </div>
                      <span>
                        {o.shipping?.type === 'delivery' ? `${t("dashboard.agenda.type_delivery")}: ${o.shipping?.wilaya || 'N/A'}` : t("dashboard.agenda.type_pickup")}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3 border-t md:border-t-0 md:border-l border-border/40 md:pl-8 pt-6 md:pt-0">
                    {o.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                         <Box className="w-4 h-4 text-primary/40" />
                         <span className="text-sm font-medium text-muted-foreground">
                           {item.olive_category_id?.name || item.name}
                         </span>
                         <span className="text-sm font-bold text-primary italic">x{item.quantity}L</span>
                         <span className="text-xs font-semibold text-muted-foreground ml-auto bg-secondary/50 px-2 py-1 rounded-md">
                           {(item.subtotal || (item.quantity * (item.olive_price_at_order || 0))).toLocaleString()} DA
                         </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Bar: Total & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-border/40 gap-6">
                  <div className="text-xl font-bold">
                    <span className="text-muted-foreground/40 text-sm font-medium mr-2">Total:</span>
                    {(o.total || o.items.reduce((acc: number, item: any) => acc + (item.subtotal || (item.quantity * (item.olive_price_at_order || 0))), 0) + (o.shipping?.cost || 0)).toLocaleString()} <span className="text-xs text-muted-foreground">DA</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button 
                      onClick={() => setEditingNoteId(editingNoteId === o._id ? null : o._id)}
                      className={cn(
                        "px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                        editingNoteId === o._id ? "bg-foreground text-background border-foreground" : "bg-secondary/40 text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <MoreHorizontal className="w-3 h-3" />
                      Notes
                    </button>

                    <button 
                      onClick={() => updateOrderStatus(o._id, 'in-progress')}
                      className="px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-border bg-secondary/40 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                    >
                      {t("dashboard.orders.status_in_progress")}
                    </button>

                    <button 
                      onClick={() => updateOrderStatus(o._id, 'delivered')}
                      className="px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-border bg-secondary/40 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all"
                    >
                      {t("dashboard.orders.status_delivered")}
                    </button>

                    {!isArchived && (
                      <button 
                        onClick={() => archiveOrder(o._id)}
                        className="px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-border bg-secondary/40 text-muted-foreground hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2"
                      >
                        {t("dashboard.orders.archive")}
                      </button>
                    )}

                    <button 
                      onClick={() => deleteOrder(o._id)}
                      className="px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-border bg-secondary/40 text-muted-foreground hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30 transition-all"
                    >
                      {t("dashboard.products.delete")}
                    </button>

                    <button 
                      onClick={() => toggleBlacklist(o.user_id?._id, o._id)}
                      disabled={actionLoadingId === o._id}
                      className={cn(
                        "px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                        o.user_id?.is_blacklisted 
                          ? "bg-emerald-500 text-white border-emerald-400" 
                          : "bg-secondary/40 text-muted-foreground border-border hover:bg-red-500 hover:text-white hover:border-red-400"
                      )}
                    >
                      {actionLoadingId === o._id ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        o.user_id?.is_blacklisted ? <><ShieldCheck className="w-3 h-3" /> {t("dashboard.orders.unblacklist")}</> : <><ShieldAlert className="w-3 h-3" /> {t("dashboard.orders.blacklist")}</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Inline Note Editor */}
                <AnimatePresence>
                  {editingNoteId === o._id && (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-6"
                    >
                       <div className="flex flex-col md:flex-row gap-4 p-6 bg-secondary/20 rounded-3xl border border-border/30">
                          <textarea
                            value={tempNoteValue}
                            onChange={(e) => setTempNoteValue(e.target.value)}
                            placeholder={t("dashboard.notes.placeholder")}
                            className="flex-1 bg-background/50 p-4 rounded-2xl text-xs font-semibold outline-none resize-none min-h-[80px] border border-border/20"
                          />
                          <button 
                            onClick={() => updateNote(o._id, tempNoteValue)}
                            className="px-8 py-4 bg-foreground text-background text-[10px] font-black uppercase rounded-2xl hover:opacity-90 transition-opacity self-end"
                          >
                            {t("dashboard.common.save")}
                          </button>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderManager;
