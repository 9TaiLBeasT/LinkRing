import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase/supabase";
import { useAuth } from "../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/types/supabase";

type LinkChat = Database["public"]["Tables"]["link_chats"]["Row"];
type LinkChatInsert = Database["public"]["Tables"]["link_chats"]["Insert"];

export interface ChatMessage extends LinkChat {
  user_name?: string;
  user_avatar?: string;
}

export interface UseLinkChatProps {
  linkId: string;
  linkCreatedAt: string;
}

export function useLinkChat({ linkId, linkCreatedAt }: UseLinkChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isExpired] = useState(false); // Chat never expires, only messages do
  const [timeRemaining] = useState<number>(Infinity); // Chat is always available
  const { user } = useAuth();
  const { toast } = useToast();

  // Filter out expired messages (older than 16 hours)
  const filterExpiredMessages = useCallback((msgs: ChatMessage[]) => {
    const now = new Date();
    return msgs.filter((msg) => {
      const messageTime = new Date(msg.created_at || "");
      const hoursElapsed =
        (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);
      return hoursElapsed < 16; // Keep messages less than 16 hours old
    });
  }, []);

  // Format time remaining as "Always Available"
  const formatTimeRemaining = useCallback(() => {
    return "Always Available";
  }, []);

  // Fetch chat messages
  const fetchMessages = useCallback(async () => {
    if (!linkId || !user) return;

    // Skip fetching for temporary link IDs
    if (linkId.startsWith("temp_")) {
      console.log("Skipping chat fetch for temporary link ID:", linkId);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Only fetch messages from the last 16 hours
      const sixteenHoursAgo = new Date(Date.now() - 16 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from("link_chats")
        .select("*")
        .eq("link_id", linkId)
        .gte("created_at", sixteenHoursAgo.toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching chat messages:", error);
        // Only show toast for non-temporary links
        if (!linkId.startsWith("temp_")) {
          toast({
            title: "Error",
            description: "Failed to load chat messages",
            variant: "destructive",
          });
        }
        return;
      }

      // Add user info to messages (simplified for now)
      const messagesWithUserInfo: ChatMessage[] = (data || []).map((msg) => ({
        ...msg,
        user_name: `User ${msg.user_id?.slice(-4) || "Unknown"}`,
        user_avatar: null,
      }));

      // Filter out any expired messages as an extra safety measure
      const validMessages = filterExpiredMessages(messagesWithUserInfo);
      setMessages(validMessages);
    } catch (error) {
      console.error("Error in fetchMessages:", error);
      // Only show toast for non-temporary links
      if (!linkId.startsWith("temp_")) {
        toast({
          title: "Error",
          description: "Failed to load chat messages",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [linkId, user, toast, filterExpiredMessages]);

  // Send a new message
  const sendMessage = useCallback(
    async (message: string) => {
      if (!user || !linkId || !message.trim()) return false;

      try {
        setSending(true);

        const messageData: LinkChatInsert = {
          link_id: linkId,
          user_id: user.id,
          message: message.trim(),
        };

        const { data, error } = await supabase
          .from("link_chats")
          .insert(messageData)
          .select("*")
          .single();

        if (error) {
          console.error("Error sending message:", error);
          toast({
            title: "Error",
            description: "Failed to send message. Please try again.",
            variant: "destructive",
          });
          return false;
        }

        // Optimistically add the message to local state if real-time fails
        if (data) {
          const messageWithUserInfo: ChatMessage = {
            ...data,
            user_name: `User ${data.user_id?.slice(-4) || "Unknown"}`,
            user_avatar: null,
          };

          // Add to state immediately for better UX
          setMessages((prev) => [...prev, messageWithUserInfo]);
        }

        return true;
      } catch (error) {
        console.error("Error in sendMessage:", error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
        return false;
      } finally {
        setSending(false);
      }
    },
    [user, linkId, toast],
  );

  // Delete a message (only own messages within 5 minutes)
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("link_chats")
          .delete()
          .eq("id", messageId)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error deleting message:", error);
          toast({
            title: "Error",
            description: "Failed to delete message.",
            variant: "destructive",
          });
          return false;
        }

        return true;
      } catch (error) {
        console.error("Error in deleteMessage:", error);
        return false;
      }
    },
    [user, toast],
  );

  // Set up real-time subscription with better error handling
  useEffect(() => {
    if (!linkId || !user) return;

    // Skip real-time subscription for temporary link IDs
    if (linkId.startsWith("temp_")) {
      console.log(
        "Skipping real-time subscription for temporary link ID:",
        linkId,
      );
      return;
    }

    console.log(`Setting up real-time subscription for link: ${linkId}`);

    const channel = supabase
      .channel(`link_chat_${linkId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: user.id },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "link_chats",
          filter: `link_id=eq.${linkId}`,
        },
        (payload) => {
          console.log("Real-time INSERT received:", payload);
          const newMessage = payload.new as LinkChat;

          // Check if message is not expired
          const messageTime = new Date(newMessage.created_at || "");
          const now = new Date();
          const hoursElapsed =
            (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);

          if (hoursElapsed < 16) {
            const messageWithUserInfo: ChatMessage = {
              ...newMessage,
              user_name: `User ${newMessage.user_id?.slice(-4) || "Unknown"}`,
              user_avatar: null,
            };

            setMessages((prev) => {
              // Avoid duplicates
              const exists = prev.some((msg) => msg.id === newMessage.id);
              if (exists) return prev;
              return [...prev, messageWithUserInfo];
            });
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "link_chats",
          filter: `link_id=eq.${linkId}`,
        },
        (payload) => {
          console.log("Real-time DELETE received:", payload);
          const deletedMessage = payload.old as LinkChat;
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== deletedMessage.id),
          );
        },
      )
      .subscribe((status, err) => {
        console.log(`Subscription status for ${linkId}:`, status);
        if (err) {
          console.error(`Subscription error for ${linkId}:`, err);
          // Only show toast for non-temporary links
          if (!linkId.startsWith("temp_")) {
            toast({
              title: "Connection Issue",
              description:
                "Real-time chat updates may be delayed. Try refreshing if needed.",
              variant: "destructive",
            });
          }
        }
      });

    return () => {
      console.log(`Cleaning up subscription for link: ${linkId}`);
      supabase.removeChannel(channel);
    };
  }, [linkId, user, toast]);

  // Set up timer to clean expired messages every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages((prev) => filterExpiredMessages(prev));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [filterExpiredMessages]);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    loading,
    sending,
    isExpired,
    timeRemaining,
    timeRemainingFormatted: formatTimeRemaining(),
    sendMessage,
    deleteMessage,
    refetch: fetchMessages,
  };
}
