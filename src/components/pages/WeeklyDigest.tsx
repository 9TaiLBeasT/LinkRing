import React, { useState } from "react";
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
} from "lucide-react";

const WeeklyDigest = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Weekly data structure - to be populated with real data from API
  const weeklyData = {
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
    hasActivity: false, // Flag to show/hide sections with no data
  };

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

      <div className="flex-1 p-6 md:p-8 overflow-auto">
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
                      <div className="text-xs text-gray-400">Links Shared</div>
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

          {/* No Activity Message */}
          {!weeklyData.hasActivity && (
            <Card className="bg-gradient-to-r from-neon-green/10 to-blue-500/10 border-neon-green/30">
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold text-neon-green">
                    Your Weekly Summary
                  </h3>
                  <p className="text-gray-300 text-lg max-w-md mx-auto">
                    Start sharing links and engaging with your rings to see your
                    weekly activity here!
                  </p>
                  <Button className="neon-button mt-6">
                    <Link className="h-4 w-4 mr-2" />
                    Share Your First Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Placeholder - Hidden when no data */}
          {weeklyData.hasActivity && (
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
                  <div className="p-8 text-center text-gray-400">
                    <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No links shared this week</p>
                  </div>
                </CardContent>
              </Card>

              {/* Most Loved Link */}
              <Card className="bg-neon-gray/50 border-neon-green/20 hover:border-neon-green/40 transition-all group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-neon-green">
                    <Eye className="h-5 w-5" />
                    ❤️ Most Loved Link You Saw
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    The link you opened with most reactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-8 text-center text-gray-400">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No activity to show yet</p>
                  </div>
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
              <div className="p-8 text-center text-gray-400">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No ring activity this week</p>
                <p className="text-sm">
                  Join or create rings to see activity here
                </p>
              </div>
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
                  Tags you used most this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center text-gray-400">
                  <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tags used this week</p>
                </div>
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
                <div className="p-8 text-center text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No friend activity to show</p>
                </div>
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
                  <h3 className="text-2xl font-bold text-orange-400 mb-2">
                    Start Your Sharing Streak!
                  </h3>
                  <p className="text-gray-300 text-lg mb-4">
                    Share your first link to begin building your daily streak.
                  </p>
                  <div className="flex gap-2 mb-4">
                    {Array.from({ length: 7 }, (_, i) => (
                      <div
                        key={i}
                        className="h-3 w-10 rounded-full bg-gray-600/50 border border-gray-500/30"
                      />
                    ))}
                  </div>
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 rounded-xl px-6 py-2">
                    <Zap className="h-4 w-4 mr-2" />
                    Share First Link
                  </Button>
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
                  <p className="text-gray-300 text-lg mb-4">
                    Your personalized insights will appear here once you start
                    sharing and engaging with content.
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
                  <p className="text-gray-300 text-lg mb-4">
                    Start sharing links and engaging with your community to
                    climb the leaderboard!
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="bg-neon-dark/50 px-4 py-2 rounded-xl border border-neon-green/30">
                      <span className="text-neon-green font-bold text-lg">
                        Unranked
                      </span>
                    </div>
                    <Button className="bg-gradient-to-r from-neon-green/20 to-blue-500/20 hover:from-neon-green/30 hover:to-blue-500/30 text-neon-green border border-neon-green/30 rounded-xl">
                      <Star className="h-4 w-4 mr-2" />
                      View Leaderboard
                    </Button>
                  </div>
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
                      Dive into your complete archive of shared links and
                      discoveries
                    </p>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-neon-green/20 to-blue-500/20 hover:from-neon-green/30 hover:to-blue-500/30 text-neon-green border border-neon-green/30 rounded-xl px-6 py-3 group-hover:scale-105 transition-all">
                  <History className="h-5 w-5 mr-2" />
                  View All Links
                  <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WeeklyDigest;
