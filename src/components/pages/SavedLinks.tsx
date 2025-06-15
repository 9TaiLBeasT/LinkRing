import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Globe,
  Users,
  ArrowLeft,
  Trash2,
  Link,
} from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Database } from "@/types/supabase";

type SavedLink = {
  id: string;
  link_id: string;
  created_at: string;
  shared_links: {
    id: string;
    title: string;
    url: string;
    description?: string;
    created_at: string;
    user_id: string;
    ring_id?: string;
    user?: {
      full_name?: string;
      email?: string;
      avatar_url?: string;
    };
    ring?: {
      name: string;
    };
  };
};

const SavedLinks = () => {
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchSavedLinks = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get saved links with full link data
      const { data: savedLinksData, error } = await supabase
        .from("saved_links")
        .select(
          `
          id,
          link_id,
          created_at,
          shared_links (
            id,
            title,
            url,
            description,
            created_at,
            user_id,
            ring_id
          )
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!savedLinksData || savedLinksData.length === 0) {
        setSavedLinks([]);
        return;
      }

      // Get user and ring data for the links
      const userIds = [
        ...new Set(
          savedLinksData
            .map((sl) => sl.shared_links)
            .filter(Boolean)
            .map((link) => link?.user_id)
            .filter(Boolean),
        ),
      ];
      const ringIds = [
        ...new Set(
          savedLinksData
            .map((sl) => sl.shared_links)
            .filter(Boolean)
            .map((link) => link?.ring_id)
            .filter(Boolean),
        ),
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

      // Process the saved links with user and ring data
      const processedLinks: SavedLink[] = savedLinksData
        .filter((savedLink) => savedLink.shared_links)
        .map((savedLink) => {
          const link = savedLink.shared_links;
          if (!link) return null;

          const userData = link.user_id ? usersMap.get(link.user_id) : null;
          const ringData = link.ring_id ? ringsMap.get(link.ring_id) : null;

          return {
            id: savedLink.id,
            link_id: savedLink.link_id,
            created_at: savedLink.created_at,
            shared_links: {
              id: link.id,
              title: link.title,
              url: link.url,
              description: link.description,
              created_at: link.created_at,
              user_id: link.user_id,
              ring_id: link.ring_id,
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
            },
          };
        })
        .filter(Boolean) as SavedLink[];

      setSavedLinks(processedLinks);
    } catch (error: any) {
      console.error("Error fetching saved links:", error);
      toast({
        title: "Error",
        description: "Failed to load saved links",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSavedLink = async (savedLinkId: string) => {
    try {
      const { error } = await supabase
        .from("saved_links")
        .delete()
        .eq("id", savedLinkId);

      if (error) throw error;

      setSavedLinks((prev) => prev.filter((sl) => sl.id !== savedLinkId));
      toast({
        title: "Success",
        description: "Link removed from saved",
      });
    } catch (error: any) {
      console.error("Error removing saved link:", error);
      toast({
        title: "Error",
        description: "Failed to remove saved link",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSavedLinks();
  }, [user]);

  const LinkCard = ({ savedLink }: { savedLink: SavedLink }) => {
    const link = savedLink.shared_links;
    if (!link) return null;

    const [faviconError, setFaviconError] = useState(false);
    let domain = "";
    try {
      domain = new URL(link.url).hostname;
    } catch {
      domain = "unknown";
    }

    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

    return (
      <Card className="group hover:scale-105 transition-all duration-300 bg-gray-900/95 border border-neon-green/30 backdrop-filter backdrop-blur-md hover:border-neon-green hover:shadow-neon">
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
                className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                onClick={() => handleRemoveSavedLink(savedLink.id)}
                title="Remove from saved"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-neon-green"
                onClick={() =>
                  window.open(link.url, "_blank", "noopener,noreferrer")
                }
                title="Open link in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
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
                Saved {new Date(savedLink.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-neon-dark text-white font-mono">
      {/* Header */}
      <div className="border-b border-neon-green/20 bg-neon-dark/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-neon-green hover:bg-neon-green/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold text-neon-green glitch-text">
              Saved Links
            </h1>
          </div>
          <p className="text-gray-400">
            Your bookmarked links from across the LinkRing network
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        ) : savedLinks.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              No saved links yet
            </h3>
            <p className="text-gray-400 mb-4">
              Start exploring and save links that interest you
            </p>
            <Button
              onClick={() => navigate("/explore")}
              className="neon-button"
            >
              Explore Links
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-neon-green">
                {savedLinks.length} Saved Links
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedLinks.map((savedLink) => (
                <LinkCard key={savedLink.id} savedLink={savedLink} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedLinks;
