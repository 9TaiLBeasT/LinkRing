import { useState, useEffect } from "react";
import { supabase } from "../../supabase/supabase";
import { useAuth } from "../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";

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
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRingData = async () => {
    if (!user || !ringId) return;

    try {
      setLoading(true);

      // Fetch ring details
      const { data: ringData, error: ringError } = await supabase
        .from("rings")
        .select("*")
        .eq("id", ringId)
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
        .eq("ring_id", ringId)
        .eq("user_id", user.id)
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

      setRing({
        ...ringData,
        is_public: ringData.is_public === true,
        is_owner: ringData.created_by === user.id,
      });

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
        .eq("ring_id", ringId);

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

      setMembers(membersWithUserData);

      // Fetch links with user data
      const { data: linksData, error: linksError } = await supabase
        .from("shared_links")
        .select("*")
        .eq("ring_id", ringId)
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

      setLinks(linksWithUserData);
    } catch (error: any) {
      console.error("Error fetching ring data:", error);
      toast({
        title: "Error",
        description: "Failed to load ring data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const shareLink = async (
    url: string,
    title: string,
    description?: string,
    tags?: string[],
    embedType?: string,
    embedData?: any,
  ) => {
    if (!user || !ringId) return null;

    // Check if user is a member before allowing link sharing
    const { data: memberCheck } = await supabase
      .from("ring_members")
      .select("role")
      .eq("ring_id", ringId)
      .eq("user_id", user.id)
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
      // First, try to insert with embed fields
      let insertData: any = {
        ring_id: ringId,
        user_id: user.id,
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
            ring_id: ringId,
            user_id: user.id,
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

          // Add to local state
          setLinks((prev) => [fallbackLinkData, ...prev]);

          toast({
            title: "Success",
            description: "Link shared to ring! (Embed features not available)",
          });

          return fallbackLinkData;
        }

        throw linkError;
      }

      // Add to local state
      setLinks((prev) => [linkData, ...prev]);

      toast({
        title: "Success",
        description: embedType
          ? "Link with embed shared to ring!"
          : "Link shared to ring!",
      });

      return linkData;
    } catch (error: any) {
      console.error("Error sharing link:", error);
      toast({
        title: "Error",
        description: `Failed to share link: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const copyInviteCode = async () => {
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
  };

  useEffect(() => {
    fetchRingData();
  }, [user, ringId]);

  return {
    ring,
    members,
    links,
    loading,
    shareLink,
    copyInviteCode,
    refetch: fetchRingData,
  };
}
