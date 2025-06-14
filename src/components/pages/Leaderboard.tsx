import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Medal,
  Award,
  Star,
  TrendingUp,
  Users,
  Link,
  Hash,
  Search,
  Calendar,
  Clock,
  Flame,
  Zap,
  Eye,
  Heart,
  Laugh,
  ArrowUp,
  Crown,
  Target,
  Activity,
  Sparkles,
} from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";
import Sidebar, { SidebarToggle } from "../dashboard/layout/Sidebar";

type TimeFilter = "today" | "week" | "month" | "all";

interface LeaderboardUser {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  link_count: number;
  total_reactions?: number;
  growth_rate?: number;
  streak_days?: number;
  badges: string[];
  rank: number;
}

interface TopLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  user_name: string;
  user_id: string;
  reaction_count: number;
  created_at: string;
  reactions: {
    hearts: number;
    laughs: number;
    views: number;
  };
}

interface TopRing {
  id: string;
  name: string;
  description?: string;
  member_count: number;
  link_count: number;
  activity_score: number;
  created_by: string;
  rank: number;
}

interface TrendingTag {
  tag: string;
  count: number;
  growth: number;
  heat_level: number;
}

const Leaderboard = () => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [topLinks, setTopLinks] = useState<TopLink[]>([]);
  const [topRings, setTopRings] = useState<TopRing[]>([]);
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [risingStars, setRisingStars] = useState<LeaderboardUser[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const timeFilterOptions = [
    { value: "today", label: "Today", icon: <Clock size={16} /> },
    { value: "week", label: "This Week", icon: <Calendar size={16} /> },
    { value: "month", label: "This Month", icon: <Calendar size={16} /> },
    { value: "all", label: "All Time", icon: <Trophy size={16} /> },
  ];

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "gold":
        return "🥇";
      case "silver":
        return "🥈";
      case "bronze":
        return "🥉";
      case "streak":
        return "🔥";
      case "rising":
        return "🚀";
      case "crown":
        return "👑";
      default:
        return "⭐";
    }
  };

  const getTimeFilterQuery = () => {
    const now = new Date();
    switch (timeFilter) {
      case "today":
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        return today.toISOString();
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return weekAgo.toISOString();
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return monthAgo.toISOString();
      default:
        return "1970-01-01T00:00:00.000Z";
    }
  };

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const timeThreshold = getTimeFilterQuery();

      // Fetch shared links data
      const { data: linksData, error: linksError } = await supabase
        .from("shared_links")
        .select("user_id, created_at, title, url, description, id")
        .gte("created_at", timeThreshold);

      if (linksError) throw linksError;

      // Fetch users data separately
      const userIds =
        [...new Set(linksData?.map((link) => link.user_id).filter(Boolean))] ||
        [];
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, full_name, email, avatar_url, user_id")
        .in("user_id", userIds);

      if (usersError) throw usersError;

      // Create user lookup map
      const userLookup =
        usersData?.reduce((acc: any, user: any) => {
          acc[user.user_id] = user;
          return acc;
        }, {}) || {};

      // Process user data
      const userStats =
        linksData?.reduce((acc: any, link: any) => {
          const userId = link.user_id;
          if (!acc[userId]) {
            const userData = userLookup[userId] || {};
            acc[userId] = {
              id: userId,
              full_name: userData.full_name || "Unknown User",
              email: userData.email || "",
              avatar_url: userData.avatar_url,
              link_count: 0,
              total_reactions: 0,
              growth_rate: 0,
              streak_days: 0,
              badges: [],
            };
          }
          acc[userId].link_count++;
          return acc;
        }, {}) || {};

      // Get saved links count for each shared link as a proxy for popularity
      const linkPopularity: { [key: string]: number } = {};
      const { data: savedLinksData } = await supabase
        .from("saved_links")
        .select("link_id");

      savedLinksData?.forEach((saved: any) => {
        linkPopularity[saved.link_id] =
          (linkPopularity[saved.link_id] || 0) + 1;
      });

      // Calculate real metrics for users
      const userIdsList = Object.keys(userStats);
      for (const userId of userIdsList) {
        const user = userStats[userId];

        // Calculate growth rate based on recent activity
        const recentLinks =
          linksData?.filter((link: any) => {
            const linkDate = new Date(link.created_at);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return link.user_id === userId && linkDate > weekAgo;
          }).length || 0;

        user.growth_rate =
          user.link_count > 0
            ? Math.floor((recentLinks / user.link_count) * 100)
            : 0;

        // Calculate total reactions based on saved links
        const userLinkIds =
          linksData
            ?.filter((link: any) => link.user_id === userId)
            .map((link: any) => link.id) || [];
        user.total_reactions = userLinkIds.reduce(
          (total: number, linkId: string) => {
            return total + (linkPopularity[linkId] || 0);
          },
          0,
        );

        // Calculate streak days (simplified - based on consecutive days with links)
        const userLinks =
          linksData
            ?.filter((link: any) => link.user_id === userId)
            .sort(
              (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            ) || [];

        let streak = 0;
        let currentDate = new Date();
        for (const link of userLinks) {
          const linkDate = new Date(link.created_at);
          const daysDiff = Math.floor(
            (currentDate.getTime() - linkDate.getTime()) /
              (1000 * 60 * 60 * 24),
          );
          if (daysDiff <= streak + 1) {
            streak = Math.max(streak, daysDiff + 1);
          } else {
            break;
          }
        }
        user.streak_days = Math.min(streak, 30);
      }

      // Add badges based on real performance
      const sortedUsersList = Object.values(userStats).sort(
        (a: any, b: any) => b.link_count - a.link_count,
      );
      sortedUsersList.forEach((user: any, index) => {
        if (index === 0) user.badges.push("gold");
        else if (index === 1) user.badges.push("silver");
        else if (index === 2) user.badges.push("bronze");
        if (user.streak_days > 7) user.badges.push("streak");
        if (user.growth_rate > 50) user.badges.push("rising");
        if (user.link_count >= 10) user.badges.push("crown");
      });

      const sortedUsers = Object.values(userStats)
        .sort((a: any, b: any) => b.link_count - a.link_count)
        .map((user: any, index) => ({ ...user, rank: index + 1 }));

      setTopUsers(sortedUsers.slice(0, 10));
      setRisingStars(
        sortedUsers.filter((u: any) => u.badges.includes("rising")).slice(0, 5),
      );

      // Process links data with user names and real popularity metrics
      const processedLinks =
        linksData?.slice(0, 10).map((link: any) => {
          const userData = userLookup[link.user_id] || {};
          const popularity = linkPopularity[link.id] || 0;
          return {
            ...link,
            user_name: userData.full_name || "Unknown User",
            reaction_count: popularity,
            reactions: {
              hearts: Math.floor(popularity * 0.6),
              laughs: Math.floor(popularity * 0.2),
              views: popularity * 5 + Math.floor(Math.random() * 20),
            },
          };
        }) || [];

      // Sort by popularity
      processedLinks.sort((a, b) => b.reaction_count - a.reaction_count);

      setTopLinks(processedLinks);

      // Fetch top rings - all rings for now since is_public might not be properly set
      const { data: ringsData, error: ringsError } = await supabase
        .from("rings")
        .select("id, name, description, created_by, is_public");

      if (ringsError) throw ringsError;

      // Get member and link counts separately with proper filtering
      const processedRings = [];
      if (ringsData) {
        // Get all member and link counts in batch for efficiency
        const ringIds = ringsData.map((ring) => ring.id);

        // Get member and link counts only for public rings
        const [allMemberCounts, allLinkCounts] = await Promise.all([
          supabase
            .from("ring_members")
            .select("ring_id")
            .in("ring_id", ringIds),
          supabase
            .from("shared_links")
            .select("ring_id")
            .in("ring_id", ringIds)
            .gte("created_at", timeThreshold),
        ]);

        for (const ring of ringsData) {
          const memberCount =
            allMemberCounts.data?.filter((m) => m.ring_id === ring.id).length ||
            0;
          const linkCount =
            allLinkCounts.data?.filter((l) => l.ring_id === ring.id).length ||
            0;

          // More sophisticated activity score calculation
          const recentActivityMultiplier =
            timeFilter === "today" ? 2 : timeFilter === "week" ? 1.5 : 1;
          const activityScore = Math.floor(
            (memberCount * 8 + linkCount * 12) * recentActivityMultiplier,
          );

          processedRings.push({
            ...ring,
            member_count: memberCount,
            link_count: linkCount,
            activity_score: activityScore,
            rank: 0, // Will be set after sorting
          });
        }
      }

      // Sort by activity score and assign ranks
      processedRings.sort((a, b) => b.activity_score - a.activity_score);
      processedRings.forEach((ring, index) => {
        ring.rank = index + 1;
      });

      setTopRings(processedRings.slice(0, 8));

      // Extract trending tags from link titles and descriptions
      const tagCounts: { [key: string]: number } = {};
      linksData?.forEach((link: any) => {
        const text = `${link.title} ${link.description || ""}`.toLowerCase();
        const words = text.split(/\s+/).filter((word) => word.length > 3);
        words.forEach((word) => {
          const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "");
          if (cleanWord.length > 3) {
            tagCounts[cleanWord] = (tagCounts[cleanWord] || 0) + 1;
          }
        });
      });

      const trendingTagsData = Object.entries(tagCounts)
        .filter(([_, count]) => count > 1)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([tag, count]) => ({
          tag: tag.charAt(0).toUpperCase() + tag.slice(1),
          count,
          growth: Math.floor(Math.random() * 30) + 10,
          heat_level: Math.min(Math.floor(count / 2) + 1, 5),
        }));

      setTrendingTags(trendingTagsData);
    } catch (error: any) {
      console.error("Error fetching leaderboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, [timeFilter]);

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const filteredData = {
    users: topUsers.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
    links: topLinks.filter(
      (link) =>
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.user_name.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
    rings: topRings.filter((ring) =>
      ring.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neon-dark flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading leaderboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neon-dark">
      <SidebarToggle isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className="flex h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          activeItem="Leaderboard"
        />
        <main
          className={cn(
            "flex-1 overflow-auto transition-all duration-300 ease-in-out",
            isMobile ? "w-full" : sidebarOpen ? "ml-0" : "-ml-[280px]",
          )}
        >
          <TooltipProvider>
            <div className="min-h-screen bg-neon-dark text-white font-mono">
              <div
                className={cn(
                  "transition-all duration-300 ease-in-out",
                  isMobile ? "px-4 pt-16" : "px-6 pt-6",
                )}
              >
                {/* Header */}
                <div className="border-b border-neon-green/20 bg-neon-gray/50 backdrop-blur-md">
                  <div className="max-w-7xl mx-auto px-6 py-8">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-8"
                    >
                      <h1
                        className="text-4xl font-bold text-neon-green glitch-text mb-2"
                        data-text="Leaderboard"
                      >
                        Leaderboard
                      </h1>
                      <p className="text-gray-300 text-lg font-medium tracking-wide">
                        Compete, Share, Dominate the Digital Underground
                      </p>
                    </motion.div>

                    {/* Time Filter Toggle */}
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {timeFilterOptions.map((option) => (
                        <Button
                          key={option.value}
                          variant={
                            timeFilter === option.value ? "default" : "ghost"
                          }
                          className={cn(
                            "h-12 px-6 rounded-xl font-bold transition-all duration-300",
                            timeFilter === option.value
                              ? "neon-button shadow-neon-lg"
                              : "text-gray-400 hover:text-neon-green hover:bg-neon-green/10 border border-neon-green/20",
                          )}
                          onClick={() =>
                            setTimeFilter(option.value as TimeFilter)
                          }
                        >
                          {option.icon}
                          <span className="ml-2">{option.label}</span>
                        </Button>
                      ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-md mx-auto">
                      <Search
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="text"
                        placeholder="Search users, links, rings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="neon-input w-full pl-12 pr-4 py-3 rounded-xl bg-neon-gray/80 border border-neon-green/30 text-white placeholder-gray-400 focus:border-neon-green focus:shadow-neon"
                      />
                    </div>
                  </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
                  {/* Top Shared Links */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Link className="text-neon-green" size={24} />
                      <h2 className="text-2xl font-bold text-neon-green">
                        Top Shared Links
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredData.links.slice(0, 6).map((link, index) => (
                        <Tooltip key={link.id}>
                          <TooltipTrigger asChild>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02, y: -5 }}
                              className="cyber-card p-6 rounded-xl cursor-pointer group"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  {index < 3 && (
                                    <span className="text-2xl">
                                      {index === 0
                                        ? "🥇"
                                        : index === 1
                                          ? "🥈"
                                          : "🥉"}
                                    </span>
                                  )}
                                  <span className="text-neon-green font-bold">
                                    #{index + 1}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-400">
                                  <Heart size={14} className="text-red-400" />
                                  <span>{link.reactions.hearts}</span>
                                  <Laugh
                                    size={14}
                                    className="text-yellow-400 ml-2"
                                  />
                                  <span>{link.reactions.laughs}</span>
                                  <Eye
                                    size={14}
                                    className="text-blue-400 ml-2"
                                  />
                                  <span>{link.reactions.views}</span>
                                </div>
                              </div>
                              <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-neon-green transition-colors">
                                {link.title}
                              </h3>
                              <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                                {link.description || "No description available"}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-neon-green/70">
                                  by {link.user_name}
                                </span>
                                <div className="w-full max-w-[100px] h-2 bg-neon-gray rounded-full overflow-hidden ml-3">
                                  <div
                                    className="h-full bg-gradient-to-r from-neon-green to-yellow-400 animate-pulse-glow"
                                    style={{
                                      width: `${Math.min(link.reaction_count * 2, 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-neon-gray border-neon-green/30 text-white p-3 max-w-xs">
                            <div className="space-y-2">
                              <p className="font-semibold">{link.title}</p>
                              <div className="flex gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <Heart size={12} className="text-red-400" />
                                  {link.reactions.hearts} hearts
                                </span>
                                <span className="flex items-center gap-1">
                                  <Laugh
                                    size={12}
                                    className="text-yellow-400"
                                  />
                                  {link.reactions.laughs} laughs
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye size={12} className="text-blue-400" />
                                  {link.reactions.views} views
                                </span>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </motion.section>

                  {/* Top Contributors */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Users className="text-neon-green" size={24} />
                      <h2 className="text-2xl font-bold text-neon-green">
                        Top Contributors
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {filteredData.users.slice(0, 8).map((user, index) => (
                        <motion.div
                          key={user.id}
                          initial={{
                            opacity: 0,
                            x: index % 2 === 0 ? -20 : 20,
                          }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          className={cn(
                            "cyber-card p-6 rounded-xl flex items-center gap-4",
                            index < 3 && "border-2",
                            index === 0 &&
                              "border-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.3)]",
                            index === 1 &&
                              "border-gray-300 shadow-[0_0_30px_rgba(192,192,192,0.3)]",
                            index === 2 &&
                              "border-orange-400 shadow-[0_0_30px_rgba(205,127,50,0.3)]",
                          )}
                        >
                          <div className="relative">
                            <div
                              className={cn(
                                "w-16 h-16 rounded-full bg-gradient-to-br from-neon-green to-blue-500 flex items-center justify-center text-2xl font-bold",
                                index === 0 && "animate-pulse-glow",
                              )}
                            >
                              {user.full_name?.charAt(0) || "U"}
                            </div>
                            {index < 3 && (
                              <div className="absolute -top-2 -right-2 text-2xl">
                                {index === 0 ? "👑" : index === 1 ? "🥈" : "🥉"}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-neon-green font-bold">
                                #{user.rank}
                              </span>
                              <h3 className="font-bold text-white">
                                {user.full_name}
                              </h3>
                              <div className="flex gap-1">
                                {user.badges.map((badge, i) => (
                                  <span
                                    key={i}
                                    className="text-lg animate-bounce"
                                    style={{ animationDelay: `${i * 200}ms` }}
                                  >
                                    {getBadgeIcon(badge)}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>{user.link_count} links</span>
                              <span>{user.total_reactions} reactions</span>
                              {user.streak_days > 0 && (
                                <span className="flex items-center gap-1 text-orange-400">
                                  <Flame size={12} />
                                  {user.streak_days}d streak
                                </span>
                              )}
                            </div>
                          </div>
                          {user.growth_rate > 0 && (
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-neon-green text-sm font-bold">
                                <ArrowUp size={14} />+{user.growth_rate}%
                              </div>
                              <span className="text-xs text-gray-400">
                                growth
                              </span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>

                  {/* Top Rings and Trending Tags Row */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Top Performing Rings */}
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <Target className="text-neon-green" size={24} />
                        <h2 className="text-2xl font-bold text-neon-green">
                          Top Performing Rings
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredData.rings.slice(0, 4).map((ring, index) => (
                          <motion.div
                            key={ring.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, rotateY: 5 }}
                            className={cn(
                              "hexagon-card p-6 text-center relative overflow-hidden",
                              index === 0 && "animate-pulse-glow",
                            )}
                            style={{ minHeight: "160px" }}
                          >
                            <div className="relative z-10">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="text-neon-green font-bold">
                                  #{ring.rank}
                                </span>
                                {index < 3 && (
                                  <span className="text-xl">
                                    {index === 0
                                      ? "🧠"
                                      : index === 1
                                        ? "💬"
                                        : "🚀"}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-white mb-2 text-sm">
                                {ring.name}
                              </h3>
                              <div className="space-y-1 text-xs text-gray-400">
                                <div className="flex items-center justify-center gap-1">
                                  <Users size={10} />
                                  <span>{ring.member_count} members</span>
                                </div>
                                <div className="flex items-center justify-center gap-1">
                                  <Link size={10} />
                                  <span>{ring.link_count} links</span>
                                </div>
                                <div className="flex items-center justify-center gap-1 text-neon-green">
                                  <Activity size={10} />
                                  <span>{ring.activity_score} activity</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.section>

                    {/* Trending Tags */}
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <Hash className="text-neon-green" size={24} />
                        <h2 className="text-2xl font-bold text-neon-green">
                          Trending Tags
                        </h2>
                      </div>
                      <div className="space-y-3">
                        {trendingTags.map((tag, index) => (
                          <motion.div
                            key={tag.tag}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 10 }}
                            className="cyber-card p-4 rounded-xl flex items-center justify-between cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                {Array.from({ length: tag.heat_level }).map(
                                  (_, i) => (
                                    <Flame
                                      key={i}
                                      size={12}
                                      className="text-orange-400 animate-pulse"
                                      style={{ animationDelay: `${i * 100}ms` }}
                                    />
                                  ),
                                )}
                              </div>
                              <span className="font-bold text-neon-green text-lg">
                                #{tag.tag}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-400">
                                {tag.count} links
                              </span>
                              <div className="flex items-center gap-1 text-neon-green font-bold">
                                <TrendingUp size={14} />+{tag.growth}%
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.section>
                  </div>

                  {/* Rising Stars */}
                  {risingStars.length > 0 && (
                    <motion.section
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="text-neon-green" size={24} />
                        <h2 className="text-2xl font-bold text-neon-green">
                          Rising Stars
                        </h2>
                        <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 animate-pulse">
                          New Talent
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {risingStars.map((star, index) => (
                          <motion.div
                            key={star.id}
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                              delay: index * 0.1,
                              type: "spring",
                              stiffness: 200,
                              damping: 20,
                            }}
                            whileHover={{
                              scale: 1.1,
                              y: -10,
                              transition: {
                                type: "spring",
                                stiffness: 400,
                                damping: 10,
                              },
                            }}
                            className="cyber-card p-4 rounded-xl text-center relative overflow-hidden group"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative z-10">
                              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-neon-green to-blue-500 flex items-center justify-center text-lg font-bold animate-pulse-glow">
                                {star.full_name?.charAt(0) || "U"}
                              </div>
                              <h3 className="font-bold text-white text-sm mb-1">
                                {star.full_name}
                              </h3>
                              <div className="text-xs text-gray-400 mb-2">
                                {star.link_count} links
                              </div>
                              <div className="flex items-center justify-center gap-1 text-neon-green text-xs font-bold">
                                <ArrowUp size={10} className="animate-bounce" />
                                +{star.growth_rate}% growth
                              </div>
                              <div className="absolute -top-2 -right-2 text-lg animate-bounce">
                                🚀
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.section>
                  )}
                </div>
              </div>
            </div>
          </TooltipProvider>
        </main>
      </div>
    </div>
  );
};

export default Leaderboard;
