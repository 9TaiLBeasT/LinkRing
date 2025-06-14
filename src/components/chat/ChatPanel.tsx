import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  X,
  Send,
  Clock,
  Trash2,
  Loader2,
  MessageCircle,
  Zap,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLinkChat, ChatMessage } from "@/hooks/useLinkChat";
import { useAuth } from "../../../supabase/auth";
import { formatDistanceToNow } from "date-fns";

interface ChatPanelProps {
  linkId: string;
  linkTitle: string;
  linkCreatedAt: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const ChatPanel = ({
  linkId,
  linkTitle,
  linkCreatedAt,
  isOpen,
  onClose,
  className,
}: ChatPanelProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const {
    messages,
    loading,
    sending,
    isExpired,
    timeRemainingFormatted,
    sendMessage,
    deleteMessage,
  } = useLinkChat({ linkId, linkCreatedAt });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current && !isExpired) {
      inputRef.current.focus();
    }
  }, [isOpen, isExpired]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || isExpired) return;

    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage("");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
  };

  const canDeleteMessage = (message: ChatMessage) => {
    if (!user || message.user_id !== user.id) return false;

    const messageTime = new Date(message.created_at || "");
    const now = new Date();
    const diffMinutes = (now.getTime() - messageTime.getTime()) / (1000 * 60);

    return diffMinutes <= 5; // Can delete within 5 minutes
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 md:inset-y-0 md:right-0 md:left-auto w-full md:w-96 bg-neon-dark/95 backdrop-blur-lg border-l border-neon-green/30 shadow-neon-lg z-50 flex flex-col animate-slide-in-right",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-4 border-b border-neon-green/20 bg-neon-gray/30 safe-area-top">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="h-5 w-5 text-neon-green animate-pulse" />
            <h3 className="font-bold text-neon-green font-mono text-sm md:text-sm">
              Ephemeral Chat
            </h3>
            <Zap className="h-4 w-4 text-neon-green animate-bounce" />
          </div>
          <p className="text-xs text-gray-400 truncate font-mono">
            {linkTitle}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-10 w-10 md:h-8 md:w-8 p-0 text-gray-400 hover:text-white hover:bg-neon-green/20 transition-all duration-300 hover:scale-110 touch-manipulation"
        >
          <X className="h-5 w-5 md:h-4 md:w-4" />
        </Button>
      </div>

      {/* Status Badge */}
      <div className="px-4 py-2 bg-neon-gray/20 border-b border-neon-green/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="font-mono text-xs border-2 transition-all duration-300 border-neon-green/50 text-neon-green bg-neon-green/10 animate-pulse-glow"
          >
            <Zap className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Chat Always Available</span>
            <span className="sm:hidden">Always Available</span>
          </Badge>
          <div className="text-xs text-gray-400 font-mono">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 font-mono text-center">
          💬 Messages auto-delete after 16h
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3 md:p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-2 text-neon-green">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-mono animate-pulse">
                Loading chat...
              </span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <MessageCircle className="h-12 w-12 text-gray-500 mb-3 animate-pulse" />
            <p className="text-sm text-gray-400 font-mono mb-1">
              No messages yet
            </p>
            <p className="text-xs text-gray-500 font-mono">
              Start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwnMessage = message.user_id === user?.id;
              const canDelete = canDeleteMessage(message);

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 animate-flicker-in",
                    isOwnMessage ? "flex-row-reverse" : "flex-row",
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Avatar className="h-8 w-8 border-2 border-neon-green/40 hover:border-neon-green transition-all duration-300">
                    {message.user_avatar ? (
                      <AvatarImage
                        src={message.user_avatar}
                        alt={message.user_name}
                      />
                    ) : null}
                    <AvatarFallback className="text-xs bg-neon-gray text-neon-green font-bold font-mono">
                      {message.user_name?.slice(0, 2).toUpperCase() || "AN"}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={cn(
                      "flex-1 min-w-0",
                      isOwnMessage ? "text-right" : "text-left",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {!isOwnMessage && (
                        <span className="text-xs font-bold text-neon-green font-mono">
                          {message.user_name}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 font-mono">
                        {formatDistanceToNow(
                          new Date(message.created_at || ""),
                          {
                            addSuffix: true,
                          },
                        )}
                      </span>
                      {canDelete && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 text-gray-500 hover:text-red-400 transition-all duration-300 hover:scale-110"
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-neon-dark border-red-500/50 text-red-400 font-mono">
                              <p className="text-xs">Delete message</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>

                    <div
                      className={cn(
                        "inline-block px-3 py-2 rounded-lg max-w-[280px] sm:max-w-xs break-words text-sm font-mono border transition-all duration-300 hover:shadow-neon",
                        isOwnMessage
                          ? "bg-neon-green/20 text-neon-green border-neon-green/40"
                          : "bg-neon-gray/50 text-white border-neon-green/20",
                      )}
                    >
                      {message.message}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 md:p-4 border-t border-neon-green/20 bg-neon-gray/20 safe-area-bottom">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="neon-input flex-1 font-mono text-sm h-12 md:h-10 touch-manipulation"
            disabled={sending}
            maxLength={500}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={cn(
              "neon-button px-4 h-12 md:h-10 transition-all duration-300 hover:scale-105 touch-manipulation",
              sending && "animate-pulse-glow",
            )}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-1">
          <p className="text-xs text-gray-500 font-mono">
            {newMessage.length}/500 characters
          </p>
          <p className="text-xs text-gray-400 font-mono">
            <span className="hidden sm:inline">
              Messages auto-delete after 16h
            </span>
            <span className="sm:hidden">Auto-delete: 16h</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
