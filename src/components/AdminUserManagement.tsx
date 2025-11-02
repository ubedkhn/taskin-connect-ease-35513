import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Shield, User, Wrench } from "lucide-react";

interface UserWithRole {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export function AdminUserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role, created_at");

      if (rolesError) throw rolesError;

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email");

      if (profilesError) throw profilesError;

      const usersWithRoles = roles?.map(role => {
        const profile = profiles?.find(p => p.user_id === role.user_id);
        return {
          id: role.user_id,
          email: profile?.email || "Unknown",
          role: role.role,
          created_at: role.created_at,
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching users:", error);
      }
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Shield className="w-4 h-4" />;
      case "service_provider": return <Wrench className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "service_provider": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-green-500/10 text-green-500 border-green-500/20";
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getRoleIcon(user.role)}
                </div>
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge className={getRoleBadgeColor(user.role)} variant="outline">
                {user.role.replace("_", " ")}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
