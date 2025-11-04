import { Link, useNavigate } from "react-router-dom";
import { User, Settings, Bell, HelpCircle, ChevronRight, Briefcase, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import BottomNav from "@/components/BottomNav";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const navigate = useNavigate();
  const { role } = useUserRole();
  const [stats, setStats] = useState([
    { label: "Tasks Completed", value: "0" },
    { label: "Services Used", value: "0" },
    { label: "Active Requests", value: "0" },
  ]);
  
  const isServiceProvider = role === "service_provider";
  const isUser = role === "user";

  useEffect(() => {
    fetchStats();
  }, [role]);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isServiceProvider) {
        // Service provider stats
        const { data: requests } = await supabase
          .from("service_requests")
          .select("status")
          .eq("service_provider_id", user.id);

        const completed = requests?.filter(r => r.status === "completed").length || 0;
        const totalServices = requests?.length || 0;
        const activeJobs = requests?.filter(r => r.status === "accepted").length || 0;

        setStats([
          { label: "Jobs Completed", value: String(completed) },
          { label: "Total Services", value: String(totalServices) },
          { label: "Active Jobs", value: String(activeJobs) },
        ]);
      } else {
        // User stats
        const { data: tasks } = await supabase
          .from("tasks")
          .select("completed")
          .eq("user_id", user.id);

        const { data: requests } = await supabase
          .from("service_requests")
          .select("status")
          .eq("user_id", user.id);

        const completedTasks = tasks?.filter(t => t.completed).length || 0;
        const servicesUsed = requests?.length || 0;
        const activeRequests = requests?.filter(r => r.status === "pending" || r.status === "accepted").length || 0;

        setStats([
          { label: "Tasks Completed", value: String(completedTasks) },
          { label: "Services Used", value: String(servicesUsed) },
          { label: "Active Requests", value: String(activeRequests) },
        ]);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handlePanelSwitch = () => {
    if (isServiceProvider) {
      navigate("/home");
      toast.success("Switched to User Panel");
    } else if (isUser) {
      navigate("/service-provider-panel");
      toast.success("Switched to Service Provider Panel");
    }
  };

  const menuItems = [
    {
      icon: User,
      label: "Edit Profile",
      description: "Update your personal info",
      link: "/edit-profile",
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "Manage your alerts",
      link: "/notifications",
    },
    {
      icon: Settings,
      label: "Settings",
      description: "App preferences & account",
      link: "/settings",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      description: "Get assistance",
      link: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Profile Info */}
      <header className="bg-gradient-hero text-primary-foreground p-6 rounded-b-3xl shadow-elevated">
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="w-24 h-24 border-4 border-primary-foreground/20">
            <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-2xl font-bold">
              JD
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h1 className="text-2xl font-bold">John Doe</h1>
            <p className="text-primary-foreground/80">john.doe@example.com</p>
          </div>

          <Link to="/edit-profile">
            <Button
              variant="outline"
              size="sm"
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
            >
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3 text-center"
            >
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-primary-foreground/70 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Menu Items */}
      <main className="p-6 space-y-4">
        {/* Panel Switcher */}
        {(isUser || isServiceProvider) && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {isServiceProvider ? <Home className="w-5 h-5 text-primary" /> : <Briefcase className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {isServiceProvider ? "Switch to User Panel" : "Switch to Service Provider"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isServiceProvider ? "Need help? Switch to request services" : "Ready to work? Switch to provide services"}
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={isServiceProvider} 
                  onCheckedChange={handlePanelSwitch}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-2">
            {menuItems.map((item, index) => (
              <div key={index}>
                <Link to={item.link}>
                  <div className="flex items-center gap-4 p-4 hover:bg-accent rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Link>
                {index < menuItems.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>


        {/* App Version */}
        <p className="text-center text-sm text-muted-foreground">
          Version 1.0.0
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
