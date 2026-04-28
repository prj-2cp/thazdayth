/**
 * QUICK ACTION BUTTON (ALWAYS-ACTIVE ELITE EDITION)
 * State-of-the-Art control hub with 100% visibility.
 * Minimalist interaction design for superior owner efficiency.
 */

import React from "react";
import { LucideIcon, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface QuickActionButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ 
  label, 
  icon: Icon, 
  onClick 
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center justify-between p-6 bg-white/50 border border-border/40 rounded-3xl hover:border-primary/20 transition-all w-full text-left shadow-sm group"
    >
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-white border border-border/10 flex items-center justify-center text-primary/40 shadow-inner group-hover:text-primary transition-colors">
          <Icon className="w-5 h-5 stroke-[1.5px]" />
        </div>
        <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground/70 group-hover:text-foreground transition-colors">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground/20 group-hover:text-primary transition-all" />
    </motion.button>
  );
};

export default QuickActionButton;
