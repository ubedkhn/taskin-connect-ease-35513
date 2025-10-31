import { ArrowLeft, Bell, CheckCircle, AlertCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: number;
  type: "reminder" | "service" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const Notifications = () => {
  const navigate = useNavigate();

  const notifications: Notification[] = [
    {
      id: 1,
      type: "reminder",
      title: "Task Reminder",
      message: "Team meeting in 30 minutes",
      time: "Just now",
      read: false,
    },
    {
      id: 2,
      type: "service",
      title: "Service Accepted",
      message: "Rajesh Kumar accepted your plumbing request",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 3,
      type: "reminder",
      title: "Task Completed",
      message: "Morning workout marked as complete",
      time: "3 hours ago",
      read: true,
    },
    {
      id: 4,
      type: "system",
      title: "App Update",
      message: "New features available in version 1.1",
      time: "Yesterday",
      read: true,
    },
  ];

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "reminder":
        return <Bell className="w-5 h-5 text-primary" />;
      case "service":
        return <MapPin className="w-5 h-5 text-success" />;
      case "system":
        return <AlertCircle className="w-5 h-5 text-warning" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b p-6 sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground text-sm">
              {notifications.filter((n) => !n.read).length} unread
            </p>
          </div>
          <Button variant="ghost" size="sm">
            Mark all read
          </Button>
        </div>
      </header>

      {/* Notifications List */}
      <main className="p-6 space-y-3">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`hover:shadow-md transition-all ${
              !notification.read ? "border-l-4 border-l-primary" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold">{notification.title}</h3>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notification.time}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
};

export default Notifications;
