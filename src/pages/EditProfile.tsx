import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  contact_no: z.string()
    .regex(/^[0-9]{10}$/, "Contact number must be exactly 10 digits")
    .optional()
    .or(z.literal("")),
  aadhaar_number: z.string()
    .regex(/^[0-9]{12}$/, "Aadhaar must be exactly 12 digits")
    .optional()
    .or(z.literal("")),
});

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    contact_no: "",
    profile_photo_url: "",
    aadhaar_number: "",
    bio: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || "",
          contact_no: data.contact_no || "",
          profile_photo_url: data.profile_photo_url || "",
          aadhaar_number: data.aadhaar_number || "",
          bio: data.bio || "",
        });
      }
    } catch (error: any) {
      toast.error("Failed to load profile");
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      setProfile({ ...profile, profile_photo_url: publicUrl });
      toast.success("Photo uploaded successfully");
    } catch (error: any) {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Validate input
      const validation = profileSchema.parse({
        full_name: profile.full_name,
        contact_no: profile.contact_no,
        aadhaar_number: profile.aadhaar_number,
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: validation.full_name,
          contact_no: validation.contact_no || null,
          profile_photo_url: profile.profile_photo_url,
          aadhaar_number: validation.aadhaar_number || null,
          bio: profile.bio || null,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      navigate("/profile");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold">Edit Profile</h1>
        </div>
      </header>

      {/* Content */}
      <main className="p-6 space-y-6">
        {/* Profile Photo */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32 border-4 border-primary/20">
                <AvatarImage src={profile.profile_photo_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                  {profile.full_name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex gap-3">
                <Label htmlFor="camera-upload">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    className="cursor-pointer"
                    asChild
                  >
                    <span>
                      <Camera className="w-4 h-4 mr-2" />
                      Camera
                    </span>
                  </Button>
                </Label>
                <input
                  id="camera-upload"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <Label htmlFor="gallery-upload">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    className="cursor-pointer"
                    asChild
                  >
                    <span>
                      {uploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Gallery
                    </span>
                  </Button>
                </Label>
                <input
                  id="gallery-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input
                id="contact"
                value={profile.contact_no}
                onChange={(e) => setProfile({ ...profile, contact_no: e.target.value })}
                placeholder="Enter your contact number"
                type="tel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aadhaar">Aadhaar Card Number (Optional)</Label>
              <Input
                id="aadhaar"
                value={profile.aadhaar_number}
                onChange={(e) => setProfile({ ...profile, aadhaar_number: e.target.value })}
                placeholder="Enter your Aadhaar number"
                maxLength={12}
              />
              <p className="text-xs text-muted-foreground">
                For identity verification
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio / Services (Optional)</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Describe your services or add relevant tags (e.g., Plumber, 24/7 Service, Emergency Repairs)"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                Add tags or describe the services you provide
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </main>
    </div>
  );
};

export default EditProfile;
