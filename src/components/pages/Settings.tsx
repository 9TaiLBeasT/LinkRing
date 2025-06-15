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
import { Badge } from "@/components/ui/badge";
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
    account: false,
    danger: false,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
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
        // Set a default profile to prevent blank page
        setProfile({
          id: user.id,
          user_id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || "",
          bio: "",
          token_identifier: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
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
          // Set a default profile to prevent blank page
          setProfile({
            id: user.id,
            user_id: user.id,
            email: user.email || "",
            full_name: user.user_metadata?.full_name || "",
            bio: "",
            token_identifier: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          setProfile(newProfile);
        }
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
      // Set a default profile to prevent blank page
      setProfile({
        id: user.id,
        user_id: user.id,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || "",
        bio: "",
        token_identifier: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
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
        setRings([]);
        return;
      }

      const userRings = data
        ?.map((item) => item.rings)
        .filter(Boolean) as Ring[];
      setRings(userRings || []);
    } catch (error) {
      console.error("Error in fetchUserRings:", error);
      setRings([]);
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

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      toast({
        title: "Logged Out Successfully",
        description: "You have been safely logged out of your account.",
        className: "bg-neon-dark border-neon-green text-neon-green",
      });
      // Navigate to home page after logout
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowLogoutDialog(false);
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
              {/* Header */}
              <div className="mb-8 text-center">
                <h1
                  className="text-4xl font-bold text-neon-green glitch-text mb-2"
                  data-text="Settings"
                >
                  Settings
                </h1>
                <div className="h-1 w-32 bg-gradient-to-r from-transparent via-neon-green to-transparent mx-auto animate-pulse" />
                <p className="text-gray-400 mt-4">
                  Manage your account settings and preferences
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <SettingsSection
                  id="profile"
                  title="Profile"
                  description="Manage your profile settings."
                  icon={<User />}
                  children={
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-neon-green mb-2">
                            Full Name
                          </label>
                          <Input
                            className="neon-input"
                            value={profile?.full_name || ""}
                            onChange={(e) =>
                              updateProfile({ full_name: e.target.value })
                            }
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-neon-green mb-2">
                            Username
                          </label>
                          <Input
                            className="neon-input"
                            value={profile?.username || ""}
                            onChange={(e) => {
                              const value = e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9_]/g, "");
                              updateProfile({ username: value });
                            }}
                            placeholder="Enter your username"
                            minLength={3}
                            maxLength={50}
                          />
                          <p className="text-xs text-neon-green/60 mt-1">
                            Username must be 3-50 characters, lowercase letters,
                            numbers, and underscores only
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm text-neon-green mb-2">
                            Email
                          </label>
                          <Input
                            className="neon-input"
                            value={profile?.email || user?.email || ""}
                            disabled
                            placeholder="Email address"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-neon-green mb-2">
                          Bio
                        </label>
                        <textarea
                          className="w-full p-3 bg-neon-gray/80 border border-neon-green/30 rounded-lg text-white placeholder-gray-400 focus:border-neon-green focus:shadow-neon min-h-[80px] resize-none"
                          value={profile?.bio || ""}
                          onChange={(e) =>
                            updateProfile({ bio: e.target.value })
                          }
                          placeholder="Tell us about yourself..."
                          maxLength={200}
                        />
                      </div>
                      <Button
                        className="neon-button w-fit"
                        onClick={() => updateProfile({})}
                        disabled={loading}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "Saving..." : "Save Profile"}
                      </Button>
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
                      <div className="bg-neon-gray/20 p-4 rounded-lg border border-neon-green/20">
                        <h4 className="text-neon-green font-semibold mb-2 flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Password Security
                        </h4>
                        <p className="text-gray-400 text-sm mb-4">
                          Change your password to keep your account secure.
                        </p>
                        <Button
                          className="neon-button"
                          onClick={() => setShowPasswordDialog(true)}
                        >
                          Change Password
                        </Button>
                      </div>
                      <div className="bg-neon-gray/20 p-4 rounded-lg border border-neon-green/20">
                        <h4 className="text-neon-green font-semibold mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Account Security
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">
                              Two-Factor Authentication
                            </span>
                            <Badge
                              variant="outline"
                              className="border-yellow-500/30 text-yellow-400"
                            >
                              Coming Soon
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">
                              Login Sessions
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-neon-green hover:text-neon-green/80"
                            >
                              View Active Sessions
                            </Button>
                          </div>
                        </div>
                      </div>
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
                      <div className="bg-neon-gray/20 p-4 rounded-lg border border-neon-green/20">
                        <h4 className="text-neon-green font-semibold mb-4 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Your Rings ({rings.length})
                        </h4>
                        {rings.length > 0 ? (
                          <div className="space-y-3">
                            {rings.slice(0, 5).map((ring) => (
                              <div
                                key={ring.id}
                                className="flex items-center justify-between p-3 bg-neon-dark/50 rounded-lg border border-neon-green/10"
                              >
                                <div>
                                  <h5 className="text-white font-medium">
                                    {ring.name}
                                  </h5>
                                  <p className="text-gray-400 text-xs">
                                    Created{" "}
                                    {new Date(
                                      ring.created_at,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        `Are you sure you want to leave "${ring.name}"?`,
                                      )
                                    ) {
                                      leaveRing(ring.id);
                                    }
                                  }}
                                >
                                  Leave
                                </Button>
                              </div>
                            ))}
                            {rings.length > 5 && (
                              <p className="text-gray-400 text-sm text-center">
                                And {rings.length - 5} more rings...
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">
                            You haven't joined any rings yet.
                          </p>
                        )}
                      </div>
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
                      <div className="bg-neon-gray/20 p-4 rounded-lg border border-neon-green/20">
                        <h4 className="text-neon-green font-semibold mb-4 flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Theme & Display
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm text-neon-green mb-2">
                              Font Style
                            </label>
                            <Select
                              value={settings.font}
                              onValueChange={(
                                value: "robotic" | "clean" | "hacker",
                              ) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  font: value,
                                }))
                              }
                            >
                              <SelectTrigger className="neon-input">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-neon-gray/95 backdrop-blur-md border-neon-green/30">
                                <SelectItem value="robotic">
                                  🤖 Robotic (Mono)
                                </SelectItem>
                                <SelectItem value="clean">
                                  ✨ Clean (Sans)
                                </SelectItem>
                                <SelectItem value="hacker">
                                  💻 Hacker (Terminal)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm text-neon-green font-medium">
                                Animated Background
                              </label>
                              <p className="text-xs text-gray-400">
                                Enable particle effects and animations
                              </p>
                            </div>
                            <Switch
                              checked={settings.animated_bg}
                              onCheckedChange={(checked) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  animated_bg: checked,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <Button
                          className="neon-button mt-4"
                          onClick={saveUserSettings}
                          disabled={loading}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {loading ? "Saving..." : "Save Preferences"}
                        </Button>
                      </div>
                    </div>
                  }
                />
                <SettingsSection
                  id="account"
                  title="Account"
                  description="Manage your account and session."
                  icon={<LogOut />}
                  children={
                    <div className="flex flex-col gap-4">
                      <div className="bg-neon-gray/20 p-4 rounded-lg border border-neon-green/20">
                        <h4 className="text-neon-green font-semibold mb-2 flex items-center gap-2">
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </h4>
                        <p className="text-gray-400 text-sm mb-4">
                          Safely log out of your account and end your current
                          session.
                        </p>
                        <Button
                          className="neon-button"
                          onClick={() => setShowLogoutDialog(true)}
                          disabled={loading}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          {loading ? "Signing Out..." : "Sign Out"}
                        </Button>
                      </div>
                    </div>
                  }
                />
                <SettingsSection
                  id="danger"
                  title="Danger Zone"
                  description="Irreversible and destructive actions."
                  icon={<Trash2 />}
                  danger={true}
                  children={
                    <div className="flex flex-col gap-4">
                      <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                        <h4 className="text-red-400 font-semibold mb-4 flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Export Data
                        </h4>
                        <p className="text-gray-400 text-sm mb-4">
                          Download all your data including links, rings, and
                          settings.
                        </p>
                        <Button
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          onClick={exportUserData}
                          disabled={loading}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {loading ? "Exporting..." : "Export Data"}
                        </Button>
                      </div>
                      <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                        <h4 className="text-red-400 font-semibold mb-4 flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </h4>
                        <p className="text-gray-400 text-sm mb-4">
                          Permanently delete your account and all associated
                          data. This action cannot be undone.
                        </p>
                        <Button
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => setShowDeleteDialog(true)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  }
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-neon-dark border-red-500/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This action cannot be undone. All your data will be permanently
              deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-red-400 mb-2">
                Type "DELETE MY ACCOUNT" to confirm:
              </label>
              <Input
                className="border-red-500/30 focus:border-red-500"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmText("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteAccount}
              disabled={loading || deleteConfirmText !== "DELETE MY ACCOUNT"}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-neon-dark border-neon-green/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-neon-green flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Update your password to keep your account secure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Password changes are handled through your email. You'll receive a
              secure link to update your password.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="neon-button"
              onClick={async () => {
                try {
                  await supabase.auth.resetPasswordForEmail(user?.email || "", {
                    redirectTo: `${window.location.origin}/reset-password`,
                  });
                  toast({
                    title: "Password Reset Email Sent",
                    description:
                      "Check your email for password reset instructions.",
                    className: "bg-neon-dark border-neon-green text-neon-green",
                  });
                  setShowPasswordDialog(false);
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to send password reset email.",
                    variant: "destructive",
                  });
                }
              }}
            >
              Send Reset Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="bg-neon-dark border-neon-green/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-neon-green flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Sign Out
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to sign out of your account?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-neon-gray/20 p-4 rounded-lg border border-neon-green/20">
              <p className="text-gray-300 text-sm">
                You will be safely logged out and redirected to the home page.
                Your data will remain secure.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="neon-button"
              onClick={handleLogout}
              disabled={loading}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {loading ? "Signing Out..." : "Sign Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
