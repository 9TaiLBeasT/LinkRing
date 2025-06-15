import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase/supabase";
import { useAuth } from "../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";
import { extractEmbedData, EmbedData } from "@/lib/embedUtils";

export interface WatchParty {
  id: string;
  owner_id: string;
  video_url: string;
  title?: string;
  description?: string;
  is_public: boolean;
  category: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  ring_id?: string;
  invite_code: string;
  current_time: number;
  is_playing: boolean;
  embed_type?: string;
  embed_data?: EmbedData;
  viewer_count: number;
  owner_name?: string;
  owner_avatar?: string;
}

export interface WatchPartyMessage {
  id: string;
  party_id: string;
  user_id: string;
  message: string;
  created_at: string;
  type: "text" | "reaction";
  user_name?: string;
  user_avatar?: string;
}

export interface WatchPartyUser {
  id: string;
  user_id: string;
  party_id: string;
  joined_at: string;
  last_seen: string;
  is_active: boolean;
  user_name?: string;
  user_avatar?: string;
}

interface CreateWatchPartyParams {
  videoUrl: string;
  title?: string;
  description?: string;
  isPublic: boolean;
  category: string;
  ringId?: string;
}

export function useWatchParty(partyId?: string) {
  const [party, setParty] = useState<WatchParty | null>(null);
  const [messages, setMessages] = useState<WatchPartyMessage[]>([]);
  const [users, setUsers] = useState<WatchPartyUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch watch party details
  const fetchWatchParty = useCallback(async () => {
    if (!partyId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("watch_parties")
        .select(
          `
          *,
          users!fk_watch_parties_owner_id (
            full_name,
            avatar_url
          )
        `,
        )
        .eq("id", partyId)
        .single();

      if (error) throw error;

      const watchParty: WatchParty = {
        ...data,
        owner_name: data.users?.full_name,
        owner_avatar: data.users?.avatar_url,
      };

      setParty(watchParty);
    } catch (error: any) {
      console.error("Error fetching watch party:", error);
      toast({
        title: "Error",
        description: "Failed to load watch party",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [partyId, toast]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!partyId) return;

    try {
      const { data, error } = await supabase
        .from("watch_party_messages")
        .select(
          `
          *,
          users!fk_watch_party_messages_user_id (
            full_name,
            avatar_url
          )
        `,
        )
        .eq("party_id", partyId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      const formattedMessages: WatchPartyMessage[] = data.map((msg) => ({
        ...msg,
        user_name: msg.users?.full_name || "Anonymous",
        user_avatar: msg.users?.avatar_url,
      }));

      setMessages(formattedMessages);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
    }
  }, [partyId]);

  // Fetch active users
  const fetchUsers = useCallback(async () => {
    if (!partyId) return;

    try {
      const { data, error } = await supabase
        .from("watch_party_users")
        .select(
          `
          *,
          users!fk_watch_party_users_user_id (
            full_name,
            avatar_url
          )
        `,
        )
        .eq("party_id", partyId)
        .eq("is_active", true)
        .order("joined_at", { ascending: true });

      if (error) throw error;

      const formattedUsers: WatchPartyUser[] = data.map((u) => ({
        ...u,
        user_name: u.users?.full_name || "Anonymous",
        user_avatar: u.users?.avatar_url,
      }));

      setUsers(formattedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
    }
  }, [partyId]);

  // Send message
  const sendMessage = async (
    message: string,
    type: "text" | "reaction" = "text",
  ) => {
    if (!user || !partyId || !message.trim()) return false;

    try {
      setSending(true);
      const { error } = await supabase.from("watch_party_messages").insert({
        party_id: partyId,
        user_id: user.id,
        message: message.trim(),
        type,
      });

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return false;
    } finally {
      setSending(false);
    }
  };

  // Join watch party
  const joinWatchParty = async () => {
    if (!user || !partyId) return false;

    try {
      const { error } = await supabase.from("watch_party_users").upsert(
        {
          user_id: user.id,
          party_id: partyId,
          is_active: true,
          last_seen: new Date().toISOString(),
        },
        {
          onConflict: "user_id,party_id",
        },
      );

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("Error joining watch party:", error);
      return false;
    }
  };

  // Leave watch party
  const leaveWatchParty = async () => {
    if (!user || !partyId) return;

    try {
      await supabase
        .from("watch_party_users")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("party_id", partyId);
    } catch (error: any) {
      console.error("Error leaving watch party:", error);
    }
  };

  // Update playback state (host only)
  const updatePlaybackState = async (
    currentTime: number,
    isPlaying: boolean,
  ) => {
    if (!user || !party || party.owner_id !== user.id) return false;

    try {
      const { error } = await supabase
        .from("watch_parties")
        .update({
          current_time: currentTime,
          is_playing: isPlaying,
        })
        .eq("id", partyId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error("Error updating playback state:", error);
      return false;
    }
  };

  // Update last seen timestamp
  const updateLastSeen = useCallback(async () => {
    if (!user || !partyId) return;

    try {
      await supabase
        .from("watch_party_users")
        .update({ last_seen: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("party_id", partyId);
    } catch (error: any) {
      console.error("Error updating last seen:", error);
    }
  }, [user, partyId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!partyId) return;

    // Subscribe to watch party updates
    const partySubscription = supabase
      .channel(`watch_party:${partyId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "watch_parties",
          filter: `id=eq.${partyId}`,
        },
        (payload) => {
          setParty((prev) => (prev ? { ...prev, ...payload.new } : null));
        },
      )
      .subscribe();

    // Subscribe to messages
    const messagesSubscription = supabase
      .channel(`watch_party_messages:${partyId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "watch_party_messages",
          filter: `party_id=eq.${partyId}`,
        },
        () => {
          fetchMessages();
        },
      )
      .subscribe();

    // Subscribe to user changes
    const usersSubscription = supabase
      .channel(`watch_party_users:${partyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "watch_party_users",
          filter: `party_id=eq.${partyId}`,
        },
        () => {
          fetchUsers();
        },
      )
      .subscribe();

    return () => {
      partySubscription.unsubscribe();
      messagesSubscription.unsubscribe();
      usersSubscription.unsubscribe();
    };
  }, [partyId, fetchMessages, fetchUsers]);

  // Update last seen every 10 seconds
  useEffect(() => {
    if (!partyId || !user) return;

    const interval = setInterval(updateLastSeen, 10000);
    return () => clearInterval(interval);
  }, [partyId, user, updateLastSeen]);

  // Initial data fetch
  useEffect(() => {
    if (partyId) {
      fetchWatchParty();
      fetchMessages();
      fetchUsers();
      joinWatchParty();
    }
  }, [partyId, fetchWatchParty, fetchMessages, fetchUsers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (partyId && user) {
        leaveWatchParty();
      }
    };
  }, []);

  const isHost = user && party && party.owner_id === user.id;

  return {
    party,
    messages,
    users,
    loading,
    sending,
    isHost,
    sendMessage,
    joinWatchParty,
    leaveWatchParty,
    updatePlaybackState,
    refetch: fetchWatchParty,
  };
}

// Hook for managing watch parties list
export function useWatchParties() {
  const [parties, setParties] = useState<WatchParty[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch public watch parties
  const fetchPublicParties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("watch_parties")
        .select(
          `
          *,
          users!fk_watch_parties_owner_id (
            full_name,
            avatar_url
          )
        `,
        )
        .eq("is_public", true)
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedParties: WatchParty[] = data.map((party) => ({
        ...party,
        owner_name: party.users?.full_name,
        owner_avatar: party.users?.avatar_url,
      }));

      setParties(formattedParties);
    } catch (error: any) {
      console.error("Error fetching public parties:", error);
      toast({
        title: "Error",
        description: "Failed to load watch parties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new watch party
  const createWatchParty = async (params: CreateWatchPartyParams) => {
    if (!user) return null;

    try {
      // Extract embed data
      const embedData = extractEmbedData(params.videoUrl);

      // Generate invite code
      const { data: codeData, error: codeError } = await supabase.rpc(
        "generate_watch_party_invite_code",
      );

      if (codeError) throw codeError;

      const { data, error } = await supabase
        .from("watch_parties")
        .insert({
          owner_id: user.id,
          video_url: params.videoUrl,
          title: params.title,
          description: params.description,
          is_public: params.isPublic,
          category: params.category,
          ring_id: params.ringId,
          invite_code: codeData,
          embed_type: embedData?.type,
          embed_data: embedData,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Watch party created successfully!",
        className: "bg-neon-dark border-neon-green text-neon-green",
      });

      return data;
    } catch (error: any) {
      console.error("Error creating watch party:", error);
      toast({
        title: "Error",
        description: "Failed to create watch party",
        variant: "destructive",
      });
      return null;
    }
  };

  // Join party by invite code
  const joinByInviteCode = async (inviteCode: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("watch_parties")
        .select("*")
        .eq("invite_code", inviteCode.toUpperCase())
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error || !data) {
        toast({
          title: "Error",
          description: "Invalid or expired invite code",
          variant: "destructive",
        });
        return null;
      }

      return data;
    } catch (error: any) {
      console.error("Error joining by invite code:", error);
      toast({
        title: "Error",
        description: "Failed to join watch party",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchPublicParties();
  }, []);

  return {
    parties,
    loading,
    createWatchParty,
    joinByInviteCode,
    refetch: fetchPublicParties,
  };
}
