import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../supabase/supabase";
import { useAuth } from "../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";
import { apiCache, retryAsync } from "@/lib/performance";

export interface RingData {
  id: string;
  name: string;
  description?: string;
  invite_code: string;
  created_by: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  is_owner?: boolean;
}

export interface RingMember {
  id: string;
  ring_id: string;
  user_id: string;
  joined_at: string;
  role: string;
  user_name?: string;
  user_email?: string;
  avatar_url?: string;
}

export interface SharedLink {
  id: string;
  ring_id: string;
  user_id: string;
  title: string;
  url: string;
  description?: string;
  tags?: string[];
  embed_type?: string;
  embed_data?: any;
  created_at: string;
  reactions?: LinkReaction[];
  user_name?: string;
  user_email?: string;
  avatar_url?: string;
}

export interface LinkReaction {
  id: string;
  link_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
}

export function useRingData(ringId: string) {
  const [ring, setRing] = useState<RingData | null>(null);
  const [members, setMembers] = useState<RingMember[]>([]);
  const [links, setLinks] = useState<SharedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Memoize user ID and ring ID to prevent unnecessary re-renders
  const userId = useMemo(() => user?.id, [user?.id]);
  const memoizedRingId = useMemo(() => ringId, [ringId]);

  const fetchRingData = useCallback(async () => {
    if (!userId || !memoizedRingId) return;

    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cacheKey = `ring_${memoizedRingId}_${userId}`;
      const cachedData = apiCache.get(cacheKey);
      if (cachedData) {
        setRing(cachedData.ring);
        setMembers(cachedData.members);
        setLinks(cachedData.links);
        setLoading(false);
        return;
      }

      // Use retry mechanism for better reliability
      const result = await retryAsync(async () => {
        // Fetch ring details
        const { data: ringData, error: ringError } = await supabase
          .from("rings")
          .select("*")
          .eq("id", memoizedRingId)
          .single();

        if (ringError) throw ringError;

        console.log("Fetched ring data:", ringData);
        console.log(
          "Ring is_public value:",
          ringData.is_public,
          typeof ringData.is_public,
        );

        // Check if user is a member or if ring is public
        const { data: memberCheck, error: memberError } = await supabase
          .from("ring_members")
          .select("role")
          .eq("ring_id", memoizedRingId)
          .eq("user_id", userId)
          .single();

        if (memberError && memberError.code !== "PGRST116") {
          throw memberError;
        }

        // Allow access if user is a member OR if ring is public
        const isMember = !!memberCheck;
        const isPublicRing = ringData.is_public;

        if (!isMember && !isPublicRing) {
          toast({
            title: "Access Denied",
            description:
              "This is a private ring. You need an invitation to access it.",
            variant: "destructive",
          });
          return;
        }

        const processedRing = {
          ...ringData,
          is_public: ringData.is_public === true,
          is_owner: ringData.created_by === userId,
        };

        // Fetch members with user data from auth.users
        const { data: membersData, error: membersError } = await supabase
          .from("ring_members")
          .select(
            `
            *,
            user_name:user_id,
            user_email:user_id
          `,
          )
          .eq("ring_id", memoizedRingId);

        if (membersError) throw membersError;

        // Create member data with fallback names (no admin API needed)
        const membersWithUserData = (membersData || []).map((member) => {
          return {
            ...member,
            user_name: `Member ${member.user_id.slice(-4)}`,
            user_email: null,
            avatar_url: null,
          };
        });

        // Fetch links with user data
        const { data: linksData, error: linksError } = await supabase
          .from("shared_links")
          .select("*")
          .eq("ring_id", memoizedRingId)
          .order("created_at", { ascending: false });

        if (linksError) throw linksError;

        // Create link data with fallback names (no admin API needed)
        const linksWithUserData = (linksData || []).map((link) => {
          return {
            ...link,
            user_name: `User ${link.user_id.slice(-4)}`,
            user_email: null,
            avatar_url: null,
          };
        });

        return {
          ring: processedRing,
          members: membersWithUserData,
          links: linksWithUserData,
        };
      });

      setRing(result.ring);
      setMembers(result.members);
      setLinks(result.links);

      // Cache the result
      apiCache.set(cacheKey, result, 1 * 60 * 1000); // 1 minute cache
    } catch (error: any) {
      console.error("Error fetching ring data:", error);
      setError(error.message || "Failed to load ring data");
      toast({
        title: "Error",
        description: "Failed to load ring data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, memoizedRingId, toast]);

  const shareLink = useCallback(
    async (
      url: string,
      title: string,
      description?: string,
      tags?: string[],
      embedType?: string,
      embedData?: any,
    ) => {
      if (!userId || !memoizedRingId) return null;

      // Check if user is a member before allowing link sharing
      const { data: memberCheck } = await supabase
        .from("ring_members")
        .select("role")
        .eq("ring_id", memoizedRingId)
        .eq("user_id", userId)
        .single();

      if (!memberCheck) {
        toast({
          title: "Access Denied",
          description: "Only ring members can share links",
          variant: "destructive",
        });
        return null;
      }

      try {
        // Optimistic update
        const tempLink: SharedLink = {
          id: `temp_${Date.now()}`,
          ring_id: memoizedRingId,
          user_id: userId,
          url,
          title,
          description,
          tags,
          embed_type: embedType,
          embed_data: embedData,
          created_at: new Date().toISOString(),
          user_name: `User ${userId.slice(-4)}`,
          user_email: null,
          avatar_url: null,
        };

        setLinks((prev) => [tempLink, ...prev]);

        // First, try to insert with embed fields
        let insertData: any = {
          ring_id: memoizedRingId,
          user_id: userId,
          url,
          title,
          description,
        };

        // Only add embed fields if they are provided
        if (embedType && embedData) {
          insertData.embed_type = embedType;
          insertData.embed_data = embedData;
        }

        console.log("Attempting to insert link data:", insertData);

        const { data: linkData, error: linkError } = await supabase
          .from("shared_links")
          .insert(insertData)
          .select("*")
          .single();

        if (linkError) {
          console.error("Link insertion error:", linkError);

          // If the error is about embed fields not existing, try without them
          if (
            linkError.message?.includes("embed_data") ||
            linkError.message?.includes("embed_type")
          ) {
            console.log("Retrying without embed fields...");

            const fallbackData = {
              ring_id: memoizedRingId,
              user_id: userId,
              url,
              title,
              description,
            };

            const { data: fallbackLinkData, error: fallbackError } =
              await supabase
                .from("shared_links")
                .insert(fallbackData)
                .select("*")
                .single();

            if (fallbackError) throw fallbackError;

            // Update optimistic link with real data
            setLinks((prev) => {
              const filtered = prev.filter((l) => l.id !== tempLink.id);
              const realLink = {
                ...fallbackLinkData,
                user_name: `User ${userId.slice(-4)}`,
                user_email: null,
                avatar_url: null,
              };
              return [realLink, ...filtered];
            });

            toast({
              title: "Success",
              description:
                "Link shared to ring! (Embed features not available)",
            });

            return fallbackLinkData;
          }

          throw linkError;
        }

        // Update optimistic link with real data
        setLinks((prev) => {
          const filtered = prev.filter((l) => l.id !== tempLink.id);
          const realLink = {
            ...linkData,
            user_name: `User ${userId.slice(-4)}`,
            user_email: null,
            avatar_url: null,
          };
          return [realLink, ...filtered];
        });

        // Clear cache
        apiCache.delete(`ring_${memoizedRingId}_${userId}`);

        return linkData;
      } catch (error: any) {
        // Remove optimistic update on error
        setLinks((prev) => prev.filter((l) => l.id !== tempLink.id));

        console.error("Error sharing link:", error);
        toast({
          title: "Error",
          description: `Failed to share link: ${error.message || "Unknown error"}`,
          variant: "destructive",
        });
        return null;
      }
    },
    [userId, memoizedRingId, toast],
  );

  toast({
    title: "Success",
    description: embedType
      ? "Link with embed shared to ring!"
      : "Link shared to ring!",
  });

  const copyInviteCode = useCallback(async () => {
    if (!ring) return;

    try {
      await navigator.clipboard.writeText(ring.invite_code);
      toast({
        title: "Copied!",
        description: "Invite code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy invite code",
        variant: "destructive",
      });
    }
  }, [ring, toast]);

  // Set up real-time subscription for shared links
  useEffect(() => {
    if (!memoizedRingId || !userId) return;

    console.log(
      `Setting up real-time subscription for ring links: ${memoizedRingId}`,
    );

    const channel = supabase
      .channel(`ring_links_${memoizedRingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "shared_links",
          filter: `ring_id=eq.${memoizedRingId}`,
        },
        (payload) => {
          console.log("Real-time link INSERT received:", payload);
          const newLink = payload.new as any;

          // Skip if this is our optimistic update
          if (newLink.user_id === userId) {
            return;
          }

          const linkWithUserInfo = {
            ...newLink,
            user_name: `User ${newLink.user_id.slice(-4)}`,
            user_email: null,
            avatar_url: null,
          };

          setLinks((prev) => {
            // Avoid duplicates
            const exists = prev.some((link) => link.id === newLink.id);
            if (exists) return prev;
            return [linkWithUserInfo, ...prev];
          });

          // Clear cache when new data arrives
          apiCache.delete(`ring_${memoizedRingId}_${userId}`);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "shared_links",
          filter: `ring_id=eq.${memoizedRingId}`,
        },
        (payload) => {
          console.log("Real-time link DELETE received:", payload);
          const deletedLink = payload.old as any;
          setLinks((prev) => prev.filter((link) => link.id !== deletedLink.id));

          // Clear cache when data is deleted
          apiCache.delete(`ring_${memoizedRingId}_${userId}`);
        },
      )
      .subscribe((status, err) => {
        console.log(
          `Ring links subscription status for ${memoizedRingId}:`,
          status,
        );
        if (err) {
          console.error(
            `Ring links subscription error for ${memoizedRingId}:`,
            err,
          );
        }
      });

    return () => {
      console.log(`Cleaning up ring links subscription: ${memoizedRingId}`);
      supabase.removeChannel(channel);
    };
  }, [memoizedRingId, userId]);

  useEffect(() => {
    fetchRingData();
  }, [fetchRingData]);

  return {
    ring,
    members,
    links,
    loading,
    error,
    shareLink,
    copyInviteCode,
    refetch: fetchRingData,
  };
}
