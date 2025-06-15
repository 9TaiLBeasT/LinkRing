import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Users,
  Send,
  Copy,
  ExternalLink,
  Crown,
  Loader2,
  ArrowLeft,
  Globe,
  Lock,
  Clock,
  Zap,
} from "lucide-react";
import { useWatchParty } from "@/hooks/useWatchParty";
import { useAuth } from "../../../supabase/auth";
import EmbedPlayer from "@/components/ui/embed-player";
import { getPlatformDisplayName, getPlatformIcon } from "@/lib/embedUtils";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const REACTIONS = ["🔥", "😂", "❤️", "👀", "🎉", "👏", "😍", "🤯"];

const WatchPartyPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    party,
    messages,
    users,
    loading,
    sending,
    isHost,
    sendMessage,
    updatePlaybackState,
  } = useWatchParty(id);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage("");
    }
  };

  const handleSendReaction = async (emoji: string) => {
    await sendMessage(emoji, "reaction");
  };

  const handleCopyInviteCode = () => {
    if (party?.invite_code) {
      navigator.clipboard.writeText(party.invite_code);
      toast({
        title: "Copied!",
        description: "Invite code copied to clipboard",
        className: "bg-neon-dark border-neon-green text-neon-green",
      });
    }
  };

  const handleCopyPartyLink = () => {
    const url = `${window.location.origin}/watchparty/${id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Party link copied to clipboard",
      className: "bg-neon-dark border-neon-green text-neon-green",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neon-dark flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="h-16 w-16 mx-auto rounded-full border-4 border-neon-green/30 border-t-neon-green animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="h-8 w-8 text-neon-green animate-pulse" />
            </div>
          </div>
          <p className="text-neon-green font-mono text-lg animate-pulse">
            Loading watch party...
          </p>
        </div>
      </div>
    );
  }

  if (!party) {
    return (
      <div className="min-h-screen bg-neon-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1
            className="text-2xl font-bold text-white font-mono glitch-text"
            data-text="Party Not Found"
          >
            Party Not Found
          </h1>
          <p className="text-gray-400">
            This watch party doesn't exist or has ended.
          </p>
          <Button
            onClick={() => navigate("/explore-watchparties")}
            className="neon-button px-6 py-2 rounded-full font-bold"
          >
            Explore Parties
          </Button>
        </div>
      </div>
    );
  }

  const isExpired = new Date(party.expires_at) < new Date();
  const timeRemaining = formatDistanceToNow(new Date(party.expires_at), {
    addSuffix: true,
  });

  return (
    <div className="min-h-screen bg-neon-dark text-white">
      {/* Header */}
      <div className="bg-neon-dark/95 backdrop-blur-md border-b border-neon-green/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-neon-green"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-neon-green font-mono">
                  {party.title || "Watch Party"}
                </h1>
                {party.is_public ? (
                  <Globe className="h-4 w-4 text-neon-green" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-400" />
                )}
                {isHost && (
                  <Crown className="h-4 w-4 text-neon-green animate-pulse" />
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Host: {party.owner_name || "Anonymous"}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {users.length} viewer{users.length !== 1 ? "s" : ""}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Expires {timeRemaining}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyInviteCode}
              className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
            >
              <Copy className="h-4 w-4 mr-2" />
              {party.invite_code}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPartyLink}
              className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Video Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Video Player */}
          <Card className="bg-neon-gray/20 border-neon-green/30">
            <CardContent className="p-0">
              {party.embed_data ? (
                <EmbedPlayer
                  embedData={party.embed_data}
                  autoPlay={party.is_playing}
                  showControls={isHost}
                  className="w-full"
                />
              ) : (
                <div className="aspect-video bg-neon-gray/50 flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-neon-green mx-auto mb-4 animate-pulse" />
                    <p className="text-neon-green font-mono">
                      Loading video...
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Host Controls */}
          {isHost && (
            <Card className="bg-neon-green/10 border-neon-green/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-neon-green" />
                  <h3 className="font-bold text-neon-green font-mono">
                    Host Controls
                  </h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    className="neon-button"
                    onClick={() =>
                      updatePlaybackState(party.current_time, !party.is_playing)
                    }
                  >
                    {party.is_playing ? (
                      <Pause className="h-4 w-4 mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {party.is_playing ? "Pause" : "Play"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    End Party
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Party Info */}
          <Card className="bg-neon-gray/20 border-neon-green/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="border-neon-green/40 text-neon-green"
                    >
                      {party.embed_type && getPlatformIcon(party.embed_type)}{" "}
                      {party.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-blue-500/40 text-blue-400"
                    >
                      {getPlatformDisplayName(party.embed_type as any)}
                    </Badge>
                  </div>
                  {party.description && (
                    <p className="text-gray-300 text-sm">{party.description}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(party.video_url, "_blank")}
                  className="text-gray-400 hover:text-neon-green"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-neon-gray/20 border-neon-green/30 h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-neon-green font-mono flex items-center gap-2">
                  <Zap className="h-4 w-4 animate-pulse" />
                  Live Chat
                </h3>
                <Badge
                  variant="outline"
                  className="border-neon-green/40 text-neon-green text-xs"
                >
                  {messages.length}
                </Badge>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-3">
                {messages.map((message) => {
                  const isReaction = message.type === "reaction";
                  const isOwnMessage = message.user_id === user?.id;

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2 animate-flicker-in",
                        isReaction && "justify-center",
                      )}
                    >
                      {!isReaction && (
                        <Avatar className="h-6 w-6 border border-neon-green/40">
                          {message.user_avatar ? (
                            <AvatarImage
                              src={message.user_avatar}
                              alt={message.user_name}
                            />
                          ) : null}
                          <AvatarFallback className="text-xs bg-neon-gray text-neon-green font-mono">
                            {message.user_name?.slice(0, 2).toUpperCase() ||
                              "AN"}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          "flex-1 min-w-0",
                          isReaction && "text-center",
                        )}
                      >
                        {isReaction ? (
                          <div className="inline-flex items-center gap-2 bg-neon-green/10 px-3 py-1 rounded-full border border-neon-green/30">
                            <span className="text-2xl">{message.message}</span>
                            <span className="text-xs text-neon-green font-mono">
                              {message.user_name}
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-neon-green font-mono">
                                {message.user_name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(
                                  new Date(message.created_at),
                                  { addSuffix: true },
                                )}
                              </span>
                            </div>
                            <p
                              className={cn(
                                "text-sm break-words",
                                isOwnMessage
                                  ? "text-neon-green"
                                  : "text-gray-300",
                              )}
                            >
                              {message.message}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Reactions */}
            <div className="px-4 py-2 border-t border-neon-green/20">
              <div className="flex flex-wrap gap-1">
                {REACTIONS.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-lg hover:bg-neon-green/20 hover:scale-125 transition-all duration-200"
                    onClick={() => handleSendReaction(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-neon-green/20">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="neon-input flex-1 text-sm"
                  disabled={sending}
                  maxLength={200}
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="neon-button px-3"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </Card>

          {/* Active Users */}
          <Card className="bg-neon-gray/20 border-neon-green/30 mt-4">
            <CardHeader className="pb-3">
              <h3 className="font-bold text-neon-green font-mono text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Viewers ({users.length})
              </h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {users.map((user) => (
                  <TooltipProvider key={user.id}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Avatar className="h-8 w-8 border border-neon-green/40 hover:border-neon-green transition-colors">
                          {user.user_avatar ? (
                            <AvatarImage
                              src={user.user_avatar}
                              alt={user.user_name}
                            />
                          ) : null}
                          <AvatarFallback className="text-xs bg-neon-gray text-neon-green font-mono">
                            {user.user_name?.slice(0, 2).toUpperCase() || "AN"}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent className="bg-neon-dark border-neon-green/50 text-neon-green font-mono">
                        <p className="font-bold">{user.user_name}</p>
                        <p className="text-xs text-gray-400">
                          Joined{" "}
                          {formatDistanceToNow(new Date(user.joined_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WatchPartyPage;
