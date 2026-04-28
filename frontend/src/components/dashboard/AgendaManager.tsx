/**
 * AGENDA MANAGER COMPONENT
 * Handles viewing and scheduling for both orders (pickups/deliveries) and pressing requests.
 */

import React, { useState } from "react";
import { 
  ClipboardList, 
  Search, 
  Truck, 
  MapPin, 
  Phone, 
  Clock, 
  ChevronRight, 
  Trash2, 
  Save, 
  Calendar as CalendarIcon, 
  Mail,
  Factory
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { Calendar } from "@/components/ui/calendar";

interface AgendaManagerProps {
  orders: any[];
  pressingRequests: any[];
  allUsers: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setActiveTab: (tab: any) => void;
  onRefresh: () => void;
  view: "all" | "pressing" | "contacts" | "availability";
}

const AgendaManager: React.FC<AgendaManagerProps> = ({
  orders,
  pressingRequests,
  allUsers,
  searchTerm,
  setSearchTerm,
  setActiveTab,
  onRefresh,
  view
}) => {
  const { t } = useTranslation();
  const { request } = useApi();
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());

  const deleteOrder = async (id: string) => {
    if (!confirm("Supprimer cette commande ?")) return;
    try {
      await request(`/orders/${id}`, { method: 'DELETE' });
      toast.success("Supprimé !");
      onRefresh();
    } catch (err) {}
  };

  const deletePressing = async (id: string) => {
    if (!confirm("Supprimer cette demande ?")) return;
    try {
      await request(`/pressing/${id}`, { method: 'DELETE' });
      toast.success("Supprimé !");
      onRefresh();
    } catch (err) {}
  };

  const fetchBlockedDates = async () => {
    try {
      const data = await request<any[]>('/availability');
      setBlockedDates(data || []);
    } catch (err) {}
  };

  React.useEffect(() => {
    if (view === "availability") {
      fetchBlockedDates();
    }
  }, [view]);

  /**
   * updatePressingStatus
   * Allows the owner to move pressing requests through the workflow.
   */
  const updatePressingStatus = async (id: string, status: string) => {
    try {
      await request(`/pressing/${id}/status`, {
        method: 'PATCH',
        body: { status }
      });
      toast.success("Statut du pressage mis à jour !");
      onRefresh();
    } catch (err) {}
  };

  /**
   * updateOrderStatus
   * Specifically for confirming pickups or deliveries in the agenda.
   */
  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await request(`/orders/${id}/status`, {
        method: 'PATCH',
        body: { status }
      });
      toast.success("Commande mise à jour !");
      onRefresh();
    } catch (err) {}
  };

  const toggleDateBlock = async (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);

    const existing = blockedDates.find(d => 
      new Date(d.date).setHours(0, 0, 0, 0) === normalized.getTime()
    );

    try {
      if (existing) {
        await request(`/availability/${existing._id}`, { method: 'DELETE' });
        toast.success("Date débloquée !");
      } else {
        await request('/availability', {
          method: 'POST',
          body: { date: normalized, reason: "Indisponible" }
        });
        toast.success("Date bloquée !");
      }
      fetchBlockedDates();
    } catch (err) {
      toast.error("Erreur lors de la mise à jour de la disponibilité");
    }
  };

  // 1. Unified Agenda for all activities (Orders & Pressing)
  const unifiedAgenda = [
    // Pickup Orders
    ...orders.filter(o => o.shipping?.type === 'pickup' && o.shipping.pickup_range_start).map(o => ({
      ...o,
      activityType: 'order',
      subType: 'pickup',
      date: o.shipping.pickup_range_start,
      label: 'RETRAIT'
    })),
    // Delivery Orders
    ...orders.filter(o => o.shipping?.type === 'delivery').map(o => ({
      ...o,
      activityType: 'order',
      subType: 'delivery',
      date: o.created_at,
      label: 'LIVRAISON'
    })),
    // Pressing / Trituration
    ...pressingRequests.filter(r => r.bring_olives_date || r.collect_oil_date).map(r => ({
      ...r,
      activityType: 'pressing',
      subType: 'pressing',
      date: r.bring_olives_date || r.created_at,
      label: 'PRESSAGE'
    }))
  ].filter(item => {
    const searchStr = `${item._id} ${item.tracking_code || ''} ${item.user_id?.first_name} ${item.user_id?.last_name} ${item.user_id?.phone} ${item.user_id?.email}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 2. Pressing / Trituration specific management (Waitlist vs Scheduled)
  const pressingWaitlist = pressingRequests.filter(r => !r.bring_olives_date && r.status === 'pending');
  const pressingScheduled = pressingRequests.filter(r => r.bring_olives_date);

  return (
    <div className="space-y-12 pb-20">
      {/* Search and Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
            <ClipboardList className="w-8 h-8" />
          </div>
          {t("dashboard.agenda.title")}
        </h2>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
          <input
            type="text"
            placeholder={t("dashboard.agenda.search_placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-secondary/30 border-2 border-transparent focus:border-primary/20 rounded-[2rem] text-sm focus:outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      {view !== "availability" && (
        <div className="space-y-16">
          {/* 1. UNIFIED TIMELINE VIEW */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-xl font-bold flex items-center gap-3 text-foreground">
                <Clock className="w-5 h-5 text-primary" />
                Fil d'Actualité & Planning Unifié
              </h3>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-secondary/50 px-3 py-1 rounded-full">
                {unifiedAgenda.length} Activités
              </span>
            </div>
            
            <div className="grid gap-6">
              {unifiedAgenda.map((item, idx) => (
                <div 
                  key={`${item.activityType}-${idx}`} 
                  className="group bg-card border-l-4 border-l-primary border border-border/50 p-6 rounded-[2.5rem] hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">
                    <div className="flex items-start gap-5">
                      {/* Activity specific Icon */}
                      <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 duration-500
                        ${item.activityType === 'pressing' ? 'bg-green-500/10 text-green-600' : 
                          item.subType === 'pickup' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {item.activityType === 'pressing' ? <Factory className="w-7 h-7" /> : 
                         item.subType === 'pickup' ? <MapPin className="w-7 h-7" /> : <Truck className="w-7 h-7" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-black text-xl hover:text-primary cursor-pointer transition-colors"
                            onClick={() => {
                              setActiveTab(item.activityType === 'pressing' ? 'pressing' : 'orders');
                              setSearchTerm(item._id);
                            }}
                          >
                            {item.user_id?.first_name} {item.user_id?.last_name}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border
                            ${item.activityType === 'pressing' ? 'bg-green-500/5 text-green-600 border-green-500/20' : 
                              item.subType === 'pickup' ? 'bg-amber-500/5 text-amber-600 border-amber-500/20' : 'bg-blue-500/5 text-blue-600 border-blue-500/20'}`}>
                            {item.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
                          <span className="text-sm font-bold text-primary flex items-center gap-2">
                             <Phone className="w-4 h-4" /> {item.user_id?.phone}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-2">
                             <Mail className="w-4 h-4 opacity-50" /> {item.user_id?.email}
                          </span>
                          <span className="text-xs font-bold text-muted-foreground flex items-center gap-2 bg-secondary px-3 py-1 rounded-lg border border-border/50 shadow-sm">
                             <Clock className="w-4 h-4 opacity-70" /> {new Date(item.date).toLocaleDateString(undefined, {
                               weekday: 'long', day: 'numeric', month: 'long'
                             })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions and Status */}
                    <div className="flex items-center gap-3 w-full lg:w-auto self-end lg:self-center">
                      <div className="flex-1 lg:flex-none">
                        <select 
                          value={item.status}
                          onChange={(e) => item.activityType === 'order' ? updateOrderStatus(item._id, e.target.value) : updatePressingStatus(item._id, e.target.value)}
                          className="w-full lg:w-40 border border-border/50 bg-secondary/50 rounded-2xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                        >
                          {item.activityType === 'order' ? (
                            <>
                              <option value="pending">En attente</option>
                              <option value="in-progress">En cours</option>
                              <option value="completed">Prêt</option>
                              <option value="delivered">Terminé</option>
                            </>
                          ) : (
                            <>
                              <option value="pending">En attente</option>
                              <option value="accepted">Accepté</option>
                              <option value="completed">Terminé</option>
                            </>
                          )}
                        </select>
                      </div>

                      <button 
                        onClick={() => item.activityType === 'order' ? deleteOrder(item._id) : deletePressing(item._id)}
                        className="p-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 border border-red-500/20 shadow-sm group/btn"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      
                      <button 
                        onClick={() => {
                          setActiveTab(item.activityType === 'pressing' ? 'pressing' : 'orders');
                          setSearchTerm(item._id);
                        }}
                        className="p-3 rounded-2xl bg-secondary hover:bg-primary hover:text-white transition-all duration-300 shadow-sm border border-border/50"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {unifiedAgenda.length === 0 && (
                <div className="text-center py-24 bg-secondary/20 border-2 border-dashed border-border rounded-[3rem]">
                  <Clock className="w-16 h-16 text-muted-foreground/10 mx-auto mb-6" />
                  <p className="text-muted-foreground font-bold">Aucune activité programmée pour le moment.</p>
                </div>
              )}
            </div>
          </div>

          {/* 2. SPECIFIC PRESSING SCHEDULING (Section for people without appointments) */}
          <div className="space-y-8 bg-black/[0.02] dark:bg-white/[0.02] p-10 rounded-[3.5rem] border border-border/30 shadow-inner">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-3">
                   <Factory className="w-7 h-7 text-green-600" />
                   Gestion du Pressage (Trituration)
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Organisez les passages au moulin et les rendez-vous clients.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
               {/* Column 1: Awaiting Schedule */}
               <div className="space-y-6">
                 <div className="flex items-center justify-between px-2">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">En Attente de Rendez-vous</h4>
                   <span className="text-[10px] font-black bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">{pressingWaitlist.length}</span>
                 </div>
                 <div className="space-y-4">
                    {pressingWaitlist.map((item, idx) => (
                      <div key={`wait-${idx}`} className="bg-background border p-5 rounded-[2rem] shadow-sm hover:border-primary/30 transition-all border-l-4 border-l-amber-500 group">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-sm tracking-tight">{item.user_id?.first_name} {item.user_id?.last_name}</p>
                            <p className="text-[10px] font-black text-primary uppercase mt-0.5">Demande de {item.olive_quantity_kg}kg</p>
                          </div>
                          <span className="text-[9px] bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full font-black uppercase tracking-widest border border-amber-500/20">À Appeler</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-4 border-t border-border/30">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] font-black flex items-center gap-1.5 text-foreground/80"><Phone className="w-3.5 h-3.5 text-primary/70" /> {item.user_id?.phone}</span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{item.user_id?.email}</span>
                          </div>
                          <button 
                            onClick={() => { setActiveTab('pressing'); setSearchTerm(item._id); }}
                            className="bg-primary text-white text-[10px] font-black px-5 py-2 rounded-full hover:shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                          >
                             FIXER RDV
                          </button>
                        </div>
                      </div>
                    ))}
                    {pressingWaitlist.length === 0 && (
                      <div className="py-12 border border-dashed rounded-[2rem] text-center opacity-50 bg-secondary/10">
                        <p className="text-[10px] font-black uppercase tracking-widest">Tous les clients sont programmés.</p>
                      </div>
                    )}
                 </div>
               </div>

               {/* Column 2: Scheduled appointments */}
               <div className="space-y-6">
                 <div className="flex items-center justify-between px-2">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Rendez-vous Confirmés</h4>
                   <span className="text-[10px] font-black bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">{pressingScheduled.length}</span>
                 </div>
                 <div className="space-y-4">
                   {pressingScheduled.map((item, idx) => (
                      <div key={`sched-${idx}`} className="bg-background border p-5 rounded-[2rem] shadow-sm border-l-4 border-l-green-500 hover:border-green-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-sm tracking-tight">{item.user_id?.first_name} {item.user_id?.last_name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[10px] font-black text-green-600 uppercase">Apport: {new Date(item.bring_olives_date).toLocaleDateString()}</p>
                              {item.collect_oil_date && (
                                <p className="text-[10px] font-black text-primary/60 uppercase">• Retrait: {new Date(item.collect_oil_date).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-[9px] bg-green-500/10 text-green-600 px-2 py-1 rounded-full font-black uppercase tracking-widest border border-green-500/20">Confirmé</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-4 border-t border-border/30">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] font-black flex items-center gap-1.5 text-foreground/80"><Phone className="w-3.5 h-3.5 text-green-600/70" /> {item.user_id?.phone}</span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{item.user_id?.email}</span>
                          </div>
                          <div className="flex gap-2">
                             <button 
                              onClick={() => updatePressingStatus(item._id, 'completed')} 
                              className="p-2.5 bg-secondary hover:bg-green-500 hover:text-white rounded-xl transition-all shadow-sm border border-border/50 group/save"
                              title="Marquer comme terminé"
                             >
                               <Save className="w-4 h-4 group-hover/save:scale-110 transition-transform" />
                             </button>
                             <button 
                              onClick={() => { setActiveTab('pressing'); setSearchTerm(item._id); }} 
                              className="p-2.5 bg-secondary hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm border border-border/50"
                             >
                               <ChevronRight className="w-4 h-4" />
                             </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pressingScheduled.length === 0 && (
                      <div className="py-12 border border-dashed rounded-[2rem] text-center opacity-50 bg-secondary/10">
                        <p className="text-[10px] font-black uppercase tracking-widest">Aucun rendez-vous pour le moment.</p>
                      </div>
                    )}
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {view === "availability" && (
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="bg-card border border-border/50 p-10 rounded-[2.5rem] shadow-sm">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
              <CalendarIcon className="w-7 h-7 text-primary" />
              {t("dashboard.agenda.availability.calendar_title")}
            </h3>
            <div className="flex flex-col items-center">
              <div className="p-6 bg-secondary/10 rounded-[2rem] border border-border/30">
                <Calendar
                  mode="single"
                  selected={calendarDate}
                  onSelect={(d) => {
                    setCalendarDate(d);
                    if (d) toggleDateBlock(d);
                  }}
                  modifiers={{
                    blocked: blockedDates.map(d => new Date(d.date))
                  }}
                  modifiersStyles={{
                    blocked: { backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold', borderRadius: '12px' }
                  }}
                  className="rounded-xl border-none"
                />
              </div>
              <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3 max-w-sm">
                <div className="p-2 rounded-full bg-primary/10 text-primary mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("dashboard.agenda.availability.click_to_block")}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-bold flex items-center gap-3 text-foreground">
                <ClipboardList className="w-6 h-6 text-primary" />
                {t("dashboard.agenda.availability.blocked_dates")}
              </h3>
              <span className="text-[10px] font-black bg-red-500/10 text-red-600 px-3 py-1 rounded-full border border-red-500/20">
                {blockedDates.length} DATES
              </span>
            </div>
            
            <div className="grid gap-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
              {blockedDates.length === 0 ? (
                <div className="bg-secondary/10 border-2 border-dashed p-12 rounded-[2.5rem] text-center">
                  <p className="text-sm text-muted-foreground font-medium italic">{t("dashboard.agenda.availability.no_blocked")}</p>
                </div>
              ) : (
                blockedDates.map((d, i) => (
                  <div key={i} className="group flex justify-between items-center bg-card border border-border/50 p-5 rounded-3xl hover:border-red-500/30 transition-all hover:translate-x-1 duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight">{new Date(d.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">{new Date(d.date).getFullYear()}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleDateBlock(new Date(d.date))}
                      className="p-3 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all border border-transparent hover:border-red-600 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaManager;
