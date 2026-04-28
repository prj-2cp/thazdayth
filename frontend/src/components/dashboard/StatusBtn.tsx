import React from "react";
import { LucideIcon } from "lucide-react";

interface StatusBtnProps {
  onClick: (e: React.MouseEvent) => void;
  icon: LucideIcon;
  label: string;
  color: string;
}

const StatusBtn: React.FC<StatusBtnProps> = ({ onClick, icon: Icon, label, color }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border border-border hover:border-primary/30 transition-all text-[10px] font-bold uppercase tracking-tight shadow-sm ${color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
};

export default StatusBtn;
