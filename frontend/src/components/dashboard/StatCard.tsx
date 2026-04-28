import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card border border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-secondary group-hover:bg-background transition-colors ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h3 className="text-3xl font-bold">{value}</h3>
      </div>
    </motion.div>
  );
};

export default StatCard;
