import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, MapPin } from "lucide-react";
import MapView from "@/components/MapView";
import { useToast } from "@/hooks/use-toast";

interface ServiceRequest {
  id: string;
  service_type: string;
  status: string;
  user_location_lat: number;
  user_location_lng: number;
  user_address: string | null;
  service_provider_id: string | null;
}

interface ProviderLocation {
  latitude: number;
  longitude: number;
  updated_at: string;
}

const TrackProvider = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [providerLocation, setProviderLocation] = useState<ProviderLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load request details",
          variant: "destructive",
        });
        return;
      }

      setRequest(data);
      setLoading(false);
    };

    fetchRequest();
  }, [requestId, toast]);

  useEffect(() => {
    if (!requestId) return;

    // Subscribe to real-time provider location updates
    const channel = supabase
      .channel(`provider-location-${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "provider_locations",
          filter: `request_id=eq.${requestId}`,
        },
        (payload) => {
          console.log("Location update:", payload);
          if (payload.new) {
            setProviderLocation(payload.new as ProviderLocation);
          }
        }
      )
      .subscribe();

    // Fetch initial provider location
    const fetchProviderLocation = async () => {
      const { data } = await supabase
        .from("provider_locations")
        .select("*")
        .eq("request_id", requestId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setProviderLocation(data);
      }
    };

    fetchProviderLocation();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Request not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Track Service Provider</h1>
            <p className="text-sm text-muted-foreground">{request.service_type}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative">
          <MapView
            userLocation={{
              lat: request.user_location_lat,
              lng: request.user_location_lng,
            }}
            providerLocation={
              providerLocation
                ? {
                    lat: providerLocation.latitude,
                    lng: providerLocation.longitude,
                  }
                : undefined
            }
          />
        </div>

        <Card className="m-4">
          <CardHeader>
            <CardTitle className="text-lg">Request Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="font-semibold capitalize">{request.status}</span>
            </div>
            {request.user_address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Your Location</p>
                  <p className="text-sm text-muted-foreground">{request.user_address}</p>
                </div>
              </div>
            )}
            {providerLocation && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(providerLocation.updated_at).toLocaleTimeString()}
                </p>
              </div>
            )}
            {!providerLocation && request.status === "accepted" && (
              <p className="text-sm text-muted-foreground">
                Waiting for provider to share location...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrackProvider;
