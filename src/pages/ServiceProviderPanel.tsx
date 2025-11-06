import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Phone, MessageSquare, Star, CheckCircle, Clock, Navigation } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ServiceRequest {
  id: string;
  user_id: string;
  service_type: string;
  user_location_lat: number;
  user_location_lng: number;
  user_address: string | null;
  status: string;
  description: string | null;
  created_at: string;
}

const ServiceProviderPanel = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    activeJobs: 0,
    completedToday: 0,
    totalEarnings: 0,
    rating: 4.8,
    totalCompleted: 0,
  });

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel("service-requests")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_requests",
        },
        () => {
          fetchRequests();
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: allRequests } = await supabase
        .from("service_requests")
        .select("status, completed_at")
        .eq("service_provider_id", user.id);

      if (allRequests) {
        const pending = allRequests.filter(r => r.status === "pending").length;
        const active = allRequests.filter(r => r.status === "accepted").length;
        const completed = allRequests.filter(r => r.status === "completed").length;
        
        // Calculate completed today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const completedToday = allRequests.filter(r => 
          r.status === "completed" && 
          r.completed_at && 
          new Date(r.completed_at) >= today
        ).length;

        setStats({
          pendingRequests: pending,
          activeJobs: active,
          completedToday,
          totalEarnings: completed * 500, // ₹500 per job
          rating: 4.8,
          totalCompleted: completed,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("service_requests")
      .select("*")
      .or(`status.eq.pending,and(service_provider_id.eq.${user.id},status.eq.accepted)`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requests:", error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const handleAcceptRequest = async (requestId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("service_requests")
      .update({ 
        service_provider_id: user.id, 
        status: "accepted",
        accepted_at: new Date().toISOString()
      })
      .eq("id", requestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Request accepted! Start tracking to share your location.",
      });
      setCurrentRequestId(requestId);
      fetchRequests();
    }
  };

  const startLocationTracking = async (requestId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setIsTracking(true);
    setCurrentRequestId(requestId);

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        const { error } = await supabase
          .from("provider_locations")
          .upsert({
            service_provider_id: user.id,
            request_id: requestId,
            latitude,
            longitude,
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error("Error updating location:", error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({
          title: "Location Error",
          description: "Unable to get your location. Please check permissions.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    toast({
      title: "Tracking Started",
      description: "Your location is being shared with the customer",
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
    };
  };

  const getTimeSince = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

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
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-2xl font-bold">{stats.pendingRequests}</span>
              </div>
              <p className="text-xs text-muted-foreground">Pending Requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold">{stats.completedToday}</span>
              </div>
              <p className="text-xs text-muted-foreground">Completed Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl font-bold">{stats.rating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold">₹{stats.totalEarnings}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total Earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Incoming Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Service Requests</span>
              <Badge variant="secondary">{requests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : requests.length === 0 ? (
              <p className="text-center text-muted-foreground">No requests available</p>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border rounded-lg space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{request.service_type}</h3>
                      <p className="text-sm text-muted-foreground">
                        {request.description || "No description"}
                      </p>
                    </div>
                    <Badge variant={request.status === "pending" ? "secondary" : "default"}>
                      {request.status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {request.user_address && <p>📍 {request.user_address}</p>}
                    <p>🕐 {getTimeSince(request.created_at)}</p>
                  </div>

                  <div className="flex gap-2">
                    {request.status === "pending" ? (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Request
                      </Button>
                    ) : request.status === "accepted" ? (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        variant={isTracking && currentRequestId === request.id ? "secondary" : "default"}
                        onClick={() => startLocationTracking(request.id)}
                        disabled={isTracking && currentRequestId === request.id}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        {isTracking && currentRequestId === request.id ? "Tracking Active" : "Start Tracking"}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
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
