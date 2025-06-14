import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  Filter,
  Calendar,
  Heart,
  Laugh,
  Flame,
  Eye,
  Bookmark,
  BookmarkCheck,
  Users,
  ExternalLink,
  Globe,
  Clock,
  TrendingUp,
  Zap,
  Star,
  Hash,
  ChevronRight,
  Sparkles,
  Activity,
  Link,
} from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Database } from "@/types/supabase";
import Sidebar, { SidebarToggle } from "../dashboard/layout/Sidebar";
import { cn } from "@/lib/utils";

type SharedLink = Database["public"]["Tables"]["shared_links"]["Row"];
type Ring = Database["public"]["Tables"]["rings"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];

interface ExploreLink extends SharedLink {
  user?: {
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
  ring?: {
    name: string;
  };
  saved?: boolean;
}

interface TrendingRing extends Ring {
  member_count: number;
  link_count: number;
}

const POPULAR_CATEGORIES = [
  "AI & Tech",
  "Startups",
  "Tools",
  "Design",
  "Gaming",
  "Productivity",
  "News",
  "Science",
];

const INTERACTION_ICONS = {
  bookmark: Bookmark,
  external: ExternalLink,
  eye: Eye,
  users: Users,
};

const Explore = () => {
  const [links, setLinks] = useState<ExploreLink[]>([]);
  const [trendingRings, setTrendingRings] = useState<TrendingRing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("recent");
  const [dateFilter, setDateFilter] = useState("week");
  const [savedLinks, setSavedLinks] = useState<Set<string>>(new Set());
  const [showOnlyMyRings, setShowOnlyMyRings] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastLinkRef = useRef<HTMLDivElement | null>(null);

  // Typewriter animation for title
  const [titleText, setTitleText] = useState("");
  const fullTitle = "Explore the LinkStream";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullTitle.length) {
        setTitleText(fullTitle.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // Handle mobile/desktop detection and sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Close sidebar by default on mobile
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

  // Infinite scroll setup
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreLinks();
        }
      },
      { threshold: 1.0 },
    );

    if (lastLinkRef.current) {
      observerRef.current.observe(lastLinkRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, isLoadingMore]);

  const fetchLinks = async (pageNum = 1, reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      // First get the shared links
      let linksQuery = supabase
        .from("shared_links")
        .select("*")
        .order("created_at", { ascending: sortBy !== "recent" })
        .range((pageNum - 1) * 12, pageNum * 12 - 1);

      // Apply search filter
      if (searchQuery.trim()) {
        linksQuery = linksQuery.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,url.ilike.%${searchQuery}%`,
        );
      }

      // Apply date filter
      const now = new Date();
      let dateThreshold: Date;
      switch (dateFilter) {
        case "today":
          dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "week":
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateThreshold = new Date(0);
      }
      if (dateFilter !== "all") {
        linksQuery = linksQuery.gte("created_at", dateThreshold.toISOString());
      }

      // Filter by user's rings if enabled, otherwise only show public rings
      if (showOnlyMyRings && user) {
        const { data: userRings } = await supabase
          .from("ring_members")
          .select("ring_id")
          .eq("user_id", user.id);

        if (userRings && userRings.length > 0) {
          const ringIds = userRings.map((r) => r.ring_id);
          linksQuery = linksQuery.in("ring_id", ringIds);
        } else {
          // User has no rings, return empty result
          if (reset) setLinks([]);
          setHasMore(false);
          return;
        }
      } else {
        // Get all rings for now since is_public might not be properly set
        const { data: publicRings } = await supabase
          .from("rings")
          .select("id, is_public");

        if (publicRings && publicRings.length > 0) {
          // Filter for public rings, but if none are marked as public, show all
          const publicRingIds = publicRings
            .filter((r) => r.is_public === true)
            .map((r) => r.id);

          if (publicRingIds.length > 0) {
            linksQuery = linksQuery.in("ring_id", publicRingIds);
          } else {
            // If no rings are marked as public, show all rings
            const allRingIds = publicRings.map((r) => r.id);
            linksQuery = linksQuery.in("ring_id", allRingIds);
          }
        } else {
          // No rings at all, return empty result
          if (reset) setLinks([]);
          setHasMore(false);
          return;
        }
      }

      const { data: linksData, error: linksError } = await linksQuery;

      if (linksError) throw linksError;

      if (!linksData || linksData.length === 0) {
        if (reset) setLinks([]);
        setHasMore(false);
        return;
      }

      // Get user data for the links
      const userIds = [
        ...new Set(linksData.map((link) => link.user_id).filter(Boolean)),
      ];
      const ringIds = [
        ...new Set(linksData.map((link) => link.ring_id).filter(Boolean)),
      ];

      const [usersData, ringsData] = await Promise.all([
        userIds.length > 0
          ? supabase
              .from("users")
              .select("id, full_name, email, avatar_url")
              .in("id", userIds)
          : Promise.resolve({ data: [] }),
        ringIds.length > 0
          ? supabase.from("rings").select("id, name").in("id", ringIds)
          : Promise.resolve({ data: [] }),
      ]);

      // Create lookup maps
      const usersMap = new Map(
        (usersData.data || []).map((user) => [user.id, user]),
      );
      const ringsMap = new Map(
        (ringsData.data || []).map((ring) => [ring.id, ring]),
      );

      // Process the links with user and ring data
      const processedLinks: ExploreLink[] = linksData.map((link) => {
        const userData = link.user_id ? usersMap.get(link.user_id) : null;
        const ringData = link.ring_id ? ringsMap.get(link.ring_id) : null;

        return {
          ...link,
          user: userData
            ? {
                full_name: userData.full_name,
                email: userData.email,
                avatar_url: userData.avatar_url,
              }
            : undefined,
          ring: ringData
            ? {
                name: ringData.name,
              }
            : undefined,
          saved: savedLinks.has(link.id),
        };
      });

      if (reset) {
        setLinks(processedLinks);
      } else {
        setLinks((prev) => [...prev, ...processedLinks]);
      }

      setHasMore(processedLinks.length === 12);
    } catch (error: any) {
      console.error("Error fetching links:", error);
      const errorMessage = error.message || "Failed to load links";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreLinks = async () => {
    if (!hasMore || isLoadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchLinks(nextPage, false);
  };

  const fetchTrendingRings = async () => {
    try {
      // Fetch top rings - all rings for now since is_public might not be properly set
      const { data: ringsData, error: ringsError } = await supabase
        .from("rings")
        .select("id, name, description, created_by, is_public");

      if (ringsError) throw ringsError;

      if (!ringsData || ringsData.length === 0) {
        setTrendingRings([]);
        return;
      }

      // Get member counts and link counts for each ring
      const ringIds = ringsData.map((ring) => ring.id);

      const [memberCounts, linkCounts] = await Promise.all([
        supabase.from("ring_members").select("ring_id").in("ring_id", ringIds),
        supabase.from("shared_links").select("ring_id").in("ring_id", ringIds),
      ]);

      // Process the rings with counts
      const processedRings: TrendingRing[] = ringsData.map((ring) => {
        const memberCount =
          memberCounts.data?.filter((m) => m.ring_id === ring.id).length || 0;
        const linkCount =
          linkCounts.data?.filter((l) => l.ring_id === ring.id).length || 0;

        return {
          ...ring,
          member_count: memberCount,
          link_count: linkCount,
        };
      });

      // Sort by activity (member count + link count)
      processedRings.sort(
        (a, b) =>
          b.member_count + b.link_count - (a.member_count + a.link_count),
      );

      setTrendingRings(processedRings);
    } catch (error: any) {
      console.error("Error fetching trending rings:", error);
    }
  };

  const handleSaveLink = async (linkId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save links",
        variant: "destructive",
      });
      return;
    }

    try {
      const newSavedLinks = new Set(savedLinks);
      const isCurrentlySaved = savedLinks.has(linkId);

      if (isCurrentlySaved) {
        // Remove from saved
        const { error } = await supabase
          .from("saved_links")
          .delete()
          .eq("user_id", user.id)
          .eq("link_id", linkId);

        if (error) throw error;

        newSavedLinks.delete(linkId);
        toast({
          title: "Link Removed",
          description: "Link removed from saved",
        });
      } else {
        // Add to saved
        const { error } = await supabase.from("saved_links").insert({
          user_id: user.id,
          link_id: linkId,
        });

        if (error) throw error;

        newSavedLinks.add(linkId);
        toast({
          title: "Link Saved",
          description: "Link saved to your archive",
        });
      }

      setSavedLinks(newSavedLinks);

      // Update the specific link in the state
      setLinks((prev) =>
        prev.map((link) =>
          link.id === linkId ? { ...link, saved: !isCurrentlySaved } : link,
        ),
      );
    } catch (error: any) {
      console.error("Error saving link:", error);
      toast({
        title: "Error",
        description: "Failed to save link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    setPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const filteredLinks = links; // All filtering is now done in the database query

  // Fetch saved links for the current user
  const fetchSavedLinks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("saved_links")
        .select("link_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching saved links:", error);
        return;
      }

      const savedSet = new Set(data?.map((item) => item.link_id) || []);
      setSavedLinks(savedSet);
    } catch (error: any) {
      console.error("Error fetching saved links:", error);
    }
  };

  useEffect(() => {
    fetchLinks();
    fetchTrendingRings();
    if (user) {
      fetchSavedLinks();
    }
  }, [
    searchQuery,
    selectedCategory,
    sortBy,
    dateFilter,
    showOnlyMyRings,
    user,
  ]);

  const LinkCard = ({ link, index }: { link: ExploreLink; index: number }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [faviconError, setFaviconError] = useState(false);

    let domain = "";
    try {
      domain = new URL(link.url).hostname;
    } catch {
      domain = "unknown";
    }

    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

    return (
      <Card
        className={`group relative overflow-hidden transition-all duration-500 hover:scale-105 bg-gray-900/95 border border-neon-green/30 backdrop-filter backdrop-blur-md hover:border-neon-green hover:shadow-neon ${
          index % 2 === 0 ? "animate-slide-in-left" : "animate-slide-in-right"
        }`}
        style={{ animationDelay: `${index * 100}ms` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              {!faviconError ? (
                <img
                  src={favicon}
                  alt=""
                  className="w-6 h-6 rounded-sm"
                  onError={() => setFaviconError(true)}
                />
              ) : (
                <Link className="w-6 h-6 text-neon-green" />
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium text-white truncate group-hover:text-neon-green transition-colors">
                  {link.title}
                </CardTitle>
                <p className="text-xs text-gray-400 truncate">{domain}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 transition-all duration-300 ${
                  savedLinks.has(link.id)
                    ? "text-neon-green hover:text-neon-green/80"
                    : "text-gray-400 hover:text-neon-green"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSaveLink(link.id);
                }}
              >
                {savedLinks.has(link.id) ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-neon-green"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(link.url, "_blank", "noopener,noreferrer");
                }}
                title="Open link in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-neon-green"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Show link details in a simple alert for now
                        const details = `Title: ${link.title}\nDomain: ${domain}${link.description ? `\nDescription: ${link.description}` : ""}${link.ring ? `\nRing: ${link.ring.name}` : ""}`;
                        alert(details);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-neon-dark border-neon-green/50 text-neon-green font-mono">
                    <p>View link details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {link.description && (
            <p className="text-sm text-gray-300 mb-3 line-clamp-2">
              {link.description}
            </p>
          )}

          {/* Ring Info */}
          {link.ring && (
            <div className="flex flex-wrap gap-1 mb-3">
              <Badge
                variant="outline"
                className="text-xs border-neon-green/30 text-neon-green hover:bg-neon-green/10 cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={() => navigate(`/ring/${link.ring_id}`)}
              >
                {link.ring.name}
              </Badge>
            </div>
          )}

          {/* Link Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Globe className="h-3 w-3" />
                <span>{domain}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={link.user?.avatar_url} />
                <AvatarFallback className="text-xs bg-neon-green/20 text-neon-green">
                  {link.user?.full_name?.[0] || link.user?.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-400">
                {new Date(link.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>

        {/* Hover glow effect */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green/5 to-transparent animate-pulse pointer-events-none" />
        )}
      </Card>
    );
  };

  const RingCard = ({ ring }: { ring: TrendingRing }) => {
    return (
      <Card className="group hover:scale-105 transition-all duration-300 animate-pulse-glow bg-gray-900/95 border border-neon-green/30 backdrop-filter backdrop-blur-md hover:border-neon-green hover:shadow-neon">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-white group-hover:text-neon-green transition-colors">
              {ring.name}
            </CardTitle>
            <div className="flex items-center gap-1 text-xs text-neon-green">
              <Users className="h-3 w-3" />
              {ring.member_count}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {ring.description && (
            <p className="text-xs text-gray-400 mb-3 line-clamp-2">
              {ring.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {ring.link_count} links
            </span>
            <Button
              size="sm"
              className="neon-button h-7 text-xs"
              onClick={() => navigate(`/ring/${ring.id}`)}
            >
              View Ring
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-neon-dark text-white font-mono">
      <TooltipProvider>
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
              isMobile ? "w-full" : "",
            )}
          >
            {/* Header */}
            <div className="border-b border-neon-green/20 bg-neon-dark/95 backdrop-blur-md sticky top-0 z-40">
              <div
                className={cn(
                  "max-w-7xl mx-auto px-4 py-6",
                  isMobile ? "pt-16" : "pt-6",
                )}
              >
                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-neon-green mb-6 glitch-text">
                  {titleText}
                  <span className="animate-pulse">|</span>
                </h1>

                {/* Search and Filters */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by tag, keyword, or domain..."
                      className="neon-input pl-10 font-mono"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-3">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40 neon-input">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neon-gray/95 backdrop-blur-md border-neon-green/30">
                        <SelectItem value="recent">🕓 Most Recent</SelectItem>
                        <SelectItem value="oldest">📅 Oldest First</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="w-32 neon-input">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neon-gray/95 backdrop-blur-md border-neon-green/30">
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant={showOnlyMyRings ? "default" : "outline"}
                      size="sm"
                      className={`${showOnlyMyRings ? "neon-button" : "border-neon-green/30 text-neon-green hover:bg-neon-green/10"}`}
                      onClick={() => setShowOnlyMyRings(!showOnlyMyRings)}
                    >
                      My Rings Only
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3">
                  {/* Popular Categories */}
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-neon-green mb-4 flex items-center gap-2">
                      <Hash className="h-5 w-5" />
                      Categories
                    </h2>
                    <ScrollArea className="w-full">
                      <div className="flex gap-2 pb-2">
                        {POPULAR_CATEGORIES.map((category) => (
                          <Button
                            key={category}
                            variant={
                              selectedCategory === category
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className={`whitespace-nowrap transition-all duration-300 hover:scale-105 ${
                              selectedCategory === category
                                ? "neon-button"
                                : "border-neon-green/30 text-neon-green hover:bg-neon-green/10 hover:shadow-neon"
                            }`}
                            onClick={() => handleCategoryClick(category)}
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Recent Activity */}
                  {filteredLinks.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-neon-green mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Recent Activity
                      </h2>
                      <div className="relative overflow-hidden bg-neon-gray/20 rounded-xl p-4 border border-neon-green/20">
                        <div className="ticker-scroll flex gap-8">
                          {filteredLinks.slice(0, 5).map((link, index) => (
                            <div
                              key={link.id}
                              className="flex items-center gap-3 whitespace-nowrap"
                            >
                              <span className="text-neon-green font-bold">
                                #{index + 1}
                              </span>
                              <span className="text-white truncate max-w-xs">
                                {link.title}
                              </span>
                              {link.ring && (
                                <Badge
                                  variant="outline"
                                  className="border-neon-green/30 text-neon-green"
                                >
                                  {link.ring.name}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Links Grid */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-neon-green flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        {searchQuery ? "Search Results" : "Latest Links"}
                        {selectedCategory && (
                          <Badge
                            variant="outline"
                            className="border-neon-green/30 text-neon-green ml-2"
                          >
                            {selectedCategory}
                          </Badge>
                        )}
                      </h2>
                      <div className="text-sm text-gray-400">
                        {filteredLinks.length} links found
                      </div>
                    </div>

                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(6)].map((_, i) => (
                          <Card
                            key={i}
                            className="animate-pulse bg-gray-900/95 border border-neon-green/30"
                          >
                            <CardHeader>
                              <div className="h-4 bg-neon-green/20 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                            </CardHeader>
                            <CardContent>
                              <div className="h-3 bg-gray-600 rounded w-full mb-2"></div>
                              <div className="h-3 bg-gray-600 rounded w-2/3"></div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : error ? (
                      <div className="text-center py-12">
                        <Globe className="h-12 w-12 text-red-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-red-300 mb-2">
                          Error Loading Links
                        </h3>
                        <p className="text-gray-400 mb-4">{error}</p>
                        <Button
                          onClick={() => {
                            setError(null);
                            fetchLinks();
                          }}
                          className="neon-button"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : filteredLinks.length === 0 ? (
                      <div className="text-center py-12">
                        <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-300 mb-2">
                          No links found
                        </h3>
                        <p className="text-gray-400">
                          {searchQuery || selectedCategory || showOnlyMyRings
                            ? "Try adjusting your search or filters"
                            : "No links have been shared yet"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredLinks.map((link, index) => (
                          <div
                            key={link.id}
                            ref={
                              index === filteredLinks.length - 1
                                ? lastLinkRef
                                : null
                            }
                          >
                            <LinkCard link={link} index={index} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Loading more indicator */}
                    {isLoadingMore && (
                      <div className="flex justify-center py-8">
                        <div className="flex items-center gap-2 text-neon-green">
                          <div className="h-4 w-4 rounded-full border-2 border-neon-green/30 border-t-neon-green animate-spin" />
                          <span className="text-sm">Loading more links...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Trending Rings */}
                  <div>
                    <h3 className="text-lg font-bold text-neon-green mb-4 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      🪐 Trending Rings
                    </h3>
                    <div className="space-y-4">
                      {trendingRings.map((ring) => (
                        <RingCard key={ring.id} ring={ring} />
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div>
                    <h3 className="text-lg font-bold text-neon-green mb-4 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      📊 Quick Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-neon-gray/20 rounded-lg border border-neon-green/20">
                        <span className="text-sm text-gray-300">
                          Total Links
                        </span>
                        <span className="text-sm font-bold text-neon-green">
                          {filteredLinks.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-neon-gray/20 rounded-lg border border-neon-green/20">
                        <span className="text-sm text-gray-300">
                          Active Rings
                        </span>
                        <span className="text-sm font-bold text-neon-green">
                          {trendingRings.length}
                        </span>
                      </div>
                      {user && (
                        <div className="flex items-center justify-between p-3 bg-neon-gray/20 rounded-lg border border-neon-green/20">
                          <span className="text-sm text-gray-300">
                            Your Saved
                          </span>
                          <span className="text-sm font-bold text-neon-green">
                            {savedLinks.size}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-neon-dark/95 backdrop-blur-md border-t border-neon-green/20 p-4 z-50">
              <div className="flex justify-around">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col items-center gap-1 text-neon-green"
                >
                  <Search className="h-4 w-4" />
                  <span className="text-xs">Explore</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col items-center gap-1 text-gray-400 hover:text-neon-green"
                  onClick={() => navigate("/dashboard")}
                >
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Rings</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col items-center gap-1 text-gray-400 hover:text-neon-green"
                  onClick={() => navigate("/post")}
                >
                  <Zap className="h-4 w-4" />
                  <span className="text-xs">Post</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col items-center gap-1 text-gray-400 hover:text-neon-green"
                  onClick={() => navigate("/saved")}
                >
                  <Bookmark className="h-4 w-4" />
                  <span className="text-xs">Saved</span>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default Explore;
