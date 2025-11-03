import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Splash from "./pages/Splash";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import RemindMe from "./pages/RemindMe";
import AddTask from "./pages/AddTask";
import NearbyHelp from "./pages/NearbyHelp";
import PostRequest from "./pages/PostRequest";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Help from "./pages/Help";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/AdminPanel";
import ServiceProviderPanel from "./pages/ServiceProviderPanel";
import TrackProvider from "./pages/TrackProvider";
import AuthGuard from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="animate-fade-in">
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin Panel */}
            <Route path="/admin" element={
              <AuthGuard allowedRoles={["admin"]}>
                <AdminPanel />
              </AuthGuard>
            } />
            
            {/* Service Provider Panel */}
            <Route path="/service-provider" element={
              <AuthGuard allowedRoles={["service_provider"]}>
                <ServiceProviderPanel />
              </AuthGuard>
            } />
            
            {/* Track Provider */}
            <Route path="/track-provider/:requestId" element={
              <AuthGuard allowedRoles={["user"]}>
                <TrackProvider />
              </AuthGuard>
            } />
            
            {/* User Panel (default home) */}
            <Route path="/home" element={
              <AuthGuard allowedRoles={["user"]}>
                <Home />
              </AuthGuard>
            } />
            <Route path="/remind-me" element={
              <AuthGuard allowedRoles={["user"]}>
                <RemindMe />
              </AuthGuard>
            } />
            <Route path="/add-task" element={
              <AuthGuard allowedRoles={["user"]}>
                <AddTask />
              </AuthGuard>
            } />
            <Route path="/nearby-help" element={
              <AuthGuard allowedRoles={["user"]}>
                <NearbyHelp />
              </AuthGuard>
            } />
            <Route path="/post-request" element={
              <AuthGuard allowedRoles={["user"]}>
                <PostRequest />
              </AuthGuard>
            } />
            
            {/* Shared Routes (all authenticated users) */}
            <Route path="/profile" element={
              <AuthGuard>
                <Profile />
              </AuthGuard>
            } />
            <Route path="/edit-profile" element={
              <AuthGuard>
                <EditProfile />
              </AuthGuard>
            } />
            <Route path="/settings" element={
              <AuthGuard>
                <Settings />
              </AuthGuard>
            } />
            <Route path="/about" element={
              <AuthGuard>
                <About />
              </AuthGuard>
            } />
            <Route path="/help" element={
              <AuthGuard>
                <Help />
              </AuthGuard>
            } />
            <Route path="/notifications" element={
              <AuthGuard>
                <Notifications />
              </AuthGuard>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
