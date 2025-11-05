import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, MapPin, Star, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface ServiceProvider {
  id: number;
  name: string;
  service: string;
  rating: number;
  distance: string;
  available: boolean;
  requests: number;
  phone: string;
}

const serviceRequestSchema = z.object({
  service_type: z.string().trim().min(2, "Service type must be at least 2 characters").max(100, "Service type must be less than 100 characters"),
  user_address: z.string().trim().min(5, "Address must be at least 5 characters").max(500, "Address must be less than 500 characters"),
  description: z.string().trim().max(2000, "Description must be less than 2000 characters").optional(),
  user_location_lat: z.number().min(-90, "Invalid latitude").max(90, "Invalid latitude"),
  user_location_lng: z.number().min(-180, "Invalid longitude").max(180, "Invalid longitude"),
});

const NearbyHelp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [providers] = useState<ServiceProvider[]>([
    {
      id: 1,
      name: "Rajesh Kumar",
      service: "Plumber",
      rating: 4.8,
      distance: "0.5 km",
      available: true,
      requests: 120,
      phone: "+919876543210",
    },
    {
      id: 2,
      name: "Amit Sharma",
      service: "Electrician",
      rating: 4.9,
      distance: "1.2 km",
      available: true,
      requests: 98,
      phone: "+919876543211",
    },
    {
      id: 3,
      name: "Priya Singh",
      service: "House Cleaning",
      rating: 4.7,
      distance: "0.8 km",
      available: false,
      requests: 150,
      phone: "+919876543212",
    },
    {
      id: 4,
      name: "Mohammed Ali",
      service: "Delivery",
      rating: 4.6,
      distance: "2.0 km",
      available: true,
      requests: 85,
      phone: "+919876543213",
    },
  ]);
  
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [description, setDescription] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationAddress, setLocationAddress] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast({
          title: "Location Error",
          description: "Unable to get your location. Please check permissions.",
          variant: "destructive",
        });
        setLoadingLocation(false);
      }
    );
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleRequestService = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setShowRequestDialog(true);
  };

  const submitServiceRequest = async () => {
    if (!userLocation) {
      toast({
        title: "Error",
        description: "Location is required. Please enable location access.",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to request service",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // Validate input data
    try {
      const validatedData = serviceRequestSchema.parse({
        service_type: selectedProvider?.service || "General Service",
        user_address: locationAddress,
        description: description || "",
        user_location_lat: userLocation.lat,
        user_location_lng: userLocation.lng,
      });

      const { data, error } = await supabase
        .from("service_requests")
        .insert({
          user_id: user.id,
          service_type: validatedData.service_type,
          user_location_lat: validatedData.user_location_lat,
          user_location_lng: validatedData.user_location_lng,
          user_address: validatedData.user_address,
          description: validatedData.description,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create service request",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Service request sent successfully!",
        });
        setShowRequestDialog(false);
        setDescription("");
        navigate(`/track-provider/${data.id}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    }
  };

  // Filter providers based on search query
  const filteredProviders = providers.filter((provider) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    return (
      provider.name.toLowerCase().includes(query) ||
      provider.service.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground p-6 rounded-b-3xl shadow-elevated">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Nearby Help</h1>
            <p className="text-primary-foreground/80 text-sm">Find local services</p>
          </div>
          <Link to="/post-request">
            <Button size="icon" className="rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30">
              <Plus className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for services or providers..."
            className="pl-11 bg-primary-foreground text-foreground h-12 border-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Services Grid */}
      <main className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">
            {searchQuery ? "Search Results" : "Available Now"}
          </h2>
          <Badge variant="secondary">
            {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="space-y-4">
          {filteredProviders.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `No providers found matching "${searchQuery}"`
                  : "No providers available"}
              </p>
            </Card>
          ) : (
            filteredProviders.map((provider) => (
            <Card
              key={provider.id}
              className="hover:shadow-elevated transition-all"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="w-14 h-14 border-2 border-primary">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                      {provider.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold truncate">{provider.name}</h3>
                      <Badge
                        variant={provider.available ? "default" : "secondary"}
                        className={
                          provider.available
                            ? "bg-success text-success-foreground"
                            : ""
                        }
                      >
                        {provider.available ? "Available" : "Busy"}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      {provider.service}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        <span className="font-medium">{provider.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{provider.distance}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {provider.requests} requests
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCall(provider.phone)}
                    className="w-full"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="w-full"
                    onClick={() => handleRequestService(provider)}
                  >
                    Request Service
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>
      </main>

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request {selectedProvider?.service}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Your Location</Label>
              <Input 
                value={locationAddress} 
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="Enter your address"
              />
              {loadingLocation && (
                <p className="text-xs text-muted-foreground mt-1">Getting location...</p>
              )}
            </div>
            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your issue or requirements..."
                rows={3}
              />
            </div>
            <Button 
              onClick={submitServiceRequest} 
              className="w-full"
              disabled={!userLocation || loadingLocation}
            >
              Send Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default NearbyHelp;
