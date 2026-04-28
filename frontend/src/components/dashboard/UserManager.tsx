/**
 * USER MANAGER COMPONENT (ELITE MINIMALIST EDITION)
 * High-performance client management.
 * Sleek horizontal list flow for effortless scanning and administrative control.
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users as UsersIcon, 
  Search, 
  User as UserIcon, 
  ShieldAlert,
  ShieldCheck,
  MoreHorizontal,
  Eye,
  EyeOff,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

interface UserManagerProps {
  users: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRefresh: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({
  users,
  searchTerm,
  setSearchTerm,
  onRefresh
}) => {
  const { request } = useApi();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showBlacklisted, setShowBlacklisted] = useState(false);

  const toggleBlacklist = async (userId: string) => {
    setLoadingId(userId);
    try {
      const data = await request<any>(`/users/${userId}/blacklist`, {
        method: 'PATCH'
      });
      toast.success(data.message || "Statut client mis à jour");
      onRefresh();
    } catch (err) {
      toast.error("Échec de l'action");
    } finally {
      setLoadingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (!showBlacklisted && u.is_blacklisted) return false;

      const searchStr = `${u.first_name} ${u.last_name} ${u.email} ${u.phone}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [users, searchTerm, showBlacklisted]);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-secondary/30 rounded-2xl text-sm border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/40"
          />
        </div>

        <button 
          onClick={() => setShowBlacklisted(!showBlacklisted)}
          className={cn(
             "h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all font-sans",
             showBlacklisted ? "bg-red-500 text-white shadow-xl shadow-red-500/20" : "bg-secondary text-muted-foreground/60 border border-border"
          )}
        >
          {showBlacklisted ? "Masquer Restraints" : "Gérer Restreints"}
        </button>
      </div>

      {/* Pure List View */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredUsers.length === 0 ? (
            <div className="py-24 text-center">
               <UsersIcon className="w-12 h-12 text-muted-foreground/10 mx-auto mb-6" />
               <p className="text-sm font-medium text-muted-foreground italic">Aucun profil client détecté.</p>
            </div>
          ) : (
            filteredUsers.map(u => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                key={u._id}
                className={cn(
                  "bg-card hover:bg-secondary/[0.15] border border-border/50 p-4 rounded-2xl transition-all flex flex-col md:flex-row md:items-center gap-6 group",
                  u.is_blacklisted && "opacity-60 grayscale-[0.5]"
                )}
              >
                {/* ID & Identity Block */}
                <div className="flex items-center gap-6 md:w-[400px]">
                   <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-muted-foreground/40 border border-border/50 group-hover:scale-105 transition-transform">
                      <UserIcon size={20} />
                   </div>

                   <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                         <h3 className="text-base font-bold text-foreground leading-tight">{u.first_name} {u.last_name}</h3>
                         {u.is_blacklisted && <span className="px-2 py-0.5 rounded-full bg-red-500 text-[8px] font-black text-white uppercase tracking-tighter">Suspendu</span>}
                      </div>
                      <p className="text-[11px] font-medium text-muted-foreground font-sans flex items-center gap-3">
                        <span>{u.email}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                        <span>{u.phone}</span>
                      </p>
                   </div>
                </div>

                {/* Info Center */}
                <div className="flex-1 flex items-center justify-between md:border-l border-border/40 md:pl-8">
                   <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                         <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-tighter">Inscrit le</span>
                         <span className="text-[11px] font-black text-foreground/70 font-sans">
                            {new Date(u.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                         </span>
                      </div>
                   </div>
                </div>

                {/* Actions Tail */}
                <div className="flex items-center justify-end gap-3 md:w-[250px] md:border-l border-border/40 md:pl-8">
                  <button
                    onClick={() => toggleBlacklist(u._id)}
                    disabled={loadingId === u._id}
                    className={cn(
                      "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
                      u.is_blacklisted 
                        ? "bg-emerald-500 text-white border-emerald-400" 
                        : "bg-secondary text-muted-foreground/40 hover:bg-red-500 hover:text-white hover:border-red-400 font-sans"
                    )}
                  >
                    {loadingId === u._id ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      u.is_blacklisted ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />
                    )}
                    <span className="hidden lg:inline">{u.is_blacklisted ? "Réhabiliter" : "Banir"}</span>
                  </button>
                  
                  <button className="p-2.5 bg-secondary text-muted-foreground/40 hover:text-foreground rounded-xl border border-border transition-all">
                     <MoreHorizontal size={20} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserManager;
