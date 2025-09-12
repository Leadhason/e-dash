import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  Package,
  Tags,
  Warehouse,
  ShoppingCart,
  Users,
  Shield,
  Handshake,
  Headphones,
  Settings
} from "lucide-react";

const navigation = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: BarChart3 },
      { name: "Analytics", href: "/analytics", icon: TrendingUp },
    ],
  },
  {
    title: "Catalog",
    items: [
      { name: "Products", href: "/products", icon: Package },
      { name: "Categories", href: "/categories", icon: Tags },
      { name: "Inventory", href: "/inventory", icon: Warehouse },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Orders", href: "/orders", icon: ShoppingCart },
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Warranties", href: "/warranties", icon: Shield },
    ],
  },
  {
    title: "Management",
    items: [
      { name: "Vendors", href: "/vendors", icon: Handshake },
      { name: "Support", href: "/support", icon: Headphones },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border">
      <div className="p-6">
        {navigation.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="font-semibold text-foreground mb-3">{section.title}</h3>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                    data-testid={`nav-${item.name.toLowerCase()}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}
