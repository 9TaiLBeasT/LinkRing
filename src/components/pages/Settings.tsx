import React, { useState, useEffect } from "react";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Users,
  Palette,
  Trash2,
  Download,
  LogOut,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Save,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Database } from "@/types/supabase";
import Sidebar, { SidebarToggle } from "../dashboard/layout/Sidebar";
import { cn } from "@/lib/utils";

type UserProfile = Database["public"]["Tables"]["users"]["Row"];
type Ring = Database["public"]["Tables"]["rings"]["Row"] & {
  member_count?: number;
  is_muted?: boolean;
};

interface UserSettings {
  font: "robotic" | "clean" | "hacker";
  animated_bg: boolean;
}

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rings, setRings] = useState<Ring[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    font: "robotic",
    animated_bg: false,
  });
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    profile: true,
    security: false,
    rings: false,
    appearance: false,
    danger: false,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserRings();
      loadUserSettings();
    }
  }, [user]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        // Create user profile if it doesn't exist
        const { data: newProfile, error: insertError } = await supabase
          .from("users")
          .insert({
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || "",
            token_identifier: user.id,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating profile:", insertError);
        } else {
          setProfile(newProfile);
        }
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  const fetchUserRings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("ring_members")
        .select(
          `
          rings (
            id,
            name,
            description,
            created_at
          )
        `,
        )
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching rings:", error);
        return;
      }

      const userRings = data
        ?.map((item) => item.rings)
        .filter(Boolean) as Ring[];
      setRings(userRings || []);
    } catch (error) {
      console.error("Error in fetchUserRings:", error);
    }
  };

  const loadUserSettings = () => {
    const savedSettings = localStorage.getItem(`linkring_settings_${user?.id}`);
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) });
    }
  };

  const saveUserSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      localStorage.setItem(
        `linkring_settings_${user.id}`,
        JSON.stringify(settings),
      );

      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
        className: "bg-neon-dark border-neon-green text-neon-green",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile({ ...profile, ...updates });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        className: "bg-neon-dark border-neon-green text-neon-green",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const leaveRing = async (ringId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("ring_members")
        .delete()
        .eq("user_id", user.id)
        .eq("ring_id", ringId);

      if (error) throw error;

      setRings(rings.filter((ring) => ring.id !== ringId));
      toast({
        title: "Left Ring",
        description: "You have successfully left the ring.",
        className: "bg-neon-dark border-neon-green text-neon-green",
      });
    } catch (error) {
      console.error("Error leaving ring:", error);
      toast({
        title: "Error",
        description: "Failed to leave ring. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportUserData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch all user data
      const [profileData, ringsData, linksData, savedLinksData] =
        await Promise.all([
          supabase.from("users").select("*").eq("user_id", user.id),
          supabase
            .from("ring_members")
            .select("*, rings(*)")
            .eq("user_id", user.id),
          supabase.from("shared_links").select("*").eq("user_id", user.id),
          supabase
            .from("saved_links")
            .select("*, shared_links(*)")
            .eq("user_id", user.id),
        ]);

      const exportData = {
        profile: profileData.data,
        rings: ringsData.data,
        shared_links: linksData.data,
        saved_links: savedLinksData.data,
        settings: settings,
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `linkring-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been downloaded successfully.",
        className: "bg-neon-dark border-neon-green text-neon-green",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user || deleteConfirmText !== "DELETE MY ACCOUNT") return;

    setLoading(true);
    try {
      // Delete user data in order
      await supabase.from("saved_links").delete().eq("user_id", user.id);
      await supabase.from("shared_links").delete().eq("user_id", user.id);
      await supabase.from("ring_members").delete().eq("user_id", user.id);
      await supabase.from("users").delete().eq("user_id", user.id);

      // Delete auth user
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
        className: "bg-red-900 border-red-500 text-red-100",
      });

      await signOut();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const SettingsSection = ({
    id,
    title,
    description,
    icon,
    children,
    danger = false,
  }: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    danger?: boolean;
  }) => {
    const isExpanded = expandedSections[id];

    return (
      <Card
        className={`bg-neon-dark border-neon-green/30 transition-all duration-300 ${
          danger
            ? "border-red-500/30 hover:border-red-500"
            : "hover:border-neon-green/50"
        }`}
      >
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => toggleSection(id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`text-xl ${
                  danger ? "text-red-400" : "text-neon-green"
                }`}
              >
                {icon}
              </span>
              <div>
                <CardTitle
                  className={`text-lg font-mono ${
                    danger ? "text-red-400" : "text-neon-green"
                  }`}
                >
                  {title}
                </CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  {description}
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400">
              {isExpanded ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="animate-slide-in-bottom">
            {children}
          </CardContent>
        )}
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neon-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-mono text-neon-green mb-4">
            Access Denied
          </h1>
          <p className="text-gray-400">Please log in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neon-dark">
      <SidebarToggle isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className="flex h-screen">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <main
          className={cn(
            "flex-1 overflow-auto transition-all duration-300 ease-in-out",
            isMobile ? "w-full" : sidebarOpen ? "ml-0" : "-ml-[280px]",
          )}
        >
          <div
            className={cn(
              "transition-all duration-300 ease-in-out text-white font-mono",
              isMobile ? "px-4 pt-16" : "px-6 pt-6",
            )}
          >
            <div className="container mx-auto py-8 max-w-4xl">
              <div className="flex flex-col gap-4">
                <SettingsSection
                  id="profile"
                  title="Profile"
                  description="Manage your profile settings."
                  icon={<User />}
                  children={
                    <div className="flex flex-col gap-4">
                      {/* Profile settings */}
                    </div>
                  }
                />
                <SettingsSection
                  id="security"
                  title="Security"
                  description="Manage your security settings."
                  icon={<Shield />}
                  children={
                    <div className="flex flex-col gap-4">
                      {/* Security settings */}
                    </div>
                  }
                />
                <SettingsSection
                  id="rings"
                  title="Rings"
                  description="Manage your rings."
                  icon={<Users />}
                  children={
                    <div className="flex flex-col gap-4">
                      {/* Rings settings */}
                    </div>
                  }
                />
                <SettingsSection
                  id="appearance"
                  title="Appearance"
                  description="Manage your appearance settings."
                  icon={<Palette />}
                  children={
                    <div className="flex flex-col gap-4">
                      {/* Appearance settings */}
                    </div>
                  }
                />
                <SettingsSection
                  id="danger"
                  title="Danger"
                  description="Manage your danger settings."
                  icon={<Trash2 />}
                  children={
                    <div className="flex flex-col gap-4">
                      {/* Danger settings */}
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
