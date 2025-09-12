import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Calculator, ClipboardCheck } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Add Product",
      description: "Add new tool or equipment to catalog",
      icon: Plus,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      action: "addProduct",
    },
    {
      title: "Process Warranty",
      description: "Handle warranty claims and replacements",
      icon: Shield,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      action: "processWarranty",
    },
    {
      title: "Generate Quote",
      description: "Create bulk quotes for contractors",
      icon: Calculator,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      action: "generateQuote",
    },
    {
      title: "Stock Check",
      description: "Review inventory levels and reorder",
      icon: ClipboardCheck,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      action: "stockCheck",
    },
  ];

  const handleQuickAction = (action: string) => {
    // TODO: Implement specific action handlers
    console.log(`Execute action: ${action}`);
  };

  return (
    <Card data-testid="quick-actions">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            
            return (
              <Button
                key={action.action}
                variant="outline"
                className="p-4 h-auto text-left flex flex-col items-start space-y-3 hover:bg-accent transition-colors"
                onClick={() => handleQuickAction(action.action)}
                data-testid={`quick-action-${action.action}`}
              >
                <div className={`w-12 h-12 ${action.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${action.iconColor}`} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">{action.title}</h4>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
