import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import taskinLogo from "@/assets/taskin_logo.png";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="text-center space-y-6 animate-scale-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-foreground/20 backdrop-blur-sm animate-pulse-glow">
          <img src={taskinLogo} alt="Taskin Logo" className="w-12 h-12" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-primary-foreground tracking-tight">
            Taskin
          </h1>
          <p className="text-primary-foreground/90 text-lg font-light">
            Your tasks, sorted.
          </p>
        </div>

        <div className="flex gap-1 justify-center pt-8">
          <div className="w-2 h-2 rounded-full bg-primary-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-primary-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-primary-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  );
};

export default Splash;
