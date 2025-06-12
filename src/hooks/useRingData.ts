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

      // Check if user is a member
      const { data: memberCheck, error: memberError } = await supabase
        .from("ring_members")
        .select("role")
        .eq("ring_id", ringId)
        .eq("user_id", user.id)
        .single();

      if (memberError && memberError.code !== "PGRST116") {
        throw memberError;
      }

      if (!memberCheck) {
        toast({
          title: "Access Denied",
          description: "You are not a member of this ring",
          variant: "destructive",
        });
        return;
      }

      setRing({
        ...ringData,
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

      // Fetch user details from auth.users for each member
      const membersWithUserData = await Promise.all(
        (membersData || []).map(async (member) => {
          try {
            // Try to get user data from Supabase auth
            const { data: userData, error } =
              await supabase.auth.admin.getUserById(member.user_id);

            if (error || !userData.user) {
              // Fallback to basic member data
              return {
                ...member,
                user_name: `Member ${member.user_id.slice(-4)}`,
                user_email: null,
                avatar_url: null,
              };
            }

            return {
              ...member,
              user_name:
                userData.user?.user_metadata?.full_name ||
                userData.user?.email?.split("@")[0] ||
                `Member ${member.user_id.slice(-4)}`,
              user_email: userData.user?.email,
              avatar_url: userData.user?.user_metadata?.avatar_url,
            };
          } catch (error) {
            console.warn(
              "Failed to fetch user data for member:",
              member.user_id,
              error,
            );
            return {
              ...member,
              user_name: `Member ${member.user_id.slice(-4)}`,
              user_email: null,
              avatar_url: null,
            };
          }
        }),
      );

      setMembers(membersWithUserData);

      // Fetch links with user data
      const { data: linksData, error: linksError } = await supabase
        .from("shared_links")
        .select("*")
        .eq("ring_id", ringId)
        .order("created_at", { ascending: false });

      if (linksError) throw linksError;

      // Fetch user details for each link
      const linksWithUserData = await Promise.all(
        (linksData || []).map(async (link) => {
          try {
            // Try to get user data from Supabase auth
            const { data: userData, error } =
              await supabase.auth.admin.getUserById(link.user_id);

            if (error || !userData.user) {
              // Fallback to basic user data
              return {
                ...link,
                user_name: `User ${link.user_id.slice(-4)}`,
                user_email: null,
                avatar_url: null,
              };
            }

            return {
              ...link,
              user_name:
                userData.user?.user_metadata?.full_name ||
                userData.user?.email?.split("@")[0] ||
                `User ${link.user_id.slice(-4)}`,
              user_email: userData.user?.email,
              avatar_url: userData.user?.user_metadata?.avatar_url,
            };
          } catch (error) {
            console.warn(
              "Failed to fetch user data for link:",
              link.user_id,
              error,
            );
            return {
              ...link,
              user_name: `User ${link.user_id.slice(-4)}`,
              user_email: null,
              avatar_url: null,
            };
          }
        }),
      );

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
  ) => {
    if (!user || !ringId) return null;

    try {
      const { data: linkData, error: linkError } = await supabase
        .from("shared_links")
        .insert({
          ring_id: ringId,
          user_id: user.id,
          url,
          title,
          description,
        })
        .select("*")
        .single();

      if (linkError) throw linkError;

      // Add to local state
      setLinks((prev) => [linkData, ...prev]);

      toast({
        title: "Success",
        description: "Link shared to ring!",
      });

      return linkData;
    } catch (error: any) {
      console.error("Error sharing link:", error);
      toast({
        title: "Error",
        description: "Failed to share link",
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
