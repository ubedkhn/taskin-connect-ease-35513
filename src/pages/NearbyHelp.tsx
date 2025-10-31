import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, MapPin, Star, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import BottomNav from "@/components/BottomNav";

interface ServiceProvider {
  id: number;
  name: string;
  service: string;
  rating: number;
  distance: string;
  available: boolean;
  requests: number;
}

const NearbyHelp = () => {
  const [providers] = useState<ServiceProvider[]>([
    {
      id: 1,
      name: "Rajesh Kumar",
      service: "Plumber",
      rating: 4.8,
      distance: "0.5 km",
      available: true,
      requests: 120,
    },
    {
      id: 2,
      name: "Amit Sharma",
      service: "Electrician",
      rating: 4.9,
      distance: "1.2 km",
      available: true,
      requests: 98,
    },
    {
      id: 3,
      name: "Priya Singh",
      service: "House Cleaning",
      rating: 4.7,
      distance: "0.8 km",
      available: false,
      requests: 150,
    },
    {
      id: 4,
      name: "Mohammed Ali",
      service: "Delivery",
      rating: 4.6,
      distance: "2.0 km",
      available: true,
      requests: 85,
    },
  ]);

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
            placeholder="Search for services..."
            className="pl-11 bg-primary-foreground h-12 border-0"
          />
        </div>
      </header>

      {/* Services Grid */}
      <main className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Available Now</h2>
          <Badge variant="secondary">
            {providers.filter((p) => p.available).length} providers
          </Badge>
        </div>

        <div className="space-y-4">
          {providers.map((provider) => (
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
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="default" size="sm">
                    Request Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default NearbyHelp;
