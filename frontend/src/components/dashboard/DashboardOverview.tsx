import React from "react";
import { ShoppingBag, Package, Factory, Users as UsersIcon, Plus, AlertCircle, LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import StatCard from "./StatCard";
import QuickActionButton from "./QuickActionButton";

interface DashboardOverviewProps {
  orders: any[];
  products: any[];
  pressingRequests: any[];
  allUsers: any[];
  setActiveTab: (tab: any) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  orders, 
  products, 
  pressingRequests, 
  allUsers, 
  setActiveTab 
}) => {
  const { t } = useTranslation();

  const stats = {
    ordersCount: orders.length,
    productsCount: products.length,
    pressingCount: pressingRequests.length,
    usersCount: allUsers.length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title={t("dashboard.overview.sales")} 
        value={stats.ordersCount} 
        icon={ShoppingBag} 
        color="text-blue-500" 
      />
      <StatCard 
        title={t("dashboard.overview.products")} 
        value={stats.productsCount} 
        icon={Package} 
        color="text-amber-500" 
      />
      <StatCard 
        title={t("dashboard.overview.pressing")} 
        value={stats.pressingCount} 
        icon={Factory} 
        color="text-green-500" 
      />

      <div className="col-span-full mt-6 bg-secondary/20 border border-border rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">{t("dashboard.overview.quick_actions")}</h2>
        </div>
        <p className="text-muted-foreground mb-8">
          {t("dashboard.overview.welcome")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionButton 
            onClick={() => setActiveTab("products")} 
            label={t("dashboard.overview.add_product")} 
            icon={Plus} 
          />
          <QuickActionButton 
            onClick={() => setActiveTab("orders")} 
            label={t("dashboard.overview.view_orders")} 
            icon={ShoppingBag} 
          />
          <QuickActionButton 
            onClick={() => setActiveTab("pressing")} 
            label={t("dashboard.overview.manage_pressing")} 
            icon={Factory} 
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
