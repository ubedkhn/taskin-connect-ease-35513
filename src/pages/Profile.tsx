import { Link } from "react-router-dom";
import { User, Settings, Bell, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import BottomNav from "@/components/BottomNav";

const Profile = () => {
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

  const stats = [
    { label: "Tasks Completed", value: "45" },
    { label: "Services Used", value: "12" },
    { label: "Active Requests", value: "2" },
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
