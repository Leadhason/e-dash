import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Drill, Hammer, HardHat, Cog } from "lucide-react";

const categoryData = [
  {
    name: "Power Tools",
    items: "1,247 items",
    revenue: "$45,230",
    change: "↗ 8.5%",
    changeColor: "text-green-600",
    icon: Drill,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600"
  },
  {
    name: "Hand Tools",
    items: "892 items",
    revenue: "$28,450",
    change: "↗ 12.1%",
    changeColor: "text-green-600",
    icon: Hammer,
    iconBg: "bg-green-100",
    iconColor: "text-green-600"
  },
  {
    name: "Safety Equipment",
    items: "534 items",
    revenue: "$15,720",
    change: "↗ 15.3%",
    changeColor: "text-green-600",
    icon: HardHat,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600"
  },
  {
    name: "Accessories",
    items: "2,156 items",
    revenue: "$35,163",
    change: "↘ 2.8%",
    changeColor: "text-red-600",
    icon: Cog,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600"
  }
];

export function CategoryPerformance() {
  return (
    <Card data-testid="category-performance">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Category Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categoryData.map((category) => {
            const Icon = category.icon;
            
            return (
              <div key={category.name} className="flex items-center justify-between" data-testid={`category-${category.name.toLowerCase().replace(' ', '-')}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${category.iconBg} rounded-full flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${category.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.items}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{category.revenue}</p>
                  <p className={`text-xs ${category.changeColor}`}>{category.change}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
