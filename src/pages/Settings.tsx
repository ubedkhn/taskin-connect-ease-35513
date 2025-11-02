import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Monitor, HelpCircle, Info, LogOut, Trash2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (value: string) => {
    setTheme(value as 'light' | 'dark' | 'system');
    toast.success(`Theme changed to ${value}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete profile data (CASCADE will handle related data)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Delete auth user
      const { error: authError } = await supabase.auth.updateUser({
        data: { deleted: true }
      });

      if (authError) throw authError;

      // Sign out
      await supabase.auth.signOut();
      toast.success("Account deleted successfully");
      navigate("/auth");
    } catch (error: any) {
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-6 animate-fade-in">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground p-6 rounded-b-3xl shadow-elevated">
        <div className="flex items-center gap-4">
          <Link to="/profile">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </header>

      {/* Settings Content */}
      <main className="p-6 space-y-6">
        {/* Theme */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">App Theme</h2>
              <p className="text-sm text-muted-foreground">
                Choose your preferred appearance
              </p>
            </div>
            <RadioGroup value={theme || "system"} onValueChange={handleThemeChange}>
              <div className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:bg-accent transition-colors">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="flex items-center gap-3 cursor-pointer flex-1">
                  <Sun className="w-5 h-5 text-warning" />
                  <p className="font-medium">Light Mode</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:bg-accent transition-colors">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="flex items-center gap-3 cursor-pointer flex-1">
                  <Moon className="w-5 h-5 text-primary" />
                  <p className="font-medium">Dark Mode</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:bg-accent transition-colors">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system" className="flex items-center gap-3 cursor-pointer flex-1">
                  <Monitor className="w-5 h-5 text-muted-foreground" />
                  <p className="font-medium">System Default</p>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* General Options */}
        <Card>
          <CardContent className="p-2">
            <ChangePasswordDialog />
            <Separator />
            <Link to="/about">
              <div className="flex items-center gap-4 p-4 hover:bg-accent rounded-lg transition-colors">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">About Us</h3>
                  <p className="text-sm text-muted-foreground">Learn more about Taskin</p>
                </div>
              </div>
            </Link>
            <Separator />
            <Link to="/help">
              <div className="flex items-center gap-4 p-4 hover:bg-accent rounded-lg transition-colors">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Help Me</h3>
                  <p className="text-sm text-muted-foreground">Get assistance and support</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardContent className="p-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center gap-4 p-4 hover:bg-accent rounded-lg transition-colors text-left">
                  <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-destructive">Logout Account</h3>
                    <p className="text-sm text-muted-foreground">Sign out from your account</p>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Logout Confirmation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to logout? You'll need to sign in again to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Separator />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center gap-4 p-4 hover:bg-accent rounded-lg transition-colors text-left">
                  <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-destructive">Delete Account</h3>
                    <p className="text-sm text-muted-foreground">Permanently remove your account</p>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
