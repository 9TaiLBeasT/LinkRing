import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../supabase/supabase";
import { useAuth } from "../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";
import { apiCache, retryAsync, useDebounce } from "@/lib/performance";

export interface Ring {
  id: string;
  name: string;
  description?: string;
  invite_code: string;
  created_by: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  member_count?: number;
  link_count?: number;
  is_owner?: boolean;
}

export interface RingMember {
  id: string;
  ring_id: string;
  user_id: string;
  joined_at: string;
  role: string;
  user?: {
    full_name?: string;
    email?: string;
  };
}

export interface SharedLink {
  id: string;
  ring_id: string;
  user_id: string;
  title: string;
  url: string;
  description?: string;
  created_at: string;
  user?: {
    full_name?: string;
    email?: string;
  };
}

export function useRings() {
  const [rings, setRings] = useState<Ring[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Memoize user ID to prevent unnecessary re-renders
  const userId = useMemo(() => user?.id, [user?.id]);

  const fetchRings = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cacheKey = `rings_${userId}`;
      const cachedData = apiCache.get(cacheKey);
      if (cachedData) {
        setRings(cachedData);
        setLoading(false);
        return;
      }

      // Use retry mechanism for better reliability
      const result = await retryAsync(async () => {
        // Get rings where user is a member with optimized query
        const { data: memberRings, error: memberError } = await supabase
          .from("ring_members")
          .select(
            `
            ring_id,
            role,
            rings (
              id,
              name,
              description,
              invite_code,
              created_by,
              is_public,
              created_at,
              updated_at
            )
          `,
          )
          .eq("user_id", userId);

        if (memberError) {
          console.error("Member rings error:", memberError);
          throw memberError;
        }

        // Get member counts and link counts for each ring
        const ringIds = memberRings?.map((mr) => mr.ring_id) || [];

        if (ringIds.length === 0) {
          setRings([]);
          return;
        }

        // Only fetch counts if we have ring IDs
        const [memberCountsResult, linkCountsResult] = await Promise.all([
          supabase
            .from("ring_members")
            .select("ring_id")
            .in("ring_id", ringIds),
          supabase
            .from("shared_links")
            .select("ring_id")
            .in("ring_id", ringIds),
        ]);

        if (memberCountsResult.error) {
          console.error("Member counts error:", memberCountsResult.error);
        }
        if (linkCountsResult.error) {
          console.error("Link counts error:", linkCountsResult.error);
        }

        // Process the data
        const processedRings: Ring[] =
          memberRings?.map((mr) => {
            const ring = mr.rings as any;
            const memberCount =
              memberCountsResult.data?.filter((mc) => mc.ring_id === ring.id)
                .length || 0;
            const linkCount =
              linkCountsResult.data?.filter((lc) => lc.ring_id === ring.id)
                .length || 0;

            return {
              ...ring,
              is_public: ring.is_public === true,
              member_count: memberCount,
              link_count: linkCount,
              is_owner: ring.created_by === user.id,
            };
          }) || [];

        return processedRings;
      });

      setRings(result);
      // Cache the result
      apiCache.set(cacheKey, result, 2 * 60 * 1000); // 2 minutes cache
    } catch (error: any) {
      console.error("Error fetching rings:", error);
      setError(error.message || "Failed to load rings");
      toast({
        title: "Error",
        description: `Failed to load rings: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  const createRing = useCallback(
    async (name: string, description?: string, isPublic: boolean = false) => {
      if (!userId) return null;

      // Optimistic update
      const tempRing: Ring = {
        id: `temp_${Date.now()}`,
        name,
        description,
        invite_code: "CREATING...",
        created_by: userId,
        is_public: isPublic,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        member_count: 1,
        link_count: 0,
        is_owner: true,
      };

      setRings((prev) => [tempRing, ...prev]);

      try {
        // Generate unique invite code
        let inviteCode: string;
        let isUnique = false;

        do {
          inviteCode = Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase();
          const { data: existing, error } = await supabase
            .from("rings")
            .select("id")
            .eq("invite_code", inviteCode)
            .maybeSingle();

          // If there's an error or no existing record, the code is unique
          isUnique = error || !existing;
        } while (!isUnique);

        // Create the ring
        console.log("Creating ring with isPublic:", isPublic);
        const { data: ring, error: ringError } = await supabase
          .from("rings")
          .insert({
            name,
            description,
            invite_code: inviteCode,
            created_by: userId,
            is_public: isPublic,
          })
          .select()
          .single();

        console.log("Created ring data:", ring);

        if (ringError) throw ringError;

        // Add creator as owner member
        const { error: memberError } = await supabase
          .from("ring_members")
          .insert({
            ring_id: ring.id,
            user_id: userId,
            role: "owner",
          });

        if (memberError) throw memberError;

        // Remove temp ring and add real ring
        setRings((prev) => {
          const filtered = prev.filter((r) => r.id !== tempRing.id);
          const realRing: Ring = {
            ...ring,
            member_count: 1,
            link_count: 0,
            is_owner: true,
          };
          return [realRing, ...filtered];
        });

        // Clear cache to force refresh
        apiCache.delete(`rings_${userId}`);

        toast({
          title: "Success",
          description: `Ring "${name}" created successfully!`,
        });

        return ring;
      } catch (error: any) {
        // Remove optimistic update on error
        setRings((prev) => prev.filter((r) => r.id !== tempRing.id));

        console.error("Error creating ring:", error);
        toast({
          title: "Error",
          description: "Failed to create ring",
          variant: "destructive",
        });
        return null;
      }
    },
    [userId, toast],
  );

  const joinRing = useCallback(
    async (inviteCode: string) => {
      if (!userId) return false;

      try {
        // Find the ring by invite code
        const { data: ring, error: ringError } = await supabase
          .from("rings")
          .select("id, name")
          .eq("invite_code", inviteCode.toUpperCase())
          .single();

        if (ringError || !ring) {
          toast({
            title: "Error",
            description: "Invalid invite code",
            variant: "destructive",
          });
          return false;
        }

        // Check if user is already a member
        const { data: existingMember } = await supabase
          .from("ring_members")
          .select("id")
          .eq("ring_id", ring.id)
          .eq("user_id", userId)
          .single();

        if (existingMember) {
          toast({
            title: "Info",
            description: "You are already a member of this ring",
          });
          return false;
        }

        // Add user as member
        const { error: memberError } = await supabase
          .from("ring_members")
          .insert({
            ring_id: ring.id,
            user_id: userId,
            role: "member",
          });

        if (memberError) throw memberError;

        // Clear cache and refresh
        apiCache.delete(`rings_${userId}`);
        await fetchRings();

        toast({
          title: "Success",
          description: `Successfully joined "${ring.name}"!`,
        });

        return true;
      } catch (error: any) {
        console.error("Error joining ring:", error);
        toast({
          title: "Error",
          description: "Failed to join ring",
          variant: "destructive",
        });
        return false;
      }
    },
    [userId, toast, fetchRings],
  );

  const deleteRing = useCallback(
    async (ringId: string) => {
      if (!userId) return false;

      try {
        // Optimistic update
        setRings((prev) => prev.filter((ring) => ring.id !== ringId));

        const { error } = await supabase
          .from("rings")
          .delete()
          .eq("id", ringId)
          .eq("created_by", userId);

        if (error) throw error;

        // Clear cache
        apiCache.delete(`rings_${userId}`);

        toast({
          title: "Success",
          description: "Ring deleted successfully",
        });

        return true;
      } catch (error: any) {
        // Revert optimistic update on error
        await fetchRings();

        console.error("Error deleting ring:", error);
        toast({
          title: "Error",
          description: "Failed to delete ring",
          variant: "destructive",
        });
        return false;
      }
    },
    [userId, toast, fetchRings],
  );

  const leaveRing = useCallback(
    async (ringId: string) => {
      if (!userId) return false;

      try {
        // Optimistic update
        setRings((prev) => prev.filter((ring) => ring.id !== ringId));

        const { error } = await supabase
          .from("ring_members")
          .delete()
          .eq("ring_id", ringId)
          .eq("user_id", userId);

        if (error) throw error;

        // Clear cache
        apiCache.delete(`rings_${userId}`);

        toast({
          title: "Success",
          description: "Left ring successfully",
        });

        return true;
      } catch (error: any) {
        // Revert optimistic update on error
        await fetchRings();

        console.error("Error leaving ring:", error);
        toast({
          title: "Error",
          description: "Failed to leave ring",
          variant: "destructive",
        });
        return false;
      }
    },
    [userId, toast, fetchRings],
  );

  // Set up real-time subscription for rings
  useEffect(() => {
    if (!userId) return;

    fetchRings();

    // Subscribe to ring changes
    const channel = supabase
      .channel(`user_rings_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ring_members",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Clear cache and refetch when ring membership changes
          apiCache.delete(`rings_${userId}`);
          fetchRings();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rings",
        },
        () => {
          // Clear cache and refetch when any ring changes
          apiCache.delete(`rings_${userId}`);
          fetchRings();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchRings]);

  return {
    rings,
    loading,
    error,
    createRing,
    joinRing,
    deleteRing,
    leaveRing,
    refetch: fetchRings,
  };
}
