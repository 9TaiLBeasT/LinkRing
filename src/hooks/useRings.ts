import { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabase";
import { useAuth } from "../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";

export interface Ring {
  id: string;
  name: string;
  description?: string;
  invite_code: string;
  created_by: string;
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
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRings = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get rings where user is a member
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
            created_at,
            updated_at
          )
        `,
        )
        .eq("user_id", user.id);

      if (memberError) throw memberError;

      // Get member counts and link counts for each ring
      const ringIds = memberRings?.map((mr) => mr.ring_id) || [];

      const [memberCounts, linkCounts] = await Promise.all([
        supabase.from("ring_members").select("ring_id").in("ring_id", ringIds),
        supabase.from("shared_links").select("ring_id").in("ring_id", ringIds),
      ]);

      // Process the data
      const processedRings: Ring[] =
        memberRings?.map((mr) => {
          const ring = mr.rings as any;
          const memberCount =
            memberCounts.data?.filter((mc) => mc.ring_id === ring.id).length ||
            0;
          const linkCount =
            linkCounts.data?.filter((lc) => lc.ring_id === ring.id).length || 0;

          return {
            ...ring,
            member_count: memberCount,
            link_count: linkCount,
            is_owner: ring.created_by === user.id,
          };
        }) || [];

      setRings(processedRings);
    } catch (error: any) {
      console.error("Error fetching rings:", error);
      toast({
        title: "Error",
        description: "Failed to load rings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRing = async (name: string, description?: string) => {
    if (!user) return null;

    try {
      // Generate unique invite code
      let inviteCode: string;
      let isUnique = false;

      do {
        inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        const { data: existing } = await supabase
          .from("rings")
          .select("id")
          .eq("invite_code", inviteCode)
          .single();
        isUnique = !existing;
      } while (!isUnique);

      // Create the ring
      const { data: ring, error: ringError } = await supabase
        .from("rings")
        .insert({
          name,
          description,
          invite_code: inviteCode,
          created_by: user.id,
        })
        .select()
        .single();

      if (ringError) throw ringError;

      // Add creator as owner member
      const { error: memberError } = await supabase
        .from("ring_members")
        .insert({
          ring_id: ring.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      toast({
        title: "Success",
        description: `Ring "${name}" created successfully!`,
      });

      await fetchRings();
      return ring;
    } catch (error: any) {
      console.error("Error creating ring:", error);
      toast({
        title: "Error",
        description: "Failed to create ring",
        variant: "destructive",
      });
      return null;
    }
  };

  const joinRing = async (inviteCode: string) => {
    if (!user) return false;

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
        .eq("user_id", user.id)
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
          user_id: user.id,
          role: "member",
        });

      if (memberError) throw memberError;

      toast({
        title: "Success",
        description: `Successfully joined "${ring.name}"!`,
      });

      await fetchRings();
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
  };

  const deleteRing = async (ringId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("rings")
        .delete()
        .eq("id", ringId)
        .eq("created_by", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ring deleted successfully",
      });

      await fetchRings();
      return true;
    } catch (error: any) {
      console.error("Error deleting ring:", error);
      toast({
        title: "Error",
        description: "Failed to delete ring",
        variant: "destructive",
      });
      return false;
    }
  };

  const leaveRing = async (ringId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("ring_members")
        .delete()
        .eq("ring_id", ringId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Left ring successfully",
      });

      await fetchRings();
      return true;
    } catch (error: any) {
      console.error("Error leaving ring:", error);
      toast({
        title: "Error",
        description: "Failed to leave ring",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchRings();
  }, [user]);

  return {
    rings,
    loading,
    createRing,
    joinRing,
    deleteRing,
    leaveRing,
    refetch: fetchRings,
  };
}
