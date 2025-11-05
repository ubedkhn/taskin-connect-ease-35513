import { Link } from "react-router-dom";
import { Bell, CheckSquare, MapPin, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  message: string;
  time: string;
  type: "success" | "primary" | "warning";
}

const Home = () => {
  const { role } = useUserRole();
  const [stats, setStats] = useState([
    { label: "Active Tasks", value: "0", color: "text-primary" },
    { label: "Completed Today", value: "0", color: "text-success" },
    { label: "Pending Requests", value: "0", color: "text-warning" },
  ]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, [role]);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (role === "service_provider") {
        // Service provider stats
        const { data: requests } = await supabase
          .from("service_requests")
          .select("status")
          .eq("service_provider_id", user.id);

        const pending = requests?.filter(r => r.status === "pending").length || 0;
        const completed = requests?.filter(r => r.status === "completed").length || 0;
        const accepted = requests?.filter(r => r.status === "accepted").length || 0;

        setStats([
          { label: "Pending Requests", value: String(pending), color: "text-warning" },
          { label: "Completed", value: String(completed), color: "text-success" },
          { label: "Active Jobs", value: String(accepted), color: "text-primary" },
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

        const activeTasks = tasks?.filter(t => !t.completed).length || 0;
        const completedToday = tasks?.filter(t => t.completed).length || 0;
        const pendingRequests = requests?.filter(r => r.status === "pending").length || 0;

        setStats([
          { label: "Active Tasks", value: String(activeTasks), color: "text-primary" },
          { label: "Completed Today", value: String(completedToday), color: "text-success" },
          { label: "Pending Requests", value: String(pendingRequests), color: "text-warning" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const activities: Activity[] = [];

      // Fetch completed tasks (last 5)
      const { data: completedTasks } = await supabase
        .from("tasks")
        .select("title, updated_at")
        .eq("user_id", user.id)
        .eq("completed", true)
        .order("updated_at", { ascending: false })
        .limit(5);

      if (completedTasks) {
        completedTasks.forEach(task => {
          activities.push({
            id: `task-${task.updated_at}`,
            message: `Completed: ${task.title}`,
            time: formatDistanceToNow(new Date(task.updated_at), { addSuffix: true }),
            type: "success"
          });
        });
      }

      // Fetch service requests
      const { data: serviceRequests } = await supabase
        .from("service_requests")
        .select("service_type, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (serviceRequests) {
        serviceRequests.forEach(request => {
          let message = "";
          let type: "success" | "primary" | "warning" = "primary";
          
          if (request.status === "accepted") {
            message = `${request.service_type} request accepted`;
            type = "primary";
          } else if (request.status === "completed") {
            message = `${request.service_type} service completed`;
            type = "success";
          } else if (request.status === "pending") {
            message = `${request.service_type} request pending`;
            type = "warning";
          }

          if (message) {
            activities.push({
              id: `request-${request.created_at}`,
              message,
              time: formatDistanceToNow(new Date(request.created_at), { addSuffix: true }),
              type
            });
          }
        });
      }

      // Sort by time and take top 5
      activities.sort((a, b) => {
        const timeA = a.time.includes("ago") ? new Date(Date.now() - parseTimeAgo(a.time)) : new Date();
        const timeB = b.time.includes("ago") ? new Date(Date.now() - parseTimeAgo(b.time)) : new Date();
        return timeB.getTime() - timeA.getTime();
      });

      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    }
  };

  const parseTimeAgo = (timeString: string): number => {
    const match = timeString.match(/(\d+)\s+(second|minute|hour|day)s?\s+ago/);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    const multipliers: { [key: string]: number } = {
      second: 1000,
      minute: 60 * 1000,
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000
    };
    
    return value * (multipliers[unit] || 0);
  };

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
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs">Start using the app to see your activity here</p>
                </div>
              ) : (
                recentActivity.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className={`flex items-center gap-3 ${index < recentActivity.length - 1 ? 'pb-3 border-b' : ''}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === "success" ? "bg-success" :
                      activity.type === "primary" ? "bg-primary" :
                      "bg-warning"
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
