import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "@/components/ui/dialog";
import {
  Play,
  Users,
  Search,
  Filter,
  Globe,
  Clock,
  Zap,
  Plus,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useWatchParties } from "@/hooks/useWatchParty";
import { getPlatformDisplayName, getPlatformIcon } from "@/lib/embedUtils";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import CreateWatchPartyDialog from "@/components/watchparty/CreateWatchPartyDialog";
import Sidebar, { SidebarToggle } from "@/components/dashboard/layout/Sidebar";

const CATEGORIES = [
  { value: "all", label: "🌐 All Categories" },
  { value: "general", label: "🌐 General" },
  { value: "music", label: "🎵 Music" },
  { value: "memes", label: "😂 Memes" },
  { value: "tech", label: "💻 Tech" },
  { value: "gaming", label: "🎮 Gaming" },
  { value: "education", label: "📚 Education" },
  { value: "entertainment", label: "🎬 Entertainment" },
  { value: "sports", label: "⚽ Sports" },
];

const ExploreWatchParties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joiningByCode, setJoiningByCode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const { parties, loading, joinByInviteCode, refetch } = useWatchParties();
  const navigate = useNavigate();

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

  // Filter parties based on search and category
  const filteredParties = parties.filter((party) => {
    const matchesSearch =
      !searchQuery ||
      party.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      party.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      party.owner_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || party.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleJoinParty = (partyId: string) => {
    navigate(`/watchparty/${partyId}`);
  };

  const handleJoinByCode = async () => {
    if (!inviteCode.trim()) return;

    setJoiningByCode(true);
    try {
      const party = await joinByInviteCode(inviteCode.trim());
      if (party) {
        setJoinDialogOpen(false);
        setInviteCode("");
        navigate(`/watchparty/${party.id}`);
      }
    } finally {
      setJoiningByCode(false);
    }
  };

  return (
    <div className="min-h-screen bg-neon-dark">
      <SidebarToggle isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className="flex h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          activeItem="Explore"
        />
        <main
          className={cn(
            "flex-1 overflow-auto transition-all duration-300 ease-in-out",
            isMobile ? "w-full" : sidebarOpen ? "ml-0" : "-ml-[280px]",
          )}
        >
          <div className={cn("min-h-screen", isMobile ? "pt-16" : "pt-0")}>
            {/* Header */}
            <div className="bg-neon-dark/95 backdrop-blur-md border-b border-neon-green/20 p-4 md:p-6">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div>
                    <h1
                      className="text-3xl md:text-4xl font-bold text-neon-green font-mono glitch-text mb-2"
                      data-text="Live WatchParties"
                    >
                      Live WatchParties
                    </h1>
                    <p className="text-gray-400 text-base md:text-lg">
                      Join live viewing sessions or start your own
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <Button
                      onClick={() => setJoinDialogOpen(true)}
                      variant="outline"
                      className="border-neon-green/30 text-neon-green hover:bg-neon-green/10 w-full sm:w-auto"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Join by Code
                    </Button>
                    <CreateWatchPartyDialog>
                      <Button className="neon-button font-bold w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Start Party
                      </Button>
                    </CreateWatchPartyDialog>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-neon-gray/20 border-b border-neon-green/10 p-4 md:p-6">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search parties, hosts, or descriptions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="neon-input pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="neon-input w-48">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neon-gray/95 backdrop-blur-md border-neon-green/30">
                        {CATEGORIES.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refetch}
                      className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Parties Grid */}
            <div className="p-4 md:p-6">
              <div className="max-w-6xl mx-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <div className="h-12 w-12 mx-auto rounded-full border-4 border-neon-green/30 border-t-neon-green animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="h-6 w-6 text-neon-green animate-pulse" />
                        </div>
                      </div>
                      <p className="text-neon-green font-mono animate-pulse">
                        Loading live parties...
                      </p>
                    </div>
                  </div>
                ) : filteredParties.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="space-y-6 animate-flicker-in">
                      <div className="w-20 h-20 mx-auto rounded-full border-2 border-neon-green/30 flex items-center justify-center hover:border-neon-green hover:shadow-neon transition-all duration-300">
                        <span className="text-3xl animate-pulse">🎬</span>
                      </div>
                      <h3
                        className="text-2xl font-semibold text-white font-mono glitch-text"
                        data-text="No parties found"
                      >
                        No parties found
                      </h3>
                      <p className="text-gray-400 max-w-md mx-auto text-lg">
                        {searchQuery || selectedCategory !== "all"
                          ? "Try adjusting your search or filters"
                          : "Be the first to start a watch party!"}
                      </p>
                      <CreateWatchPartyDialog>
                        <Button className="neon-button px-8 py-3 font-bold text-lg">
                          <Plus className="h-5 w-5 mr-2" />
                          Start First Party
                        </Button>
                      </CreateWatchPartyDialog>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredParties.map((party, index) => (
                      <Card
                        key={party.id}
                        className={cn(
                          "cyber-card group hover:border-neon-green/60 transition-all duration-500 relative overflow-hidden backdrop-blur-sm bg-gradient-to-br from-neon-dark/95 to-neon-gray/90 border-2 animate-flicker-in",
                          `[animation-delay:${index * 150}ms]`,
                        )}
                      >
                        {/* Live indicator */}
                        <div className="absolute top-3 right-3 z-10">
                          <Badge className="bg-red-600 text-white font-bold animate-pulse border-0">
                            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-ping" />
                            LIVE
                          </Badge>
                        </div>

                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 border-2 border-neon-green/40 group-hover:border-neon-green transition-colors">
                              {party.owner_avatar ? (
                                <AvatarImage
                                  src={party.owner_avatar}
                                  alt={party.owner_name}
                                />
                              ) : null}
                              <AvatarFallback className="bg-neon-gray text-neon-green font-bold font-mono">
                                {party.owner_name?.slice(0, 2).toUpperCase() ||
                                  "AN"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-white text-lg truncate group-hover:text-neon-green transition-colors duration-300">
                                {party.title || "Untitled Party"}
                              </h3>
                              <p className="text-sm text-gray-400 truncate">
                                by {party.owner_name || "Anonymous"}
                              </p>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Platform and Category */}
                          <div className="flex flex-wrap gap-2">
                            {party.embed_type && (
                              <Badge
                                variant="outline"
                                className="border-blue-500/40 text-blue-400 text-xs"
                              >
                                {getPlatformIcon(party.embed_type)}{" "}
                                {getPlatformDisplayName(
                                  party.embed_type as any,
                                )}
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className="border-neon-green/40 text-neon-green text-xs"
                            >
                              {CATEGORIES.find(
                                (cat) => cat.value === party.category,
                              )?.label || party.category}
                            </Badge>
                          </div>

                          {/* Description */}
                          {party.description && (
                            <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
                              {party.description}
                            </p>
                          )}

                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {party.viewer_count || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(
                                  new Date(party.created_at),
                                  { addSuffix: true },
                                )}
                              </span>
                            </div>
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              Public
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => handleJoinParty(party.id)}
                              className="neon-button flex-1 font-bold group-hover:scale-105 transition-transform duration-200"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Join Party
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(party.video_url, "_blank")
                              }
                              className="border-gray-600 text-gray-400 hover:text-neon-green hover:border-neon-green/50"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Join by Code Dialog */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="bg-neon-dark border-neon-green/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-neon-green font-mono flex items-center gap-2">
              <Zap className="h-5 w-5 animate-pulse" />
              Join by Invite Code
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter the invite code shared by the host to join their private
              watch party.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Enter invite code (e.g., ABC123)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="neon-input text-center font-mono text-lg tracking-wider"
                maxLength={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setJoinDialogOpen(false);
                setInviteCode("");
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinByCode}
              disabled={!inviteCode.trim() || joiningByCode}
              className="neon-button font-bold"
            >
              {joiningByCode ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Join Party
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExploreWatchParties;
