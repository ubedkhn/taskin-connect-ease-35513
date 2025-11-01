import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Shield, Settings, BarChart3, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminUserManagement } from "@/components/AdminUserManagement";
import { useState, useEffect } from "react";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/auth");
  };

const [stats, setStats] = useState({
    totalUsers: 0,
    serviceProviders: 0,
    regularUsers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role");

      if (roles) {
        const serviceProviders = roles.filter(r => r.role === "service_provider").length;
        const users = roles.filter(r => r.role === "user").length;
        setStats({
          totalUsers: roles.length,
          serviceProviders,
          regularUsers: users,
        });
      }
    };
    fetchStats();
  }, []);

  const adminStats = [
    { label: "Total Users", value: stats.totalUsers.toString(), icon: Users, color: "text-blue-500" },
    { label: "Service Providers", value: stats.serviceProviders.toString(), icon: Shield, color: "text-green-500" },
    { label: "Regular Users", value: stats.regularUsers.toString(), icon: BarChart3, color: "text-orange-500" },
    { label: "System Status", value: "Active", icon: Settings, color: "text-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Full system access</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="w-6 h-6" />
              <span>Manage Users</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Shield className="w-6 h-6" />
              <span>Verify Providers</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <BarChart3 className="w-6 h-6" />
              <span>View Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Settings className="w-6 h-6" />
              <span>System Settings</span>
            </Button>
          </CardContent>
        </Card>

        {/* User Management */}
        <AdminUserManagement />
      </div>
    </div>
  );
};

export default AdminPanel;
