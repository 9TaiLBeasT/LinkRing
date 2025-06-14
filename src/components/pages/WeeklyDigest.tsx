import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Sidebar, { SidebarToggle } from "@/components/dashboard/layout/Sidebar";
import {
  Calendar,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Crown,
  Flame,
  Target,
  Zap,
  Trophy,
  Star,
  Eye,
  Link,
  Activity,
  Hash,
  ArrowUp,
  ArrowDown,
  History,
  Gift,
  Brain,
  Globe,
  ChevronRight,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const WeeklyDigest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const fetchWeeklyData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const weekAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();

      // Fetch user's weekly stats
      const [linksData, savedLinksData, ringsData] = await Promise.all([
        supabase
          .from("shared_links")
          .select("*")
          .eq("user_id", user.id)
          .gte("created_at", weekAgo),
        supabase
          .from("saved_links")
          .select("*, shared_links(*)")
          .eq("user_id", user.id)
          .gte("created_at", weekAgo),
        supabase
          .from("ring_members")
          .select("ring_id, rings(name)")
          .eq("user_id", user.id),
      ]);

      const linksShared = linksData.data?.length || 0;
      const reactionsReceived = savedLinksData.data?.length || 0;
      const ringsActiveIn = ringsData.data?.length || 0;

      // Calculate actual streak days
      let streakDays = 0;
      if (linksData.data && linksData.data.length > 0) {
        const allUserLinks = await supabase
          .from("shared_links")
          .select("created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (allUserLinks.data) {
          const linkDates = allUserLinks.data.map((link) =>
            new Date(link.created_at).toDateString(),
          );
          const uniqueDates = [...new Set(linkDates)];

          let currentStreak = 0;
          const today = new Date();

          for (let i = 0; i < uniqueDates.length; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);

            if (uniqueDates.includes(checkDate.toDateString())) {
              currentStreak++;
            } else {
              break;
            }
          }

          streakDays = currentStreak;
        }
      }

      // Find top link (most saved)
      let topLink = null;
      if (linksData.data && linksData.data.length > 0) {
        const linkPopularity: { [key: string]: number } = {};
        const { data: allSavedLinks } = await supabase
          .from("saved_links")
          .select("link_id")
          .in(
            "link_id",
            linksData.data.map((l) => l.id),
          );

        allSavedLinks?.forEach((saved) => {
          linkPopularity[saved.link_id] =
            (linkPopularity[saved.link_id] || 0) + 1;
        });

        topLink = linksData.data.reduce((best, current) => {
          const currentScore = linkPopularity[current.id] || 0;
          const bestScore = linkPopularity[best?.id] || 0;
          return currentScore > bestScore ? current : best;
        }, linksData.data[0]);
      }

      // Find most loved link user interacted with
      let mostLovedLink = null;
      if (savedLinksData.data && savedLinksData.data.length > 0) {
        mostLovedLink = savedLinksData.data[0]?.shared_links;
      }

      // Fetch ring activity data - include privacy info
      let ringActivity = [];
      if (ringsData.data && ringsData.data.length > 0) {
        const ringIds = ringsData.data.map((r) => r.ring_id);

        const [ringLinksData, ringMembersData, ringDetailsData] =
          await Promise.all([
            supabase
              .from("shared_links")
              .select("ring_id, created_at")
              .in("ring_id", ringIds)
              .gte("created_at", weekAgo),
            supabase
              .from("ring_members")
              .select("ring_id")
              .in("ring_id", ringIds),
            supabase.from("rings").select("id, is_public").in("id", ringIds),
          ]);

        ringActivity = ringsData.data.map((ring) => {
          const linksThisWeek =
            ringLinksData.data?.filter((l) => l.ring_id === ring.ring_id)
              .length || 0;
          const totalMembers =
            ringMembersData.data?.filter((m) => m.ring_id === ring.ring_id)
              .length || 0;
          const ringDetails = ringDetailsData.data?.find(
            (r) => r.id === ring.ring_id,
          );

          return {
            ...ring,
            linksThisWeek,
            totalMembers,
            is_public: ringDetails?.is_public || false,
            activityLevel:
              linksThisWeek > 5 ? "high" : linksThisWeek > 2 ? "medium" : "low",
          };
        });
      }

      // Fetch trending tags from user's links
      let trendingTags = [];
      if (linksData.data && linksData.data.length > 0) {
        // Extract tags from descriptions and titles
        const tagCounts: { [key: string]: number } = {};

        linksData.data.forEach((link) => {
          const text = `${link.title} ${link.description || ""}`;
          const words = text.toLowerCase().match(/\b\w+\b/g) || [];

          words.forEach((word) => {
            if (word.length > 3) {
              // Only count meaningful words
              tagCounts[word] = (tagCounts[word] || 0) + 1;
            }
          });
        });

        trendingTags = Object.entries(tagCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([tag, count]) => ({ tag, count }));
      }

      // Fetch top friends (most active ring members)
      let topFriends = [];
      if (ringsData.data && ringsData.data.length > 0) {
        const ringIds = ringsData.data.map((r) => r.ring_id);

        const { data: friendsActivity } = await supabase
          .from("shared_links")
          .select("user_id, ring_id")
          .in("ring_id", ringIds)
          .gte("created_at", weekAgo)
          .neq("user_id", user.id);

        if (friendsActivity) {
          const friendCounts: { [key: string]: number } = {};

          friendsActivity.forEach((activity) => {
            friendCounts[activity.user_id] =
              (friendCounts[activity.user_id] || 0) + 1;
          });

          const topUserIds = Object.entries(friendCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([userId]) => userId);

          // Get user details for top friends - use fallback since admin API requires service key
          if (topUserIds.length > 0) {
            try {
              const friendsData = topUserIds.map((userId) => {
                return {
                  id: userId,
                  name: `User ${userId.slice(-4)}`,
                  email: null,
                  linksShared: friendCounts[userId],
                  avatar_url: null,
                };
              });
              topFriends = friendsData;
            } catch (error) {
              console.warn("Failed to fetch friend details:", error);
            }
          }
        }
      }

      // Calculate user rank
      let currentRank = 0;
      let rankChange = 0;
      try {
        const { data: allUsersActivity } = await supabase
          .from("shared_links")
          .select("user_id")
          .gte("created_at", weekAgo);

        if (allUsersActivity) {
          const userCounts: { [key: string]: number } = {};
          allUsersActivity.forEach((activity) => {
            userCounts[activity.user_id] =
              (userCounts[activity.user_id] || 0) + 1;
          });

          const sortedUsers = Object.entries(userCounts).sort(
            ([, a], [, b]) => b - a,
          );

          const userRankIndex = sortedUsers.findIndex(
            ([userId]) => userId === user.id,
          );
          currentRank = userRankIndex >= 0 ? userRankIndex + 1 : 0;
        }
      } catch (error) {
        console.warn("Failed to calculate rank:", error);
      }

      const hasActivity =
        linksShared > 0 || reactionsReceived > 0 || ringsActiveIn > 0;

      setWeeklyData({
        weekRange: "This Week",
        userStats: {
          linksShared,
          reactionsReceived,
          ringsActiveIn,
          badgesEarned: Math.floor(linksShared / 5),
          streakDays,
          rankChange,
          currentRank,
        },
        hasActivity,
        topLink,
        mostLovedLink,
        ringActivity,
        trendingTags,
        topFriends,
      });
    } catch (error: any) {
      console.error("Error fetching weekly data:", error);
      toast({
        title: "Error",
        description: "Failed to load weekly data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (user) {
      fetchWeeklyData();
    }
  }, [user]);

  const [weeklyData, setWeeklyData] = useState({
    weekRange: "This Week",
    userStats: {
      linksShared: 0,
      reactionsReceived: 0,
      ringsActiveIn: 0,
      badgesEarned: 0,
      streakDays: 0,
      rankChange: 0,
      currentRank: 0,
    },
    hasActivity: false,
    topLink: null as any,
    mostLovedLink: null as any,
    ringActivity: [] as any[],
    trendingTags: [] as any[],
    topFriends: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  const getActivityColor = (level: string) => {
    switch (level) {
      case "high":
        return "border-neon-green/50 bg-neon-green/10";
      case "medium":
        return "border-yellow-500/50 bg-yellow-500/10";
      case "low":
        return "border-red-500/50 bg-red-500/10";
      default:
        return "border-gray-500/50 bg-gray-500/10";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="h-3 w-3 text-neon-green" />;
      case "down":
        return <ArrowDown className="h-3 w-3 text-red-500" />;
      default:
        return <div className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-neon-dark text-white font-mono flex">
      <SidebarToggle
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <Sidebar
        activeItem="Weekly Digest"
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main
        className={cn(
          "flex-1 overflow-auto transition-all duration-300 ease-in-out",
          isMobile ? "w-full" : sidebarOpen ? "ml-0" : "-ml-[280px]",
        )}
      >
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            isMobile ? "px-4 pt-16" : "px-6 pt-6",
          )}
        >
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Neon Header with Wave Animation */}
            <div className="text-center space-y-4 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-green/10 via-transparent to-neon-green/10 animate-pulse" />
              <div className="relative">
                <h1 className="text-5xl font-bold text-neon-green mb-2 animate-glow">
                  Week in Links
                </h1>
                <p className="text-2xl text-gray-300 font-light">
                  {weeklyData.weekRange}
                </p>
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-neon-green/70">
                  <Calendar className="h-4 w-4" />
                  <span>Your digital journey recap</span>
                </div>
              </div>
            </div>

            {/* User Stats Panel */}
            <Card className="bg-gradient-to-br from-neon-gray/50 to-neon-dark/50 border-neon-green/30 shadow-neon">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neon-green">
                  <Activity className="h-5 w-5" />
                  Your Weekly Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-neon-dark/50 p-4 rounded-xl border border-neon-green/20 hover:border-neon-green/40 transition-all group">
                    <div className="flex items-center gap-3">
                      <Link className="h-6 w-6 text-neon-green group-hover:animate-pulse" />
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {weeklyData.userStats.linksShared}
                        </div>
                        <div className="text-xs text-gray-400">
                          Links Shared
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-neon-dark/50 p-4 rounded-xl border border-neon-green/20 hover:border-neon-green/40 transition-all group">
                    <div className="flex items-center gap-3">
                      <Heart className="h-6 w-6 text-red-500 group-hover:animate-pulse" />
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {weeklyData.userStats.reactionsReceived}
                        </div>
                        <div className="text-xs text-gray-400">Reactions</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-neon-dark/50 p-4 rounded-xl border border-neon-green/20 hover:border-neon-green/40 transition-all group">
                    <div className="flex items-center gap-3">
                      <Flame className="h-6 w-6 text-orange-500 group-hover:animate-pulse" />
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {weeklyData.userStats.streakDays}
                        </div>
                        <div className="text-xs text-gray-400">Day Streak</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-neon-dark/50 p-4 rounded-xl border border-neon-green/20 hover:border-neon-green/40 transition-all group">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-6 w-6 text-yellow-500 group-hover:animate-pulse" />
                      <div>
                        <div className="text-2xl font-bold text-white">
                          #{weeklyData.userStats.currentRank}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          Rank
                          {weeklyData.userStats.rankChange > 0 && (
                            <ArrowUp className="h-3 w-3 text-neon-green" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
              <Card className="bg-neon-gray/50 border-neon-green/30">
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="h-8 w-8 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin mx-auto" />
                    <p className="text-gray-300">
                      Loading your weekly summary...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Activity Message */}
            {!loading && !weeklyData.hasActivity && (
              <Card className="bg-gradient-to-r from-neon-green/10 to-blue-500/10 border-neon-green/30">
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-2xl font-bold text-neon-green">
                      Your Weekly Summary
                    </h3>
                    <p className="text-gray-300 text-lg max-w-md mx-auto">
                      Start sharing links and engaging with your rings to see
                      your weekly activity here!
                    </p>
                    <Button
                      className="neon-button mt-6"
                      onClick={() => navigate("/dashboard")}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Share Your First Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Content - Show when has data */}
            {!loading && weeklyData.hasActivity && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Shared Link */}
                <Card className="bg-neon-gray/50 border-neon-green/20 hover:border-neon-green/40 transition-all group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-neon-green">
                      <TrendingUp className="h-5 w-5" />
                      🏆 Your Top Link
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Most reactions on your shared content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {weeklyData.topLink ? (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-white truncate">
                          {weeklyData.topLink.title}
                        </h4>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {weeklyData.topLink.description || "No description"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-neon-green">
                          <Heart className="h-3 w-3" />
                          <span>Most popular this week</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-400">
                        <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No links shared this week</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Most Loved Link */}
                <Card className="bg-neon-gray/50 border-neon-green/20 hover:border-neon-green/40 transition-all group">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-neon-green">
                      <Eye className="h-5 w-5" />
                      ❤️ Most Loved Link You Saved
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      The link you saved this week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {weeklyData.mostLovedLink ? (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-white truncate">
                          {weeklyData.mostLovedLink.title}
                        </h4>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {weeklyData.mostLovedLink.description ||
                            "No description"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-red-400">
                          <Heart className="h-3 w-3" />
                          <span>Saved by you</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-400">
                        <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No links saved this week</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Ring Activity Snapshot */}
            <Card className="bg-neon-gray/50 border-neon-green/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neon-green">
                  <Users className="h-5 w-5" />
                  Ring Activity Snapshot
                </CardTitle>
                <CardDescription className="text-gray-400">
                  How your rings performed this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                {weeklyData.ringActivity.length > 0 ? (
                  <div className="space-y-4">
                    {weeklyData.ringActivity.map((ring: any) => (
                      <div
                        key={ring.ring_id}
                        className={cn(
                          "p-4 rounded-xl border transition-all",
                          getActivityColor(ring.activityLevel),
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-white">
                                {ring.rings?.name || "Unknown Ring"}
                              </h4>
                              {ring.is_public ? (
                                <Globe className="h-4 w-4 text-neon-green" />
                              ) : (
                                <Lock className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                            <p className="text-sm text-gray-400">
                              {ring.totalMembers} members • {ring.linksThisWeek}{" "}
                              links this week •{" "}
                              {ring.is_public ? "Public" : "Private"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                ring.activityLevel === "high"
                                  ? "border-neon-green text-neon-green"
                                  : ring.activityLevel === "medium"
                                    ? "border-yellow-500 text-yellow-500"
                                    : "border-red-500 text-red-500",
                              )}
                            >
                              {ring.activityLevel} activity
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No ring activity this week</p>
                    <p className="text-sm">
                      Join or create rings to see activity here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Trending Tags */}
              <Card className="bg-neon-gray/50 border-neon-green/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-neon-green">
                    <Hash className="h-5 w-5" />
                    Your Trending Tags
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Most common words from your shared content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {weeklyData.trendingTags.length > 0 ? (
                    <div className="space-y-3">
                      {weeklyData.trendingTags.map(
                        (tag: any, index: number) => (
                          <div
                            key={tag.tag}
                            className="flex items-center justify-between p-3 bg-neon-dark/50 rounded-lg border border-neon-green/20"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-neon-green font-bold text-lg">
                                #{index + 1}
                              </div>
                              <div>
                                <span className="text-white font-medium capitalize">
                                  {tag.tag}
                                </span>
                                <p className="text-xs text-gray-400">
                                  appeared {tag.count} times
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="border-neon-green/30 text-neon-green"
                            >
                              {tag.count}x
                            </Badge>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400">
                      <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No trending words this week</p>
                      <p className="text-sm mt-2">
                        Share more links to see patterns
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Friends */}
              <Card className="bg-neon-gray/50 border-neon-green/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-neon-green">
                    <Crown className="h-5 w-5" />
                    Top Friends This Week
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Most active members in your rings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {weeklyData.topFriends.length > 0 ? (
                    <div className="space-y-3">
                      {weeklyData.topFriends.map(
                        (friend: any, index: number) => (
                          <div
                            key={friend.id}
                            className="flex items-center gap-4 p-3 bg-neon-dark/50 rounded-lg border border-neon-green/20"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="text-neon-green font-bold text-lg">
                                #{index + 1}
                              </div>
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-neon-green/20 to-blue-500/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-neon-green">
                                  {friend.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {friend.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {friend.linksShared} links shared
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="border-neon-green/30 text-neon-green"
                            >
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {friend.linksShared}
                            </Badge>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-400">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No friend activity to show</p>
                      <p className="text-sm mt-2">
                        Join rings to see active members
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Streak Status */}
            <Card className="bg-gradient-to-br from-orange-500/20 via-red-500/10 to-pink-500/20 border-orange-500/40 rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-pulse" />
                    <Flame className="h-12 w-12 text-orange-500 relative z-10" />
                  </div>
                  <div className="flex-1">
                    {weeklyData.userStats.streakDays > 0 ? (
                      <>
                        <h3 className="text-2xl font-bold text-orange-400 mb-2">
                          🔥 {weeklyData.userStats.streakDays} Day Streak!
                        </h3>
                        <p className="text-gray-300 text-lg mb-4">
                          Keep it up! You've shared links for{" "}
                          {weeklyData.userStats.streakDays} consecutive days.
                        </p>
                        <div className="flex gap-2 mb-4">
                          {Array.from({ length: 7 }, (_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "h-3 w-10 rounded-full border",
                                i < weeklyData.userStats.streakDays
                                  ? "bg-orange-500 border-orange-400"
                                  : "bg-gray-600/50 border-gray-500/30",
                              )}
                            />
                          ))}
                        </div>
                        <Button
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 rounded-xl px-6 py-2"
                          onClick={() => navigate("/post")}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Continue Streak
                        </Button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-2xl font-bold text-orange-400 mb-2">
                          Start Your Sharing Streak!
                        </h3>
                        <p className="text-gray-300 text-lg mb-4">
                          Share your first link to begin building your daily
                          streak.
                        </p>
                        <div className="flex gap-2 mb-4">
                          {Array.from({ length: 7 }, (_, i) => (
                            <div
                              key={i}
                              className="h-3 w-10 rounded-full bg-gray-600/50 border border-gray-500/30"
                            />
                          ))}
                        </div>
                        <Button
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 rounded-xl px-6 py-2"
                          onClick={() => navigate("/post")}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Share First Link
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Insights */}
            <Card className="bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-cyan-500/20 border-purple-500/40 rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-pulse" />
                    <Brain className="h-12 w-12 text-purple-400 relative z-10" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-purple-400 mb-3">
                      Weekly Insights
                    </h3>
                    {weeklyData.hasActivity ? (
                      <>
                        <p className="text-gray-300 text-lg mb-4">
                          Based on your activity this week, here are your
                          insights:
                        </p>
                        <div className="space-y-3 mb-4">
                          {weeklyData.userStats.linksShared > 0 && (
                            <div className="flex items-center gap-2 text-sm text-purple-300">
                              <Target className="h-4 w-4" />
                              <span>
                                You shared {weeklyData.userStats.linksShared}{" "}
                                links across{" "}
                                {weeklyData.userStats.ringsActiveIn} rings
                              </span>
                            </div>
                          )}
                          {weeklyData.userStats.reactionsReceived > 0 && (
                            <div className="flex items-center gap-2 text-sm text-purple-300">
                              <Heart className="h-4 w-4" />
                              <span>
                                Your content received{" "}
                                {weeklyData.userStats.reactionsReceived}{" "}
                                reactions
                              </span>
                            </div>
                          )}
                          {weeklyData.trendingTags.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-purple-300">
                              <Hash className="h-4 w-4" />
                              <span>
                                Top interest: {weeklyData.trendingTags[0]?.tag}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <span>
                              {weeklyData.userStats.ringsActiveIn} sources
                              explored
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            <span>
                              {Math.min(weeklyData.userStats.linksShared, 5)}{" "}
                              insights generated
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-300 text-lg mb-4">
                          Your personalized insights will appear here once you
                          start sharing and engaging with content.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <span>0 sources explored</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            <span>0 insights generated</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rank Status */}
            <Card className="bg-gradient-to-br from-neon-green/20 via-blue-500/10 to-teal-500/20 border-neon-green/40 rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-neon-green/20 rounded-full animate-pulse" />
                    <Trophy className="h-12 w-12 text-neon-green relative z-10" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-neon-green mb-3">
                      Your Ranking Journey
                    </h3>
                    {weeklyData.userStats.currentRank > 0 ? (
                      <>
                        <p className="text-gray-300 text-lg mb-4">
                          You're currently ranked #
                          {weeklyData.userStats.currentRank} this week!
                          {weeklyData.userStats.rankChange > 0 && (
                            <span className="text-neon-green ml-2">
                              ↗️ Up {weeklyData.userStats.rankChange} spots
                            </span>
                          )}
                          {weeklyData.userStats.rankChange < 0 && (
                            <span className="text-red-400 ml-2">
                              ↘️ Down{" "}
                              {Math.abs(weeklyData.userStats.rankChange)} spots
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="bg-neon-dark/50 px-4 py-2 rounded-xl border border-neon-green/30">
                            <span className="text-neon-green font-bold text-lg">
                              #{weeklyData.userStats.currentRank}
                            </span>
                          </div>
                          <Button
                            className="bg-gradient-to-r from-neon-green/20 to-blue-500/20 hover:from-neon-green/30 hover:to-blue-500/30 text-neon-green border border-neon-green/30 rounded-xl"
                            onClick={() => navigate("/leaderboard")}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            View Leaderboard
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-300 text-lg mb-4">
                          Start sharing links and engaging with your community
                          to climb the leaderboard!
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="bg-neon-dark/50 px-4 py-2 rounded-xl border border-neon-green/30">
                            <span className="text-neon-green font-bold text-lg">
                              Unranked
                            </span>
                          </div>
                          <Button
                            className="bg-gradient-to-r from-neon-green/20 to-blue-500/20 hover:from-neon-green/30 hover:to-blue-500/30 text-neon-green border border-neon-green/30 rounded-xl"
                            onClick={() => navigate("/leaderboard")}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            View Leaderboard
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Link History CTA */}
            <Card className="bg-gradient-to-br from-neon-green/10 via-transparent to-blue-500/10 border-neon-green/30 hover:border-neon-green/50 transition-all group cursor-pointer rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-neon-green/10 rounded-full animate-pulse" />
                      <History className="h-12 w-12 text-neon-green relative z-10" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-neon-green mb-2">
                        Explore Your Link History
                      </h3>
                      <p className="text-gray-300 text-lg">
                        {weeklyData.userStats.linksShared > 0
                          ? `You've shared ${weeklyData.userStats.linksShared} links this week. View your complete archive!`
                          : "Dive into your complete archive of shared links and discoveries"}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-neon-green/20 to-blue-500/20 hover:from-neon-green/30 hover:to-blue-500/30 text-neon-green border border-neon-green/30 rounded-xl px-6 py-3 group-hover:scale-105 transition-all"
                    onClick={() => navigate("/saved-links")}
                  >
                    <History className="h-5 w-5 mr-2" />
                    View All Links
                    <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WeeklyDigest;
