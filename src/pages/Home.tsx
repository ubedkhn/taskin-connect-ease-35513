import { Link } from "react-router-dom";
import { Bell, CheckSquare, MapPin, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";

const Home = () => {
  const stats = [
    { label: "Active Tasks", value: "5", color: "text-primary" },
    { label: "Completed Today", value: "3", color: "text-success" },
    { label: "Pending Requests", value: "2", color: "text-warning" },
  ];

  const quickActions = [
    {
      title: "Urgent Requirement",
      description: "Get immediate service",
      icon: Zap,
      link: "/post-request",
      gradient: "from-destructive to-warning",
    },
    {
      title: "Remind Me",
      description: "Add a new reminder",
      icon: CheckSquare,
      link: "/remind-me",
      gradient: "from-primary to-primary-dark",
    },
    {
      title: "Nearby Help",
      description: "Find local services",
      icon: MapPin,
      link: "/nearby-help",
      gradient: "from-accent-foreground to-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground p-6 rounded-b-3xl shadow-elevated">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome back!</h1>
            <p className="text-primary-foreground/80 text-sm">Let's accomplish great things today</p>
          </div>
          <Link to="/notifications">
            <div className="relative p-2 bg-primary-foreground/20 rounded-full hover:bg-primary-foreground/30 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-xs">
                3
              </span>
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3 text-center"
            >
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-primary-foreground/70 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <Card className="overflow-hidden hover:shadow-elevated transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-r ${action.gradient} p-4 flex items-center gap-4`}>
                      <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
                        <action.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1 text-primary-foreground">
                        <h3 className="font-semibold text-lg">{action.title}</h3>
                        <p className="text-sm text-primary-foreground/80">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Morning workout completed</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Plumber request accepted</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-warning"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Team meeting reminder</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
