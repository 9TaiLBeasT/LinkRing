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
  Mail,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Calendar,
  Crown,
} from "lucide-react";

const WeeklyDigest = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data for the weekly digest
  const weeklyData = {
    topLinks: [
      {
        id: 1,
        title: "The Future of Web Development",
        url: "https://example.com/future-web-dev",
        reactions: 45,
        comments: 12,
        shares: 8,
        submittedBy: "Alice Chen",
      },
      {
        id: 2,
        title: "AI Tools That Will Change Everything",
        url: "https://example.com/ai-tools",
        reactions: 38,
        comments: 9,
        shares: 15,
        submittedBy: "Bob Wilson",
      },
      {
        id: 3,
        title: "Building Scalable React Applications",
        url: "https://example.com/scalable-react",
        reactions: 32,
        comments: 7,
        shares: 6,
        submittedBy: "Carol Davis",
      },
      {
        id: 4,
        title: "The Rise of Edge Computing",
        url: "https://example.com/edge-computing",
        reactions: 28,
        comments: 5,
        shares: 4,
        submittedBy: "David Kim",
      },
      {
        id: 5,
        title: "Cybersecurity Best Practices 2024",
        url: "https://example.com/cybersecurity",
        reactions: 25,
        comments: 8,
        shares: 3,
        submittedBy: "Eve Rodriguez",
      },
    ],
    topContributor: {
      name: "Alice Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
      linksShared: 12,
      totalReactions: 156,
    },
    reactionsSummary: {
      totalReactions: 324,
      totalComments: 89,
      totalShares: 67,
      mostPopularDay: "Wednesday",
    },
    weekRange: "Dec 16 - Dec 22, 2024",
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
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Mail className="h-8 w-8 text-neon-green" />
              <h1
                className="text-4xl font-bold text-neon-green glitch-text"
                data-text="Weekly Digest"
              >
                Weekly Digest
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Your ring's top content from {weeklyData.weekRange}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-neon-green/70">
              <Calendar className="h-4 w-4" />
              <span>Delivered every Sunday night</span>
            </div>
          </div>

          {/* Top 5 Links */}
          <Card className="bg-neon-gray/50 border-neon-green/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neon-green">
                <TrendingUp className="h-5 w-5" />
                Top 5 Links of the Week
              </CardTitle>
              <CardDescription className="text-gray-400">
                The most popular links shared in your rings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyData.topLinks.map((link, index) => (
                  <div
                    key={link.id}
                    className="flex items-start gap-4 p-4 rounded-xl bg-neon-dark/50 border border-neon-green/10 hover:border-neon-green/30 transition-all duration-300 group"
                  >
                    <div className="flex-shrink-0">
                      <Badge
                        variant="outline"
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0
                            ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                            : index === 1
                              ? "bg-gray-400/20 text-gray-400 border-gray-400/30"
                              : index === 2
                                ? "bg-orange-500/20 text-orange-500 border-orange-500/30"
                                : "bg-neon-green/20 text-neon-green border-neon-green/30"
                        }`}
                      >
                        {index + 1}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white group-hover:text-neon-green transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Shared by {link.submittedBy}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {link.reactions}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {link.comments}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="h-3 w-3" />
                          {link.shares}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-neon-green hover:bg-neon-green/10"
                      onClick={() => window.open(link.url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Contributor */}
            <Card className="bg-neon-gray/50 border-neon-green/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neon-green">
                  <Crown className="h-5 w-5" />
                  Top Contributor
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your ring's most active member this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={weeklyData.topContributor.avatar}
                      alt={weeklyData.topContributor.name}
                      className="w-16 h-16 rounded-full border-2 border-neon-green/30"
                    />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Crown className="h-3 w-3 text-yellow-900" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">
                      {weeklyData.topContributor.name}
                    </h3>
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Links shared:</span>
                        <span className="text-neon-green font-medium">
                          {weeklyData.topContributor.linksShared}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total reactions:</span>
                        <span className="text-neon-green font-medium">
                          {weeklyData.topContributor.totalReactions}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reactions Summary */}
            <Card className="bg-neon-gray/50 border-neon-green/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neon-green">
                  <Heart className="h-5 w-5" />
                  Reactions Summary
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Community engagement this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neon-green">
                        {weeklyData.reactionsSummary.totalReactions}
                      </div>
                      <div className="text-xs text-gray-400">Reactions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neon-green">
                        {weeklyData.reactionsSummary.totalComments}
                      </div>
                      <div className="text-xs text-gray-400">Comments</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neon-green">
                        {weeklyData.reactionsSummary.totalShares}
                      </div>
                      <div className="text-xs text-gray-400">Shares</div>
                    </div>
                  </div>
                  <Separator className="bg-neon-green/20" />
                  <div className="text-center">
                    <p className="text-sm text-gray-400">
                      Most active day:{" "}
                      <span className="text-neon-green font-medium">
                        {weeklyData.reactionsSummary.mostPopularDay}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-neon-green/10 to-neon-green/5 border-neon-green/30">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold text-neon-green mb-2">
                Ready to explore more?
              </h3>
              <p className="text-gray-400 mb-4">
                Dive back into your rings and discover what's trending now
              </p>
              <Button className="neon-button">
                <ExternalLink className="h-4 w-4 mr-2" />
                View More in App
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WeeklyDigest;
