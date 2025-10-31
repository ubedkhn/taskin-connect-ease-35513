import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import taskinLogo from "@/assets/taskin_logo.jpg";

const About = () => {
  return (
    <div className="min-h-screen bg-background pb-6 animate-fade-in">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground p-6 rounded-b-3xl shadow-elevated">
        <div className="flex items-center gap-4">
          <Link to="/settings">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">About Us</h1>
        </div>
      </header>

      {/* Content */}
      <main className="p-6 space-y-6">
        {/* Logo & Intro */}
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-primary">
              <img src={taskinLogo} alt="Taskin Logo" className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Taskin</h2>
              <p className="text-muted-foreground">Your tasks, sorted.</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Taskin is your all-in-one task management and service connection platform. 
              We help you organize your daily tasks and connect with trusted service providers 
              in your area, making life simpler and more organized.
            </p>
          </CardContent>
        </Card>

        {/* Mission Cards */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Our Mission</h3>
                <p className="text-sm text-muted-foreground">
                  To empower individuals and businesses by providing an intuitive platform 
                  that simplifies task management and connects people with quality service providers.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Our Community</h3>
                <p className="text-sm text-muted-foreground">
                  We bring together users seeking services and skilled professionals 
                  offering their expertise, creating a trusted ecosystem for everyone.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Built with Care</h3>
                <p className="text-sm text-muted-foreground">
                  Every feature is designed with user experience in mind, ensuring that 
                  managing tasks and finding help is as seamless as possible.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Version Info */}
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            <p className="text-xs text-muted-foreground mt-1">© 2024 Taskin. All rights reserved.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default About;
