import { Link, useLocation } from "react-router-dom";
import { Home, CheckSquare, MapPin, User, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";

const BottomNav = () => {
  const location = useLocation();
  const { role } = useUserRole();

  // Navigation items for regular users
  const userNavItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: CheckSquare, label: "Remind Me", path: "/remind-me" },
    { icon: MapPin, label: "Nearby Help", path: "/nearby-help" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  // Navigation items for service providers
  const providerNavItems = [
    { icon: Briefcase, label: "Dashboard", path: "/service-provider" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  // Select appropriate navigation based on role
  const navItems = role === "service_provider" ? providerNavItems : userNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-elevated z-50">
      <div className={cn(
        "max-w-lg mx-auto grid h-16",
        role === "service_provider" ? "grid-cols-2" : "grid-cols-4"
      )}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "animate-scale-in")} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-12 h-1 bg-primary rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
