import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Database, 
  Palette,
  Globe,
  Save
} from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);

  const userRoles = [
    "super_admin",
    "operations_manager", 
    "product_manager",
    "customer_service",
    "sales_rep",
    "warehouse_manager",
    "technical_support"
  ];

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <SettingsIcon className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Configure your account and system preferences
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Settings */}
        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">First Name</label>
                <Input defaultValue="Sarah" className="mt-1" data-testid="first-name-input" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Last Name</label>
                <Input defaultValue="Johnson" className="mt-1" data-testid="last-name-input" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input defaultValue="admin@toolstech.com" className="mt-1" data-testid="email-input" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Role</label>
                <div className="mt-1">
                  <Badge className="bg-blue-100 text-blue-800">Super Admin</Badge>
                </div>
              </div>
              <Button className="w-full" data-testid="save-profile-button">
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Current Password</label>
                <Input type="password" className="mt-1" data-testid="current-password-input" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">New Password</label>
                <Input type="password" className="mt-1" data-testid="new-password-input" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Confirm Password</label>
                <Input type="password" className="mt-1" data-testid="confirm-password-input" />
              </div>
              <Button className="w-full" variant="outline" data-testid="change-password-button">
                <Shield className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - System Settings */}
        <div className="space-y-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                  data-testid="email-notifications-toggle"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Low Stock Alerts</p>
                  <p className="text-xs text-muted-foreground">Alert when inventory is low</p>
                </div>
                <Switch defaultChecked data-testid="low-stock-alerts-toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Order Updates</p>
                  <p className="text-xs text-muted-foreground">Notifications for order status changes</p>
                </div>
                <Switch defaultChecked data-testid="order-updates-toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Warranty Expiry</p>
                  <p className="text-xs text-muted-foreground">Alert before warranties expire</p>
                </div>
                <Switch defaultChecked data-testid="warranty-expiry-toggle" />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Switch to dark theme</p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                  data-testid="dark-mode-toggle"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Language</label>
                <Select defaultValue="en">
                  <SelectTrigger className="mt-1" data-testid="language-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Timezone</label>
                <Select defaultValue="utc">
                  <SelectTrigger className="mt-1" data-testid="timezone-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Time</SelectItem>
                    <SelectItem value="pst">Pacific Time</SelectItem>
                    <SelectItem value="cst">Central Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - System Management */}
        <div className="space-y-6">
          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>System</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Auto Backup</p>
                  <p className="text-xs text-muted-foreground">Automatically backup database daily</p>
                </div>
                <Switch
                  checked={autoBackup}
                  onCheckedChange={setAutoBackup}
                  data-testid="auto-backup-toggle"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Backup Retention</label>
                <Select defaultValue="30">
                  <SelectTrigger className="mt-1" data-testid="backup-retention-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="w-full" data-testid="backup-now-button">
                <Database className="mr-2 h-4 w-4" />
                Backup Now
              </Button>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>User Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Available Roles</p>
                <div className="space-y-1">
                  {userRoles.map((role) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-xs">{formatRole(role)}</span>
                      <Badge variant="secondary" className="text-xs">
                        {role === 'super_admin' ? '1' : Math.floor(Math.random() * 5) + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              <Button variant="outline" className="w-full" data-testid="manage-users-button">
                <User className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </CardContent>
          </Card>

          {/* Integration Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Integrations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { name: "Email Service", status: "connected", color: "bg-green-100 text-green-800" },
                  { name: "Payment Gateway", status: "disconnected", color: "bg-red-100 text-red-800" },
                  { name: "Inventory Sync", status: "connected", color: "bg-green-100 text-green-800" },
                  { name: "Shipping API", status: "pending", color: "bg-amber-100 text-amber-800" },
                ].map((integration, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{integration.name}</span>
                    <Badge className={integration.color}>
                      {integration.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full" data-testid="manage-integrations-button">
                <Globe className="mr-2 h-4 w-4" />
                Manage Integrations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}