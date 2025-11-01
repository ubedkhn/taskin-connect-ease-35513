import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Phone, MessageSquare, Star, CheckCircle, Clock } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const ServiceProviderPanel = () => {
  const stats = [
    { label: "Pending Requests", value: "12", icon: Clock, color: "text-orange-500" },
    { label: "Completed Today", value: "8", icon: CheckCircle, color: "text-green-500" },
    { label: "Rating", value: "4.8", icon: Star, color: "text-yellow-500" },
    { label: "Total Earnings", value: "₹2,450", icon: CheckCircle, color: "text-blue-500" },
  ];

  const incomingRequests = [
    {
      id: 1,
      customerName: "Rajesh Kumar",
      service: "Plumbing",
      location: "Sector 15, 2.3 km away",
      time: "10 mins ago",
      urgent: true,
    },
    {
      id: 2,
      customerName: "Priya Sharma",
      service: "Electrical Work",
      location: "Sector 22, 3.5 km away",
      time: "25 mins ago",
      urgent: false,
    },
    {
      id: 3,
      customerName: "Amit Patel",
      service: "AC Repair",
      location: "Sector 18, 1.8 km away",
      time: "1 hour ago",
      urgent: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Service Provider</h1>
            <p className="text-sm text-muted-foreground">Manage your requests</p>
          </div>
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-2xl font-bold">{stat.value}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Incoming Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Incoming Requests</span>
              <Badge variant="secondary">{incomingRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {incomingRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 border rounded-lg space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{request.customerName}</h3>
                    <p className="text-sm text-muted-foreground">{request.service}</p>
                  </div>
                  {request.urgent && (
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>📍 {request.location}</p>
                  <p>🕐 {request.time}</p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                  <Button size="sm" variant="outline">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Availability Toggle */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Availability Status</h3>
                <p className="text-sm text-muted-foreground">You are currently available</p>
              </div>
              <Button variant="outline">Toggle Off</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default ServiceProviderPanel;
